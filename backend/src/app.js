const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');

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

app.get('/', (req, res) => {
  res.send('API is running ✅');
});

module.exports = app;