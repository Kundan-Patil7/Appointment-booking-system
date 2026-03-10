// pages/api/appointments/[id]/respond/[requestId].js
import { connectDB } from '../../../../../lib/mongodb';
import { requireProfessional } from '../../../../../lib/auth';
import Appointment from '../../../../../models/Appointment';
import { sendRescheduleApproved, sendRescheduleDeclined } from '../../../../../services/email';
import { updateCalendarEvent } from '../../../../../services/googleCalendar';

export default requireProfessional(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await connectDB();
  const { id, requestId } = req.query;
  const { action } = req.body; // 'approve' | 'reject'

  const apt = await Appointment.findById(id).populate('customerId', 'name email');
  if (!apt) return res.status(404).json({ message: 'Not found' });

  const rr = apt.rescheduleHistory.id(requestId);
  if (!rr) return res.status(404).json({ message: 'Reschedule request not found' });

  rr.respondedAt = new Date();

  if (action === 'approve') {
    const oldDate = apt.date, oldTime = apt.time;
    apt.date = rr.requestedDate;
    apt.time = rr.requestedTime;
    apt.status = 'Rescheduled';
    rr.status = 'approved';
    apt.pendingReschedule = null;

    if (apt.googleEventId) {
      try { await updateCalendarEvent(apt.googleEventId, apt, apt.customerId); } catch(e) {}
    }
    try {
      await sendRescheduleApproved(apt.customerId, apt, { oldDate, oldTime, newDate: apt.date, newTime: apt.time });
    } catch(e) { console.error('Email:', e.message); }

  } else if (action === 'reject') {
    rr.status = 'rejected';
    apt.pendingReschedule = null;
    apt.status = 'Accepted';
    try { await sendRescheduleDeclined(apt.customerId, apt); } catch(e) { console.error('Email:', e.message); }
  }

  await apt.save();
  res.json({ appointment: apt });
});
