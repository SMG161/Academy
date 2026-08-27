const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // teacher model later
      default: null,
    },

    description: {
      type: String,
      default: '',
    },

    videoPath: {
      type: String,
      required: true,
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

module.exports = mongoose.model('Lecture', lectureSchema);
