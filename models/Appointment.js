// models/Appointment.js
import mongoose from 'mongoose';

const rescheduleSchema = new mongoose.Schema({
  requestedBy:   { type: String, enum: ['customer', 'professional'], required: true },
  previousDate:  Date,
  previousTime:  String,
  requestedDate: Date,
  requestedTime: String,
  reason:        String,
  status:        { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  respondedAt:   Date,
  requestedAt:   { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: {
    type: String, required: true,
    enum: ['Consultation','Follow-up','General Checkup','Specialist Visit',
           'Lab Test','Therapy Session','Dental','Eye Exam','Vaccination','Emergency']
  },
  date:     { type: Date, required: true },
  time:     { type: String, required: true },
  note:     { type: String, maxlength: 500, default: '' },
  priority: { type: String, enum: ['Low','Medium','High'], default: 'Medium' },
  status: {
    type: String,
    enum: ['Pending','Accepted','Rejected','Rescheduled','RescheduleRequested','Completed','Cancelled'],
    default: 'Pending'
  },
  googleEventId:    { type: String, default: null },
  rejectionReason:  { type: String, default: '' },
  rescheduleHistory: [rescheduleSchema],
  pendingReschedule: { type: mongoose.Schema.Types.ObjectId, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

appointmentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
