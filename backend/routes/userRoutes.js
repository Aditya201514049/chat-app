const express = require('express');
const { registerUser, loginUser, getAllUsers, getOwnInfo } = require('../controllers/userController');
const  authMiddleware  = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profiles', authMiddleware, getAllUsers);
router.get("/me", authMiddleware, getOwnInfo); 

module.exports = router;
