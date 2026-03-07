const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    coordinates: {
        lat: Number,
        lng: Number
    },
    pricePerNight: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    category: {
        type: String,
        enum: ['budget', 'moderate', 'luxury', '5-star', 'boutique'],
        required: true
    },
    amenities: [{
        type: String
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    isPartner: {
        type: Boolean,
        default: false
    },
    partnerTier: {
        type: String,
        enum: ['basic', 'featured', 'premium']
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    contactEmail: String,
    contactPhone: String,
    checkInTime: String,
    checkOutTime: String,
    placeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    addedByAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Hotel', hotelSchema);
