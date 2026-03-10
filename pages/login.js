// pages/login.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/AuthContext';
import Navbar from '../components/shared/Navbar';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      router.push(user.role === 'professional' ? '/admin/dashboard' : '/customer/appointments');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📅</div>
            <h1 style={{ fontSize: 26 }}>Welcome back</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Sign in to your account</p>
          </div>
          <div className="card">
            {error && <div className="alert alert-err">{error}</div>}
            <form onSubmit={onSubmit}>
              <div className="fg">
                <label className="lbl">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
              </div>
              <div className="fg">
                <label className="lbl">Password</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>
          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'var(--muted)' }}>
            Don't have an account? <Link href="/register" style={{ color: 'var(--navy)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </main>
    </>
  );
}
