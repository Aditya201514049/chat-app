const express = require('express');
const { accessChat, fetchChats } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, accessChat);
router.get('/', authMiddleware, fetchChats);

module.exports = router;
