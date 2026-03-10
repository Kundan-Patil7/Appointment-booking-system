// pages/customer/book.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../../components/shared/Navbar';
import { useAuth, apiFetch } from '../../lib/AuthContext';

const SERVICES = ['Consultation','Follow-up','General Checkup','Specialist Visit','Lab Test','Therapy Session','Dental','Eye Exam','Vaccination','Emergency'];
const TIMES = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'];

export default function BookPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ service:'', date:'', time:'', note:'', priority:'Medium' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user?.role === 'professional') router.push('/admin/dashboard');
  }, [user, loading]);

  const minDate = (() => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; })();

  const onSubmit = async (e) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      await apiFetch('/api/appointments', { method: 'POST', body: JSON.stringify(form) });
      setDone(true);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="spin-wrap"><div className="spin" /></div>;

  if (done) return (
    <>
      <Navbar />
      <main style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 64px)', padding:40 }}>
        <div className="card" style={{ textAlign:'center', maxWidth:460 }}>
          <div style={{ fontSize:52, marginBottom:14 }}>🎉</div>
          <h2 style={{ marginBottom:10 }}>Appointment Submitted!</h2>
          <p style={{ color:'var(--muted)', marginBottom:24 }}>You'll get an email confirmation shortly, and another update once the professional reviews your request.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn btn-primary" onClick={() => router.push('/customer/appointments')}>View Appointments</button>
            <button className="btn btn-outline" onClick={() => { setDone(false); setForm({ service:'', date:'', time:'', note:'', priority:'Medium' }); }}>Book Another</button>
          </div>
        </div>
      </main>
    </>
  );

  return (
    <>
      <Navbar />
      <main style={{ maxWidth:620, margin:'0 auto', padding:'36px 24px' }}>
        <h1 style={{ fontSize:26, marginBottom:4 }}>Book an Appointment</h1>
        <p style={{ color:'var(--muted)', fontSize:14, marginBottom:24 }}>Fill in the details below</p>

        <div className="card">
          {error && <div className="alert alert-err">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="fg">
              <label className="lbl">Service *</label>
              <select value={form.service} onChange={e => setForm({...form, service:e.target.value})} required>
                <option value="">Select a service…</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="fg">
                <label className="lbl">Date *</label>
                <input type="date" value={form.date} min={minDate} onChange={e => setForm({...form, date:e.target.value})} required />
              </div>
              <div className="fg">
                <label className="lbl">Time *</label>
                <select value={form.time} onChange={e => setForm({...form, time:e.target.value})} required>
                  <option value="">Select…</option>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="fg">
              <label className="lbl">Priority</label>
              <div style={{ display:'flex', gap:20, marginTop:4 }}>
                {['Low','Medium','High'].map(p => (
                  <label key={p} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:14 }}>
                    <input type="radio" name="priority" value={p} checked={form.priority===p} onChange={e => setForm({...form, priority:e.target.value})} style={{ width:'auto' }} />
                    <span className={`dot dot-${p}`} />{p}
                  </label>
                ))}
              </div>
            </div>

            <div className="fg">
              <label className="lbl">Note (optional)</label>
              <textarea value={form.note} onChange={e => setForm({...form, note:e.target.value})} rows={3} placeholder="Additional info for the professional…" maxLength={500} style={{ resize:'vertical' }} />
              <div style={{ fontSize:11, color:'var(--muted)', marginTop:3, textAlign:'right' }}>{form.note.length}/500</div>
            </div>

            <button className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center' }} disabled={submitting}>
              {submitting ? 'Submitting…' : '📅 Book Appointment'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
