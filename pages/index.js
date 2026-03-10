// pages/index.js
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/AuthContext';
import Navbar from '../components/shared/Navbar';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user) router.push(user.role === 'professional' ? '/admin/dashboard' : '/customer/appointments');
  }, [user]);

  return (
    <>
      <Navbar />
      <section style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📅</div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', color: '#e8c97e', marginBottom: 14 }}>AppointEase</h1>
          <p style={{ fontSize: 17, color: '#a0aec0', marginBottom: 40, lineHeight: 1.7 }}>
            Book, manage, and track appointments effortlessly — with real-time status updates and email notifications.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-gold btn-lg">Book an Appointment →</Link>
            <Link href="/login" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>Sign In</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 36, fontSize: 30 }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 20 }}>
          {[
            { icon: '📝', title: 'Book', desc: 'Choose your service, date, and time — submit in seconds.' },
            { icon: '🔔', title: 'Get Notified', desc: 'Receive email updates for every status change automatically.' },
            { icon: '🔄', title: 'Reschedule', desc: 'Flexible two-way rescheduling between customer and professional.' },
            { icon: '📊', title: 'Dashboard', desc: 'Admin gets full table + calendar view to manage everything.' },
          ].map(f => (
            <div key={f.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ background: 'var(--ink)', color: '#a0aec0', padding: '20px', textAlign: 'center', fontSize: 13 }}>
        © {new Date().getFullYear()} AppointEase
      </footer>
    </>
  );
}
