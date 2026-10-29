const mongoose = require('mongoose');
const { GRADE_OPTIONS } = require('../utils/grades');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    // Free-text subject/category (e.g. "Mathematics", "Physics"). The Browse
    // Courses filter dropdown is populated from whatever values are
    // actually in use, rather than a fixed taxonomy, so this stays flexible.
    subject: {
      type: String,
      default: '',
      trim: true,
    },

    grade: {
      type: String,
      enum: GRADE_OPTIONS,
      default: 'None',
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // teacher model later
      default: null,
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

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    thumbnailPath: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', courseSchema);