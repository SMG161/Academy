
// Express app configuration
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

const app = express();

// CORS for frontend
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: false,
  }),
);

// Built-in middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check route (you can remove or change later)
app.get('/', (req, res) => {
  res.send('API is running ✅');
});

module.exports = app;
