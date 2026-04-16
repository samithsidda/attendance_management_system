const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
    },
    semester: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
