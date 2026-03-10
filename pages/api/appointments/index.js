// pages/api/appointments/index.js
import { connectDB } from '../../../lib/mongodb';
import { requireAuth, requireProfessional } from '../../../lib/auth';
import Appointment from '../../../models/Appointment';
import User from '../../../models/User';
import { sendBookingConfirmation, sendNewToProfessional } from '../../../services/email';
import { createCalendarEvent } from '../../../services/googleCalendar';

export default requireAuth(async function handler(req, res) {
  await connectDB();

  // GET all appointments — professional only
  if (req.method === 'GET') {
    if (req.user.role !== 'professional') return res.status(403).json({ message: 'Forbidden' });
    const apts = await Appointment.find().populate('customerId', 'name email').sort({ date: -1 });
    return res.json({ appointments: apts });
  }

  // POST create appointment — customer
  if (req.method === 'POST') {
    const { service, date, time, note, priority } = req.body;
    if (!service || !date || !time) return res.status(400).json({ message: 'Missing required fields' });

    const apt = await Appointment.create({
      customerId: req.user._id, service, date, time,
      note: note || '', priority: priority || 'Medium', status: 'Pending'
    });

    // Google Calendar
try {
  if (process.env.GOOGLE_CALENDAR_ID && process.env.GOOGLE_CLIENT_EMAIL) {
    const eventId = await createCalendarEvent(apt, req.user);
    apt.googleEventId = eventId;
    await apt.save();
  }
} catch (e) {
  console.error('=== CALENDAR ERROR ===');
  console.error('Message:', e.message);
  console.error('Details:', e.response?.data || e);
  console.error('=== END ERROR ===');
}

    // Google Calendar
    try {
      if (process.env.GOOGLE_CALENDAR_ID && process.env.GOOGLE_CLIENT_EMAIL) {
        const eventId = await createCalendarEvent(apt, req.user);
        apt.googleEventId = eventId;
        await apt.save();
      }
    } catch (e) { console.error('Calendar:', e.message); }

    // Emails
    try { await sendBookingConfirmation(req.user, apt); } catch (e) { console.error('Email:', e.message); }
    try {
      const pro = await User.findOne({ role: 'professional' });
      if (pro) await sendNewToProfessional(pro, req.user, apt);
    } catch (e) { console.error('Email:', e.message); }

    return res.status(201).json({ appointment: apt });
  }

  res.status(405).end();
});
