// pages/api/appointments/stats.js
import { connectDB } from '../../../lib/mongodb';
import { requireProfessional } from '../../../lib/auth';
import Appointment from '../../../models/Appointment';

export default requireProfessional(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  await connectDB();
  const [total, pending, accepted, rejected, rescheduled, completed] = await Promise.all([
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: 'Pending' }),
    Appointment.countDocuments({ status: 'Accepted' }),
    Appointment.countDocuments({ status: 'Rejected' }),
    Appointment.countDocuments({ status: { $in: ['Rescheduled','RescheduleRequested'] } }),
    Appointment.countDocuments({ status: 'Completed' }),
  ]);
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
  const todayCount = await Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } });
  res.json({ total, pending, accepted, rejected, rescheduled, completed, today: todayCount });
});
