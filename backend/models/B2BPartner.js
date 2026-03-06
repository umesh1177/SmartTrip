const mongoose = require('mongoose');

const b2bPartnerSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    ownerName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        enum: ['hotel', 'store', 'guide_agency'],
        required: true
    },
    subscriptionPlan: {
        type: String,
        enum: ['basic', 'featured', 'premium'],
        required: true
    },
    subscriptionCost: {
        type: Number,
        required: true
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'pending'
    },
    referrals: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('B2BPartner', b2bPartnerSchema);
