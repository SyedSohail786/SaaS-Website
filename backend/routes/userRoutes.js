const express = require('express');
const router = express.Router();
const { getCurrentUser, updateUser } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// Get current user profile
router.get('/me', auth, getCurrentUser);

// Update user profile
router.put('/', auth, updateUser);

module.exports = router;