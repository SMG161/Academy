require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const { runStudentPurgeSweep } = require('../src/jobs/studentPurge');

async function main() {
  await connectDB(process.env.MONGO_URI);
  const result = await runStudentPurgeSweep();
  console.log(
    `Purge sweep complete: checked ${result.checked} deactivated student(s), deleted ${result.deletedCount}.`
  );
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Purge sweep failed:', error);
  process.exit(1);
});
