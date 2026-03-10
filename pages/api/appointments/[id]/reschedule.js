// pages/api/appointments/[id]/reschedule.js
import { connectDB } from '../../../../lib/mongodb';
import { requireProfessional } from '../../../../lib/auth';
import Appointment from '../../../../models/Appointment';
import { sendProReschedule } from '../../../../services/email';
import { updateCalendarEvent } from '../../../../services/googleCalendar';

export default requireProfessional(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await connectDB();
  const { id } = req.query;
  const { date, time, reason } = req.body;

  const apt = await Appointment.findById(id).populate('customerId', 'name email');
  if (!apt) return res.status(404).json({ message: 'Not found' });

  const oldDate = apt.date;
  const oldTime = apt.time;

  apt.rescheduleHistory.push({
    requestedBy: 'professional',
    previousDate: oldDate, previousTime: oldTime,
    requestedDate: new Date(date), requestedTime: time,
    reason: reason || '', status: 'approved', respondedAt: new Date()
  });
  apt.date = new Date(date);
  apt.time = time;
  apt.status = 'Rescheduled';
  await apt.save();

  if (apt.googleEventId) {
    try { await updateCalendarEvent(apt.googleEventId, apt, apt.customerId); } catch(e) {}
  }

  try {
    await sendProReschedule(apt.customerId, apt, { oldDate, oldTime, newDate: apt.date, newTime: apt.time, reason });
  } catch(e) { console.error('Email:', e.message); }

  res.json({ appointment: apt });
});
