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
            enum: ['free', 'premium', 'guide', 'driver', 'b2b_admin', 'admin'],
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
        ]
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
