// pages/customer/appointments.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../../components/shared/Navbar';
import { useAuth, apiFetch } from '../../lib/AuthContext';

const TIMES = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'];
const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' }) : 'N/A';
const minDate = () => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; };

const STATUS_LABELS = { Pending:'⏳ Pending', Accepted:'✅ Confirmed', Rejected:'❌ Rejected', Rescheduled:'📅 Rescheduled', RescheduleRequested:'🔄 Reschedule Requested', Completed:'🎉 Completed', Cancelled:'🚫 Cancelled' };

export default function MyAppointments() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [apts, setApts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ date:'', time:'', reason:'' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user?.role === 'professional') router.push('/admin/dashboard');
  }, [user, loading]);

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    try { const d = await apiFetch('/api/appointments/my'); setApts(d.appointments); }
    catch(e) {} finally { setFetching(false); }
  };

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''), 3500); };

  const submitReschedule = async (e) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      await apiFetch(`/api/appointments/${modal._id}/request-reschedule`, { method:'POST', body:JSON.stringify(form) });
      setModal(null); showToast('Reschedule request sent!'); load();
    } catch(err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const canReschedule = s => ['Pending','Accepted','Rescheduled'].includes(s);

  if (loading || fetching) return <div className="spin-wrap"><div className="spin" /></div>;

  return (
    <>
      <Navbar />
      {toast && <div className="toast">✅ {toast}</div>}

      <main style={{ maxWidth:1000, margin:'0 auto', padding:'28px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:26 }}>My Appointments</h1>
            <p style={{ color:'var(--muted)', fontSize:14 }}>{apts.length} total</p>
          </div>
          <Link href="/customer/book" className="btn btn-primary">+ Book New</Link>
        </div>

        {apts.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="empty-icon">📅</div>
              <div className="empty-title">No appointments yet</div>
              <p style={{ marginBottom:20 }}>Book your first appointment to get started.</p>
              <Link href="/customer/book" className="btn btn-primary">Book an Appointment</Link>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {apts.map(apt => (
              <div key={apt._id} className="card" style={{ padding:'18px 22px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
                      <strong style={{ fontSize:16 }}>{apt.service}</strong>
                      <span className={`badge badge-${apt.status}`}>{STATUS_LABELS[apt.status] || apt.status}</span>
                      <span style={{ fontSize:12, color:'var(--muted)' }}><span className={`dot dot-${apt.priority}`}/>{apt.priority}</span>
                    </div>
                    <div style={{ display:'flex', gap:20, fontSize:13, color:'var(--muted)' }}>
                      <span>📅 {fmt(apt.date)}</span>
                      <span>🕐 {apt.time}</span>
                    </div>
                    {apt.note && <p style={{ fontSize:13, color:'var(--muted)', marginTop:6 }}>📝 {apt.note}</p>}
                    {apt.rejectionReason && <p style={{ fontSize:13, color:'var(--red)', marginTop:6 }}>❌ {apt.rejectionReason}</p>}
                  </div>
                  {canReschedule(apt.status) && (
                    <button className="btn btn-outline btn-sm" onClick={() => { setModal(apt); setForm({ date:'', time:'', reason:'' }); setError(''); }}>
                      🔄 Reschedule
                    </button>
                  )}
                </div>

                {apt.rescheduleHistory?.length > 0 && (
                  <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
                    <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:'var(--muted)', marginBottom:8 }}>Reschedule History</div>
                    <div className="tl">
                      {apt.rescheduleHistory.map((h, i) => (
                        <div key={i} className="tl-item">
                          <div className="tl-date">{fmt(h.requestedAt)} · by {h.requestedBy}</div>
                          <div className="tl-body">
                            Requested: {fmt(h.requestedDate)} at {h.requestedTime}
                            {h.reason && ` — "${h.reason}"`}
                            <span className={`badge badge-${h.status==='approved'?'Accepted':h.status==='rejected'?'Rejected':'Pending'}`} style={{ marginLeft:8, fontSize:10 }}>{h.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {modal && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Request Reschedule</h2>
            <p style={{ fontSize:14, color:'var(--muted)', marginBottom:16 }}>Rescheduling: <strong>{modal.service}</strong></p>
            {error && <div className="alert alert-err">{error}</div>}
            <form onSubmit={submitReschedule}>
              <div className="fg">
                <label className="lbl">New Date *</label>
                <input type="date" value={form.date} min={minDate()} onChange={e=>setForm({...form,date:e.target.value})} required />
              </div>
              <div className="fg">
                <label className="lbl">New Time *</label>
                <select value={form.time} onChange={e=>setForm({...form,time:e.target.value})} required>
                  <option value="">Select…</option>
                  {TIMES.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="fg">
                <label className="lbl">Reason</label>
                <textarea value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} rows={2} placeholder="Why do you need to reschedule?" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={()=>setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting?'Sending…':'Send Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
