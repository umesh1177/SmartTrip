const axios = require('axios');
const TripPlan = require('../models/TripPlan');

// @desc    Get transit routes using Google Maps Directions API
// @route   GET /api/transit/routes
// @access  Protected
exports.getTransitRoutes = async (req, res) => {
    try {
        const { fromLat, fromLng, toLat, toLng, arrivalTime } = req.query;
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ message: "Google Maps API key not configured." });
        }

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&mode=transit&arrival_time=${arrivalTime || Math.floor(Date.now() / 1000)}&key=${apiKey}`;

        const response = await axios.get(url);

        if (response.data.status !== 'OK') {
            return res.status(400).json({ message: response.data.error_message || "Failed to fetch routes" });
        }

        const routes = response.data.routes.map(route => {
            const leg = route.legs[0];
            return {
                totalDuration: leg.duration.value / 60, // minutes
                totalDistance: leg.distance.value / 1000, // km
                fare: leg.transit_fare ? leg.transit_fare.value : 0,
                steps: leg.steps.map(step => ({
                    type: step.travel_mode.toLowerCase(),
                    instruction: step.html_instructions.replace(/<[^>]*>?/gm, ''),
                    lineNumber: step.transit_details?.line?.short_name || step.transit_details?.line?.name,
                    lineName: step.transit_details?.line?.name,
                    departureStop: step.transit_details?.departure_stop?.name,
                    arrivalStop: step.transit_details?.arrival_stop?.name,
                    duration: step.duration.value / 60,
                    distance: step.distance.value / 1000,
                    polyline: step.polyline.points
                }))
            };
        });

        res.json({ routes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Find nearest transit stops
// @route   GET /api/transit/nearby-stops
// @access  Protected
exports.getNearestTransitStops = async (req, res) => {
    try {
        const { lat, lng, radius = 500 } = req.query;
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=transit_station&key=${apiKey}`;

        const response = await axios.get(url);

        const stops = response.data.results.map(stop => ({
            name: stop.name,
            type: stop.types.filter(t => t.includes('station'))[0] || 'transit_stop',
            lat: stop.geometry.location.lat,
            lng: stop.geometry.location.lng,
            rating: stop.rating,
            vicinity: stop.vicinity
        }));

        res.json({ stops });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get metro map data for specific cities
// @route   GET /api/transit/metro-map
// @access  Protected
exports.getMetroMap = async (req, res) => {
    const { city } = req.query;

    // Static mock data for demo major cities
    const metroMaps = {
        delhi: {
            lines: [
                { name: 'Yellow Line', color: '#FFFF00', stations: ['Samaypur Badli', 'Huda City Centre', 'Rajiv Chowk'] },
                { name: 'Blue Line', color: '#0000FF', stations: ['Dwarka Sec 21', 'Noida Electronic City', 'Vaishali'] }
            ],
            interchanges: ['Rajiv Chowk', 'Kashmere Gate']
        },
        mumbai: {
            lines: [
                { name: 'Line 1', color: '#00A1DE', stations: ['Versova', 'Ghatkopar', 'Andheri'] }
            ]
        },
        nyc: {
            lines: [
                { name: '1 2 3', color: '#EE352E', stations: ['Van Cortlandt Park', 'South Ferry'] }
            ]
        }
    };

    const data = metroMaps[city.toLowerCase()];
    if (!data) {
        return res.status(404).json({ message: "Metro map data not available for this city yet." });
    }

    res.json(data);
};

// @desc    Save transit route to trip plan
// @route   POST /api/trips/:tripId/transit-route
// @access  Protected
exports.saveFavoriteRoute = async (req, res) => {
    try {
        const { route } = req.body;
        const trip = await TripPlan.findById(req.params.tripId);

        if (!trip) return res.status(404).json({ message: "Trip not found" });

        // Add to activities or a specific field
        trip.activities.push({
            type: 'transport_used',
            title: 'Saved Transit Route',
            description: `Route with ${route.steps.length} steps. Total duration: ${route.totalDuration.toFixed(0)} mins.`,
            metadata: { route }
        });

        await trip.save();
        res.status(200).json({ message: "Route saved to trip plan!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
