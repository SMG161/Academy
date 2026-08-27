const mongoose = require('mongoose');
const User = require('./User.model');

const adminSchema = new mongoose.Schema({});

module.exports = User.discriminator('admin', adminSchema);
