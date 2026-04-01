const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Check user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            phone
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user & include password field
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('favorites', 'title address price images availabilityStatus totalRooms bookedRooms roomType genderPreference');

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                favorites: user.favorites
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle a listing in user's favourites
// @route   PUT /api/auth/favorites/:listingId
// @access  Private
exports.toggleFavourite = async (req, res) => {
    try {
        const listingId = req.params.listingId;

        // Check current state first (only fetch favorites field)
        const current = await User.findById(req.user._id).select('favorites');
        if (!current) return res.status(404).json({ message: 'User not found' });

        const alreadySaved = current.favorites.some(id => id.toString() === listingId);

        // Use atomic update operators — avoids triggering the pre-save password hook
        const updateOp = alreadySaved
            ? { $pull: { favorites: listingId } }
            : { $addToSet: { favorites: listingId } };

        const updated = await User.findByIdAndUpdate(
            req.user._id,
            updateOp,
            { new: true, select: 'favorites' }
        );

        res.json({ favorites: updated.favorites, saved: !alreadySaved });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
