const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

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
    const token = socket.handshake.auth.token;
    
    if (!userId) {
      console.error("Socket auth failed: No userId provided");
      return next(new Error('Authentication error: userId not provided'));
    }
    
    if (!token) {
      console.error("Socket auth failed: No token provided");
      return next(new Error('Authentication error: token not provided'));
    }
    
    console.log(`Socket authenticating user: ${userId}`);
    socket.userId = userId; // Store userId in socket object for future reference
    socket.userToken = token; // Store token for potential verification
    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('New client connected with ID:', socket.id);
  
  // User authentication and setup
  socket.on('setup', (userData) => {
    if (userData && userData._id) {
      const userId = userData._id.toString();
      
      // Store user socket mapping
      connectedUsers.set(userId, socket.id);
      
      // Join a room with the user's ID to send them direct messages
      socket.join(userId);
      
      console.log(`User ${userId} connected and setup complete. Socket ID: ${socket.id}. Active users: ${connectedUsers.size}`);
      
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
    
    // Leave all other chat rooms (not user rooms) before joining new one
    Array.from(socket.rooms)
      .filter(room => room !== socket.id && room !== socket.userId)
      .forEach(room => {
        console.log(`Leaving previous chat room: ${room}`);
        socket.leave(room);
      });
    
    // Join the new chat room
    socket.join(roomId);
    console.log(`User ${socket.userId} joined chat room: ${roomId}`);
    
    // Debug: print all rooms this socket is in
    console.log(`Socket ${socket.id} is now in rooms:`, Array.from(socket.rooms));
  });

  // Add this after the join chat event handler
  socket.on('check room status', (chatId) => {
    if (!chatId) return;
    
    const roomId = chatId.toString();
    const roomClients = io.sockets.adapter.rooms.get(roomId);
    const isInRoom = socket.rooms.has(roomId);
    const clientCount = roomClients ? roomClients.size : 0;
    
    console.log(`Room status check for ${roomId}: in room=${isInRoom}, total clients=${clientCount}`);
    
    // If not in room, rejoin it
    if (!isInRoom) {
      console.log(`Socket ${socket.id} not in room ${roomId}, rejoining...`);
      socket.join(roomId);
    }
    
    // Send the status back to the client
    socket.emit('room status', {
      chatId: roomId,
      isInRoom,
      clientCount
    });
  });

  // Handle new message - Add reliability layer even though HTTP is primary method
  socket.on('new message', (newMessageData) => {
    console.log('New message received from socket:', newMessageData);
    
    // Validate chat ID
    const chatId = newMessageData.chatId;
    if (!chatId) {
      console.error('Invalid chat data received:', newMessageData);
      return;
    }
    
    // Convert chatId to string if it's an object
    const chatRoomId = typeof chatId === 'object' ? chatId._id.toString() : chatId.toString();
    
    // Ensure the sender is in the chat room
    if (!socket.rooms.has(chatRoomId)) {
      console.log(`Auto-joining sender to chat room: ${chatRoomId} before message processing`);
      socket.join(chatRoomId);
    }
    
    // IMPORTANT: The main message broadcasting happens in the controller after DB save
    // This is just a safety layer in case the HTTP endpoint fails or the socket
    // needs to handle message broadcasting directly
    
    // We'll log but not broadcast to avoid duplication with the HTTP endpoint
    console.log(`Socket message received for chat: ${chatRoomId}. Will be handled via HTTP.`);
  });

  // Handle typing status
  socket.on('typing', (chatId) => {
    if (!chatId) return;
    
    const roomId = chatId.toString();
    console.log(`User ${socket.userId} typing in chat: ${roomId}`);
    
    // Make sure we're in the room before broadcasting
    if (!socket.rooms.has(roomId)) {
      console.log(`Auto-joining chat room for typing: ${roomId}`);
      socket.join(roomId);
    }
    
    // Broadcast typing event to everyone in the room EXCEPT sender
    socket.to(roomId).emit('typing', roomId);
  });

  socket.on('stop typing', (chatId) => {
    if (!chatId) return;
    
    const roomId = chatId.toString();
    console.log(`User ${socket.userId} stopped typing in chat: ${roomId}`);
    
    // Broadcast stop typing event to everyone in the room EXCEPT sender
    socket.to(roomId).emit('stop typing');
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

// Add error handling middleware after all routes
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  console.error(err.stack);
  
  res.status(500).json({
    message: 'An unexpected error occurred on the server',
    error: process.env.NODE_ENV === 'production' ? 'Unknown error' : err.message
  });
});

// Improve MongoDB connection handling
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
  // Attempt to reconnect
  setTimeout(() => {
    connectDB();
  }, 5000);
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
