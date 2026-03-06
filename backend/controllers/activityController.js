const TripActivity = require('../models/TripActivity');
const TripPlan = require('../models/TripPlan');
const Notification = require('../models/Notification');
const Store = require('../models/Store');
const { differenceInDays, format, startOfDay } = require('date-fns');

// @desc    Get activity timeline for a trip (Grouped by Day)
// @route   GET /api/trips/:tripId/timeline
exports.getTripTimeline = async (req, res) => {
    try {
        const trip = await TripPlan.findById(req.params.tripId);
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        const activities = await TripActivity.find({ tripPlanId: req.params.tripId }).sort('createdAt');

        // Group by day
        const grouped = activities.reduce((acc, activity) => {
            const dayNum = differenceInDays(startOfDay(activity.createdAt), startOfDay(trip.startDate)) + 1;
            const dayKey = `Day ${dayNum >= 1 ? dayNum : 0}`;

            if (!acc[dayKey]) acc[dayKey] = [];
            acc[dayKey].push({
                id: activity._id,
                time: format(activity.createdAt, 'hh:mm a'),
                type: activity.type,
                title: activity.title,
                description: activity.description,
                location: activity.location,
                metadata: activity.metadata
            });
            return acc;
        }, {});

        res.json(grouped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Log a trip activity (Manual or Internal)
// @route   POST /api/trips/:tripId/activity
exports.logActivity = async (req, res) => {
    try {
        const { type, title, description, location, metadata } = req.body;
        const tripId = req.params.tripId;

        const activity = await TripActivity.create({
            userId: req.user._id,
            tripPlanId: tripId,
            type,
            title,
            description,
            location,
            metadata
        });

        await TripPlan.findByIdAndUpdate(tripId, {
            $push: { activities: activity._id }
        });

        res.status(201).json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update budget tracker and handle alerts
// @route   PUT /api/trips/:tripId/budget
exports.updateBudgetTracker = async (req, res) => {
    try {
        const { category, amount } = req.body;
        const trip = await TripPlan.findById(req.params.tripId);

        if (!trip) return res.status(404).json({ message: "Trip not found" });

        if (trip.budgetTracker[category] !== undefined) {
            trip.budgetTracker[category] += parseFloat(amount);
        }

        const totalSpent = Object.keys(trip.budgetTracker.toObject())
            .filter(k => k !== 'total' && k !== 'remaining' && typeof trip.budgetTracker[k] === 'number')
            .reduce((sum, key) => sum + trip.budgetTracker[key], 0);

        trip.budgetTracker.remaining = trip.budgetTracker.total - totalSpent;
        const remainingPercent = (trip.budgetTracker.remaining / trip.budgetTracker.total) * 100;

        await trip.save();

        if (remainingPercent < 10) {
            await Notification.create({
                userId: trip.userId,
                tripId: trip._id,
                type: 'system',
                title: "🚨 Budget Critical!",
                message: `URGENT: You have less than 10% ($${trip.budgetTracker.remaining.toFixed(2)}) of your budget remaining.`,
                channel: 'in_app'
            });
        } else if (remainingPercent < 20) {
            await Notification.create({
                userId: trip.userId,
                tripId: trip._id,
                type: 'system',
                title: "⚠️ Budget Warning",
                message: `You've used 80% of your budget. $${trip.budgetTracker.remaining.toFixed(2)} remaining.`,
                channel: 'in_app'
            });
        }

        res.json(trip.budgetTracker);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Scheduled Partner Recommendations
exports.scheduledRecommendations = async () => {
    try {
        const activeTrips = await TripPlan.find({ isActive: true }).populate('userId destination');
        const hour = new Date().getHours();

        let category = '';
        let recommendationType = '';

        if (hour >= 7 && hour < 10) { category = 'cafe'; recommendationType = 'Breakfast Spot'; }
        else if (hour >= 12 && hour < 14) { category = 'restaurant'; recommendationType = 'Lunch Recommendation'; }
        else if (hour >= 17 && hour < 20) { category = 'shopping'; recommendationType = 'Evening Shopping'; }
        else if (hour >= 20 && hour < 22) { category = 'activity'; recommendationType = 'Nightlife/Experience'; }

        if (!category) return;

        for (const trip of activeTrips) {
            const stores = await Store.find({
                city: trip.destination.city,
                category: category,
                isPartner: true
            }).sort({ partnerTier: -1 }).limit(1);

            if (stores.length > 0) {
                const store = stores[0];
                await Notification.create({
                    userId: trip.userId._id,
                    tripId: trip._id,
                    type: 'system',
                    title: `✨ Top Pick for your ${recommendationType}`,
                    message: `We recommend visiting ${store.name} in ${trip.destination.city}!`,
                    metadata: { storeId: store._id }
                });

                await TripActivity.create({
                    userId: trip.userId._id,
                    tripPlanId: trip._id,
                    type: 'partner_recommendation',
                    title: recommendationType,
                    description: `Recommended ${store.name} based on current time.`,
                    metadata: { storeId: store._id, storeName: store.name }
                });
            }
        }
    } catch (error) {
        console.error('Scheduled Recommendation Error:', error);
    }
};

// @desc    Activate/Deactivate Trip Tracking
exports.toggleTripStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const trip = await TripPlan.findByIdAndUpdate(req.params.tripId, { isActive: status }, { new: true });
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        await TripActivity.create({
            userId: req.user._id,
            tripPlanId: trip._id,
            type: status ? 'check_in' : 'place_visited',
            title: status ? "Trip Activated" : "Trip Deactivated",
            description: status ? `You have started your journey to ${trip.title}!` : `You have ended your journey.`
        });
        res.json({ isActive: trip.isActive });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
