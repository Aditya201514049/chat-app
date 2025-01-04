const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const Chat = require('./models/chatModel');
const cors = require('cors');
const http = require('http'); // Import HTTP module for creating server
const socketIo = require('socket.io'); // Import Socket.io
const { Server } = require('socket.io');

dotenv.config();
connectDB();

const app = express();

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Set up Socket.io with the server
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins (restrict in production)
    methods: ['GET', 'POST'],
  },
});

// Use CORS middleware to allow cross-origin requests
app.use(cors()); // Allows all origins by default

app.use(express.json()); // Middleware to parse JSON requests

// Define the root route for basic HTTP requests (optional, just to avoid "Cannot GET /")
app.get('/', (req, res) => {
  res.send('Welcome to the WebSocket Server!');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    //Join chat room
    socket.on('Join chat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat' ${chatId}`);
    })
  
    // Handle sending message
    socket.on('send message', async ({chatId, senderId, message}) =>
    {
      try{
        // Save message to the database
        const chat = await Chat.findById(chatId);
        if(chat){
          const newMessage = {
            sender: senderId,
            content: message,
            timestamp: new Date(),
          };
          chat.messages.push(newMessage);
          await chat.save();

          // Broadcast the new message to all users in the chat room
          io.to(chatId).emit('recieved new message', newMessage);
        }

      } catch(error){
        console.error('error saving message', error);
      }
    })
  
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