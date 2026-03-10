// pages/register.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/AuthContext';
import Navbar from '../components/shared/Navbar';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'customer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      router.push(user.role === 'professional' ? '/admin/dashboard' : '/customer/appointments');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✨</div>
            <h1 style={{ fontSize: 26 }}>Create Account</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Start booking today</p>
          </div>
          <div className="card">
            {error && <div className="alert alert-err">{error}</div>}
            <form onSubmit={onSubmit}>
              <div className="fg">
                <label className="lbl">Full Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required />
              </div>
              <div className="fg">
                <label className="lbl">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
              </div>
              <div className="fg">
                <label className="lbl">Password</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 6 characters" minLength={6} required />
              </div>
              <div className="fg">
                <label className="lbl">Account Type</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="customer">Customer – Book appointments</option>
                  <option value="professional">Professional – Manage appointments</option>
                </select>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Creating…' : 'Create Account'}
              </button>
            </form>
          </div>
          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'var(--muted)' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--navy)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </main>
    </>
  );
}
