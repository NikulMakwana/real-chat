const express = require('express');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const cors = require('cors');

// 1. Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chatdb')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// 2. Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// 3. Start server
const server = app.listen(4000, () => {
  console.log('Server running on port 4000');
});

// 4. Set up Socket.io
const io = socketio(server, {
  cors: { origin: "http://localhost:3000" }
});

io.on('connection', (socket) => {
  console.log('New user connected');

  // Listen for new messages
  socket.on('send-message', (message) => {
    io.emit('new-message', message);
  });

  // Listen for mark-read event
  socket.on('mark-read', (messageId) => {
    io.emit('read-receipt', messageId);
  });

  socket.on('send-message', async (msg) => {
  try {
    const message = new Message({
      text: msg.text,
      user: msg.user,
      voiceNote: msg.voiceNote
    });
    await message.save();
    io.emit('new-message', message);
  } catch (err) {
    console.error('Message save error:', err);
  }
});
// Track connections
const usersOnline = new Set();

io.on('connection', (socket) => {
  socket.on('user-online', (username) => {
    usersOnline.add(username);
    io.emit('users-online', Array.from(usersOnline));
  });

  socket.on('disconnect', () => {
    usersOnline.delete(socket.username);
    io.emit('users-online', Array.from(usersOnline));
  });
});
});