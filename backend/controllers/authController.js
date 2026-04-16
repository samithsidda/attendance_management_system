const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (faculty or student)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, ...otherData } = req.body;

  if (role === 'admin') {
    res.status(400);
    throw new Error('Admin registration is not allowed via this endpoint');
  }

  if (role === 'faculty') {
    const facultyExists = await Faculty.findOne({ email });
    if (facultyExists) {
      res.status(400);
      throw new Error('Faculty already exists');
    }
    const faculty = await Faculty.create({ name, email, password, department: otherData.department });
    if (faculty) {
      res.status(201).json({
        _id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        department: faculty.department,
        subjects: [],
        token: generateToken(faculty._id, faculty.role),
      });
    } else {
      res.status(400);
      throw new Error('Invalid faculty data');
    }
  } else if (role === 'student') {
    const { rollNumber, department, year, semester } = otherData;
    const studentExists = await Student.findOne({ email });
    const rollNumberExists = await Student.findOne({ rollNumber });
    
    if (studentExists) {
      res.status(400);
      throw new Error('Student with this email already exists');
    }
    if (rollNumberExists) {
      res.status(400);
      throw new Error('Student with this roll number already exists');
    }

    const student = await Student.create({
      name, email, password, rollNumber, department, year, semester
    });

    if (student) {
      res.status(201).json({
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        rollNumber: student.rollNumber,
        token: generateToken(student._id, student.role),
      });
    } else {
      res.status(400);
      throw new Error('Invalid student data');
    }
  } else {
    res.status(400);
    throw new Error('Invalid role specified');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  let user = await Admin.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  }

  user = await Faculty.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subjects: user.subjects,
      token: generateToken(user._id, user.role),
    });
  }

  user = await Student.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  }

  res.status(401);
  throw new Error('Invalid email or password');
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  let model;
  if (req.user.role === 'admin') model = Admin;
  else if (req.user.role === 'faculty') model = Faculty;
  else if (req.user.role === 'student') model = Student;
  else {
    res.status(400); throw new Error('Invalid user role');
  }

  const user = await model.findById(req.user._id);

  if (user && (await user.matchPassword(oldPassword))) {
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401);
    throw new Error('Incorrect old password');
  }
});

// @desc    Reset user password (Mock forgot password)
// @route   PUT /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    res.status(400); throw new Error('Please provide email and new password');
  }

  let user = await Student.findOne({ email });
  if (user) {
    user.password = newPassword;
    await user.save();
    return res.json({ message: 'Password reset successful' });
  }

  user = await Faculty.findOne({ email });
  if (user) {
    user.password = newPassword;
    await user.save();
    return res.json({ message: 'Password reset successful' });
  }

  user = await Admin.findOne({ email });
  if (user) {
    user.password = newPassword;
    await user.save();
    return res.json({ message: 'Password reset successful' });
  }

  res.status(404);
  throw new Error('User not found with this email');
});

module.exports = { registerUser, loginUser, getUserProfile, changePassword, resetPassword };
