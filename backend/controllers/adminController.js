const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Place = require('../models/Place');
const TripPlan = require('../models/TripPlan');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const [usersCount, hotelsCount, placesCount, tripsCount] = await Promise.all([
            User.countDocuments(),
            Hotel.countDocuments(),
            Place.countDocuments(),
            TripPlan.countDocuments(),
        ]);

        const activeHotels = await Hotel.countDocuments({ subscriptionStatus: 'active' });
        const premiumUsers = await User.countDocuments({ role: 'premium' });

        res.json({
            usersCount,
            hotelsCount,
            activeHotels,
            placesCount,
            tripsCount,
            premiumUsers,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort('-createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id
// @access  Admin
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};

// @desc    Get all hotels (admin view - includes inactive)
// @route   GET /api/admin/hotels
// @access  Admin
exports.getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find().populate('placeId', 'name country').sort('-createdAt');
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hotels' });
    }
};

// @desc    Admin adds a hotel for recommendation (auto active + partner)
// @route   POST /api/admin/hotels
// @access  Admin
exports.addHotelForRecommendation = async (req, res) => {
    try {
        const {
            name, description, images, address, city, country,
            pricePerNight, currency, category, amenities, contactEmail,
            contactPhone, checkInTime, checkOutTime, placeId, partnerTier,
            coordinates
        } = req.body;

        if (!name || !description || !address || !city || !country || !pricePerNight || !category || !placeId) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const hotel = await Hotel.create({
            name,
            description,
            images: images || [],
            address,
            city,
            country,
            coordinates,
            pricePerNight,
            currency: currency || 'INR',
            category,
            amenities: amenities || [],
            contactEmail,
            contactPhone,
            checkInTime,
            checkOutTime,
            placeId,
            isPartner: true,
            partnerTier: partnerTier || 'featured',
            subscriptionStatus: 'active', // Admin adds = immediately active for recommendation
        });

        res.status(201).json(hotel);
    } catch (error) {
        console.error('Error adding hotel:', error);
        res.status(500).json({ message: 'Error adding hotel for recommendation', error: error.message });
    }
};

// @desc    Update hotel subscription status / details
// @route   PUT /api/admin/hotels/:id
// @access  Admin
exports.updateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
        res.json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error updating hotel' });
    }
};

// @desc    Delete hotel
// @route   DELETE /api/admin/hotels/:id
// @access  Admin
exports.deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndDelete(req.params.id);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
        res.json({ message: 'Hotel deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting hotel' });
    }
};

// @desc    Toggle hotel subscription status
// @route   PUT /api/admin/hotels/:id/toggle-status
// @access  Admin
exports.toggleHotelStatus = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

        hotel.subscriptionStatus = hotel.subscriptionStatus === 'active' ? 'inactive' : 'active';
        await hotel.save();
        res.json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error toggling hotel status' });
    }
};

// @desc    Get all trip plans (admin view)
// @route   GET /api/admin/trips
// @access  Admin
exports.getAllTripPlans = async (req, res) => {
    try {
        const trips = await TripPlan.find()
            .populate('userId', 'name email role')
            .sort('-createdAt');
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trip plans' });
    }
};

// @desc    Get all places (admin view)
// @route   GET /api/admin/places
// @access  Admin
exports.getAllPlaces = async (req, res) => {
    try {
        const places = await Place.find().sort('-createdAt');
        res.json(places);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching places' });
    }
};
