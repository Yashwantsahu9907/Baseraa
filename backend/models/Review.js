const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    roomId: {
        type: mongoose.Schema.ObjectId,
        ref: 'RoomListing'
    },
    messId: {
        type: mongoose.Schema.ObjectId,
        ref: 'MessListing'
    },
    rating: {
        type: Number,
        required: [true, 'Please add a rating between 1 and 5'],
        min: 1,
        max: 5
    },
    reviewText: {
        type: String,
        required: [true, 'Please add a review text'],
        trim: true,
        maxlength: [500, 'Review cannot be more than 500 characters']
    }
}, {
    timestamps: true
});

// Prevent user from submitting more than one review per listing
reviewSchema.index({ user: 1, roomId: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, messId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
