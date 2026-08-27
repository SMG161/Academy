const mongoose = require('mongoose');
const User = require('./User.model');

const studentSchema = new mongoose.Schema({
  courses: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    default: [],
  },

  lectures: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture',
      },
    ],
    default: [],
  },
});

module.exports = User.discriminator('student', studentSchema);
