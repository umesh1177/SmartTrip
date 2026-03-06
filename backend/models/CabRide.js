const mongoose = require('mongoose');

const cabRideSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CabDriver'
    },
    tripPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TripPlan'
    },
    pickupLocation: {
        address: String,
        lat: Number,
        lng: Number
    },
    dropLocation: {
        address: String,
        lat: Number,
        lng: Number
    },
    vehicleType: String,
    status: {
        type: String,
        enum: ['searching', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled'],
        default: 'searching'
    },
    fare: {
        estimated: Number,
        final: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    distance: Number, // km
    duration: Number, // minutes
    otp: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'online'],
        default: 'online'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    rating: Number,
    review: String,
    startTime: Date,
    endTime: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('CabRide', cabRideSchema);
