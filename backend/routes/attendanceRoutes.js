const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  updateAttendanceRecord,
  getStudentHistory,
} = require('../controllers/attendanceController');
const { protect, facultyOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAttendance)
  .post(protect, facultyOrAdmin, markAttendance);

router.route('/:id')
  .put(protect, facultyOrAdmin, updateAttendanceRecord);

router.route('/student/:studentId')
  .get(protect, getStudentHistory);

module.exports = router;
