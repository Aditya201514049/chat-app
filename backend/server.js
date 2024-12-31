const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cors = require('cors');
const http = require('http'); // Import HTTP module for creating server
const socketIo = require('socket.io'); // Import Socket.io

dotenv.config();
connectDB();

const app = express();

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Set up Socket.io with the server
const io = socketIo(server);

// Use CORS middleware to allow cross-origin requests
app.use(cors()); // Allows all origins by default

app.use(express.json()); // Middleware to parse JSON requests

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Listen for a custom event (e.g., a new message)
    socket.on('send_message', (message) => {
      console.log('Message received:', message);
      // Emit the message to all connected clients
      io.emit('new_message', message);
    });
  
    // Handle user disconnect
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});