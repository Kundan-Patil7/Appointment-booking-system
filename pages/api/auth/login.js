// pages/api/auth/login.js
import { connectDB } from '../../../lib/mongodb';
import { signToken } from '../../../lib/auth';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await connectDB();
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken(user._id);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}
