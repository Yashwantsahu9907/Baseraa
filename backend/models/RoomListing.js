const mongoose = require('mongoose');

const roomListingSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Please add a title'], trim: true },
    description: { type: String, required: [true, 'Please add a description'] },
    price: { type: Number, required: [true, 'Please add a price per month'] },
    
    // Address & Location
    address: { type: String, required: [true, 'Please add an address'] },
    location: {
        // GeoJSON Point
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    
    // Property Details
    roomType: { type: String, enum: ['Single', 'Double', 'Triple', 'Dormitory', '1BHK', '2BHK', 'PG'], required: true },
    genderPreference: { type: String, enum: ['Boys', 'Girls', 'Any'], required: true },
    availabilityStatus: { type: String, enum: ['Available', 'Limited', 'Full'], default: 'Available' },
    totalRooms: { type: Number, required: [true, 'Please specify total number of rooms'], min: 1 },
    bookedRooms: { type: Number, default: 0, min: 0 },
    category: { type: String, enum: ['room', 'mess'], default: 'room', required: true },
    
    // Arrays
    facilities: [String], // e.g., 'WiFi', 'AC', 'Attached Bathroom', 'Parking', 'Washing Machine'
    images: [{
        public_id: String,
        url: String
    }],

    // Relations
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    isVerified: { type: Boolean, default: false } // Admin verification
}, {
    timestamps: true
});

module.exports = mongoose.model('RoomListing', roomListingSchema);
