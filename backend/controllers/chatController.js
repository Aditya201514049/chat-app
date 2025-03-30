const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// Create a new chat (1-on-1)
const createChat = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === recipientId) {
      return res.status(400).json({ message: 'You cannot chat with yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
    }).populate('sender', 'name email')
      .populate('recipient', 'name email');

    if (existingChat) {
      // Set the chat's updatedAt to now to bring it to the top of the list
      existingChat.updatedAt = new Date();
      await existingChat.save();
      
      // Emit socket event if available
      const io = req.app.get('io');
      if (io) {
        console.log(`Notifying users about existing chat: ${existingChat._id}`);
        io.to(recipientId).emit('chat updated', existingChat);
        io.to(senderId.toString()).emit('chat updated', existingChat);
      }
      
      return res.status(200).json(existingChat);
    }

    const newChat = new Chat({ 
      sender: senderId, 
      recipient: recipientId,
      updatedAt: new Date() 
    });

    await newChat.save();
    
    // Populate the new chat
    const populatedChat = await Chat.findById(newChat._id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    // Emit socket event if available
    const io = req.app.get('io');
    if (io) {
      console.log(`Notifying users about new chat: ${populatedChat._id}`);
      io.to(recipientId).emit('new chat', populatedChat);
      io.to(senderId.toString()).emit('new chat', populatedChat);
    }
    
    res.status(201).json(populatedChat);
  } catch (error) {
    console.error(`Error in createChat: ${error.message}`);
    res.status(500).json({ message: 'Error creating chat' });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    // Extract message details
    const { chatId, content, tempId } = req.body;
    const senderId = req.user._id;

    if (!chatId || !content) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate chat ID
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID format' });
    }

    // Find chat and validate that user is part of it
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Convert IDs to strings for comparison
    const senderIdStr = senderId.toString();
    const chatSenderIdStr = chat.sender ? chat.sender.toString() : null;
    const chatRecipientIdStr = chat.recipient ? chat.recipient.toString() : null;

    // Validate user is part of the chat
    if (senderIdStr !== chatSenderIdStr && senderIdStr !== chatRecipientIdStr) {
      return res.status(403).json({ message: 'You are not authorized to send messages in this chat' });
    }

    // Create and save the new message
    const newMessage = new Message({
      sender: senderId, 
      content, 
      chatId,
      tempId  // Store the tempId for correlation
    });
    await newMessage.save();

    // Update the chat's messages array to include the new message
    chat.messages.push(newMessage._id);
    // Update the timestamp for sorting chats by most recent activity
    chat.updatedAt = new Date();
    await chat.save();

    // Determine recipient - the other user in the chat
    const recipientId = senderIdStr === chatSenderIdStr
      ? chatRecipientIdStr
      : chatSenderIdStr;

    // Prepare message data with sender info for socket
    const messageData = {
      ...newMessage.toObject(),
      chatId: chat._id,  // Only send the chat ID, not the full chat object
      tempId // Include the tempId for correlation with temporary messages
    };

    // Emit socket event if available
    const io = req.app.get('io');
    if (io) {
      const chatRoomId = chat._id.toString();
      console.log(`Server emitting message to chat room: ${chatRoomId}, tempId: ${tempId}`);
      
      // IMPORTANT: Double-check sockets are properly joined to the chat room
      // Get all clients in the chat room
      const roomClients = io.sockets.adapter.rooms.get(chatRoomId);
      const clientCount = roomClients ? roomClients.size : 0;
      console.log(`Chat room ${chatRoomId} has ${clientCount} connected clients`);

      // If no clients in the room, try to find sockets for both users
      if (clientCount === 0) {
        console.log(`No clients found in chat room ${chatRoomId}. Attempting to notify by user ID.`);
        
        // Find all socket instances for each user
        const senderSockets = Array.from(io.sockets.sockets.values())
          .filter(s => s.userId === senderIdStr);
        
        const recipientSockets = Array.from(io.sockets.sockets.values())
          .filter(s => s.userId === recipientIdStr);
        
        console.log(`Found ${senderSockets.length} sockets for sender and ${recipientSockets.length} for recipient`);
        
        // Join each socket to the chat room
        [...senderSockets, ...recipientSockets].forEach(socket => {
          if (!socket.rooms.has(chatRoomId)) {
            console.log(`Joining socket ${socket.id} to chat room ${chatRoomId}`);
            socket.join(chatRoomId);
          }
        });
      }
      
      // Strategy: Only send to room for message events
      // If user is in multiple tabs/devices, they'll all get it via room
      io.to(chatRoomId).emit('message received', messageData);
      
      // Only directly emit to users if they aren't in the room
      // First check if sender has a socket in the room
      const senderInRoom = Array.from(io.sockets.sockets.values())
        .some(s => s.userId === senderIdStr && s.rooms.has(chatRoomId));
      
      // Then check if recipient has a socket in the room
      const recipientInRoom = Array.from(io.sockets.sockets.values())
        .some(s => s.userId === recipientIdStr && s.rooms.has(chatRoomId));
      
      // Only send direct message if user isn't in room
      if (!senderInRoom && senderIdStr) {
        console.log(`Sender not in room, sending direct message to: ${senderIdStr}`);
        io.to(senderIdStr).emit('message received', messageData);
      }
      
      if (!recipientInRoom && recipientId) {
        console.log(`Recipient not in room, sending direct message to: ${recipientId}`);
        io.to(recipientId).emit('message received', messageData);
      }
      
      // Send chat updates as a separate event with the message ID included
      // This helps clients avoid double-counting messages
      const chatData = {
        ...chat.toObject(),
        updatedAt: new Date(),
        lastMessageId: newMessage._id, // Include the message ID that triggered this update
        lastMessage: content // Include the message content for preview
      };
      
      // Update the chat list for both users (directly to user rooms, not the chat room)
      if (senderIdStr) {
        io.to(senderIdStr).emit('chat updated', chatData);
      }
      
      if (recipientId) {
        io.to(recipientId).emit('chat updated', chatData);
      }
    } else {
      console.warn('Socket.io instance not available, skipping real-time updates');
    }

    // Respond with the new message
    res.status(201).json(newMessage);
  } catch (error) {
    console.error(`Error in sendMessage: ${error.message}`);
    res.status(500).json({ message: 'Error sending message' });
  }
};

// Get all messages in a chat
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID format' });
    }

    const messages = await Message.find({ chatId });
    res.status(200).json(messages);
  } catch (error) {
    console.error(`Error in getMessages: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving messages' });
  }
};

const getChats = async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user._id;

    // Find all chats for this user using lean() for better performance
    const chats = await Chat.find({
      $or: [{ sender: userId }, { recipient: userId }]
    }).lean();

    // Format and return chats with proper error handling
    const formattedChats = [];

    // Process each chat
    for (const chat of chats) {
      try {
        // Determine if current user is sender or recipient
        const isSender = chat.sender && chat.sender.toString() === userId.toString();
        
        // Get the other user's ID
        const otherUserId = isSender ? chat.recipient : chat.sender;
        
        if (!otherUserId) {
          console.log(`Chat ${chat._id} has missing user reference`);
          continue; // Skip this chat as it's corrupted
        }
        
        // Try to get other user info
        let otherUser = null;
        try {
          otherUser = await User.findById(otherUserId).select('name email').lean();
        } catch (error) {
          console.log(`Error finding user ${otherUserId}: ${error.message}`);
        }
        
        // If other user doesn't exist (was deleted)
        if (!otherUser) {
          otherUser = {
            _id: otherUserId,
            name: 'Deleted User',
            email: 'account-deleted'
          };
        }
        
        // Add formatted chat to result
        formattedChats.push({
          ...chat,
          otherUser
        });
      } catch (error) {
        console.error(`Error processing chat ${chat._id}: ${error.message}`);
        // Continue with next chat instead of failing the whole request
      }
    }
    
    // Sort chats by most recent first
    formattedChats.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA;
    });
    
    res.status(200).json(formattedChats);
  } catch (error) {
    console.error(`Error in getChats: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving chats' });
  }
};

const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    
    // Validate chat ID format
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID format' });
    }

    // Find the chat directly
    const chat = await Chat.findById(chatId).lean();
    
    // Check if chat exists
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Validate user belongs to this chat
    const userIdStr = userId.toString();
    const senderIdStr = chat.sender ? chat.sender.toString() : null;
    const recipientIdStr = chat.recipient ? chat.recipient.toString() : null;

    if (userIdStr !== senderIdStr && userIdStr !== recipientIdStr) {
      return res.status(403).json({ message: 'You are not authorized to view this chat' });
    }

    // Determine if current user is sender or recipient
    const isSender = userIdStr === senderIdStr;
    const otherUserId = isSender ? chat.recipient : chat.sender;

    // Create default response with placeholder for other user
    let otherUser = {
      _id: otherUserId || 'deleted-user',
      name: 'Deleted User',
      email: 'account-deleted'
    };

    // Try to get the actual other user if they exist
    try {
      if (otherUserId) {
        const foundUser = await User.findById(otherUserId).select('name email').lean();
        if (foundUser) {
          otherUser = foundUser;
        }
      }
    } catch (error) {
      console.log(`Error finding other user: ${error.message}`);
      // Just continue with the default user info
    }

    // Return the formatted chat
    return res.status(200).json({
      ...chat,
      otherUser
    });
    
  } catch (error) {
    console.error(`Error in getChatById: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving chat' });
  }
};

module.exports = {
  createChat,
  sendMessage,
  getMessages,
  getChats,
  getChatById,
};
