const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, changePassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/change-password', protect, changePassword);
router.put('/reset-password', resetPassword);

module.exports = router;
