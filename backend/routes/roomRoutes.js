const express = require('express');
const { createRoomListing, getRooms, getMyRooms, getRoomById, getAllRoomsAdmin, verifyRoomListing, deleteRoomListingAdmin } = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getRooms); // Public Route
router.get('/me', protect, authorize('RoomOwner', 'Admin'), getMyRooms);
router.get('/:id', getRoomById);

// Admin Routes
router.get('/admin/all', protect, authorize('Admin'), getAllRoomsAdmin);
router.put('/:id/verify', protect, authorize('Admin'), verifyRoomListing);
router.delete('/:id/admin', protect, authorize('Admin'), deleteRoomListingAdmin);

router.post(
    '/',
    protect,
    authorize('RoomOwner', 'Admin'),
    upload.array('images', 5), // Allow max 5 images
    createRoomListing
);

module.exports = router;
