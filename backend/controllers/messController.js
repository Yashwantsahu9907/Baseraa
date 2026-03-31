const MessListing = require('../models/MessListing');
const cloudinary = require('../config/cloudinary');

// @desc    Create a new mess listing
// @route   POST /api/mess
// @access  Private/MessOwner
exports.createMessListing = async (req, res) => {
    try {
        const { name, description, monthlyPlanPrice, address, coordinates, foodType, mealTimings, deliveryOptions, facilities } = req.body;
        
        let imageUrls = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const b64 = Buffer.from(file.buffer).toString('base64');
                let dataURI = 'data:' + file.mimetype + ';base64,' + b64;
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: 'basera/mess'
                });
                imageUrls.push({
                    public_id: result.public_id,
                    url: result.secure_url
                });
            }
        }

        let parseCoords = null;
        if (coordinates) {
            parseCoords = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
        }

        const mess = await MessListing.create({
            name,
            description,
            monthlyPlanPrice: Number(monthlyPlanPrice),
            address,
            location: parseCoords ? { type: 'Point', coordinates: parseCoords } : undefined,
            foodType,
            mealTimings: typeof mealTimings === 'string' ? JSON.parse(mealTimings) : mealTimings,
            deliveryOptions: deliveryOptions === 'true' || deliveryOptions === true,
            facilities: typeof facilities === 'string' ? JSON.parse(facilities) : facilities,
            images: imageUrls,
            owner: req.user._id
        });

        res.status(201).json(mess);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active mess listings
// @route   GET /api/mess
// @access  Public
exports.getMessListings = async (req, res) => {
    try {
        const messes = await MessListing.find({ isVerified: true }).populate('owner', 'name phone');
        res.json(messes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single mess by ID
// @route   GET /api/mess/:id
// @access  Public
exports.getMessById = async (req, res) => {
    try {
        const mess = await MessListing.findById(req.params.id).populate('owner', 'name phone');
        if (mess) {
            res.json(mess);
        } else {
            res.status(404).json({ message: 'Mess not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get owner's mess listings
// @route   GET /api/mess/me
// @access  Private/MessOwner
exports.getMyMessListings = async (req, res) => {
    try {
        const messes = await MessListing.find({ owner: req.user._id });
        res.json(messes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- ADMIN ONLY ACTIONS ---

// @desc    Get all messes (Admin only)
// @route   GET /api/mess/admin/all
// @access  Private/Admin
exports.getAllMessesAdmin = async (req, res) => {
    try {
        const messes = await MessListing.find().populate('owner', 'name email phone');
        res.json(messes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify/Approve a mess listing
// @route   PUT /api/mess/:id/verify
// @access  Private/Admin
exports.verifyMessListing = async (req, res) => {
    try {
        const mess = await MessListing.findByIdAndUpdate(
            req.params.id, 
            { isVerified: true }, 
            { new: true }
        );
        if (!mess) return res.status(404).json({ message: 'Mess not found' });
        res.json({ message: 'Mess verified successfully', mess });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a mess listing (Admin only)
// @route   DELETE /api/mess/:id/admin
// @access  Private/Admin
exports.deleteMessListingAdmin = async (req, res) => {
    try {
        const mess = await MessListing.findById(req.params.id);
        if (!mess) return res.status(404).json({ message: 'Mess not found' });

        // Delete images from Cloudinary
        if (mess.images && mess.images.length > 0) {
            for (const img of mess.images) {
                if (img.public_id) {
                    await cloudinary.uploader.destroy(img.public_id);
                }
            }
        }

        await MessListing.findByIdAndDelete(req.params.id);
        res.json({ message: 'Mess and associated assets deleted permanently by admin' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
