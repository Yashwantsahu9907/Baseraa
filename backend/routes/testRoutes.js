const express = require('express');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/test', protect, async (req, res) => {
    try {
        const result = await cloudinary.api.ping();
        res.json({ message: 'Cloudinary connected!', result });
    } catch (error) {
        console.error('Cloudinary Ping Error:', error);
        res.status(500).json({ 
            message: 'Cloudinary setup failed', 
            error: error.message,
            used_credentials: {
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing',
                api_secret: process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing'
            }
        });
    }
});

module.exports = router;
