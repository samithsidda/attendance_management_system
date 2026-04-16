const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');

// @desc    Daily attendance summary
// @route   GET /api/reports/daily
// @access  Private
const getDailyReport = asyncHandler(async (req, res) => {
  const { date, subjectId, department } = req.query;
  if (!date) {
    res.status(400);
    throw new Error('Date is required');
  }

  let matchStage = { date: new Date(date) };
  if (subjectId) matchStage.subject = new mongoose.Types.ObjectId(subjectId);
  else if (department) {
      const deptSubjects = await Subject.find({ department }).select('_id');
      const deptSubjectIds = deptSubjects.map(s => s._id);
      matchStage.subject = { $in: deptSubjectIds };
  }

  // If faculty, limit to assigned subjects
  if (req.user.role === 'faculty' && !subjectId) {
      const facultySubjectIds = req.user.subjects.map(id => new mongoose.Types.ObjectId(id));
      if (matchStage.subject && matchStage.subject.$in) {
          // INTERSECTION of department subjects and faculty subjects
          matchStage.subject.$in = matchStage.subject.$in.filter(id => 
              facultySubjectIds.some(fid => fid.equals(id))
          );
      } else {
          matchStage.subject = { $in: facultySubjectIds };
      }
  } else if (req.user.role === 'faculty' && subjectId) {
    if (!req.user.subjects.includes(subjectId)) {
        res.status(403); throw new Error('Not authorized for this subject');
    }
  } else if (req.user.role === 'student') {
      const studentSubjects = await Subject.find({ department: req.user.department, semester: req.user.semester }).select('_id');
      const studentSubjectIds = studentSubjects.map(s => s._id);

      if (subjectId) {
         if (!studentSubjectIds.some(id => id.equals(new mongoose.Types.ObjectId(subjectId)))) {
             res.status(403); throw new Error('Not authorized for this subject');
         }
      } else {
         if (matchStage.subject && matchStage.subject.$in) {
             matchStage.subject.$in = matchStage.subject.$in.filter(id => studentSubjectIds.some(sid => sid.equals(id)));
         } else {
             matchStage.subject = { $in: studentSubjectIds };
         }
      }
  }

  const stats = await Attendance.aggregate([
    { $match: matchStage },
    { $group: {
        _id: '$status',
        count: { $sum: 1 }
    }}
  ]);

  const totalPresent = stats.find(s => s._id === 'present')?.count || 0;
  const totalAbsent = stats.find(s => s._id === 'absent')?.count || 0;

  res.json({ date, subjectId, totalPresent, totalAbsent });
});

// @desc    Monthly summary with day-by-day breakdown
// @route   GET /api/reports/monthly
// @access  Private
const getMonthlyReport = asyncHandler(async (req, res) => {
  const { month, year, subjectId, department } = req.query;
  if (!month || !year) {
    res.status(400); throw new Error('Month and year are required');
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  let matchStage = { date: { $gte: startDate, $lte: endDate } };
  if (subjectId) matchStage.subject = new mongoose.Types.ObjectId(subjectId);
  else if (department) {
      const deptSubjects = await Subject.find({ department }).select('_id');
      const deptSubjectIds = deptSubjects.map(s => s._id);
      matchStage.subject = { $in: deptSubjectIds };
  }
  
  if (req.user.role === 'faculty' && !subjectId) {
      const facultySubjectIds = req.user.subjects.map(id => new mongoose.Types.ObjectId(id));
      if (matchStage.subject && matchStage.subject.$in) {
          matchStage.subject.$in = matchStage.subject.$in.filter(id => 
              facultySubjectIds.some(fid => fid.equals(id))
          );
      } else {
          matchStage.subject = { $in: facultySubjectIds };
      }
  } else if (req.user.role === 'faculty' && subjectId) {
      if (!req.user.subjects.includes(subjectId)) {
          res.status(403); throw new Error('Not authorized for this subject');
      }
  } else if (req.user.role === 'student') {
      const studentSubjects = await Subject.find({ department: req.user.department, semester: req.user.semester }).select('_id');
      const studentSubjectIds = studentSubjects.map(s => s._id);

      if (subjectId) {
         if (!studentSubjectIds.some(id => id.equals(new mongoose.Types.ObjectId(subjectId)))) {
             res.status(403); throw new Error('Not authorized for this subject');
         }
      } else {
         if (matchStage.subject && matchStage.subject.$in) {
             matchStage.subject.$in = matchStage.subject.$in.filter(id => studentSubjectIds.some(sid => sid.equals(id)));
         } else {
             matchStage.subject = { $in: studentSubjectIds };
         }
      }
  }

  const breakdown = await Attendance.aggregate([
    { $match: matchStage },
    { $group: {
        _id: { date: '$date', status: '$status' },
        count: { $sum: 1 }
    }},
    { $group: {
        _id: '$_id.date',
        statuses: { $push: { status: '$_id.status', count: '$count' } }
    }},
    { $sort: { _id: 1 } }
  ]);

  const formatted = breakdown.map(item => {
     const present = item.statuses.find(s => s.status === 'present')?.count || 0;
     const absent = item.statuses.find(s => s.status === 'absent')?.count || 0;
     return { date: item._id, present, absent };
  });

  res.json(formatted);
});

// @desc    Individual student report (subject-wise %)
// @route   GET /api/reports/student/:studentId
// @access  Private
const getStudentReport = asyncHandler(async (req, res) => {
   const { studentId } = req.params;
   const { subjectId } = req.query;
   
   if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      res.status(403); throw new Error('Not authorized to view other students report');
   }

   let matchStage = { student: new mongoose.Types.ObjectId(studentId) };
   if (subjectId) {
      matchStage.subject = new mongoose.Types.ObjectId(subjectId);
   }
   
   if (req.user.role === 'faculty') {
      if (subjectId) {
          if (!req.user.subjects.includes(subjectId)) {
              res.status(403); throw new Error('Not authorized for this subject');
          }
      } else {
          matchStage.subject = { $in: req.user.subjects.map(id => new mongoose.Types.ObjectId(id)) };
      }
   }

   const report = await Attendance.aggregate([
      { $match: matchStage },
      { $group: {
          _id: '$subject',
          totalClasses: { $sum: 1 },
          presentClasses: {
             $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          }
      }},
      { $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subjectDetails'
      }},
      { $unwind: '$subjectDetails' },
      { $project: {
          subjectName: '$subjectDetails.name',
          subjectCode: '$subjectDetails.code',
          totalClasses: 1,
          presentClasses: 1,
          percentage: { $round: [ { $multiply: [ { $divide: ['$presentClasses', '$totalClasses'] }, 100 ] }, 2] }
      }}
   ]);

   res.json(report);
});

// @desc    Attendance % for all students
// @route   GET /api/reports/percentage
// @access  Private
const getPercentageReport = asyncHandler(async (req, res) => {
   const { subjectId, startDate, endDate, department } = req.query;
   let matchStage = {};
   
   if (subjectId) matchStage.subject = new mongoose.Types.ObjectId(subjectId);
   else if (department) {
      const deptSubjects = await Subject.find({ department }).select('_id');
      const deptSubjectIds = deptSubjects.map(s => s._id);
      matchStage.subject = { $in: deptSubjectIds };
   }

   if (req.user.role === 'faculty' && !subjectId) {
      const facultySubjectIds = req.user.subjects.map(id => new mongoose.Types.ObjectId(id));
      if (matchStage.subject && matchStage.subject.$in) {
          matchStage.subject.$in = matchStage.subject.$in.filter(id => 
              facultySubjectIds.some(fid => fid.equals(id))
          );
      } else {
          matchStage.subject = { $in: facultySubjectIds };
      }
   } else if (req.user.role === 'faculty' && subjectId) {
      if (!req.user.subjects.includes(subjectId)) {
          res.status(403); throw new Error('Not authorized for this subject');
      }
   }
   
   if (startDate && endDate) {
       matchStage.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
   } else if (startDate) {
       matchStage.date = { $gte: new Date(startDate) };
   }

   const report = await Attendance.aggregate([
      { $match: matchStage },
      { $group: {
          _id: '$student',
          totalClasses: { $sum: 1 },
          presentClasses: {
             $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          }
      }},
      { $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentDetails'
      }},
      { $unwind: '$studentDetails' },
      { $project: {
          studentName: '$studentDetails.name',
          rollNumber: '$studentDetails.rollNumber',
          totalClasses: 1,
          presentClasses: 1,
          percentage: { $round: [ { $multiply: [ { $divide: ['$presentClasses', '$totalClasses'] }, 100 ] }, 2] }
      }},
      { $sort: { rollNumber: 1 } }
   ]);

   res.json(report);
});

// @desc    Students below attendance threshold
// @route   GET /api/reports/defaulters
// @access  Private
const getDefaulters = asyncHandler(async (req, res) => {
   const threshold = parseFloat(req.query.threshold) || 75;
   const { subjectId, department } = req.query;

   let matchStage = {};
   if (subjectId) matchStage.subject = new mongoose.Types.ObjectId(subjectId);
   else if (department) {
      const deptSubjects = await Subject.find({ department }).select('_id');
      const deptSubjectIds = deptSubjects.map(s => s._id);
      matchStage.subject = { $in: deptSubjectIds };
   }
   
   if (req.user.role === 'faculty' && !subjectId) {
      const facultySubjectIds = req.user.subjects.map(id => new mongoose.Types.ObjectId(id));
      if (matchStage.subject && matchStage.subject.$in) {
          matchStage.subject.$in = matchStage.subject.$in.filter(id => 
              facultySubjectIds.some(fid => fid.equals(id))
          );
      } else {
          matchStage.subject = { $in: facultySubjectIds };
      }
   } else if (req.user.role === 'faculty' && subjectId) {
      if (!req.user.subjects.includes(subjectId)) {
          res.status(403); throw new Error('Not authorized for this subject');
      }
   }

   const report = await Attendance.aggregate([
      { $match: matchStage },
      { $group: {
          _id: { student: '$student', subject: '$subject' },
          totalClasses: { $sum: 1 },
          presentClasses: {
             $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          }
      }},
      { $project: {
          totalClasses: 1,
          presentClasses: 1,
          percentage: { $round: [ { $multiply: [ { $divide: ['$presentClasses', '$totalClasses'] }, 100 ] }, 2] }
      }},
      { $match: { percentage: { $lt: threshold } } },
      { $lookup: {
          from: 'students',
          localField: '_id.student',
          foreignField: '_id',
          as: 'studentDetails'
      }},
      { $unwind: '$studentDetails' },
      { $lookup: {
          from: 'subjects',
          localField: '_id.subject',
          foreignField: '_id',
          as: 'subjectDetails'
      }},
      { $unwind: '$subjectDetails' },
      { $project: {
          studentName: '$studentDetails.name',
          rollNumber: '$studentDetails.rollNumber',
          subjectName: '$subjectDetails.name',
          totalClasses: 1,
          presentClasses: 1,
          percentage: 1
      }},
      { $sort: { percentage: 1 } }
   ]);

   res.json(report);
});

module.exports = {
   getDailyReport,
   getMonthlyReport,
   getStudentReport,
   getPercentageReport,
   getDefaulters
};
