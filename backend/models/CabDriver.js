const mongoose = require('mongoose');

const cabDriverSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    profilePhoto: String,
    phone: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['auto', 'bike', 'sedan', 'suv', 'mini'],
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true,
        unique: true
    },
    vehicleModel: String,
    vehicleColor: String,
    documents: {
        license: String, // Encrypted URL
        rc: String,      // Encrypted URL
        insurance: String // Encrypted URL
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    currentLocation: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    city: String,
    country: String,
    rating: {
        type: Number,
        default: 5
    },
    totalRides: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    bankDetails: {
        accountNumber: String, // AES-256 encrypted
        ifsc: String,           // AES-256 encrypted
        accountName: String     // AES-256 encrypted
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    commissionRate: {
        type: Number,
        default: 0.15 // SmartTrip commission: 15%
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CabDriver', cabDriverSchema);
