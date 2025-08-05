const express = require('express');
const mongoose = require('mongoose');
const http = require('http'); // Explicitly require http for socket.io
const { Server } = require('socket.io'); // Destructure Server from socket.io
const cors = require('cors');

// --- 1. MongoDB Connection ---
// Use an environment variable for the MongoDB URI in production
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatdb';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Define Mongoose Message Schema and Model ---
// This is a basic example. Adjust fields as per your needs (e.g., voiceNote type)
const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: String, required: true },
  voiceNote: { type: String }, // Assuming voiceNote will be a URL or ID for now
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// --- 2. Create Express App ---
const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Dynamic CORS origin
    methods: ["GET", "POST"]
}));
app.use(express.json());

// Basic Express route for health check
app.get('/', (req, res) => {
    res.send('Chat Backend is running and connected to MongoDB!');
});

// --- 3. Start HTTP Server ---
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// --- 4. Set up Socket.io ---
const io = new Server(server, { // Use new Server(httpServer, options) syntax
  cors: { 
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Dynamic CORS origin
    methods: ["GET", "POST"] 
  }
});

// Track online users
const usersOnline = new Set();

io.on('connection', (socket) => {
  console.log(`New user connected: ${socket.id}`);

  // Listen for user going online/joining chat
  socket.on('user-online', (username) => {
    socket.username = username; // Store username on the socket object
    usersOnline.add(username);
    io.emit('users-online', Array.from(usersOnline));
    console.log(`${username} is online. Current online users: ${Array.from(usersOnline).join(', ')}`);
  });

  // Listen for new messages
  socket.on('send-message', async (msg) => {
    try {
      const message = new Message({
        text: msg.text,
        user: msg.user,
        voiceNote: msg.voiceNote // Ensure this matches your frontend's message structure
      });
      await message.save();
      io.emit('new-message', message); // Broadcast the saved message
      console.log(`Message saved and broadcasted: ${message.text} from ${message.user}`);
    } catch (err) {
      console.error('Message save error:', err);
    }
  });

  // Listen for mark-read event
  socket.on('mark-read', (messageId) => {
    // Implement logic to update message status in DB if needed
    io.emit('read-receipt', messageId);
    console.log(`Read receipt for message ID: ${messageId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.username) {
      usersOnline.delete(socket.username);
      io.emit('users-online', Array.from(usersOnline));
      console.log(`${socket.username} disconnected. Current online users: ${Array.from(usersOnline).join(', ')}`);
    } else {
      console.log(`User disconnected (unknown username): ${socket.id}`);
    }
  });
});