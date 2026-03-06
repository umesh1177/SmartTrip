const TripPlan = require('../models/TripPlan');
const TripActivity = require('../models/TripActivity');
const { generateNearbySuggestions } = require('../services/endOfTripService');

// @desc    Get pre-generated or on-demand end-of-trip suggestions
// @route   GET /api/trips/:tripId/end-suggestions
exports.getEndOfTripSuggestions = async (req, res) => {
    try {
        const trip = await TripPlan.findById(req.params.tripId).populate('destination');
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        if (trip.endOfTripSuggestions && trip.endOfTripSuggestions.length > 0) {
            return res.json(trip.endOfTripSuggestions);
        }

        // Generate on-demand if missing
        const suggestions = await generateNearbySuggestions(trip, trip.currentLocation || { lat: 0, lng: 0 }, 10);
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a suggestion to the trip plan
// @route   POST /api/trips/:tripId/add-suggestion/:placeId
exports.addSuggestionToTrip = async (req, res) => {
    try {
        const { tripId, placeId } = req.params;
        const trip = await TripPlan.findById(tripId);

        // Log Activity
        await TripActivity.create({
            userId: req.user._id,
            tripPlanId: tripId,
            type: 'check_in',
            title: "Nearby Explored 💎",
            description: `Decided to visit a nearby recommendation.`,
            metadata: { placeId }
        });

        // Extend end date by 4 hours for the new activity
        trip.endDate = new Date(trip.endDate.getTime() + 4 * 60 * 60 * 1000);
        await trip.save();

        res.json({ message: "Suggestion added and trip extended!", newEndDate: trip.endDate });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Report current location for various real-time features
// @route   POST /api/trips/:tripId/location
exports.reportCurrentLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const trip = await TripPlan.findByIdAndUpdate(
            req.params.tripId,
            {
                currentLocation: { lat, lng, updatedAt: new Date() }
            },
            { new: true }
        );

        res.json({ message: "Location updated", currentLocation: trip.currentLocation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
