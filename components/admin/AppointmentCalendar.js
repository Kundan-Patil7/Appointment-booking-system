// components/admin/AppointmentCalendar.js
import { useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

const localizer = momentLocalizer(moment);

const COLORS = {
  Pending: '#d97706', Accepted: '#059669', Rejected: '#dc2626',
  Rescheduled: '#7c3aed', RescheduleRequested: '#7c3aed',
  Completed: '#166534', Cancelled: '#64748b'
};

export default function AppointmentCalendar({ appointments }) {
  const events = useMemo(() => appointments.map((apt) => {
    const d = new Date(apt.date);
    const timeStr = apt.time || '09:00 AM';
    const [t, period] = timeStr.split(' ');
    let [h, m] = t.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const start = new Date(d); start.setHours(h, m||0, 0);
    const end = new Date(start); end.setHours(end.getHours() + 1);
    return { id: apt._id, title: `${apt.service} — ${apt.customerId?.name || 'Customer'}`, start, end, status: apt.status };
  }), [appointments]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        {Object.entries(COLORS).map(([s, c]) => (
          <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />{s}
          </span>
        ))}
      </div>
      <Calendar
        localizer={localizer} events={events}
        startAccessor="start" endAccessor="end"
        style={{ height: 520 }}
        eventPropGetter={e => ({ style: { background: COLORS[e.status] || '#1e3a5f', border: 'none', borderRadius: 4, color: '#fff', fontSize: 12 } })}
        views={['month','week','day','agenda']}
        defaultView="month"
        tooltipAccessor={e => `${e.title}\nStatus: ${e.status}`}
      />
    </div>
  );
}
