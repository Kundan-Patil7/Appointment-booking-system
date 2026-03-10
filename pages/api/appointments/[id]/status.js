// pages/api/appointments/[id]/status.js
import { connectDB } from '../../../../lib/mongodb';
import { requireProfessional } from '../../../../lib/auth';
import Appointment from '../../../../models/Appointment';
import { sendAccepted, sendRejected } from '../../../../services/email';
import { updateCalendarEvent } from '../../../../services/googleCalendar';

export default requireProfessional(async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).end();
  await connectDB();
  const { id } = req.query;
  const { status, rejectionReason } = req.body;

  const apt = await Appointment.findById(id).populate('customerId', 'name email');
  if (!apt) return res.status(404).json({ message: 'Not found' });

  apt.status = status;
  if (rejectionReason) apt.rejectionReason = rejectionReason;
  await apt.save();

  if (apt.googleEventId) {
    try { await updateCalendarEvent(apt.googleEventId, apt, apt.customerId); } catch(e) {}
  }

  try {
    if (status === 'Accepted') await sendAccepted(apt.customerId, apt);
    else if (status === 'Rejected') await sendRejected(apt.customerId, apt);
  } catch(e) { console.error('Email:', e.message); }

  res.json({ appointment: apt });
});
