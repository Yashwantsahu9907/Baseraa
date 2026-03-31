const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    propertyId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        refPath: 'propertyModel'
    },
    propertyModel: {
        type: String,
        required: true,
        enum: ['RoomListing', 'MessListing']
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Confirmed', 'Cancelled', 'Rejected'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid'],
        default: 'Unpaid'
    },
    amount: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
