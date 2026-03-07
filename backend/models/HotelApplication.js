const mongoose = require('mongoose');

const hotelApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Basic Info
    hotelName: { type: String, required: true },
    description: { type: String, required: true },
    tagline: String, // e.g. "Your Home Away From Home"

    // Location
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    pincode: String,
    latitude: Number,
    longitude: Number,
    nearbyPlaces: [{
        place: String,
        distance: String
    }], // which tourist places are nearby
    distanceFromCity: String, // e.g. "2km from city center"

    // Contact
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    website: String,
    whatsappNumber: String,

    // Pricing
    pricePerNight: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    minStayNights: { type: Number, default: 1 },

    // Category & Type
    category: {
        type: String,
        enum: ['budget', 'moderate', 'luxury', '5-star', 'boutique'],
        required: true
    },
    propertyType: {
        type: String,
        enum: ['hotel', 'resort', 'homestay', 'hostel', 'villa', 'guesthouse']
    },
    totalRooms: Number,

    // Room Types
    roomTypes: [{
        type: { type: String }, // Standard, Deluxe, Suite
        price: Number,
        maxOccupancy: Number,
        quantity: Number
    }],

    // Amenities (all boolean)
    amenities: {
        wifi: { type: Boolean, default: false },
        pool: { type: Boolean, default: false },
        gym: { type: Boolean, default: false },
        spa: { type: Boolean, default: false },
        parking: { type: Boolean, default: false },
        restaurant: { type: Boolean, default: false },
        ac: { type: Boolean, default: false },
        roomService: { type: Boolean, default: false },
        laundry: { type: Boolean, default: false },
        bar: { type: Boolean, default: false },
        conferenceRoom: { type: Boolean, default: false },
        airportShuttle: { type: Boolean, default: false },
        petFriendly: { type: Boolean, default: false },
        kidsPlay: { type: Boolean, default: false },
        beachAccess: { type: Boolean, default: false }
    },

    // Images
    mainImage: { type: String, required: true },
    galleryImages: [String], // up to 10 images

    // Check-in/out
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '11:00' },

    // Policies
    cancellationPolicy: {
        type: String,
        enum: ['free_cancellation', 'flexible', '24hr_notice', '48hr_notice', 'non_refundable'],
        default: 'free_cancellation'
    },
    breakfastIncluded: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },
    smokingAllowed: { type: Boolean, default: false },

    // Special features
    highlightFeatures: [String], // e.g. ["Sea View", "Rooftop Pool"]
    languagesSpoken: [String],

    // Status
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'revision_needed'],
        default: 'pending'
    },
    adminNotes: String,
    rejectionReason: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,

    // Which subscription plan the hotel owner bought
    subscribedPlan: {
        type: String,
        enum: ['basic', 'featured', 'premium']
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HotelApplication', hotelApplicationSchema);
