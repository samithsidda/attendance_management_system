const asyncHandler = require('express-async-handler');
const Faculty = require('../models/Faculty');

// @desc    Get all faculty
// @route   GET /api/faculty
// @access  Private (Admin)
const getFaculty = asyncHandler(async (req, res) => {
  const { department, search } = req.query;
  
  let query = {};
  
  if (department) {
    query.department = department;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const faculty = await Faculty.find(query).select('-password');
  res.json(faculty);
});

// @desc    Get faculty by ID
// @route   GET /api/faculty/:id
// @access  Private
const getFacultyById = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id).select('-password');

  if (faculty) {
    res.json(faculty);
  } else {
    res.status(404);
    throw new Error('Faculty not found');
  }
});

// @desc    Create a faculty
// @route   POST /api/faculty
// @access  Private/Admin
const createFaculty = asyncHandler(async (req, res) => {
  const { name, email, password, department } = req.body;

  const facultyExists = await Faculty.findOne({ email });

  if (facultyExists) {
    res.status(400);
    throw new Error('Faculty with this email already exists');
  }

  const faculty = await Faculty.create({
    name,
    email,
    password, 
    department
  });

  if (faculty) {
    res.status(201).json({
      _id: faculty._id,
      name: faculty.name,
      email: faculty.email,
      department: faculty.department,
    });
  } else {
    res.status(400);
    throw new Error('Invalid faculty data');
  }
});

// @desc    Update faculty
// @route   PUT /api/faculty/:id
// @access  Private/Admin
const updateFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);

  if (faculty) {
    faculty.name = req.body.name || faculty.name;
    faculty.email = req.body.email || faculty.email;
    faculty.department = req.body.department || faculty.department;

    if (req.body.password) {
      faculty.password = req.body.password;
    }

    const updatedFaculty = await faculty.save();
    
    res.json({
      _id: updatedFaculty._id,
      name: updatedFaculty.name,
      email: updatedFaculty.email,
      department: updatedFaculty.department,
    });
  } else {
    res.status(404);
    throw new Error('Faculty not found');
  }
});

// @desc    Delete faculty
// @route   DELETE /api/faculty/:id
// @access  Private/Admin
const deleteFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);

  if (faculty) {
    await faculty.deleteOne();
    res.json({ message: 'Faculty removed' });
  } else {
    res.status(404);
    throw new Error('Faculty not found');
  }
});

module.exports = {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty
};
