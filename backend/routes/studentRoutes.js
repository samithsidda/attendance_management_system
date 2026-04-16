const express = require('express');
const router = express.Router();
const { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect, adminOnly, facultyOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, facultyOrAdmin, getStudents)
  .post(protect, adminOnly, createStudent);

router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, adminOnly, updateStudent)
  .delete(protect, adminOnly, deleteStudent);

module.exports = router;
