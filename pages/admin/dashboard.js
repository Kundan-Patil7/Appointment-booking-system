// pages/admin/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Navbar from '../../components/shared/Navbar';
import { useAuth, apiFetch } from '../../lib/AuthContext';

const AppointmentCalendar = dynamic(() => import('../../components/admin/AppointmentCalendar'), { ssr: false });

const TIMES = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'];
const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }) : 'N/A';

const STATUS_LABELS = { Pending:'⏳ Pending', Accepted:'✅ Confirmed', Rejected:'❌ Rejected', Rescheduled:'📅 Rescheduled', RescheduleRequested:'🔄 Reschedule Req.', Completed:'🎉 Completed' };

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [apts, setApts] = useState([]);
  const [stats, setStats] = useState({});
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // { apt, type }
  const [mform, setMform] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user?.role !== 'professional') router.push('/customer/appointments');
  }, [user, loading]);

  useEffect(() => { if (user?.role === 'professional') loadAll(); }, [user]);

  const loadAll = async () => {
    try {
      const [a, s] = await Promise.all([apiFetch('/api/appointments'), apiFetch('/api/appointments/stats')]);
      setApts(a.appointments); setStats(s);
    } catch(e) {} finally { setFetching(false); }
  };

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''), 3500); };

  const doAction = async (e) => {
    e.preventDefault(); setSubmitting(true);
    const { apt, type } = modal;
    try {
      if (type === 'accept') {
        await apiFetch(`/api/appointments/${apt._id}/status`, { method:'PATCH', body: JSON.stringify({ status:'Accepted' }) });
        showToast('Appointment accepted ✅');
      } else if (type === 'reject') {
        await apiFetch(`/api/appointments/${apt._id}/status`, { method:'PATCH', body: JSON.stringify({ status:'Rejected', rejectionReason: mform.reason||'' }) });
        showToast('Appointment rejected');
      } else if (type === 'reschedule') {
        await apiFetch(`/api/appointments/${apt._id}/reschedule`, { method:'POST', body: JSON.stringify({ date:mform.date, time:mform.time, reason:mform.reason }) });
        showToast('Rescheduled 📅');
      } else if (type === 'approve-rs') {
        await apiFetch(`/api/appointments/${apt._id}/respond/${mform.requestId}`, { method:'POST', body: JSON.stringify({ action:'approve' }) });
        showToast('Reschedule approved ✅');
      } else if (type === 'reject-rs') {
        await apiFetch(`/api/appointments/${apt._id}/respond/${mform.requestId}`, { method:'POST', body: JSON.stringify({ action:'reject' }) });
        showToast('Reschedule declined');
      }
      setModal(null); loadAll();
    } catch(err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  const filtered = apts.filter(a => {
    const q = search.toLowerCase();
    const match = !q || a.customerId?.name?.toLowerCase().includes(q) || a.service?.toLowerCase().includes(q);
    if (tab === 'pending') return match && a.status === 'Pending';
    if (tab === 'reschedule') return match && a.status === 'RescheduleRequested';
    return match;
  });

  const STATS = [
    { l:'Total', v:stats.total||0, c:'var(--navy)', i:'📋' },
    { l:'Pending', v:stats.pending||0, c:'var(--orange)', i:'⏳' },
    { l:'Confirmed', v:stats.accepted||0, c:'var(--green)', i:'✅' },
    { l:'Rejected', v:stats.rejected||0, c:'var(--red)', i:'❌' },
    { l:'Rescheduled', v:stats.rescheduled||0, c:'var(--purple)', i:'🔄' },
    { l:'Today', v:stats.today||0, c:'var(--gold)', i:'📅' },
  ];

  if (loading || fetching) return <div className="spin-wrap"><div className="spin" /></div>;

  return (
    <>
      <Navbar />
      {toast && <div className="toast">{toast}</div>}

      <main style={{ maxWidth:1280, margin:'0 auto', padding:'28px 24px' }}>
        <h1 style={{ fontSize:26, marginBottom:4 }}>Admin Dashboard</h1>
        <p style={{ color:'var(--muted)', fontSize:14, marginBottom:24 }}>Manage all appointment requests</p>

        {/* Stats */}
        <div className="stats-grid">
          {STATS.map(s => (
            <div key={s.l} className="stat-card">
              <div style={{ fontSize:22, marginBottom:6 }}>{s.i}</div>
              <div className="stat-val" style={{ color:s.c }}>{s.v}</div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[
            { id:'all',        label:'All Appointments' },
            { id:'pending',    label:`Pending (${stats.pending||0})` },
            { id:'reschedule', label:`Reschedule (${stats.rescheduled||0})` },
            { id:'calendar',   label:'📅 Calendar' },
          ].map(t => (
            <button key={t.id} className={`btn btn-sm ${tab===t.id?'btn-primary':'btn-outline'}`} style={{ border:'none' }} onClick={()=>setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'calendar' ? (
          <div className="card">
            <h2 style={{ fontSize:18, marginBottom:20 }}>Appointments Calendar</h2>
            <AppointmentCalendar appointments={apts} />
          </div>
        ) : (
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', gap:12, alignItems:'center' }}>
              <input type="text" placeholder="Search by customer or service…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:280 }} />
              <span style={{ fontSize:13, color:'var(--muted)', marginLeft:'auto' }}>{filtered.length} records</span>
            </div>

            {filtered.length === 0 ? (
              <div className="empty"><div className="empty-icon">📭</div><div className="empty-title">No appointments found</div></div>
            ) : (
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th><th>Service</th><th>Date & Time</th><th>Priority</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(apt => {
                      const pendingRS = apt.rescheduleHistory?.find(r => r.status === 'pending');
                      return (
                        <tr key={apt._id}>
                          <td>
                            <div style={{ fontWeight:600 }}>{apt.customerId?.name}</div>
                            <div style={{ fontSize:12, color:'var(--muted)' }}>{apt.customerId?.email}</div>
                          </td>
                          <td>{apt.service}</td>
                          <td>
                            <div>{fmt(apt.date)}</div>
                            <div style={{ fontSize:12, color:'var(--muted)' }}>{apt.time}</div>
                          </td>
                          <td><span className={`dot dot-${apt.priority}`}/>{apt.priority}</td>
                          <td><span className={`badge badge-${apt.status}`}>{STATUS_LABELS[apt.status]||apt.status}</span></td>
                          <td>
                            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                              {apt.status === 'Pending' && (
                                <>
                                  <button className="btn btn-success btn-sm" onClick={()=>{ setMform({}); setModal({apt,type:'accept'}); }}>Accept</button>
                                  <button className="btn btn-danger btn-sm" onClick={()=>{ setMform({}); setModal({apt,type:'reject'}); }}>Reject</button>
                                </>
                              )}
                              {apt.status === 'RescheduleRequested' && pendingRS && (
                                <>
                                  <button className="btn btn-success btn-sm" onClick={()=>{ setMform({requestId:pendingRS._id}); setModal({apt,type:'approve-rs'}); }}>Approve</button>
                                  <button className="btn btn-danger btn-sm" onClick={()=>{ setMform({requestId:pendingRS._id}); setModal({apt,type:'reject-rs'}); }}>Reject</button>
                                </>
                              )}
                              {['Pending','Accepted','Rescheduled'].includes(apt.status) && (
                                <button className="btn btn-outline btn-sm" onClick={()=>{ setMform({}); setModal({apt,type:'reschedule'}); }}>Reschedule</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {modal && (
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>

            {modal.type === 'accept' && (
              <>
                <h2>Confirm Acceptance</h2>
                <p style={{ color:'var(--muted)', fontSize:14, marginBottom:20 }}>
                  Accept appointment for <strong>{modal.apt.customerId?.name}</strong>? An email will be sent.
                </p>
                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={()=>setModal(null)}>Cancel</button>
                  <button className="btn btn-success" onClick={doAction} disabled={submitting}>{submitting?'…':'✅ Accept'}</button>
                </div>
              </>
            )}

            {modal.type === 'reject' && (
              <>
                <h2>Reject Appointment</h2>
                <form onSubmit={doAction}>
                  <div className="fg">
                    <label className="lbl">Reason (sent to customer)</label>
                    <textarea value={mform.reason||''} onChange={e=>setMform({...mform,reason:e.target.value})} rows={3} placeholder="Optional reason…" />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn btn-outline" onClick={()=>setModal(null)}>Cancel</button>
                    <button type="submit" className="btn btn-danger" disabled={submitting}>{submitting?'…':'❌ Reject'}</button>
                  </div>
                </form>
              </>
            )}

            {modal.type === 'reschedule' && (
              <>
                <h2>Reschedule Appointment</h2>
                <form onSubmit={doAction}>
                  <div className="fg">
                    <label className="lbl">New Date *</label>
                    <input type="date" value={mform.date||''} onChange={e=>setMform({...mform,date:e.target.value})} required />
                  </div>
                  <div className="fg">
                    <label className="lbl">New Time *</label>
                    <select value={mform.time||''} onChange={e=>setMform({...mform,time:e.target.value})} required>
                      <option value="">Select…</option>
                      {TIMES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="fg">
                    <label className="lbl">Reason</label>
                    <textarea value={mform.reason||''} onChange={e=>setMform({...mform,reason:e.target.value})} rows={2} />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn btn-outline" onClick={()=>setModal(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting?'…':'📅 Reschedule'}</button>
                  </div>
                </form>
              </>
            )}

            {(modal.type === 'approve-rs' || modal.type === 'reject-rs') && (() => {
              const rr = modal.apt.rescheduleHistory?.find(r => r.status === 'pending');
              return (
                <>
                  <h2>{modal.type === 'approve-rs' ? 'Approve Reschedule?' : 'Decline Reschedule?'}</h2>
                  {rr && (
                    <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', padding:'14px', marginBottom:16 }}>
                      <div style={{ fontSize:13, color:'var(--muted)' }}>Customer requested:</div>
                      <div style={{ fontWeight:600, marginTop:4 }}>{fmt(rr.requestedDate)} at {rr.requestedTime}</div>
                      {rr.reason && <div style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>"{rr.reason}"</div>}
                    </div>
                  )}
                  <p style={{ fontSize:14, color:'var(--muted)', marginBottom:16 }}>
                    {modal.type === 'approve-rs' ? 'The appointment will be rescheduled and the customer notified.' : 'The customer will be notified their request was declined.'}
                  </p>
                  <div className="modal-actions">
                    <button className="btn btn-outline" onClick={()=>setModal(null)}>Cancel</button>
                    <button className={`btn ${modal.type==='approve-rs'?'btn-success':'btn-danger'}`} onClick={doAction} disabled={submitting}>
                      {submitting ? '…' : modal.type==='approve-rs' ? '✅ Approve' : '❌ Decline'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
