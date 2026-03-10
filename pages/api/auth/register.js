// pages/api/auth/register.js
import { connectDB } from '../../../lib/mongodb';
import { signToken } from '../../../lib/auth';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await connectDB();
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
  const user = await User.create({ name, email, password, role: role || 'customer' });
  const token = signToken(user._id);
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}
