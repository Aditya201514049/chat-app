const express = require('express');
const router = express.Router();
const { createChat, sendMessage, getMessages, getChats } = require('../controllers/chatController');
const  authMiddleware  = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, createChat);
router.post('/message', authMiddleware, sendMessage);
router.get('/messages/:chatId', authMiddleware, getMessages);
router.get('/getchats', authMiddleware, getChats);



module.exports = router;
