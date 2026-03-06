const mongoose = require('mongoose');

const tripPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['planning', 'confirmed', 'completed', 'cancelled'],
        default: 'planning'
    },
    hotel: {
        hotelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hotel'
        },
        checkIn: Date,
        checkOut: Date,
        totalCost: Number,
        bookingRef: String
    },
    transport: [{
        type: {
            type: String,
            enum: ['flight', 'train', 'bus']
        },
        from: String,
        to: String,
        date: Date,
        time: String,
        bookingRef: String,
        providerName: String,
        cost: Number,
        externalBookingUrl: String,
        status: {
            type: String,
            enum: ['searching', 'booked'],
            default: 'searching'
        }
    }],
    guides: [{
        guideId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Guide'
        },
        date: Date,
        duration: Number, // in hours or days
        cost: Number,
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending'
        }
    }],
    totalBudget: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    notes: String,
    tripsUsed: {
        type: Number,
        default: 1
    },
    nearbyStores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
    }],
    notifications: [{
        message: String,
        scheduledAt: Date,
        sent: {
            type: Boolean,
            default: false
        }
    }],
    activities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TripActivity'
    }],
    cabRides: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CabRide'
    }],
    budgetTracker: {
        total: { type: Number, default: 0 },
        hotel: { type: Number, default: 0 },
        transport: { type: Number, default: 0 },
        guides: { type: Number, default: 0 },
        cabs: { type: Number, default: 0 },
        food: { type: Number, default: 0 },
        shopping: { type: Number, default: 0 },
        remaining: { type: Number, default: 0 }
    },
    endOfTripSuggestions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place'
    }],
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TripPlan', tripPlanSchema);
