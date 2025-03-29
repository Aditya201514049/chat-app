const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://chat-app-j7od.onrender.com', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({ origin: ['https://chat-app-j7od.onrender.com', 'http://localhost:5173'] }));
app.use(express.json()); // Middleware to parse JSON requests

// Define the root route for basic HTTP requests (optional, just to avoid "Cannot GET /")
app.get('/', (req, res) => {
  res.send('Welcome to the Chat App Backend!');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

// Socket.IO connection handler
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // User authentication and setup
  socket.on('setup', (userData) => {
    if (userData && userData._id) {
      // Store user socket mapping
      connectedUsers.set(userData._id, socket.id);
      socket.join(userData._id);
      socket.emit('connected');
      console.log(`User ${userData._id} connected and setup complete`);
    }
  });

  // Join a chat room
  socket.on('join chat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  // Handle new message
  socket.on('new message', (newMessageData) => {
    console.log('New message received from socket:', newMessageData);
    
    // Validate chat ID
    const chatId = newMessageData.chatId;
    if (!chatId) {
      console.error('Invalid chat data received:', newMessageData);
      return;
    }
    
    // Convert chatId to string if it's an object
    const chatRoomId = typeof chatId === 'object' ? chatId._id : chatId;
    
    // Join the chat room if not already
    socket.join(chatRoomId);
    
    // Always broadcast to everyone in the chat room (including sender for consistency)
    console.log(`Broadcasting message to chat room: ${chatRoomId}`);
    
    // Use io.to() instead of socket.to() to include the sender
    io.to(chatRoomId).emit('message received', {
      ...newMessageData,
      chatId: chatRoomId // Ensure chatId is consistent
    });
    
    // Get sender and recipient IDs
    const senderId = newMessageData.sender;
    if (!senderId) {
      console.error('No sender ID in message data');
      return;
    }
    
    // Find the recipient by looking up connected users
    // Since we may not have recipient info, broadcast to the room
    // and any user in that room will receive it
    
    // Also notify about chat updates to refresh the chat list
    const chatUpdateData = {
      _id: chatRoomId,
      updatedAt: new Date()
    };
    
    // Broadcast chat update to the room
    io.to(chatRoomId).emit('chat updated', chatUpdateData);
  });

  // Handle typing status
  socket.on('typing', (chatId) => {
    socket.to(chatId).emit('typing', chatId);
  });

  socket.on('stop typing', (chatId) => {
    socket.to(chatId).emit('stop typing');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io available globally so controllers can access it
app.set('io', io);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
