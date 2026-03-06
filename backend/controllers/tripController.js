const TripPlan = require('../models/TripPlan');
const User = require('../models/User');

// @desc    Create new trip plan
// @route   POST /api/trips
// @access  Protected
const createTrip = async (req, res) => {
    try {
        const { title, destinationId, startDate, endDate, notes } = req.body;

        if (!title || !destinationId || !startDate || !endDate) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const trip = await TripPlan.create({
            userId: req.user._id,
            title,
            destination: destinationId,
            startDate,
            endDate,
            notes,
            status: 'planning'
        });

        // Increment usage
        const user = req.user;
        user.tripsPlanned += 1;
        if (user.role === 'free') {
            user.freeTripsUsed += 1;
        } else if (user.role === 'premium') {
            user.premiumTripsUsed += 1;
        }
        await user.save();

        res.status(201).json(trip);
    } catch (error) {
        console.error('Error creating trip:', error);
        res.status(500).json({ message: 'Server error creating trip' });
    }
};

// @desc    Get logged in user's trips
// @route   GET /api/trips
// @access  Protected
const getMyTrips = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const query = { userId: req.user._id, status: { $ne: 'cancelled' } };

        const total = await TripPlan.countDocuments(query);
        const trips = await TripPlan.find(query)
            .populate('destination', 'name image city country')
            .sort({ startDate: 1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: trips.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            data: trips
        });
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).json({ message: 'Server error fetching trips' });
    }
};

// @desc    Get single trip by ID
// @route   GET /api/trips/:id
// @access  Protected
const getTripById = async (req, res) => {
    try {
        const trip = await TripPlan.findOne({ _id: req.params.id, userId: req.user._id })
            .populate('destination', 'name image city country description category')
            .populate('hotel.hotelId', 'name address rating pricePerNight images')
            .populate('guides.guideId', 'name profilePhoto languages rating pricePerDay');

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        res.status(200).json(trip);
    } catch (error) {
        console.error('Error fetching trip details:', error);
        res.status(500).json({ message: 'Server error fetching trip details' });
    }
};

// @desc    Update trip details
// @route   PUT /api/trips/:id
// @access  Protected
const updateTrip = async (req, res) => {
    try {
        let trip = await TripPlan.findOne({ _id: req.params.id, userId: req.user._id });

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Only allow updating specific fields to prevent overwriting base structure carelessly
        const { title, startDate, endDate, notes, status, hotel, transport, guides, totalSpent } = req.body;

        if (title) trip.title = title;
        if (startDate) trip.startDate = startDate;
        if (endDate) trip.endDate = endDate;
        if (notes !== undefined) trip.notes = notes;
        if (status) trip.status = status;
        if (hotel) trip.hotel = hotel;
        if (transport) trip.transport = transport;
        if (guides) trip.guides = guides;
        if (totalSpent !== undefined) trip.totalSpent = totalSpent;

        await trip.save();

        res.status(200).json(trip);
    } catch (error) {
        console.error('Error updating trip:', error);
        res.status(500).json({ message: 'Server error updating trip' });
    }
};

// @desc    Soft delete trip (cancel)
// @route   DELETE /api/trips/:id
// @access  Protected
const deleteTrip = async (req, res) => {
    try {
        const trip = await TripPlan.findOne({ _id: req.params.id, userId: req.user._id });

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Soft delete
        trip.status = 'cancelled';
        await trip.save();

        res.status(200).json({ message: 'Trip cancelled', _id: trip._id });
    } catch (error) {
        console.error('Error deleting trip:', error);
        res.status(500).json({ message: 'Server error deleting trip' });
    }
};

// @desc    Get user's trip statistics
// @route   GET /api/trips/stats
// @access  Protected
const getTripStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const trips = await TripPlan.find({ userId });

        const totalTrips = trips.length;
        const completedTrips = trips.filter(t => t.status === 'completed').length;
        const upcomingTrips = trips.filter(t => t.status === 'confirmed' || t.status === 'planning').length;
        const cancelledTrips = trips.filter(t => t.status === 'cancelled').length;

        // Calculate usage limits
        const role = req.user.role;
        let tripsRemaining = 0;

        if (role === 'free') {
            tripsRemaining = Math.max(0, 1 - req.user.freeTripsUsed);
        } else if (role === 'premium') {
            tripsRemaining = Math.max(0, 5 - req.user.premiumTripsUsed);
        } else {
            tripsRemaining = 'Unlimited';
        }

        res.status(200).json({
            totalTrips,
            upcomingTrips,
            completedTrips,
            cancelledTrips,
            tripsRemaining,
            role
        });
    } catch (error) {
        console.error('Error getting trip stats:', error);
        res.status(500).json({ message: 'Server error calculating stats' });
    }
};

// @desc    Get user's active/upcoming trip
// @route   GET /api/trips/active
// @access  Protected
const getActiveTrip = async (req, res) => {
    try {
        // Find the most recent trip that is either confirmed or planning
        const activeTrip = await TripPlan.findOne({
            userId: req.user._id,
            status: { $in: ['confirmed', 'planning'] }
        })
            .sort({ updatedAt: -1 })
            .populate('destination', 'name image city country');

        if (!activeTrip) {
            return res.status(200).json(null); // No error, just no active trip
        }

        res.status(200).json(activeTrip);
    } catch (error) {
        console.error('Error fetching active trip:', error);
        res.status(500).json({ message: 'Server error fetching active trip' });
    }
};

module.exports = {
    createTrip,
    getMyTrips,
    getActiveTrip,
    getTripById,
    updateTrip,
    deleteTrip,
    getTripStats
};
