const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'access_granted',
  'expiry_30d',
  'expiry_7d',
  'expiry_1d',
  'expired',
];

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
