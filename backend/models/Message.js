const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: String,
  user: String,
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);