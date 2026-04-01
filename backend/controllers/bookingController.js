const Booking = require('../models/Booking');
const RoomListing = require('../models/RoomListing');
const MessListing = require('../models/MessListing');

// Helper: compute availability status from counts
function computeAvailability(booked, total) {
    if (!total || total === 0) return 'Available';
    const ratio = booked / total;
    if (ratio >= 1) return 'Full';
    if (ratio >= 0.7) return 'Limited';
    return 'Available';
}

// @desc    Request a new booking
// @route   POST /api/bookings
// @access  Private/Student
exports.requestBooking = async (req, res) => {
    try {
        const { propertyId, propertyType, amount, startDate } = req.body;

        // Block booking if room is Full
        if (propertyType === 'RoomListing') {
            const room = await RoomListing.findById(propertyId);
            if (room && room.availabilityStatus === 'Full') {
                return res.status(400).json({ message: 'This property is fully booked and cannot accept new requests.' });
            }
        }
        
        const booking = await Booking.create({
            student: req.user._id,
            propertyId,
            propertyModel: propertyType,
            amount,
            startDate,
            status: 'Pending'
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status (Approve/Reject/Cancel)
// @route   PUT /api/bookings/:id/status
// @access  Private/Owner
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const prevStatus = booking.status;
        booking.status = status;
        await booking.save();

        // Auto-update room availability counts (only for RoomListing)
        if (booking.propertyModel === 'RoomListing') {
            const room = await RoomListing.findById(booking.propertyId);
            if (room) {
                // Increment bookedRooms when a booking transitions TO Approved
                if (status === 'Approved' && prevStatus !== 'Approved') {
                    room.bookedRooms = Math.min(room.bookedRooms + 1, room.totalRooms);
                }
                // Decrement bookedRooms when a booking is Rejected or Cancelled FROM Approved
                if ((status === 'Rejected' || status === 'Cancelled') && prevStatus === 'Approved') {
                    room.bookedRooms = Math.max(room.bookedRooms - 1, 0);
                }
                // Recompute availability status
                room.availabilityStatus = computeAvailability(room.bookedRooms, room.totalRooms);
                await room.save();
            }
        }
        
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Confirm payment for approved booking
// @route   PUT /api/bookings/:id/pay
// @access  Private/Student
exports.confirmPayment = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.status !== 'Approved') return res.status(400).json({ message: 'Booking must be approved first' });
        
        booking.paymentStatus = 'Paid';
        booking.status = 'Confirmed';
        await booking.save();
        
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bookings (Student or Owner context)
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
    try {
        let bookings;
        if (req.user.role === 'Student') {
            bookings = await Booking.find({ student: req.user._id })
                .populate('propertyId');
        } else {
            // Find properties owned by this user
            const rooms = await RoomListing.find({ owner: req.user._id }).select('_id');
            const messes = await MessListing.find({ owner: req.user._id }).select('_id');
            const propertyIds = [...rooms.map(r => r._id), ...messes.map(m => m._id)];
            
            bookings = await Booking.find({ propertyId: { $in: propertyIds } })
                .populate('student', 'name email phone')
                .populate('propertyId');
        }
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
