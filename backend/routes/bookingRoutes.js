const express = require('express');
const { 
    requestBooking, 
    updateBookingStatus, 
    confirmPayment, 
    getBookings 
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, authorize('Student'), upload.single('aadhaarCard'), requestBooking);
router.get('/', protect, getBookings);
router.put('/:id/status', protect, authorize('RoomOwner', 'MessOwner', 'Admin'), updateBookingStatus);
router.put('/:id/pay', protect, authorize('Student'), confirmPayment);

module.exports = router;
