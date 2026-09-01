const Notification = require('../models/Notification.model');

const DAY_MS = 24 * 60 * 60 * 1000;
// Tolerance for the pre-exclusion check below, so a millisecond-level race
// between when a caller computes expiresAt and when the server reads "now"
// can't accidentally swallow a milestone that lands right at the boundary.
const PRE_EXCLUDE_EPSILON_MS = 5000;

// Ordered oldest-to-newest so a sweep fires them in a sensible sequence.
const EXPIRY_MILESTONES = [
  { key: 'expiry_30d', daysBefore: 30, label: '1 month' },
  { key: 'expiry_7d', daysBefore: 7, label: '1 week' },
  { key: 'expiry_1d', daysBefore: 1, label: '1 day' },
];

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Called when a grant is created/renewed: pre-marks any reminder milestone whose
// trigger date already fell before "now" as notified, so a course granted with
// e.g. 3 days left never fires the (already false) "1 month left" reminder.
function computeInitialNotifiedMilestones(expiresAt, now = new Date()) {
  const notified = [];
  for (const milestone of EXPIRY_MILESTONES) {
    const triggerAt = new Date(expiresAt.getTime() - milestone.daysBefore * DAY_MS);
    // Strictly-before (with a small epsilon), not <=: a trigger that lands at
    // or right around `now` (e.g. a round "30 days" grant) should stay
    // eligible so the next sweep fires it, rather than being silently
    // swallowed by clock jitter between when expiresAt was computed and when
    // the server reads "now".
    if (triggerAt.getTime() < now.getTime() - PRE_EXCLUDE_EPSILON_MS) {
      notified.push(milestone.key);
    }
  }
  return notified;
}

async function notifyAccessGranted({ studentId, courseId, courseName, expiresAt }) {
  await Notification.create({
    user: studentId,
    type: 'access_granted',
    course: courseId,
    message: `You now have access to "${courseName}" until ${formatDate(expiresAt)}.`,
  });
}

module.exports = {
  DAY_MS,
  EXPIRY_MILESTONES,
  formatDate,
  computeInitialNotifiedMilestones,
  notifyAccessGranted,
};
