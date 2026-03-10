# 📅 AppointEase — Appointment Booking System

A full-stack **Appointment Booking System** built using **Next.js, MongoDB, and Google Calendar API**.

The project allows **customers to book appointments** and **professionals to manage them** through a dashboard with email notifications and calendar integration.

---

# 🚀 Features

## Customer
- Register and login
- Book appointments
- View their appointments
- Request reschedule
- Receive email notifications

## Professional
- View all appointments
- Accept or reject appointments
- Reschedule appointments
- Respond to customer reschedule requests
- Dashboard with statistics
- Calendar view of appointments

## Notifications
Email notifications are sent when:

- Appointment is booked
- Appointment is accepted
- Appointment is rejected
- Appointment is rescheduled
- Customer requests reschedule
- Professional approves or declines reschedule

## Google Calendar Integration
- Automatically creates calendar events
- Syncs confirmed appointments
- Prevents scheduling conflicts

---

# 🛠 Tech Stack

## Frontend
- Next.js
- React
- CSS

## Backend
- Next.js API Routes
- Node.js

## Database
- MongoDB
- Mongoose

## Authentication
- JWT

## Email
- Nodemailer

## Calendar
- Google Calendar API

## Libraries
- react-big-calendar
- moment
- bcryptjs
- jsonwebtoken

---

# 📁 Project Structure

```
appointment-nextjs/
│
├── pages/
│   ├── index.js
│   ├── login.js
│   ├── register.js
│   │
│   ├── customer/
│   │   ├── book.js
│   │   └── appointments.js
│   │
│   ├── admin/
│   │   └── dashboard.js
│   │
│   └── api/
│       ├── auth/
│       │   ├── register.js
│       │   ├── login.js
│       │   └── me.js
│       │
│       └── appointments/
│           ├── index.js
│           ├── my.js
│           ├── stats.js
│           └── [id]/
│               ├── status.js
│               ├── reschedule.js
│               ├── request-reschedule.js
│               └── respond/
│                   └── [requestId].js
│
├── models/
│   ├── User.js
│   └── Appointment.js
│
├── services/
│   ├── email.js
│   └── googleCalendar.js
│
├── lib/
│   ├── mongodb.js
│   ├── auth.js
│   └── AuthContext.js
│
├── components/
│   ├── shared/Navbar.js
│   └── admin/AppointmentCalendar.js
│
├── styles/
│   └── globals.css
│
├── .env.local
└── next.config.js
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/yourusername/appointment-booking-system.git
```

Go to the project directory

```bash
cd appointment-nextjs
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

Application will start at

```
http://localhost:3000
```

---

# 🔐 Environment Variables

Create `.env.local`

```
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_CALENDAR_ID=your_calendar_id

EMAIL_USER=your_gmail
EMAIL_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

---

# 📊 Appointment Status

| Status | Description |
|------|-------------|
| Pending | Appointment awaiting review |
| Accepted | Appointment confirmed |
| Rejected | Appointment declined |
| Rescheduled | Time changed |
| RescheduleRequested | Customer requested new time |
| Completed | Appointment finished |
| Cancelled | Appointment cancelled |

---

# 🔄 Appointment Workflow

                                    Customer books appointment

                                            ↓

                                    Professional reviews request

                                            ↓   

                                    Professional can:
                                      - Accept
                                      - Reject
                                      - Reschedule

                                            ↓

                                Customer can request reschedule

                                            ↓

                            Professional approves or rejects request

---

# 📦 Dependencies

```
next
react
react-dom
mongoose
bcryptjs
jsonwebtoken
nodemailer
googleapis
react-big-calendar
moment
```

---

# 🔐 Authentication Flow

1. User registers or logs in
2. Server returns JWT token
3. Token stored in localStorage
4. API requests include

```
Authorization: Bearer <token>
```

5. Middleware verifies token

---

# 👨‍💻 Author

**Kundan Patil**

GitHub  
https://github.com/Kundan-Patil7

LinkedIn  
https://www.linkedin.com/in/kundan-patil88

Portfolio  
https://kundan-patil.vercel.app

---

# ⭐ Support

If you like this project, consider giving it a **star ⭐ on GitHub**.# Appointment-booking-system
