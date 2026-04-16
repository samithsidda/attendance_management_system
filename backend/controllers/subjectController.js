const asyncHandler = require('express-async-handler');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({});
  res.json(subjects);
});

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = asyncHandler(async (req, res) => {
  const { name, code, department, semester } = req.body;

  const subjectExists = await Subject.findOne({ code });

  if (subjectExists) {
    res.status(400);
    throw new Error('Subject with this code already exists');
  }

  const subject = await Subject.create({
    name,
    code,
    department,
    semester,
  });

  if (subject) {
    res.status(201).json(subject);
  } else {
    res.status(400);
    throw new Error('Invalid subject data');
  }
});

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (subject) {
    subject.name = req.body.name || subject.name;
    subject.code = req.body.code || subject.code;
    subject.department = req.body.department || subject.department;
    subject.semester = req.body.semester || subject.semester;

    const updatedSubject = await subject.save();
    res.json(updatedSubject);
  } else {
    res.status(404);
    throw new Error('Subject not found');
  }
});

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (subject) {
    await subject.deleteOne();
    
    // Also remove this subject from any faculty who have it assigned
    await Faculty.updateMany(
      { subjects: subject._id },
      { $pull: { subjects: subject._id } }
    );
    
    res.json({ message: 'Subject removed' });
  } else {
    res.status(404);
    throw new Error('Subject not found');
  }
});

// @desc    Assign faculty to a subject
// @route   POST /api/subjects/:id/assign-faculty
// @access  Private/Admin
const assignFacultyToSubject = asyncHandler(async (req, res) => {
  const { facultyId } = req.body;
  const subjectId = req.params.id;

  const subject = await Subject.findById(subjectId);
  const faculty = await Faculty.findById(facultyId);

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  if (!faculty) {
    res.status(404);
    throw new Error('Faculty not found');
  }

  // Check if already assigned
  if (faculty.subjects.includes(subjectId)) {
    res.status(400);
    throw new Error('Faculty is already assigned to this subject');
  }

  faculty.subjects.push(subjectId);
  await faculty.save();

  res.json({ message: 'Faculty assigned to subject successfully', faculty });
});

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  assignFacultyToSubject,
};
