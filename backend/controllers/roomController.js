const RoomListing = require('../models/RoomListing');
const cloudinary = require('../config/cloudinary');

// @desc    Create a new room listing
// @route   POST /api/rooms
// @access  Private/RoomOwner
exports.createRoomListing = async (req, res) => {
    try {
        const { title, description, price, address, coordinates, roomType, genderPreference, facilities, totalRooms } = req.body;
        
        let imageUrls = [];

        // Check if files exist
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Upload to cloudinary from buffer
                const b64 = Buffer.from(file.buffer).toString('base64');
                let dataURI = 'data:' + file.mimetype + ';base64,' + b64;
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: 'basera/rooms'
                });
                imageUrls.push({
                    public_id: result.public_id,
                    url: result.secure_url
                });
            }
        }

        // Handle coords if parsed as string
        let parseCoords = null;
        if (coordinates) {
            parseCoords = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
        }

        const room = await RoomListing.create({
            title,
            description,
            price: Number(price),
            address,
            location: parseCoords ? { type: 'Point', coordinates: parseCoords } : undefined,
            roomType,
            genderPreference,
            totalRooms: Number(totalRooms),
            category: 'room',
            facilities: typeof facilities === 'string' ? JSON.parse(facilities) : facilities,
            images: imageUrls,
            owner: req.user._id
        });

        res.status(201).json(room);
    } catch (error) {
        console.error('Room Creation Error:', error);
        res.status(500).json({ 
            message: error.message || 'Room creation failed',
            error: error 
        });
    }
};

// @desc    Get all active room listings with filters
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res) => {
    try {
        const { type, query, minPrice, maxPrice, college } = req.query;
        let dbQuery = { isVerified: true };

        // Handle Type Filter
        if (type && type !== 'All') {
            if (type === 'PG / Rooms') {
                 // Only fetch rooms
            }
            // (If searching mess, it hits messRoute)
        }

        // Handle text query
        if (query) {
            dbQuery.$or = [
                { title: { $regex: query, $options: 'i' } },
                { address: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        // Handle price limits
        if (minPrice || maxPrice) {
            dbQuery.price = {};
            if (minPrice) dbQuery.price.$gte = Number(minPrice);
            if (maxPrice) dbQuery.price.$lte = Number(maxPrice);
        }

        // Handle college distance mapping
        // Future scale: Use $nearSphere if index '2dsphere' is setup fully.
        // E.g. dbQuery.location = { $nearSphere: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: 5000 } }

        const rooms = await RoomListing.find(dbQuery).populate('owner', 'name phone');
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoomById = async (req, res) => {
    try {
        const room = await RoomListing.findById(req.params.id).populate('owner', 'name phone');
        if (room) {
            res.json(room);
        } else {
            res.status(404).json({ message: 'Listing not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get owner's room listings
// @route   GET /api/rooms/me
// @access  Private/RoomOwner
exports.getMyRooms = async (req, res) => {
    try {
        const rooms = await RoomListing.find({ owner: req.user._id });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- ADMIN ONLY ACTIONS ---

// @desc    Get all rooms (Admin only)
// @route   GET /api/rooms/admin/all
// @access  Private/Admin
exports.getAllRoomsAdmin = async (req, res) => {
    try {
        const rooms = await RoomListing.find().populate('owner', 'name email phone');
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify/Approve a room listing
// @route   PUT /api/rooms/:id/verify
// @access  Private/Admin
exports.verifyRoomListing = async (req, res) => {
    try {
        const room = await RoomListing.findByIdAndUpdate(
            req.params.id, 
            { isVerified: true }, 
            { new: true }
        );
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json({ message: 'Room verified successfully', room });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a room listing (Admin only)
// @route   DELETE /api/rooms/:id/admin
// @access  Private/Admin
exports.deleteRoomListingAdmin = async (req, res) => {
    try {
        const room = await RoomListing.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        // Delete images from Cloudinary
        if (room.images && room.images.length > 0) {
            for (const img of room.images) {
                if (img.public_id) {
                    await cloudinary.uploader.destroy(img.public_id);
                }
            }
        }

        await RoomListing.findByIdAndDelete(req.params.id);
        res.json({ message: 'Room and associated assets deleted permanently by admin' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
