const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // teacher model later
      default: null,
    },

    videoPath: {
      type: String,
      required: true,
      default: '/videos/sample.mp4',
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