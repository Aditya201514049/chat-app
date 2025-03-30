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
    console.log("Received message request:", JSON.stringify(req.body, null, 2));
    
    // Extract message details
    const { chatId, content, tempId, recipientId } = req.body;
    const senderId = req.user._id;

    // Detailed validation logging
    if (!chatId) console.log("Missing chatId in request");
    if (!content) console.log("Missing content in request");
    
    if (!chatId || !content) {
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        code: 'MISSING_FIELDS'
      });
    }

    // Validate chat ID
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      console.log(`Invalid chatId format: ${chatId}`);
      return res.status(400).json({ 
        message: 'Invalid chat ID format',
        code: 'INVALID_CHAT_ID'
      });
    }

    // Find chat and validate that user is part of it
    let chat;
    try {
      chat = await Chat.findById(chatId);
      console.log("Chat found:", chat ? "yes" : "no");
    } catch (err) {
      console.error(`Error finding chat ${chatId}:`, err);
      return res.status(500).json({
        message: 'Database error when finding chat',
        code: 'DB_ERROR',
        details: err.message
      });
    }

    if (!chat) {
      // Chat not found - this could happen if the chat was deleted
      // Let's check if the users exist and create a new chat
      console.log(`Chat ${chatId} not found, attempting to find users and create a new chat. Recipient ID: ${recipientId}`);
      
      if (!recipientId) {
        console.log("No recipientId provided for chat recovery");
        return res.status(404).json({ 
          message: 'Chat not found and no recipient ID provided for recovery',
          code: 'CHAT_NOT_FOUND_NO_RECIPIENT'
        });
      }
      
      if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        console.log(`Invalid recipientId format: ${recipientId}`);
        return res.status(400).json({ 
          message: 'Invalid recipient ID format',
          code: 'INVALID_RECIPIENT_ID'
        });
      }
      
      try {
        // Look for a different chat between these users
        const userId = req.user._id.toString();
        
        // Try to find an existing chat with the same participants (in any direction)
        // This is a fallback in case the original chat ID is no longer valid
        const alternativeChat = await Chat.findOne({
          $or: [
            { sender: req.user._id, recipient: recipientId },
            { sender: recipientId, recipient: req.user._id }
          ]
        });
        
        if (alternativeChat) {
          console.log(`Found alternative chat ${alternativeChat._id} between the same users`);
          
          // Create and save the new message using the alternative chat
          const newMessage = new Message({
            sender: senderId, 
            content, 
            chatId: alternativeChat._id,
            tempId
          });
          
          try {
            await newMessage.save();
            console.log(`Created new message ${newMessage._id} in alternative chat`);
          } catch (err) {
            console.error("Error saving message in alternative chat:", err);
            return res.status(500).json({
              message: 'Error saving message in alternative chat',
              code: 'DB_ERROR',
              details: err.message
            });
          }
          
          // Update the chat's messages array
          try {
            alternativeChat.messages.push(newMessage._id);
            alternativeChat.updatedAt = new Date();
            await alternativeChat.save();
            console.log(`Updated alternative chat with new message`);
          } catch (err) {
            console.error("Error updating alternative chat:", err);
            // Don't fail here since the message is already saved
          }
          
          // Return the message with the correct chat ID
          return res.status(201).json({
            ...newMessage.toObject(),
            originalChatId: chatId,
            newChatId: alternativeChat._id,
            chatRestored: true
          });
        } else if (recipientId) {
          // If we have a recipient ID, we can create a new chat
          console.log(`No alternative chat found, creating new chat with recipient ${recipientId}`);
          
          // Verify recipient exists
          let recipientExists;
          try {
            recipientExists = await User.exists({ _id: recipientId });
            console.log(`Recipient exists: ${recipientExists ? "yes" : "no"}`);
          } catch (err) {
            console.error("Error checking if recipient exists:", err);
            return res.status(500).json({
              message: 'Error checking if recipient exists',
              code: 'DB_ERROR',
              details: err.message
            });
          }
          
          if (!recipientExists) {
            return res.status(404).json({ 
              message: 'Recipient not found',
              code: 'RECIPIENT_NOT_FOUND'
            });
          }
          
          // Create a new chat
          let newChat;
          try {
            newChat = new Chat({
              sender: req.user._id,
              recipient: recipientId,
              updatedAt: new Date()
            });
            await newChat.save();
            console.log(`Created new chat ${newChat._id}`);
          } catch (err) {
            console.error("Error creating new chat:", err);
            return res.status(500).json({
              message: 'Error creating new chat',
              code: 'DB_ERROR',
              details: err.message
            });
          }
          
          // Create the message in this new chat
          let newMessage;
          try {
            newMessage = new Message({
              sender: senderId, 
              content, 
              chatId: newChat._id,
              tempId
            });
            await newMessage.save();
            console.log(`Created new message ${newMessage._id} in new chat`);
          } catch (err) {
            console.error("Error creating message in new chat:", err);
            return res.status(500).json({
              message: 'Error creating message in new chat',
              code: 'DB_ERROR',
              details: err.message
            });
          }
          
          // Update the chat with this message
          try {
            newChat.messages.push(newMessage._id);
            await newChat.save();
            console.log(`Updated new chat with message`);
          } catch (err) {
            console.error("Error updating new chat with message:", err);
            // Don't fail here since the message is already saved
          }
          
          // Return success with new chat info
          return res.status(201).json({
            ...newMessage.toObject(),
            originalChatId: chatId,
            newChatId: newChat._id,
            chatCreated: true
          });
        }
      } catch (error) {
        console.error(`Error creating alternative chat: ${error.message}`, error);
        return res.status(500).json({
          message: 'Error while trying to create alternative chat',
          code: 'DB_ERROR',
          details: error.message
        });
      }
      
      // If we get here, we couldn't recover
      return res.status(404).json({ 
        message: 'Chat not found and could not create a new one',
        code: 'CHAT_NOT_FOUND'
      });
    }

    // Convert IDs to strings for comparison
    const senderIdStr = senderId.toString();
    const chatSenderIdStr = chat.sender ? chat.sender.toString() : null;
    const chatRecipientIdStr = chat.recipient ? chat.recipient.toString() : null;

    // Validate user is part of the chat
    const isAuthorized = senderIdStr === chatSenderIdStr || senderIdStr === chatRecipientIdStr;
    console.log(`Authorization check: user ${senderIdStr} is ${isAuthorized ? '' : 'not '}part of the chat`);
    
    if (!isAuthorized) {
      return res.status(403).json({ 
        message: 'You are not authorized to send messages in this chat',
        code: 'UNAUTHORIZED'
      });
    }

    // Create and save the new message
    let newMessage;
    try {
      newMessage = new Message({
        sender: senderId, 
        content, 
        chatId,
        tempId  // Store the tempId for correlation
      });
      
      await newMessage.save();
      console.log(`Created new message: ${newMessage._id}`);
    } catch (error) {
      console.error(`Error saving message: ${error.message}`, error);
      return res.status(500).json({ 
        message: 'Error saving message to database',
        code: 'DATABASE_ERROR',
        details: error.message
      });
    }

    // Update the chat's messages array to include the new message
    try {
      chat.messages.push(newMessage._id);
      // Update the timestamp for sorting chats by most recent activity
      chat.updatedAt = new Date();
      await chat.save();
      console.log(`Updated chat with new message`);
    } catch (error) {
      console.error(`Error updating chat with new message: ${error.message}`, error);
      // Don't fail the request since the message is already saved
    }

    // Determine recipient - the other user in the chat
    const chatRecipientId = senderIdStr === chatSenderIdStr
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
          .filter(s => s.userId === chatRecipientIdStr);
        
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
        .some(s => s.userId === chatRecipientIdStr && s.rooms.has(chatRoomId));
      
      // Only send direct message if user isn't in room
      if (!senderInRoom && senderIdStr) {
        console.log(`Sender not in room, sending direct message to: ${senderIdStr}`);
        io.to(senderIdStr).emit('message received', messageData);
      }
      
      if (!recipientInRoom && chatRecipientId) {
        console.log(`Recipient not in room, sending direct message to: ${chatRecipientId}`);
        io.to(chatRecipientId).emit('message received', messageData);
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
      
      if (chatRecipientId) {
        io.to(chatRecipientId).emit('chat updated', chatData);
      }
    } else {
      console.warn('Socket.io instance not available, skipping real-time updates');
    }

    // Respond with the new message
    console.log(`Successfully sent message, responding with status 201`);
    return res.status(201).json(newMessage);
  } catch (error) {
    console.error(`Error in sendMessage: ${error.message}`, error);
    console.error(error.stack); // Print the full stack trace
    
    return res.status(500).json({ 
      message: 'Error sending message',
      code: 'SERVER_ERROR',
      details: error.message
    });
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
