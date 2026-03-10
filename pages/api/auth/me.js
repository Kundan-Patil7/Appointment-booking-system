// pages/api/auth/me.js
import { requireAuth } from '../../../lib/auth';

export default requireAuth(async function handler(req, res) {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
});
