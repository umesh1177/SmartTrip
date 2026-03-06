const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    images: [{
        type: String
    }],
    category: {
        type: String,
        enum: ['restaurant', 'cafe', 'shopping', 'pharmacy', 'atm', 'activity'],
        required: true
    },
    address: String,
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
    openingHours: String,
    contactPhone: String,
    priceRange: {
        type: String,
        enum: ['$', '$$', '$$$']
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    isPartner: {
        type: Boolean,
        default: false
    },
    partnerTier: {
        type: String,
        enum: ['basic', 'featured']
    },
    placeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
    tags: [{
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Store', storeSchema);
