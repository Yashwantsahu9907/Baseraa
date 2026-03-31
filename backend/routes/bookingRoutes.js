const express = require('express');
const { 
    requestBooking, 
    updateBookingStatus, 
    confirmPayment, 
    getBookings 
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('Student'), requestBooking);
router.get('/', protect, getBookings);
router.put('/:id/status', protect, authorize('RoomOwner', 'MessOwner', 'Admin'), updateBookingStatus);
router.put('/:id/pay', protect, authorize('Student'), confirmPayment);

module.exports = router;
