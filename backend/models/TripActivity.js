const mongoose = require('mongoose');

const tripActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tripPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TripPlan',
        required: true
    },
    type: {
        type: String,
        enum: [
            'check_in', 'cab_booked', 'store_visited', 'place_visited',
            'transport_used', 'guide_met', 'review_posted', 'photo_uploaded',
            'budget_spent', 'nearby_explored'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    location: {
        lat: Number,
        lng: Number,
        address: String
    },
    metadata: {
        type: Object
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TripActivity', tripActivitySchema);
