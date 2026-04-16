const express = require('express');
const router = express.Router();
const {
  getDailyReport,
  getMonthlyReport,
  getStudentReport,
  getPercentageReport,
  getDefaulters
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes are protected

router.get('/daily', getDailyReport);
router.get('/monthly', getMonthlyReport);
router.get('/student/:studentId', getStudentReport);
router.get('/percentage', getPercentageReport);
router.get('/defaulters', getDefaulters);

module.exports = router;
