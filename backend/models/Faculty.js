const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const facultySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    department: {
      type: String,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    role: {
      type: String,
      default: 'faculty',
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

facultySchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

facultySchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;
