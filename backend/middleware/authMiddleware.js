const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from corresponding collection based on role
      if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'faculty') {
        req.user = await Faculty.findById(decoded.id).select('-password');
      } else if (decoded.role === 'student') {
        req.user = await Student.findById(decoded.id).select('-password');
      }
      
      // Ensure user was found
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

const facultyOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'faculty' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin or faculty');
  }
};

const checkSubjectAccess = (req, res, next) => {
  // Admin has access to all subjects
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  const subjectId = req.body.subjectId || req.params.subjectId || req.query.subjectId || (req.body.length && req.body[0].subjectId);
  
  if (req.user && req.user.role === 'faculty') {
     // Wait, req.user.subjects is an array of ObjectIds. The subjectId from request is usually a string.
     // toString() check is better.
     if (!subjectId) {
         res.status(400);
         throw new Error('Subject ID is missing');
     }
     
     // we assume if bulk array of attendance we will use single subjectId param or body field for context
     const hasAccess = req.user.subjects.some(id => id.toString() === subjectId.toString());
     
     if (hasAccess) {
         return next();
     } else {
         res.status(403);
         throw new Error('Not authorized to access this subject');
     }
  }
  
  res.status(403);
  throw new Error('Not authorized');
};

module.exports = { protect, adminOnly, facultyOrAdmin, checkSubjectAccess };
