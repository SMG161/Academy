require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../src/models/Course.model');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env');
  process.exit(1);
}

async function createHardcodedCourse() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Hardcoded course data
    const courseData = {
      name: 'Economics',
      teacher: null, // or ObjectId if you have a teacher
      videoPath: '/videos/sample.mp4', // ensure sample.mp4 exists in backend/videos
      price: 1500,
    };

    // Create course
    const course = await Course.create(courseData);

    console.log('✅ Course created:', course);

    await mongoose.disconnect();
    console.log('🛑 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating course:', error);
    process.exit(1);
  }
}

createHardcodedCourse();