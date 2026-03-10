// services/googleCalendar.js
import { google } from 'googleapis';

const getClient = () => new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/calendar']
});

const toISO = (date, time) => {
  const d = new Date(date);
  const [t, period] = time.split(' ');
  let [h, m] = t.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  d.setHours(h, m || 0, 0);
  return d.toISOString();
};

export const createCalendarEvent = async (apt, customer) => {
  console.log('=== GOOGLE CALENDAR DEBUG ===');
  console.log('CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL);
  console.log('CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID);
  console.log('PRIVATE_KEY exists:', !!process.env.GOOGLE_PRIVATE_KEY);

  const auth = getClient();
  const cal = google.calendar({ version: 'v3', auth });

  const start = toISO(apt.date, apt.time);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  const event = {
    summary: `${apt.service} – ${customer.name}`,
    description: `Customer: ${customer.name} (${customer.email})\nService: ${apt.service}\nPriority: ${apt.priority}`,
    start: { dateTime: start, timeZone: 'Asia/Kolkata' },
    end:   { dateTime: end.toISOString(), timeZone: 'Asia/Kolkata' },
   
  };

  console.log('Creating event:', event.summary, 'at', start);

  const res = await cal.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    resource: event,
    sendUpdates: 'none'
  });

  console.log('Event created! ID:', res.data.id);
  console.log('Event link:', res.data.htmlLink);
  console.log('=== END CALENDAR DEBUG ===');

  return res.data.id;
};

export const updateCalendarEvent = async (eventId, apt, customer) => {
  const cal = google.calendar({ version: 'v3', auth: getClient() });
  const start = toISO(apt.date, apt.time);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  await cal.events.patch({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId,
    resource: {
      summary: `${apt.service} – ${customer?.name || ''}`,
      start: { dateTime: start, timeZone: 'Asia/Kolkata' },
      end:   { dateTime: end.toISOString(), timeZone: 'Asia/Kolkata' },
    }
  });
};