const express = require('express');
const { createMessListing, getMessListings, getMyMessListings, getMessById, getAllMessesAdmin, verifyMessListing, deleteMessListingAdmin } = require('../controllers/messController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getMessListings);
router.get('/me', protect, authorize('MessOwner', 'Admin'), getMyMessListings);
router.get('/:id', getMessById);

// Admin Routes
router.get('/admin/all', protect, authorize('Admin'), getAllMessesAdmin);
router.put('/:id/verify', protect, authorize('Admin'), verifyMessListing);
router.delete('/:id/admin', protect, authorize('Admin'), deleteMessListingAdmin);

router.post(
    '/',
    protect,
    authorize('MessOwner', 'Admin'),
    upload.array('images', 5),
    createMessListing
);

module.exports = router;
