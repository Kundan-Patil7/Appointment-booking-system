// services/email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
});

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : 'N/A';
const APP = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const base = (content) => `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f9;margin:0;padding:20px}
.c{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)}
.h{background:linear-gradient(135deg,#1a1a2e,#16213e);padding:30px;text-align:center}
.h h1{color:#e8c97e;margin:0;font-size:22px;letter-spacing:2px}
.h p{color:#a0aec0;margin:5px 0 0;font-size:13px}
.b{padding:28px}
.badge{display:inline-block;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:18px}
.bp{background:#fef3c7;color:#92400e}.ba{background:#d1fae5;color:#065f46}
.br{background:#fee2e2;color:#991b1b}.bs{background:#dbeafe;color:#1e40af}
.box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:18px;margin:16px 0}
.row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e2e8f0}
.row:last-child{border-bottom:none}
.lbl{color:#64748b;font-size:13px;font-weight:600}.val{color:#1e293b;font-size:13px}
.btn{display:block;width:fit-content;margin:20px auto;padding:12px 28px;background:linear-gradient(135deg,#e8c97e,#d4a843);color:#1a1a2e;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px}
.f{background:#f8fafc;padding:18px;text-align:center;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0}
h2{color:#1e293b;font-size:19px;margin:0 0 8px}p{color:#475569;line-height:1.6;font-size:14px}
</style></head><body><div class="c">
<div class="h"><h1>📅 AppointEase</h1><p>Appointment Management System</p></div>
<div class="b">${content}</div>
<div class="f">© ${new Date().getFullYear()} AppointEase. Automated notification.</div>
</div></body></html>`;

const send = async (to, subject, html) => {
  if (!process.env.EMAIL_USER) return console.log('Email skipped:', subject);
  await transporter.sendMail({ from: `"AppointEase" <${process.env.EMAIL_USER}>`, to, subject, html });
};

export const sendBookingConfirmation = async (customer, apt) => send(customer.email, '✅ Appointment Submitted', base(`
  <span class="badge bp">Pending Review</span>
  <h2>Appointment Booked!</h2>
  <p>Hi ${customer.name}, your request is awaiting professional review.</p>
  <div class="box">
    <div class="row"><span class="lbl">Service</span><span class="val">${apt.service}</span></div>
    <div class="row"><span class="lbl">Date</span><span class="val">${fmt(apt.date)}</span></div>
    <div class="row"><span class="lbl">Time</span><span class="val">${apt.time}</span></div>
    <div class="row"><span class="lbl">Priority</span><span class="val">${apt.priority}</span></div>
  </div>
  <p>You'll receive an update once reviewed.</p>`));

export const sendNewToProfessional = async (pro, customer, apt) => send(pro.email, `📋 New Request – ${customer.name}`, base(`
  <span class="badge bp">Action Required</span>
  <h2>New Appointment Request</h2>
  <p><strong>${customer.name}</strong> has requested an appointment.</p>
  <div class="box">
    <div class="row"><span class="lbl">Customer</span><span class="val">${customer.name} (${customer.email})</span></div>
    <div class="row"><span class="lbl">Service</span><span class="val">${apt.service}</span></div>
    <div class="row"><span class="lbl">Date</span><span class="val">${fmt(apt.date)}</span></div>
    <div class="row"><span class="lbl">Time</span><span class="val">${apt.time}</span></div>
    <div class="row"><span class="lbl">Priority</span><span class="val">${apt.priority}</span></div>
    ${apt.note ? `<div class="row"><span class="lbl">Note</span><span class="val">${apt.note}</span></div>` : ''}
  </div>
  <a href="${APP}/admin/dashboard" class="btn">Review in Dashboard →</a>`));

export const sendAccepted = async (customer, apt) => send(customer.email, '✅ Appointment Confirmed', base(`
  <span class="badge ba">Confirmed</span>
  <h2>Appointment Confirmed! 🎉</h2>
  <p>Hi ${customer.name}, your appointment has been confirmed.</p>
  <div class="box">
    <div class="row"><span class="lbl">Service</span><span class="val">${apt.service}</span></div>
    <div class="row"><span class="lbl">Date</span><span class="val">${fmt(apt.date)}</span></div>
    <div class="row"><span class="lbl">Time</span><span class="val">${apt.time}</span></div>
  </div>
  <p>Please be ready 10 minutes before your scheduled time.</p>`));

export const sendRejected = async (customer, apt) => send(customer.email, '❌ Appointment Declined', base(`
  <span class="badge br">Declined</span>
  <h2>Appointment Not Available</h2>
  <p>Hi ${customer.name}, your appointment for <strong>${fmt(apt.date)}</strong> at <strong>${apt.time}</strong> could not be accommodated.</p>
  ${apt.rejectionReason ? `<div class="box"><div class="row"><span class="lbl">Reason</span><span class="val">${apt.rejectionReason}</span></div></div>` : ''}
  <a href="${APP}/customer/book" class="btn">Book New Appointment →</a>`));

export const sendProReschedule = async (customer, apt, d) => send(customer.email, '📅 Appointment Rescheduled', base(`
  <span class="badge bs">Rescheduled</span>
  <h2>Your Appointment Was Rescheduled</h2>
  <p>Hi ${customer.name}, your professional has proposed a new time.</p>
  <div class="box">
    <div class="row"><span class="lbl">Previous Date</span><span class="val">${fmt(d.oldDate)}</span></div>
    <div class="row"><span class="lbl">Previous Time</span><span class="val">${d.oldTime}</span></div>
    <div class="row"><span class="lbl">New Date</span><span class="val">${fmt(d.newDate)}</span></div>
    <div class="row"><span class="lbl">New Time</span><span class="val">${d.newTime}</span></div>
    ${d.reason ? `<div class="row"><span class="lbl">Reason</span><span class="val">${d.reason}</span></div>` : ''}
  </div>`));

export const sendRescheduleRequestToPro = async (pro, apt, req) => send(pro.email, `🔄 Reschedule Request – ${apt.customerId?.name}`, base(`
  <span class="badge bp">Action Required</span>
  <h2>Customer Reschedule Request</h2>
  <p><strong>${apt.customerId?.name}</strong> wants to reschedule their appointment.</p>
  <div class="box">
    <div class="row"><span class="lbl">Service</span><span class="val">${apt.service}</span></div>
    <div class="row"><span class="lbl">Current Date</span><span class="val">${fmt(req.previousDate)}</span></div>
    <div class="row"><span class="lbl">Requested Date</span><span class="val">${fmt(req.requestedDate)}</span></div>
    <div class="row"><span class="lbl">Requested Time</span><span class="val">${req.requestedTime}</span></div>
    ${req.reason ? `<div class="row"><span class="lbl">Reason</span><span class="val">${req.reason}</span></div>` : ''}
  </div>
  <a href="${APP}/admin/dashboard" class="btn">Respond in Dashboard →</a>`));

export const sendRescheduleApproved = async (customer, apt, d) => send(customer.email, '✅ Reschedule Approved', base(`
  <span class="badge ba">Approved</span>
  <h2>Reschedule Request Approved!</h2>
  <p>Hi ${customer.name}, your reschedule has been approved.</p>
  <div class="box">
    <div class="row"><span class="lbl">New Date</span><span class="val">${fmt(d.newDate)}</span></div>
    <div class="row"><span class="lbl">New Time</span><span class="val">${d.newTime}</span></div>
    <div class="row"><span class="lbl">Service</span><span class="val">${apt.service}</span></div>
  </div>`));

export const sendRescheduleDeclined = async (customer, apt) => send(customer.email, '❌ Reschedule Declined', base(`
  <span class="badge br">Declined</span>
  <h2>Reschedule Request Declined</h2>
  <p>Hi ${customer.name}, your reschedule request was declined. Your original appointment stands.</p>
  <div class="box">
    <div class="row"><span class="lbl">Service</span><span class="val">${apt.service}</span></div>
    <div class="row"><span class="lbl">Date</span><span class="val">${fmt(apt.date)}</span></div>
    <div class="row"><span class="lbl">Time</span><span class="val">${apt.time}</span></div>
  </div>
  <a href="${APP}/customer/appointments" class="btn">View Appointments →</a>`));
