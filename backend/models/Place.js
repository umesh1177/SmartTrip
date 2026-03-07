const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
    {
        // ── Core identity ────────────────────────────────────────────────────
        name: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
            index: true,
            default: 'India',
        },
        state: {
            type: String,
            trim: true,
            index: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        image: {
            type: String,
            required: true,
            match: [/^https?:\/\//, 'Please provide a valid image URL'],
        },
        description: {
            type: String,
            required: true,
        },
        tags: [{ type: String, trim: true }],

        // ── Classification ───────────────────────────────────────────────────
        category: {
            type: String,
            enum: ['beach', 'mountain', 'city', 'adventure', 'cultural', 'wildlife', 'luxury'],
            required: true,
        },
        type: {
            type: String,
            enum: [
                'ancient', 'temple', 'nature', 'modern',
                'beach', 'museum', 'fort', 'wildlife',
                'hill_station', 'waterfall', 'lake', 'city',
            ],
            default: 'city',
        },

        // ── Visit characteristics ─────────────────────────────────────────────
        budget: {
            type: String,
            enum: ['budget', 'moderate', 'luxury'],
            required: true,
        },
        budgetPerPerson: {
            type: String,
            enum: ['budget', 'mid_range', 'premium'],
            default: 'mid_range',
        },
        entryFee: {
            type: String,
            enum: ['free', 'below_100', '100_to_500', 'above_500'],
            default: 'free',
        },

        // ── Season / Timing ───────────────────────────────────────────────────
        // Keep legacy single-string season for backward-compat, ADD array-based season
        season: {
            type: String,
            enum: ['summer', 'winter', 'spring', 'autumn', 'all-season'],
            required: true,
        },
        bestTime: {
            type: [String],
            enum: ['morning', 'evening', 'all_day', 'night'],
        },
        bestSeason: {
            type: [String],
            enum: ['jan_mar', 'apr_jun', 'jul_sep', 'oct_dec', 'all_season'],
        },

        // ── Duration / Distance ───────────────────────────────────────────────
        // Keep legacy enum for backward-compat, ADD granular version
        duration: {
            type: String,
            enum: ['weekend', '1-week', '2-weeks', 'month', '1_2hrs', '3_4hrs', 'full_day'],
            required: true,
        },
        distanceFromAhmedabad: {
            type: String,
            enum: ['below_100km', '100_300km', 'above_300km'],
        },

        // ── Climate / Environment ─────────────────────────────────────────────
        climate: {
            type: String,
            enum: ['tropical', 'cold', 'desert', 'temperate', 'mediterranean'],
            required: true,
        },
        indoorOutdoor: {
            type: String,
            enum: ['indoor', 'outdoor', 'mixed'],
            default: 'outdoor',
        },

        // ── Crowd & Popularity ────────────────────────────────────────────────
        crowdLevel: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        crowdCalendar: {
            jan: { type: String, enum: ['peak', 'moderate', 'off'], default: 'moderate' },
            feb: { type: String, enum: ['peak', 'moderate', 'off'], default: 'moderate' },
            mar: { type: String, enum: ['peak', 'moderate', 'off'], default: 'moderate' },
            apr: { type: String, enum: ['peak', 'moderate', 'off'], default: 'off' },
            may: { type: String, enum: ['peak', 'moderate', 'off'], default: 'off' },
            jun: { type: String, enum: ['peak', 'moderate', 'off'], default: 'off' },
            jul: { type: String, enum: ['peak', 'moderate', 'off'], default: 'moderate' },
            aug: { type: String, enum: ['peak', 'moderate', 'off'], default: 'moderate' },
            sep: { type: String, enum: ['peak', 'moderate', 'off'], default: 'moderate' },
            oct: { type: String, enum: ['peak', 'moderate', 'off'], default: 'peak' },
            nov: { type: String, enum: ['peak', 'moderate', 'off'], default: 'peak' },
            dec: { type: String, enum: ['peak', 'moderate', 'off'], default: 'peak' },
        },

        // ── Accessibility & Logistics ─────────────────────────────────────────
        accessibility: {
            type: String,
            enum: ['wheelchair', 'partial', 'none'],
            default: 'partial',
        },
        parking: {
            type: String,
            enum: ['free', 'paid', 'limited', 'none'],
            default: 'limited',
        },
        transportMode: {
            type: [String],
            enum: ['car', 'train', 'bus', 'flight'],
        },

        // ── Audience ──────────────────────────────────────────────────────────
        bestFor: {
            type: String,
            enum: ['solo', 'couple', 'family', 'friends', 'honeymoon'],
            required: true,
        },
        familyFriendly: {
            type: Boolean,
            default: true,
        },
        ageSuitability: {
            type: [String],
            enum: ['toddlers', 'kids', 'teenagers', 'adults', 'seniors', 'all'],
            default: ['all'],
        },
        fitnessLevel: {
            type: String,
            enum: ['easy', 'moderate', 'challenging'],
            default: 'easy',
        },
        petFriendly: {
            type: String,
            enum: ['allowed', 'not_allowed', 'service_only'],
            default: 'not_allowed',
        },

        // ── Activities & Experiences ──────────────────────────────────────────
        activities: [{ type: String, trim: true }],
        activityType: {
            type: [String],
            enum: ['spiritual', 'adventure', 'relaxation', 'educational', 'photography', 'sightseeing'],
        },

        // ── Facilities & Services ─────────────────────────────────────────────
        facilities: {
            type: [String],
            enum: ['restrooms', 'food_court', 'first_aid', 'wifi', 'atm', 'shopping'],
        },
        accommodationNearby: {
            type: [String],
            enum: ['hotels', 'budget', 'luxury', 'camping'],
        },
        foodOptions: {
            type: [String],
            enum: ['restaurant', 'street_food', 'gujarati_thali', 'limited'],
        },
        guidedTours: {
            type: [String],
            enum: ['audio', 'professional', 'self_guided', 'group'],
        },
        languages: {
            type: [String],
            enum: ['gujarati', 'hindi', 'english', 'regional'],
        },

        // ── Photography & Content ─────────────────────────────────────────────
        photographyScore: {
            type: String,
            enum: ['excellent', 'good', 'average'],
            default: 'good',
        },

        // ── Ratings & Reviews ─────────────────────────────────────────────────
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        reviews: {
            type: Number,
            default: 0,
        },
        averageRating: {
            type: Number,
            default: 0,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        recentPhotos: [String],

        // ── Real-time Info ────────────────────────────────────────────────────
        realTimeInfo: {
            currentCrowdLevel: {
                type: String,
                enum: ['low', 'moderate', 'high'],
                default: 'low',
            },
            lastUpdated: Date,
            weatherNote: String,
        },

        // ── Flags ─────────────────────────────────────────────────────────────
        isTrending: {
            type: Boolean,
            default: false,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },

        // ── Google Integration ────────────────────────────────────────────────
        isFromGoogle: {
            type: Boolean,
            default: false,
        },
        googlePlaceId: {
            type: String,
        },
        source: {
            type: String,
            enum: ['manual', 'google', 'user_generated'],
            default: 'manual',
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedByAdmin: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

// Compound index for common filter combos
placeSchema.index({ category: 1, budget: 1, season: 1 });
placeSchema.index({ isFeatured: 1, isTrending: 1 });
placeSchema.index({ crowdLevel: 1 });

const Place = mongoose.model('Place', placeSchema);
module.exports = Place;
