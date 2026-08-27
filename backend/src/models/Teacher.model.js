const mongoose = require('mongoose');
const User = require('./User.model');

const teacherSchema = new mongoose.Schema({});

module.exports = User.discriminator('teacher', teacherSchema);
