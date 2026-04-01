const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const RoomListing = require('B:/Baseraa/backend/models/RoomListing');
const MessListing = require('B:/Baseraa/backend/models/MessListing');

// Load env vars from backend/.env
dotenv.config({ path: 'B:/Baseraa/backend/.env' });

const migrate = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in the .env file');
        }
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Update Rooms
        const rooms = await RoomListing.updateMany(
            { category: { $exists: false } },
            { $set: { category: 'room' } }
        );
        console.log(`Updated ${rooms.modifiedCount} room listings.`);

        // Update Messes
        const messes = await MessListing.updateMany(
            { category: { $exists: false } },
            { $set: { category: 'mess' } }
        );
        console.log(`Updated ${messes.modifiedCount} mess listings.`);

        process.exit(0);
    } catch (error) {
        console.error('Migration Error:', error);
        process.exit(1);
    }
};

migrate();
