const mongoose = require('mongoose');

// Resume-playback bookmark for a lecture, scoped to whoever is watching
// (a student resuming a purchased lecture, or a teacher checking their own
// upload) — one row per (user, lecture) pair.
const watchProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
    positionSeconds: { type: Number, default: 0, min: 0 },
    durationSeconds: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

watchProgressSchema.index({ user: 1, lecture: 1 }, { unique: true });

module.exports = mongoose.model('WatchProgress', watchProgressSchema);
