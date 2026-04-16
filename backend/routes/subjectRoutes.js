const express = require('express');
const router = express.Router();
const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  assignFacultyToSubject,
} = require('../controllers/subjectController');
const { protect, adminOnly, facultyOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getSubjects)
  .post(protect, adminOnly, createSubject);

router.route('/:id')
  .put(protect, adminOnly, updateSubject)
  .delete(protect, adminOnly, deleteSubject);

router.route('/:id/assign-faculty')
  .post(protect, adminOnly, assignFacultyToSubject);

module.exports = router;
