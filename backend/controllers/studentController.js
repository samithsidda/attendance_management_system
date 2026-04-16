const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin/Faculty)
const getStudents = asyncHandler(async (req, res) => {
  // Optional search query and filters
  const { department, year, search } = req.query;
  
  let query = {};
  
  if (department) {
    query.department = department;
  }
  
  if (year) {
    query.year = year;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const students = await Student.find(query).select('-password');
  res.json(students);
});

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).select('-password');

  if (student) {
    res.json(student);
  } else {
    res.status(404);
    throw new Error('Student not found');
  }
});

// @desc    Create a student (by Admin)
// @route   POST /api/students
// @access  Private/Admin
const createStudent = asyncHandler(async (req, res) => {
  const { name, rollNumber, email, password, department, year, semester } = req.body;

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
    name,
    rollNumber,
    email,
    password, 
    department,
    year,
    semester
  });

  if (student) {
    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
    });
  } else {
    res.status(400);
    throw new Error('Invalid student data');
  }
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (student) {
    student.name = req.body.name || student.name;
    student.rollNumber = req.body.rollNumber || student.rollNumber;
    student.email = req.body.email || student.email;
    student.department = req.body.department || student.department;
    student.year = req.body.year || student.year;
    student.semester = req.body.semester || student.semester;

    if (req.body.password) {
      student.password = req.body.password;
    }

    const updatedStudent = await student.save();
    
    res.json({
      _id: updatedStudent._id,
      name: updatedStudent.name,
      email: updatedStudent.email,
      rollNumber: updatedStudent.rollNumber,
      department: updatedStudent.department,
      year: updatedStudent.year,
      semester: updatedStudent.semester
    });
  } else {
    res.status(404);
    throw new Error('Student not found');
  }
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (student) {
    await student.deleteOne();
    res.json({ message: 'Student removed' });
  } else {
    res.status(404);
    throw new Error('Student not found');
  }
});

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
