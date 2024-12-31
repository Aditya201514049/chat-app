const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', // Reference to the 'User' model for sender
    },
    content: {
      type: String,
      required: true, // Message content
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat', // Reference to the 'Chat' model this message belongs to
      required: true,
    },
  },
  { timestamps: true } // Automatically adds 'createdAt' and 'updatedAt' fields
);

module.exports = mongoose.model('Message', messageSchema);
