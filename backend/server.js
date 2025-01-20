const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const Chat = require('./models/chatModel');
const cors = require('cors');
const http = require('http'); // Import HTTP module for creating server

const { Server } = require('socket.io'); // Import Socket.io

// Load environment variables
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Set up Socket.io with the server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*', // Allow all origins or restrict to CLIENT_URL
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors()); // Allow cross-origin requests (customize in production)
app.use(express.json()); // Parse JSON requests

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the WebSocket Server!');
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a chat room
  socket.on('Join chat', (chatId) => {
    if (!chatId) {
      console.error('Chat ID is missing');
      return socket.emit('error', { message: 'Chat ID is required' });
    }

    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });

  // Send message
  socket.on('send message', async ({ chatId, senderId, message }) => {
    if (!chatId || !senderId || !message) {
      console.error('Invalid message data');
      return socket.emit('error', { message: 'chatId, senderId, and message are required' });
    }

    try {
      // Save message to the database
      const chat = await Chat.findById(chatId);
      if (!chat) {
        console.error('Chat not found');
        return socket.emit('error', { message: 'Chat not found' });
      }

      const newMessage = {
        sender: senderId,
        content: message,
        timestamp: new Date(),
      };
      chat.messages.push(newMessage);
      await chat.save();

      // Broadcast the new message to the chat room
      io.to(chatId).emit('received new message', newMessage);
      console.log(`Message sent in chat ${chatId} by ${senderId}: ${message}`);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Error saving message' });
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
