require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const { runExpiryNotificationSweep } = require('../src/jobs/expiryNotifications');

async function main() {
  await connectDB(process.env.MONGO_URI);
  const result = await runExpiryNotificationSweep();
  console.log(
    `Sweep complete: checked ${result.studentsChecked} student(s), created ${result.notificationsCreated} notification(s).`
  );
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Sweep failed:', error);
  process.exit(1);
});
