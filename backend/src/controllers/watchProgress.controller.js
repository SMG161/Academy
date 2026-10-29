const WatchProgress = require('../models/WatchProgress.model');

// Returns the signed-in user's saved resume position for a lecture, or
// zero if they've never watched it before.
exports.getProgress = async (req, res) => {
  try {
    const progress = await WatchProgress.findOne({
      user: req.user.userId,
      lecture: req.params.id,
    }).select('positionSeconds durationSeconds');

    res.json({
      positionSeconds: progress ? progress.positionSeconds : 0,
      durationSeconds: progress ? progress.durationSeconds : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upserts the signed-in user's resume position for a lecture. Called
// periodically by the player while watching, and on pause/unmount.
exports.saveProgress = async (req, res) => {
  try {
    const { positionSeconds, durationSeconds } = req.body;

    if (typeof positionSeconds !== 'number' || !Number.isFinite(positionSeconds) || positionSeconds < 0) {
      return res.status(400).json({ message: 'positionSeconds must be a non-negative number' });
    }

    const update = { positionSeconds };
    if (typeof durationSeconds === 'number' && Number.isFinite(durationSeconds) && durationSeconds >= 0) {
      update.durationSeconds = durationSeconds;
    }

    await WatchProgress.findOneAndUpdate(
      { user: req.user.userId, lecture: req.params.id },
      update,
      { upsert: true, new: true }
    );

    res.json({ message: 'Progress saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
