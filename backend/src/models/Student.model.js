const mongoose = require('mongoose');
const User = require('./User.model');

const courseGrantSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    expiresAt: { type: Date, required: true },
    grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notifiedMilestones: { type: [String], default: [] },
  },
  { timestamps: true }
);

const lectureGrantSchema = new mongoose.Schema(
  {
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
    expiresAt: { type: Date, required: true },
    grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const studentSchema = new mongoose.Schema({
  courses: {
    type: [courseGrantSchema],
    default: [],
  },

  lectures: {
    type: [lectureGrantSchema],
    default: [],
  },
});

module.exports = User.discriminator('student', studentSchema);
