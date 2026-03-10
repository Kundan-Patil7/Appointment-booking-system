// lib/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { connectDB } from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyAuth(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    return user || null;
  } catch {
    return null;
  }
}

export function requireAuth(handler) {
  return async (req, res) => {
    const user = await verifyAuth(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    return handler(req, res);
  };
}

export function requireProfessional(handler) {
  return async (req, res) => {
    const user = await verifyAuth(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (user.role !== 'professional') return res.status(403).json({ message: 'Professional access required' });
    req.user = user;
    return handler(req, res);
  };
}
