const express = require('express');
const router = express.Router();
const { getFaculty, getFacultyById, createFaculty, updateFaculty, deleteFaculty } = require('../controllers/facultyController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, adminOnly, getFaculty)
  .post(protect, adminOnly, createFaculty);

router.route('/:id')
  .get(protect, adminOnly, getFacultyById)
  .put(protect, adminOnly, updateFaculty)
  .delete(protect, adminOnly, deleteFaculty);

module.exports = router;
