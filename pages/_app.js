// pages/_app.js
import { AuthProvider } from '../lib/AuthContext';
import '../styles/globals.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
