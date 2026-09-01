const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

require('./models/Student.model');
require('./models/Admin.model');
require('./models/Teacher.model');

const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const studentRoutes = require('./routes/student.routes');
const lectureRoutes = require('./routes/lecture.routes');
const adminRoutes = require('./routes/admin.routes');
const teacherRoutes = require('./routes/teacher.routes');
const uploadRoutes = require('./routes/upload.routes');
const accountRoutes = require('./routes/account.routes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

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
app.use('/api/teacher', teacherRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/account', accountRoutes);

app.get('/', (req, res) => {
  res.send('API is running ✅');
});

module.exports = app;