const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['free', 'premium', 'guide', 'driver', 'hotel_partner', 'admin', 'b2b_admin'],
            default: 'free',
        },
        premiumExpiresAt: {
            type: Date
        },
        savedPlaces: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Place',
            },
        ],
        tripsPlanned: {
            type: Number,
            default: 0
        },
        freeTripsUsed: {
            type: Number,
            default: 0,
            max: 1 // Max 1 free trip plan
        },
        premiumTripsUsed: {
            type: Number,
            default: 0 // Max 5 per billing cycle (enforced in controllers)
        },
        notificationPreferences: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        },
        badges: [
            {
                name: String,
                earnedAt: { type: Date, default: Date.now }
            }
        ],
        hotelPartnerInfo: {
            businessName: String,
            ownerName: String,
            businessPhone: String,
            businessEmail: String,
            city: String,
            state: String,
            country: { type: String, default: 'India' },
            gstNumber: String,
            businessType: {
                type: String,
                enum: ['hotel', 'resort', 'homestay', 'hostel', 'villa', 'guesthouse'],
                default: 'hotel'
            },
            subscriptionPlan: {
                type: String,
                enum: ['none', 'basic', 'featured', 'premium'],
                default: 'none'
            },
            subscriptionStatus: {
                type: String,
                enum: ['inactive', 'active', 'expired', 'cancelled'],
                default: 'inactive'
            },
            subscriptionStartDate: Date,
            subscriptionEndDate: Date,
            stripeCustomerId: String,
            stripeSubscriptionId: String,
            hotelFormSubmitted: { type: Boolean, default: false },
            hotelFormSubmittedAt: Date,
            hotelApprovedByAdmin: { type: Boolean, default: false },
            hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
            totalReferrals: { type: Number, default: 0 },
            totalClicks: { type: Number, default: 0 }
        }
    },
    {
        timestamps: true,
    }
);

// Add custom validation to enforce the max 10 places limit for free users
userSchema.pre('save', function () {
    if (this.role === 'free' && this.savedPlaces.length > 10) {
        throw new Error('Free users can only save up to 10 places. Upgrade to premium for unlimited saved places.');
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
