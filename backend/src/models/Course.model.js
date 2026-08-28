const mongoose = require('mongoose');

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', courseSchema);