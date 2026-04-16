const express = require('express');
const router = express.Router();
const { addAdmin, getAdmins, deleteAdmin, getDashboardStats, getFaculties, resetUserPassword } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/add', protect, adminOnly, addAdmin);
router.post('/reset-password', protect, adminOnly, resetUserPassword);
router.get('/list', protect, adminOnly, getAdmins);
router.delete('/:id', protect, adminOnly, deleteAdmin);
router.get('/dashboard-stats', protect, adminOnly, getDashboardStats);
router.get('/faculties', protect, adminOnly, getFaculties);

module.exports = router;
