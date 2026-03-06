const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    placeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
    tripPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TripPlan'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: String,
    body: {
        type: String,
        required: true
    },
    photos: [String],
    tags: [String],
    visitedMonth: String,
    visitedYear: Number,
    travelType: {
        type: String,
        enum: ['solo', 'couple', 'family', 'friends']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    helpfulVotes: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved' // Auto-approve for now unless flagged
    }
}, {
    timestamps: true
});

// Ensure a user can only review a specific place once per trip
reviewSchema.index({ userId: 1, placeId: 1, tripPlanId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
