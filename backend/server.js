const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();

app.use(cors()); // Allows all origins by default
app.use(express.json()); // Middleware to parse JSON requests

// Define the root route for basic HTTP requests (optional, just to avoid "Cannot GET /")
app.get('/', (req, res) => {
  res.send('Welcome to the Chat App Backend!');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
