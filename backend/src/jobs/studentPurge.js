const Student = require('../models/Student.model');

const PURGE_GRACE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Given when an account was deactivated and the expiry dates of every
// grant it holds, returns the earliest moment it becomes eligible for
// permanent deletion — whichever is later of "30 days after deactivation"
// and "every grant has expired". This stops a deactivation from quietly
// cutting off access the student (or whoever paid for it) is still inside
// the grant period for.
function computePurgeEligibleAt(deactivatedAt, grantExpiries) {
  const graceFloor = new Date(deactivatedAt.getTime() + PURGE_GRACE_MS);

  const latestGrantExpiry = grantExpiries.length
    ? new Date(Math.max(...grantExpiries.map((d) => d.getTime())))
    : null;

  return latestGrantExpiry && latestGrantExpiry > graceFloor ? latestGrantExpiry : graceFloor;
}

// Permanently deletes deactivated student accounts once computePurgeEligibleAt
// says it's time. Teacher/admin accounts are never auto-purged here — see
// User.model.js.
async function runStudentPurgeSweep() {
  const now = new Date();

  const candidates = await Student.find({ deactivatedAt: { $ne: null } }).select(
    'deactivatedAt courses.expiresAt lectures.expiresAt'
  );

  const idsToDelete = candidates
    .filter((student) => {
      const grantExpiries = [
        ...student.courses.map((c) => c.expiresAt),
        ...student.lectures.map((l) => l.expiresAt),
      ];
      return now >= computePurgeEligibleAt(student.deactivatedAt, grantExpiries);
    })
    .map((student) => student._id);

  if (!idsToDelete.length) {
    return { checked: candidates.length, deletedCount: 0 };
  }

  const result = await Student.deleteMany({ _id: { $in: idsToDelete } });
  return { checked: candidates.length, deletedCount: result.deletedCount };
}

module.exports = { runStudentPurgeSweep, computePurgeEligibleAt, PURGE_GRACE_MS };
