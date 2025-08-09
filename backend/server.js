const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

// --- 1. MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatdb';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Define Mongoose Message Schema and Model ---
const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: String, required: true },
  voiceNote: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// --- 2. Create Express App ---
const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
}));
app.use(express.json());

// FIX: Add the health check endpoint for Kubernetes Liveness Probe
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// A basic route, separate from the health check
app.get('/', (req, res) => {
    res.send('Chat Backend is running!');
});


// --- 3. Start HTTP Server ---
const PORT = process.env.PORT || 4000;
const server = http.createServer(app); // Use http.createServer to pass app to server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// --- 4. Set up Socket.io ---
const io = new Server(server, {
  cors: { 
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"] 
  }
});

// --- Redis Adapter
const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  console.log('Redis adapter connected for WebSocket scaling');
}).catch(err => {
  console.error('Redis connection error:', err);
});

// --- 5. Original Socket.io Event Handlers ---
const usersOnline = new Set();

io.on('connection', (socket) => {
  console.log(`New user connected: ${socket.id}`);

  socket.on('user-online', (username) => {
    socket.username = username;
    usersOnline.add(username);
    io.emit('users-online', Array.from(usersOnline));
    console.log(`${username} is online. Current online users: ${Array.from(usersOnline).join(', ')}`);
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
      console.log(`Message saved and broadcasted: ${message.text} from ${message.user}`);
    } catch (err) {
      console.error('Message save error:', err);
    }
  });

  socket.on('mark-read', (messageId) => {
    io.emit('read-receipt', messageId);
    console.log(`Read receipt for message ID: ${messageId}`);
  });

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