const User = require('../models/User');
const Place = require('../models/Place');
const TripPlan = require('../models/TripPlan');
const Hotel = require('../models/Hotel');
const Guide = require('../models/Guide');
const CabDriver = require('../models/CabDriver');
const Review = require('../models/Review');
const Subscription = require('../models/Subscription');
const HotelApplication = require('../models/HotelApplication');

// ── DASHBOARD STATS ──
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers, premiumUsers, freeUsers,
            totalPlaces, totalTrips, activeTrips,
            completedTrips, cancelledTrips,
            totalHotels, partnerHotels,
            totalGuides, verifiedGuides, pendingGuides,
            totalDrivers, verifiedDrivers, pendingDrivers,
            totalReviews, totalRevenue,
            totalPendingApplications
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'premium' }),
            User.countDocuments({ role: 'free' }),
            Place.countDocuments(),
            TripPlan.countDocuments(),
            TripPlan.countDocuments({ status: 'confirmed', isActive: true }),
            TripPlan.countDocuments({ status: 'completed' }),
            TripPlan.countDocuments({ status: 'cancelled' }),
            Hotel.countDocuments(),
            Hotel.countDocuments({ isPartner: true }),
            Guide.countDocuments(),
            Guide.countDocuments({ isVerified: true }),
            Guide.countDocuments({ isVerified: false }),
            CabDriver.countDocuments(),
            CabDriver.countDocuments({ isVerified: true }),
            CabDriver.countDocuments({ isVerified: false }),
            Review.countDocuments(),
            Subscription.aggregate([{
                $group: { _id: null, total: { $sum: '$amount' } }
            }]),
            HotelApplication.countDocuments({ status: 'pending' })
        ]);

        // Recent signups (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsersThisWeek = await User.countDocuments({
            createdAt: { $gte: weekAgo }
        });

        // Monthly revenue chart data (last 6 months)
        const revenueChart = await Subscription.aggregate([
            { $match: { createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        res.json({
            success: true,
            stats: {
                users: {
                    total: totalUsers, premium: premiumUsers,
                    free: freeUsers, newThisWeek: newUsersThisWeek
                },
                places: { total: totalPlaces },
                trips: {
                    total: totalTrips, active: activeTrips,
                    completed: completedTrips, cancelled: cancelledTrips
                },
                hotels: { total: totalHotels, partners: partnerHotels },
                guides: {
                    total: totalGuides, verified: verifiedGuides,
                    pending: pendingGuides
                },
                drivers: {
                    total: totalDrivers, verified: verifiedDrivers,
                    pending: pendingDrivers
                },
                reviews: { total: totalReviews },
                revenue: { total: totalRevenue[0]?.total || 0, chart: revenueChart },
                applications: { pending: totalPendingApplications }
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
};

// ── USER MANAGEMENT ──
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (search) filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];

        const users = await User.find(filter)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(filter);

        res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id, { role }, { new: true }
        ).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating user role' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting user' });
    }
};

exports.banUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBanned: true, bannedReason: req.body.reason },
            { new: true }
        );
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error banning user' });
    }
};

// ── HOTEL MANAGEMENT (B2B) ──
exports.addHotel = async (req, res) => {
    try {
        const { city, state, country, images, name } = req.body;

        // Find or create a Place for this city to link the hotel
        let place = await Place.findOne({
            $or: [
                { city: { $regex: new RegExp(`^${city}$`, 'i') } },
                { name: { $regex: new RegExp(`^${city}$`, 'i') } }
            ]
        });

        if (!place) {
            place = await Place.create({
                name: city,
                city: city,
                state: state,
                country: country,
                description: `Experience the beauty of ${city}, ${state}.`,
                image: images?.[0] || "https://images.unsplash.com/photo-1444723121867-7a241cacace9",
                category: 'city',
                budget: 'moderate',
                season: 'all-season',
                duration: 'weekend',
                climate: 'tropical',
                bestFor: 'family',
                addedByAdmin: true
            });
        }

        const hotel = await Hotel.create({
            ...req.body,
            placeId: place._id,
            isPartner: true,
            subscriptionStatus: 'active',
            addedByAdmin: true,
            addedBy: req.user.id
        });
        res.status(201).json({ success: true, hotel });
    } catch (error) {
        console.error('Add hotel error:', error);
        res.status(500).json({ success: false, message: error.message || 'Error adding hotel' });
    }
};

exports.getAllHotels = async (req, res) => {
    try {
        const { page = 1, limit = 20, isPartner, city } = req.query;
        const filter = {};
        if (isPartner !== undefined) filter.isPartner = isPartner === 'true';
        if (city) filter.city = { $regex: city, $options: 'i' };

        const hotels = await Hotel.find(filter)
            .populate('addedBy', 'name _id')
            .sort({ isPartner: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Hotel.countDocuments(filter);
        res.json({ success: true, hotels, total });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching hotels' });
    }
};

exports.updateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        );
        res.json({ success: true, hotel });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating hotel' });
    }
};

exports.deleteHotel = async (req, res) => {
    try {
        await Hotel.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Hotel deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting hotel' });
    }
};

exports.toggleHotelPartner = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        hotel.isPartner = !hotel.isPartner;
        hotel.partnerTier = req.body.tier || hotel.partnerTier;
        await hotel.save();
        res.json({ success: true, hotel });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error toggling partner status' });
    }
};

// ── PLACE MANAGEMENT ──
exports.getAllPlacesAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const filter = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const places = await Place.find(filter)
            .populate('addedBy', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Place.countDocuments(filter);
        res.json({ success: true, places, total });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching places' });
    }
};

exports.addPlace = async (req, res) => {
    try {
        const place = await Place.create({
            ...req.body,
            addedByAdmin: true,
            addedBy: req.user.id
        });
        res.status(201).json({ success: true, place });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding place' });
    }
};

exports.updatePlace = async (req, res) => {
    try {
        const place = await Place.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        );
        res.json({ success: true, place });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating place' });
    }
};

exports.deletePlace = async (req, res) => {
    try {
        await Place.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Place deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting place' });
    }
};

exports.toggleFeatured = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        place.isFeatured = !place.isFeatured;
        await place.save();
        res.json({ success: true, place });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error toggling featured status' });
    }
};

exports.toggleTrending = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        place.isTrending = !place.isTrending;
        await place.save();
        res.json({ success: true, place });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error toggling trending status' });
    }
};

// ── TRIP MANAGEMENT ──
exports.getAllTrips = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const filter = status ? { status } : {};

        const trips = await TripPlan.find(filter)
            .populate('userId', 'name email')
            .populate('destination', 'name city country image')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await TripPlan.countDocuments(filter);
        res.json({ success: true, trips, total });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching trips' });
    }
};

// ── GUIDE MANAGEMENT ──
exports.getAllGuides = async (req, res) => {
    try {
        const guides = await Guide.find()
            .populate('userId', 'name email')
            .sort({ isVerified: 1, createdAt: -1 });
        res.json({ success: true, guides });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching guides' });
    }
};

exports.verifyGuide = async (req, res) => {
    try {
        const guide = await Guide.findByIdAndUpdate(
            req.params.id,
            { isVerified: true, verifiedAt: new Date() },
            { new: true }
        );
        await User.findByIdAndUpdate(guide.userId, { role: 'guide' });
        res.json({ success: true, guide });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error verifying guide' });
    }
};

exports.rejectGuide = async (req, res) => {
    try {
        await Guide.findByIdAndUpdate(req.params.id, {
            isVerified: false,
            rejectionReason: req.body.reason
        });
        res.json({ success: true, message: 'Guide rejected' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error rejecting guide' });
    }
};

// ── DRIVER MANAGEMENT ──
exports.getAllDrivers = async (req, res) => {
    try {
        const drivers = await CabDriver.find()
            .populate('userId', 'name email')
            .sort({ isVerified: 1, createdAt: -1 });
        res.json({ success: true, drivers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching drivers' });
    }
};

exports.verifyDriver = async (req, res) => {
    try {
        const driver = await CabDriver.findByIdAndUpdate(
            req.params.id,
            { isVerified: true, verifiedAt: new Date() },
            { new: true }
        );
        await User.findByIdAndUpdate(driver.userId, { role: 'driver' });
        res.json({ success: true, driver });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error verifying driver' });
    }
};

exports.rejectDriver = async (req, res) => {
    try {
        await CabDriver.findByIdAndUpdate(req.params.id, {
            isVerified: false,
            rejectionReason: req.body.reason
        });
        res.json({ success: true, message: 'Driver application rejected' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error rejecting driver' });
    }
};

// ── REVIEW MANAGEMENT ──
exports.getAllReviews = async (req, res) => {
    try {
        const { status = 'pending' } = req.query;
        const reviews = await Review.find({ status })
            .populate('userId', 'name email')
            .populate('placeId', 'name city')
            .sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching reviews' });
    }
};

exports.approveReview = async (req, res) => {
    try {
        await Review.findByIdAndUpdate(req.params.id, { status: 'approved' });
        res.json({ success: true, message: 'Review approved' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error approving review' });
    }
};

exports.rejectReview = async (req, res) => {
    try {
        await Review.findByIdAndUpdate(req.params.id, {
            status: 'rejected',
            rejectionReason: req.body.reason
        });
        res.json({ success: true, message: 'Review rejected' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error rejecting review' });
    }
};

// ── REVENUE / SUBSCRIPTIONS ──
exports.getRevenueStats = async (req, res) => {
    try {
        const subscriptions = await Subscription.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(50);

        const monthlyRevenue = await Subscription.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        res.json({ success: true, subscriptions, monthlyRevenue });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching revenue stats' });
    }
};

// ── HOTEL APPLICATION MANAGEMENT ──

// Get all hotel applications
exports.getHotelApplications = async (req, res) => {
    try {
        const { status = 'pending' } = req.query;
        const applications = await HotelApplication.find({ status })
            .populate('userId', 'name email hotelPartnerInfo')
            .sort({ createdAt: -1 });
        res.json({ success: true, applications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching applications' });
    }
};

// Approve hotel application → auto-create Hotel document
exports.approveHotelApplication = async (req, res) => {
    try {
        const application = await HotelApplication.findById(req.params.id)
            .populate('userId');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Create or find a Place for this city to link the hotel
        let place = await Place.findOne({
            $or: [
                { city: { $regex: new RegExp(`^${application.city}$`, 'i') } },
                { name: { $regex: new RegExp(`^${application.city}$`, 'i') } }
            ]
        });

        if (!place) {
            // Ensure we have a valid HTTP URL for the Place image
            const isValidUrl = /^https?:\/\//.test(application.mainImage);
            const fallbackImage = "https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=2070&auto=format&fit=crop";

            // Create a placeholder city destination if no matching place exists
            place = await Place.create({
                name: application.city,
                city: application.city,
                state: application.state,
                country: application.country,
                description: `Experience the beauty of ${application.city}, ${application.state}.`,
                image: isValidUrl ? application.mainImage : fallbackImage,
                category: 'city',
                budget: 'moderate',
                season: 'all-season',
                duration: 'weekend',
                climate: 'tropical',
                bestFor: 'family',
                addedByAdmin: true
            });
            console.log(`Auto-created new city destination Place: ${application.city}`);
        }

        // Create Hotel document from application data
        const hotel = await Hotel.create({
            name: application.hotelName,
            description: application.description,
            images: [application.mainImage, ...application.galleryImages],
            address: application.address,
            city: application.city,
            state: application.state,
            country: application.country,
            coordinates: {
                lat: application.latitude,
                lng: application.longitude
            },
            pricePerNight: application.pricePerNight,
            currency: application.currency,
            category: application.category,
            amenities: Object.keys(application.amenities)
                .filter(k => application.amenities[k]),
            checkInTime: application.checkInTime,
            checkOutTime: application.checkOutTime,
            contactEmail: application.contactEmail,
            contactPhone: application.contactPhone,
            isPartner: true,
            partnerTier: application.subscribedPlan,
            subscriptionStatus: 'active',
            partnerId: application.userId._id,
            placeId: place._id  // FIXED: Linked to the place
        });

        // Update application status
        await HotelApplication.findByIdAndUpdate(req.params.id, {
            status: 'approved',
            reviewedBy: req.user._id,
            reviewedAt: new Date()
        });

        // Update user record
        await User.findByIdAndUpdate(application.userId._id, {
            'hotelPartnerInfo.hotelApprovedByAdmin': true,
            'hotelPartnerInfo.hotelId': hotel._id
        });

        res.json({
            success: true,
            message: 'Hotel approved and added to platform!',
            hotel
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reject hotel application
exports.rejectHotelApplication = async (req, res) => {
    try {
        await HotelApplication.findByIdAndUpdate(req.params.id, {
            status: 'rejected',
            rejectionReason: req.body.reason,
            reviewedBy: req.user._id,
            reviewedAt: new Date()
        });

        // Reset hotel form submitted flag so they can resubmit
        const application = await HotelApplication.findById(req.params.id);
        await User.findByIdAndUpdate(application.userId, {
            'hotelPartnerInfo.hotelFormSubmitted': false
        });

        res.json({ success: true, message: 'Application rejected' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Request revision
exports.requestRevision = async (req, res) => {
    try {
        await HotelApplication.findByIdAndUpdate(req.params.id, {
            status: 'revision_needed',
            adminNotes: req.body.notes,
            reviewedBy: req.user._id
        });
        res.json({ success: true, message: 'Revision requested' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
