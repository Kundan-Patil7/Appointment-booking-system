// components/shared/Navbar.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const p = router.pathname;

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">📅 Appoint<span>Ease</span></Link>
      <div className="nav-links">
        {user ? (
          <>
            <span style={{ fontSize: 13, color: 'var(--muted)', padding: '0 8px' }}>Hi, <strong>{user.name}</strong></span>
            {user.role === 'professional' ? (
              <Link href="/admin/dashboard" className={`nav-link ${p.startsWith('/admin') ? 'active' : ''}`}>Dashboard</Link>
            ) : (
              <>
                <Link href="/customer/book" className={`nav-link ${p === '/customer/book' ? 'active' : ''}`}>Book</Link>
                <Link href="/customer/appointments" className={`nav-link ${p === '/customer/appointments' ? 'active' : ''}`}>My Appointments</Link>
              </>
            )}
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-link">Login</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
