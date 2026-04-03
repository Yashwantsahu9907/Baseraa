const mongoose = require('mongoose');
const Review = require('../models/Review');
const RoomListing = require('../models/RoomListing');
const MessListing = require('../models/MessListing');

// Helper to update listing average rating and count
const updateListingStats = async (listingType, listingId) => {
    const Model = listingType === 'room' ? RoomListing : MessListing;
    const matchField = listingType === 'room' ? 'roomId' : 'messId';

    const stats = await Review.aggregate([
        { $match: { [matchField]: new mongoose.Types.ObjectId(listingId) } },
        {
            $group: {
                _id: `$${matchField}`,
                numReviews: { $sum: 1 },
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Model.findByIdAndUpdate(listingId, {
            numReviews: stats[0].numReviews,
            averageRating: Math.round(stats[0].averageRating * 10) / 10 // Round to 1 decimal
        });
    } else {
        await Model.findByIdAndUpdate(listingId, {
            numReviews: 0,
            averageRating: 0
        });
    }
};

// @desc    Add a review
// @route   POST /api/reviews/:type/:id
// @access  Private (Student)
exports.addReview = async (req, res) => {
    try {
        const { rating, reviewText } = req.body;
        const { type, id } = req.params;

        if (req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Only students can leave reviews' });
        }

        const reviewData = {
            user: req.user._id,
            rating,
            reviewText
        };

        if (type === 'room') reviewData.roomId = id;
        else if (type === 'mess') reviewData.messId = id;
        else return res.status(400).json({ message: 'Invalid listing type' });

        const review = await Review.create(reviewData);
        await updateListingStats(type, id);

        res.status(201).json(review);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this listing' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a listing
// @route   GET /api/reviews/:type/:id
// @access  Public
exports.getReviews = async (req, res) => {
    try {
        const { type, id } = req.params;
        const { sort } = req.query;

        const matchField = type === 'room' ? 'roomId' : 'messId';
        let query = Review.find({ [matchField]: id }).populate('user', 'name profileImage');

        if (sort === 'highest') query = query.sort({ rating: -1, createdAt: -1 });
        else if (sort === 'lowest') query = query.sort({ rating: 1, createdAt: -1 });
        else query = query.sort({ createdAt: -1 }); // Newest default

        const reviews = await query;
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
    try {
        const { rating, reviewText } = req.body;
        let review = await Review.findById(req.params.id);

        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this review' });
        }

        review.rating = rating;
        review.reviewText = reviewText;
        await review.save();

        const type = review.roomId ? 'room' : 'mess';
        const listingId = review.roomId || review.messId;
        await updateListingStats(type, listingId);

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this review' });
        }

        const type = review.roomId ? 'room' : 'mess';
        const listingId = review.roomId || review.messId;

        await review.deleteOne();
        await updateListingStats(type, listingId);

        res.json({ message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
