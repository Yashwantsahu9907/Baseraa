const mongoose = require('mongoose');

const messListingSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Please add a mess name'], trim: true },
    description: { type: String, required: [true, 'Please add a description'] },
    pricePerMeal: { type: Number },
    monthlyPlanPrice: { type: Number, required: [true, 'Please add a monthly price'] },
    
    // Address & Location
    address: { type: String, required: [true, 'Please add an address'] },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    
    // Food & Dining Details
    foodType: { type: String, enum: ['Veg', 'Non-Veg', 'Both'], required: true },
    mealTimings: {
        breakfast: { start: String, end: String },
        lunch: { start: String, end: String },
        dinner: { start: String, end: String }
    },
    deliveryOptions: { type: Boolean, default: false }, // Delivery available or not
    category: { type: String, enum: ['room', 'mess'], default: 'mess', required: true },
    
    // Arrays
    facilities: [String], // e.g., 'Dining Hall', 'RO Water', 'Tiffin Service'
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

module.exports = mongoose.model('MessListing', messListingSchema);
