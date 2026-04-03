const express = require('express');
const router = express.Router();
const { getMessages, markAsRead, getUnreadCounts, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/unread', protect, getUnreadCounts);
router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);
router.put('/read/:userId', protect, markAsRead);

module.exports = router;
