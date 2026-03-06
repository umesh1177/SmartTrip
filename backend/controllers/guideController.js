const Guide = require('../models/Guide');
const User = require('../models/User');
const TripPlan = require('../models/TripPlan');

// @desc    Register as a guide
// @route   POST /api/guides/register
// @access  Protected
exports.registerAsGuide = async (req, res) => {
    try {
        const { bio, languages, specializations, experience, pricePerDay, pricePerHalfDay, city, country, documents } = req.body;

        // Check if already a guide
        const existingGuide = await Guide.findOne({ userId: req.user._id });
        if (existingGuide) {
            return res.status(400).json({ message: 'You are already registered/applied as a guide' });
        }

        const guide = await Guide.create({
            userId: req.user._id,
            name: req.user.name,
            bio,
            languages,
            specializations,
            experience,
            pricePerDay,
            pricePerHalfDay,
            city,
            country,
            documents,
            subscriptionStatus: 'inactive',
            isVerified: false
        });

        // In a real app, send confirmation email here
        res.status(201).json({
            message: 'Application submitted successfully. Pending admin verification.',
            guide
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering as guide' });
    }
};

// @desc    Search guides by place and filters
// @route   GET /api/guides
// @access  Protected
exports.getGuidesByPlace = async (req, res) => {
    try {
        const { city, country, specialization, language, maxPrice } = req.query;

        let query = { isVerified: true };
        if (city) query.city = new RegExp(city, 'i');
        if (country) query.country = new RegExp(country, 'i');
        if (specialization) query.specializations = { $in: [specialization] };
        if (language) query.languages = { $in: [language] };
        if (maxPrice) query.pricePerDay = { $lte: Number(maxPrice) };

        const guides = await Guide.find(query)
            .sort({ rating: -1, pricePerDay: 1 })
            .select('-bankDetails -documents');

        res.status(200).json(guides);
    } catch (error) {
        res.status(500).json({ message: 'Error searching guides' });
    }
};

// @desc    Request a guide for a trip
// @route   POST /api/guides/:guideId/request
// @access  Protected (Premium Only)
exports.requestGuide = async (req, res) => {
    try {
        const { tripId, date, duration } = req.body;
        const { guideId } = req.params;

        if (req.user.role !== 'premium') {
            return res.status(403).json({ message: 'Guide booking is a Premium feature.' });
        }

        const guide = await Guide.findById(guideId);
        if (!guide || !guide.isVerified) {
            return res.status(404).json({ message: 'Guide not found or not verified' });
        }

        // Check availability
        const isBooked = guide.availability.some(
            a => a.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0] && a.isBooked
        );

        if (isBooked) {
            return res.status(400).json({ message: 'Guide is already booked for this date' });
        }

        // In a real app, we would create a separate Booking model. 
        // For this simplified logic, we update the TripPlan and notify the guide.
        const trip = await TripPlan.findOne({ _id: tripId, userId: req.user._id });
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        trip.guides.push({
            guideId: guide._id,
            date,
            duration,
            cost: guide.pricePerDay, // Initial cost estimate
            status: 'pending'
        });

        await trip.save();

        res.status(200).json({ message: 'Request sent to guide', trip });
    } catch (error) {
        res.status(500).json({ message: 'Error requesting guide' });
    }
};

// @desc    Guide accepts a booking
// @route   PUT /api/guides/bookings/:tripId/:guideBookingId/accept
// @access  Guide Role
exports.guideAcceptBooking = async (req, res) => {
    try {
        const { tripId, guideBookingId } = req.params;
        const guide = await Guide.findOne({ userId: req.user._id });

        if (!guide) return res.status(403).json({ message: 'Only guides can accept bookings' });

        const trip = await TripPlan.findById(tripId);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        const booking = trip.guides.id(guideBookingId);
        if (!booking) return res.status(404).json({ message: 'Booking request not found' });

        booking.status = 'confirmed';

        // Mark date as booked in guide availability
        guide.availability.push({ date: booking.date, isBooked: true });

        // Commission Logic: 15% SmartTrip, 85% Guide
        const commission = booking.cost * 0.15;
        const guideShare = booking.cost * 0.85;

        if (!guide.totalEarnings) guide.totalEarnings = 0;
        guide.totalEarnings += guideShare;

        await guide.save();
        await trip.save();

        res.status(200).json({ message: 'Booking confirmed', trip });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting booking' });
    }
};

// @desc    Guide rejects a booking
// @route   PUT /api/guides/bookings/:tripId/:guideBookingId/reject
// @access  Guide Role
exports.guideRejectBooking = async (req, res) => {
    try {
        const { tripId, guideBookingId } = req.params;

        const trip = await TripPlan.findById(tripId);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        const booking = trip.guides.id(guideBookingId);
        if (!booking) return res.status(404).json({ message: 'Booking request not found' });

        booking.status = 'cancelled';
        await trip.save();

        res.status(200).json({ message: 'Booking rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting booking' });
    }
};

// @desc    Get guide's own bookings
// @route   GET /api/guides/my-bookings
// @access  Guide Role
exports.getMyBookings = async (req, res) => {
    try {
        const guide = await Guide.findOne({ userId: req.user._id });
        if (!guide) return res.status(403).json({ message: 'Not a guide' });

        // Search TripPlans where this guideId is present
        const trips = await TripPlan.find({ 'guides.guideId': guide._id })
            .populate('userId', 'name email')
            .populate('destination', 'name');

        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching guide bookings' });
    }
};
