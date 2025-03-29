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

// Middleware for authentication
io.use((socket, next) => {
  try {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error('Authentication error: userId not provided'));
    }
    
    console.log(`Socket authenticating user: ${userId}`);
    socket.userId = userId; // Store userId in socket object for future reference
    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // User authentication and setup
  socket.on('setup', (userData) => {
    if (userData && userData._id) {
      const userId = userData._id.toString();
      
      // Store user socket mapping
      connectedUsers.set(userId, socket.id);
      socket.join(userId);
      
      console.log(`User ${userId} connected and setup complete. Active users: ${connectedUsers.size}`);
      
      // Notify the client that setup is complete
      socket.emit('connected');
      
      // Log all connected users for debugging
      console.log('Connected users:', Array.from(connectedUsers.entries()));
    } else {
      console.error('Invalid user data during setup:', userData);
    }
  });

  // Join a chat room
  socket.on('join chat', (chatId) => {
    if (!chatId) {
      console.error('Invalid chatId received:', chatId);
      return;
    }
    
    const roomId = chatId.toString();
    socket.join(roomId);
    console.log(`User joined chat: ${roomId}`);
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
    const chatRoomId = typeof chatId === 'object' ? chatId._id : chatId.toString();
    
    // Join the chat room if not already
    socket.join(chatRoomId);
    
    // IMPORTANT: DO NOT broadcast to the chat room here 
    // The message will be broadcast through the sendMessage controller
    // This avoids message duplication
    console.log(`Socket message received, will be processed via HTTP endpoint: ${chatRoomId}`);
    
    // The actual broadcasting happens in the controller after DB save
  });

  // Handle typing status
  socket.on('typing', (chatId) => {
    console.log(`User typing in chat: ${chatId}`);
    socket.to(chatId).emit('typing', chatId);
  });

  socket.on('stop typing', (chatId) => {
    console.log(`User stopped typing in chat: ${chatId}`);
    socket.to(chatId).emit('stop typing');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Get userId directly from socket
    const userId = socket.userId;
    
    // Remove from connected users
    if (userId && connectedUsers.get(userId) === socket.id) {
      connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected. Remaining users: ${connectedUsers.size}`);
    } else {
      // Fallback to searching by socket ID
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`User ${userId} disconnected by socket ID search`);
          break;
        }
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
