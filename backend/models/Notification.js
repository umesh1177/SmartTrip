const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TripPlan'
    },
    type: {
        type: String,
        enum: ['reminder', 'booking_confirmed', 'guide_accepted', 'system'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    scheduledAt: {
        type: Date,
        default: Date.now
    },
    sentAt: {
        type: Date
    },
    channel: {
        type: String,
        enum: ['email', 'in_app'],
        default: 'in_app'
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
