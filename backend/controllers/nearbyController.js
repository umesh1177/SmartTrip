const Store = require('../models/Store');
const B2BPartner = require('../models/B2BPartner');
const TripPlan = require('../models/TripPlan');
const axios = require('axios');

// @desc    Get nearby stores with priority to partners
// @route   GET /api/nearby
// @access  Protected
exports.getNearbyStores = async (req, res) => {
    try {
        const { lat, lng, radius = 2000, category } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and Longitude are required' });
        }

        // 1. Search OUR PARTNER stores first
        // Using a simple coordinate box for nearby (production would use $near sphere)
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const radiusInDeg = radius / 111000; // Roughly convert meters to degrees

        let query = {
            'coordinates.lat': { $gte: latNum - radiusInDeg, $lte: latNum + radiusInDeg },
            'coordinates.lng': { $gte: lngNum - radiusInDeg, $lte: lngNum + radiusInDeg }
        };

        if (category) query.category = category;

        let partnerStores = await Store.find(query).sort({ isPartner: -1, partnerTier: -1 });

        // 2. Google Places API Fallback
        let googleResults = [];
        if (partnerStores.length < 5 && process.env.GOOGLE_PLACES_API_KEY) {
            try {
                const googleResponse = await axios.get(
                    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${category || 'point_of_interest'}&key=${process.env.GOOGLE_PLACES_API_KEY}`
                );

                googleResults = googleResponse.data.results.map(place => ({
                    _id: `google-${place.place_id}`,
                    name: place.name,
                    address: place.vicinity,
                    rating: place.rating,
                    isPartner: false,
                    source: 'Google Maps',
                    coordinates: {
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng
                    },
                    image: place.photos?.[0]
                        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
                        : null
                }));
            } catch (gError) {
                console.error('Google Places API error:', gError.message);
            }
        }

        // Merge results: partner stores first
        const results = [...partnerStores, ...googleResults];

        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching nearby places' });
    }
};

// @desc    Track store referral clicks
// @route   POST /api/nearby/track-referral/:id
// @access  Protected
exports.trackStoreReferral = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);

        if (store && store.isPartner) {
            // Find the B2B partner associated with this store (by email or phone)
            await B2BPartner.findOneAndUpdate(
                { $or: [{ email: store.contactEmail }, { phone: store.contactPhone }] },
                { $inc: { referrals: 1 } }
            );
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Referral tracking failed' });
    }
};

// @desc    Get curated partner stores for a destination
// @route   GET /api/nearby/destination/:placeId
// @access  Protected
exports.getStoresByDestination = async (req, res) => {
    try {
        const stores = await Store.find({ placeId: req.params.placeId, isPartner: true })
            .sort({ partnerTier: -1, rating: -1 });

        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching destination stores' });
    }
};

// @desc    Save favourite nearby store to trip
// @route   POST /api/trips/:tripId/nearby-store
// @access  Protected
exports.saveStoreToTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { storeId } = req.body;

        if (!storeId.startsWith('google-')) {
            const trip = await TripPlan.findOne({ _id: tripId, userId: req.user._id });
            if (!trip) return res.status(404).json({ message: 'Trip not found' });

            // Add to array if not already there
            if (!trip.nearbyStores.includes(storeId)) {
                trip.nearbyStores.push(storeId);
                await trip.save();
            }
        } else {
            // For Google results, in a real app we might create a shadow Store record
            // For now, return a message that only partners can be saved
            return res.status(400).json({ message: 'Only partner stores can be saved to trip plans currently.' });
        }

        res.status(200).json({ message: 'Store saved to trip' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving store to trip' });
    }
};
