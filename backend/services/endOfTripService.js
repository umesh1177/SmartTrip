const TripPlan = require('../models/TripPlan');
const Place = require('../models/Place');
const Notification = require('../models/Notification');
const { differenceInHours } = require('date-fns');

// Calculation factors
const TRAVEL_SPEED_KMH = 50; // Average travel speed in regional areas

/**
 * Scheduled job to check for trips ending soon with leftovers
 */
const checkEndOfTripOpportunity = async () => {
    try {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Find active trips ending in the next 24 hours
        const endingSoon = await TripPlan.find({
            isActive: true,
            endDate: { $gte: now, $lte: tomorrow },
            'budgetTracker.remaining': { $gt: 0 }
        }).populate('userId destination');

        for (const trip of endingSoon) {
            // Check if user has enough time (at least 6 hours left)
            const hoursLeft = differenceInHours(trip.endDate, now);
            if (hoursLeft < 6) continue;

            // Report: We found an opportunity!
            console.log(`End-of-trip opportunity found for User ${trip.userId.name} in ${trip.destination.city}`);

            // Current location would typically come from an mobile report
            // For the engine, we use the destination as pivot if status isActive
            const origin = trip.currentLocation || { lat: 0, lng: 0 }; // Fallback

            await generateNearbySuggestions(trip, origin, hoursLeft);
        }
    } catch (error) {
        console.error('Opportunity Check Error:', error);
    }
};

/**
 * Logic to find and store nearby gems
 */
const generateNearbySuggestions = async (trip, origin, availableHours) => {
    try {
        const remainingBudget = trip.budgetTracker.remaining;

        // Use MongoDB geospatial to find places within 50-150km
        // Assuming Place model has location field (will add if missing)
        // For now, filtering by city or nearby coordinates

        const suggestions = await Place.find({
            _id: { $nin: trip.activities.map(a => a.placeId).concat([trip.destination._id]) },
            // Simplified filter for demonstration (in production use $nearSphere)
            city: trip.destination.city, // Within same region
            averageRating: { $gte: 4.0 }
        }).limit(5);

        const formattedSuggestions = suggestions.map(place => {
            const distance = 45; // Mock distance in km
            const travelTime = distance / TRAVEL_SPEED_KMH;
            const entryCost = 500; // Mock cost

            return {
                placeId: place._id,
                name: place.name,
                image: place.image,
                distance: `${distance}km`,
                estimatedTravelTime: `${travelTime.toFixed(1)}h`,
                estimatedCost: entryCost,
                recommendationReason: `Only ${distance}km away • Fits your $${remainingBudget.toFixed(0)} budget • Rated ${place.averageRating} ⭐`
            };
        });

        trip.endOfTripSuggestions = formattedSuggestions;
        await trip.save();

        // Notify User
        if (formattedSuggestions.length > 0) {
            await Notification.create({
                userId: trip.userId._id,
                tripId: trip._id,
                type: 'system',
                title: "💎 You have time & budget left!",
                message: `We found ${formattedSuggestions.length} nearby gems for your last day. Check them out!`,
                channel: 'in_app'
            });
        }

        return formattedSuggestions;
    } catch (error) {
        console.error('Suggestion Generation Error:', error);
    }
};

module.exports = {
    checkEndOfTripOpportunity,
    generateNearbySuggestions
};
