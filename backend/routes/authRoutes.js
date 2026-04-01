const express = require('express');
const { registerUser, loginUser, getUserProfile, toggleFavourite } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/favorites/:listingId', protect, toggleFavourite);

module.exports = router;
