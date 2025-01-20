const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');

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
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = new Chat({ 
      sender: senderId, 
      recipient: recipientId 
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error(`Error in createChat: ${error.message}`);
    res.status(500).json({ message: 'Error creating chat' });
  }
};



const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const senderId = req.user._id;

    // Verify that the chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Ensure the sender is part of the chat
    if (![chat.sender.toString(), chat.recipient.toString()].includes(senderId.toString())) {
      return res.status(403).json({ message: 'Unauthorized to send messages in this chat' });
    }

    // Create the new message
    const newMessage = new Message({ sender: senderId, content, chatId });
    await newMessage.save();

    // Update the chat's messages array to include the new message
    chat.messages.push(newMessage._id);
    await chat.save();

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

    const messages = await Message.find({ chatId });
    res.status(200).json(messages);
  } catch (error) {
    console.error(`Error in getMessages: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving messages' });
  }
};



const getChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    // Add the `otherUser` field for each chat
    const formattedChats = chats.map((chat) => {
      const isSender = chat.sender._id.toString() === userId.toString();
      return {
        ...chat.toObject(),
        otherUser: isSender ? chat.recipient : chat.sender,
      };
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

    const chat = await Chat.findById(chatId)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if the logged-in user is part of the chat
    if (
      chat.sender._id.toString() !== userId.toString() &&
      chat.recipient._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: 'You are not authorized to view this chat' });
    }

    // Determine the "other user" dynamically
    const otherUser = chat.sender._id.toString() === userId.toString() ? chat.recipient : chat.sender;

    res.status(200).json({
      ...chat.toObject(),
      otherUser,
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
