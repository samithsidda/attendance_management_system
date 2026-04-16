const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');

// @desc    Mark attendance (bulk)
// @route   POST /api/attendance
// @access  Private (Admin/Faculty)
const markAttendance = asyncHandler(async (req, res) => {
  const records = req.body;
  
  if (!Array.isArray(records) || records.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of attendance records');
  }

  // Extract a distinct subject ID (assuming bulk mark is per class/subject)
  const subjectId = records[0].subject;

  if (req.user.role === 'faculty') {
    if (!req.user.subjects.includes(subjectId)) {
      res.status(403);
      throw new Error('You are not authorized to mark attendance for this subject');
    }
  } else if (req.user.role === 'student') {
    res.status(403);
    throw new Error('Students are not authorized to mark attendance');
  }

  const timeSlot = records[0].timeSlot;
  if (!timeSlot) {
    res.status(400);
    throw new Error('Time slot is required');
  }

  // Pre-flight collision check
  const startOfDay = new Date(records[0].date);
  startOfDay.setUTCHours(0,0,0,0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  const existingRecords = await Attendance.find({
    subject: subjectId,
    date: { $gte: startOfDay, $lt: endOfDay },
    timeSlot: timeSlot
  });

  if (existingRecords.length > 0) {
    res.status(400);
    throw new Error(`Attendance collision: Records already exist for ${timeSlot} on this date.`);
  }

  const markedRecords = records.map(record => ({
    ...record,
    markedBy: req.user._id,
    markedByRole: req.user.role,
  }));

  try {
    const ops = markedRecords.map(record => ({
      updateOne: {
        filter: { student: record.student, subject: record.subject, date: record.date, timeSlot: record.timeSlot },
        update: { $set: record },
        upsert: true
      }
    }));
    await Attendance.bulkWrite(ops);
    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(400);
    throw new Error(`Failed to mark attendance: ${error.message}`);
  }
});

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendance = asyncHandler(async (req, res) => {
  const { date, subject, student, department } = req.query;
  let query = {};
  
  if (date) { query.date = new Date(date); }
  if (subject) { query.subject = subject; }
  else if (department) {
      const deptSubjects = await Subject.find({ department }).select('_id');
      query.subject = { $in: deptSubjects.map(s => s._id) };
  }
  if (student) { query.student = student; }
  
  if (req.user.role === 'student') {
    query.student = req.user._id; 
  } else if (req.user.role === 'faculty') {
    if (subject) {
       if (!req.user.subjects.includes(subject)) {
           res.status(403);
           throw new Error('You do not have access to this subject');
       }
    } else {
       if (query.subject && query.subject.$in) {
           const facultySubjectIds = req.user.subjects.map(id => id.toString());
           query.subject.$in = query.subject.$in.filter(id => facultySubjectIds.includes(id.toString()));
       } else {
           query.subject = { $in: req.user.subjects };
       }
    }
  }
  
  const records = await Attendance.find(query)
    .populate('student', 'name rollNumber department')
    .populate('subject', 'name code')
    .sort({ date: -1 });
    
  res.json(records);
});

// @desc    Update single attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Admin/Faculty)
const updateAttendanceRecord = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const record = await Attendance.findById(req.params.id);
  
  if (!record) {
    res.status(404);
    throw new Error('Attendance record not found');
  }
  
  if (req.user.role === 'faculty') {
    if (!req.user.subjects.includes(record.subject.toString())) {
       res.status(403);
       throw new Error('Not authorized to modify this subject attendance');
    }
  } else if (req.user.role === 'student') {
     res.status(403);
     throw new Error('Students are not authorized to update attendance');
  }
  
  record.status = status;
  record.markedBy = req.user._id;
  record.markedByRole = req.user.role;
  
  await record.save();
  const updatedRecord = await Attendance.findById(record._id)
    .populate('student', 'name rollNumber department')
    .populate('subject', 'name code');
    
  res.json(updatedRecord);
});

// @desc    Get attendance history for a single student
// @route   GET /api/attendance/student/:studentId
// @access  Private
const getStudentHistory = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;
  
  if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
    res.status(403);
    throw new Error('You can only access your own attendance history');
  }
  
  let query = { student: studentId };
  if (req.user.role === 'faculty') {
    query.subject = { $in: req.user.subjects };
  }
  
  const records = await Attendance.find(query)
    .populate('subject', 'name code')
    .sort({ date: -1 });
    
  res.json(records);
});

module.exports = {
  markAttendance,
  getAttendance,
  updateAttendanceRecord,
  getStudentHistory,
};
