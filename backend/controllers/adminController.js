const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');

// @desc    Create a new admin
// @route   POST /api/admin/add
// @access  Private/Admin
const addAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(400);
    throw new Error('Admin already exists');
  }

  const admin = await Admin.create({
    name,
    email,
    password,
  });

  if (admin) {
    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid admin data');
  }
});

// @desc    Get all admins
// @route   GET /api/admin/list
// @access  Private/Admin
const getAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find({}).select('-password');
  res.json(admins);
});

// @desc    Delete an admin
// @route   DELETE /api/admin/:id
// @access  Private/Admin
const deleteAdmin = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own admin account');
  }

  const admin = await Admin.findById(req.params.id);

  if (admin) {
    await admin.deleteOne();
    res.json({ message: 'Admin deleted' });
  } else {
    res.status(404);
    throw new Error('Admin not found');
  }
});

// @desc    Get all faculties
// @route   GET /api/admin/faculties
// @access  Private/Admin
const getFaculties = asyncHandler(async (req, res) => {
  const faculties = await Faculty.find({}).select('-password');
  res.json(faculties);
});

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalStudents = await Student.countDocuments();
  const totalFaculty = await Faculty.countDocuments();
  const totalSubjects = await Subject.countDocuments();
  
  // Note: System-wide Attendance % will rely on the Attendance model. It might be complex, but we can do a mock or basic calc later.
  // We'll leave systemWideAttendance at 0 for now until Attendance is fully implemented.

  res.json({
    totalStudents,
    totalFaculty,
    totalSubjects,
    systemWideAttendance: 0 // Placeholder
  });
});

// @desc    Reset User Password
// @route   POST /api/admin/reset-password
// @access  Private/Admin
const resetUserPassword = asyncHandler(async (req, res) => {
  const { userId, userType } = req.body;
  if (!userId || !userType) {
    res.status(400); throw new Error('User ID and Type are required');
  }

  let user;
  if (userType === 'student') user = await Student.findById(userId);
  else if (userType === 'faculty') user = await Faculty.findById(userId);
  else { res.status(400); throw new Error('Invalid user type'); }

  if (!user) { res.status(404); throw new Error('User not found'); }

  user.password = '123456';
  await user.save();

  res.json({ message: `Password successfully reset to 123456 for ${user.name}` });
});

module.exports = {
  addAdmin,
  getAdmins,
  deleteAdmin,
  getDashboardStats,
  getFaculties,
  resetUserPassword,
};
