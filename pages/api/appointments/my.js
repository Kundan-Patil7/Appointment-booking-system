// pages/api/appointments/my.js
import { connectDB } from '../../../lib/mongodb';
import { requireAuth } from '../../../lib/auth';
import Appointment from '../../../models/Appointment';

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  await connectDB();
  const apts = await Appointment.find({ customerId: req.user._id }).sort({ date: -1 });
  res.json({ appointments: apts });
});
