const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    profilePhoto: String,
    bio: {
        type: String,
        required: true
    },
    languages: [{
        type: String,
        required: true
    }],
    specializations: [{
        type: String
    }],
    experience: {
        type: Number,
        required: true // in years
    },
    pricePerDay: {
        type: Number,
        required: true
    },
    pricePerHalfDay: {
        type: Number,
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
    isVerified: {
        type: Boolean,
        default: false
    },
    availability: [{
        date: Date,
        isBooked: {
            type: Boolean,
            default: false
        }
    }],
    documents: [{
        type: String // verification IDs
    }],
    bankDetails: {
        accountNumber: String, // In production, these should be encrypted or use Stripe Connect
        ifsc: String,
        accountName: String
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Guide', guideSchema);
