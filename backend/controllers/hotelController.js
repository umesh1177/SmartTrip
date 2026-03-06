const Hotel = require('../models/Hotel');
const B2BPartner = require('../models/B2BPartner');

// @desc    Get hotels for a place with tiered ranking
// @route   GET /api/hotels
// @access  Protected
exports.getHotelsByPlace = async (req, res) => {
    try {
        const { placeId, checkIn, checkOut, guests, budget, amenities } = req.query;

        if (!placeId) {
            return res.status(400).json({ message: 'placeId is required' });
        }

        let query = { placeId, subscriptionStatus: 'active' };

        // Basic filters for everyone
        if (budget) query.category = budget;

        // Advanced filters for Premium users
        if (req.user.role === 'premium' || req.user.role === 'b2b_admin') {
            if (amenities) {
                const amenitiesArray = amenities.split(',');
                query.amenities = { $all: amenitiesArray };
            }
        }

        // Sort logic: 
        // 1. isPartner: true (Partners first)
        // 2. partnerTier: featured > basic
        // 3. rating: desc
        let hotels = await Hotel.find(query)
            .sort({ isPartner: -1, partnerTier: -1, rating: -1 });

        // Tiered Access
        if (req.user.role === 'free') {
            // Limit to 5 and basic info
            hotels = hotels.slice(0, 5).map(hotel => ({
                _id: hotel._id,
                name: hotel.name,
                city: hotel.city,
                image: hotel.images?.[0],
                pricePerNight: hotel.pricePerNight,
                rating: hotel.rating,
                isPartner: hotel.isPartner,
                partnerTier: hotel.partnerTier
            }));
        }

        res.status(200).json(hotels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching hotels' });
    }
};

// @desc    Get single hotel detail
// @route   GET /api/hotels/:id
// @access  Protected
exports.getHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id).populate('placeId', 'name country');

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        res.status(200).json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hotel details' });
    }
};

// @desc    Register a new hotel (B2B)
// @route   POST /api/hotels
// @access  B2B Admin
exports.registerHotel = async (req, res) => {
    try {
        const {
            name, description, images, address, city, country,
            pricePerNight, category, amenities, contactEmail,
            contactPhone, checkInTime, checkOutTime, placeId
        } = req.body;

        const hotel = await Hotel.create({
            name, description, images, address, city, country,
            pricePerNight, category, amenities, contactEmail,
            contactPhone, checkInTime, checkOutTime, placeId,
            subscriptionStatus: 'inactive' // Wait for B2B sub activation
        });

        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error registering hotel' });
    }
};

// @desc    Update hotel info
// @route   PUT /api/hotels/:id
// @access  B2B Admin
exports.updateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
        res.status(200).json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error updating hotel' });
    }
};

// @desc    Get partner dashboard stats
// @route   GET /api/b2b/dashboard
// @access  B2B Admin
exports.getPartnerDashboard = async (req, res) => {
    try {
        const partner = await B2BPartner.findOne({ email: req.user.email });
        if (!partner) return res.status(404).json({ message: 'Partner record not found' });

        // For simplicity, find the hotel(s) associated
        const hotels = await Hotel.find({ contactEmail: req.user.email });

        res.status(200).json({
            partner,
            hotels,
            referrals: partner.referrals,
            status: partner.status
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard' });
    }
};
