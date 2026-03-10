// pages/api/appointments/[id]/request-reschedule.js
import { connectDB } from '../../../../lib/mongodb';
import { requireAuth } from '../../../../lib/auth';
import Appointment from '../../../../models/Appointment';
import User from '../../../../models/User';
import { sendRescheduleRequestToPro } from '../../../../services/email';

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await connectDB();
  const { id } = req.query;
  const { date, time, reason } = req.body;

  const apt = await Appointment.findById(id).populate('customerId', 'name email');
  if (!apt) return res.status(404).json({ message: 'Not found' });

  if (apt.customerId._id.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not authorized' });

  if (['Rejected','Cancelled','Completed'].includes(apt.status))
    return res.status(400).json({ message: `Cannot reschedule a ${apt.status.toLowerCase()} appointment` });

  const rescheduleReq = {
    requestedBy: 'customer',
    previousDate: apt.date, previousTime: apt.time,
    requestedDate: new Date(date), requestedTime: time,
    reason: reason || '', status: 'pending', requestedAt: new Date()
  };

  apt.rescheduleHistory.push(rescheduleReq);
  apt.status = 'RescheduleRequested';
  apt.pendingReschedule = apt.rescheduleHistory[apt.rescheduleHistory.length - 1]._id;
  await apt.save();

  try {
    const pro = await User.findOne({ role: 'professional' });
    if (pro) await sendRescheduleRequestToPro(pro, apt, rescheduleReq);
  } catch(e) { console.error('Email:', e.message); }

  res.json({ appointment: apt });
});
