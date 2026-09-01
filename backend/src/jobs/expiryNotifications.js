const Student = require('../models/Student.model');
const Course = require('../models/Course.model');
const Notification = require('../models/Notification.model');
const { DAY_MS, EXPIRY_MILESTONES, formatDate } = require('../utils/notifications');

// Scans every student's course grants and fires whichever expiry milestones
// ("1 month left", "1 week left", "1 day left", "expired") have newly been
// crossed since the last sweep. Idempotent: each milestone is recorded on the
// grant itself (notifiedMilestones) so re-running never double-notifies.
async function runExpiryNotificationSweep() {
  const now = new Date();

  const students = await Student.find({ 'courses.0': { $exists: true } }).select('courses');
  if (!students.length) return { studentsChecked: 0, notificationsCreated: 0 };

  const courseIds = [
    ...new Set(students.flatMap((s) => s.courses.map((c) => c.course.toString()))),
  ];
  const courses = await Course.find({ _id: { $in: courseIds } }).select('name');
  const courseNameById = new Map(courses.map((c) => [c._id.toString(), c.name]));

  const notificationsToCreate = [];

  for (const student of students) {
    let changed = false;

    for (const grant of student.courses) {
      const courseName = courseNameById.get(grant.course.toString()) || 'a course';

      if (grant.expiresAt <= now) {
        if (!grant.notifiedMilestones.includes('expired')) {
          grant.notifiedMilestones.push('expired');
          changed = true;
          notificationsToCreate.push({
            user: student._id,
            type: 'expired',
            course: grant.course,
            message: `Your access to "${courseName}" has expired.`,
          });
        }
        continue;
      }

      for (const milestone of EXPIRY_MILESTONES) {
        if (grant.notifiedMilestones.includes(milestone.key)) continue;

        const triggerAt = new Date(grant.expiresAt.getTime() - milestone.daysBefore * DAY_MS);
        if (now >= triggerAt) {
          grant.notifiedMilestones.push(milestone.key);
          changed = true;
          notificationsToCreate.push({
            user: student._id,
            type: milestone.key,
            course: grant.course,
            message: `Your access to "${courseName}" expires in ${milestone.label} (${formatDate(
              grant.expiresAt
            )}).`,
          });
        }
      }
    }

    if (changed) await student.save();
  }

  if (notificationsToCreate.length) {
    await Notification.insertMany(notificationsToCreate);
  }

  return { studentsChecked: students.length, notificationsCreated: notificationsToCreate.length };
}

module.exports = { runExpiryNotificationSweep };
