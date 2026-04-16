const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    markedByRole: {
      type: String,
      enum: ['admin', 'faculty'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index on (student, subject, date, timeSlot) to prevent duplicates per class period
attendanceSchema.index({ student: 1, subject: 1, date: 1, timeSlot: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
