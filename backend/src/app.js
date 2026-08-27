const express = require('express');
const cors = require('cors');

require('./models/Student.model');
require('./models/Admin.model');
require('./models/Teacher.model');

const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const studentRoutes = require('./routes/student.routes');
const lectureRoutes = require('./routes/lecture.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: false,
  })
);

app.use(express.json());

// Serve videos
app.use('/videos', express.static('videos'));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is running ✅');
});

module.exports = app;