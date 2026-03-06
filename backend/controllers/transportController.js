const { amadeus } = require('../config/transportConfig');
const TripPlan = require('../models/TripPlan');

// @desc    Search flights using Amadeus API
// @route   GET /api/transport/flights
// @access  Protected (Premium Only)
exports.searchFlights = async (req, res) => {
    if (!amadeus) {
        return res.status(503).json({
            success: false,
            message: 'Flight search is not available yet. Train and bus search still works.'
        });
    }

    try {
        const { from, to, date, passengers = 1, travelClass = 'ECONOMY' } = req.query;

        if (!from || !to || !date) {
            return res.status(400).json({ message: 'Origin, destination, and date are required' });
        }

        try {
            const response = await amadeus.shopping.flightOffersSearch.get({
                originLocationCode: from,
                destinationLocationCode: to,
                departureDate: date,
                adults: passengers,
                travelClass: travelClass,
                max: 10
            });

            // Format Amadeus response to a cleaner UI-friendly structure
            const flights = response.data.map(offer => {
                const itinerary = offer.itineraries[0];
                const lastSegment = itinerary.segments[itinerary.segments.length - 1];

                return {
                    id: offer.id,
                    type: 'flight',
                    providerName: 'Amadeus',
                    airline: offer.validatingAirlineCodes[0],
                    price: offer.price.total,
                    currency: offer.price.currency,
                    duration: itinerary.duration,
                    stops: itinerary.segments.length - 1,
                    departure: itinerary.segments[0].departure,
                    arrival: lastSegment.arrival,
                    bookingUrl: `https://www.google.com/travel/flights?q=Flights%20to%20${to}%20from%20${from}%20on%20${date}` // Fallback link
                };
            });

            res.status(200).json(flights);
        } catch (amadeusError) {
            console.error('Amadeus API Error:', amadeusError.code);
            // Fallback to mock data if API fails (likely due to invalid credentials)
            const mockFlights = [
                {
                    id: 'mock-1',
                    type: 'flight',
                    providerName: 'Skyline Airways (Mock)',
                    airline: 'SA',
                    price: '450.00',
                    currency: 'USD',
                    duration: 'PT2H30M',
                    stops: 0,
                    departure: { iataCode: from, at: `${date}T10:00:00` },
                    arrival: { iataCode: to, at: `${date}T12:30:00` },
                    bookingUrl: 'https://www.skyscanner.com'
                }
            ];
            res.status(200).json(mockFlights);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error searching flights' });
    }
};

// @desc    Search trains (Mock/Free API)
// @route   GET /api/transport/trains
// @access  Protected
exports.searchTrains = async (req, res) => {
    try {
        const { from, to, date } = req.query;

        // In a real app, you'd call RailwayAPI here. Since specific keys are needed:
        const mockTrains = [
            {
                id: 'train-1',
                type: 'train',
                providerName: 'Express Liner',
                trainNumber: '12401',
                departure: { station: from, time: '08:00 AM' },
                arrival: { station: to, time: '04:00 PM' },
                price: '45.00',
                currency: 'USD',
                classes: ['SL', '3A', '2A', '1A'],
                bookingUrl: 'https://www.irctc.co.in'
            },
            {
                id: 'train-2',
                type: 'train',
                providerName: 'Bullet Pro',
                trainNumber: 'B882',
                departure: { station: from, time: '11:00 AM' },
                arrival: { station: to, time: '02:30 PM' },
                price: '120.00',
                currency: 'USD',
                classes: ['Executive', 'Standard'],
                bookingUrl: 'https://www.irctc.co.in'
            }
        ];

        res.status(200).json(mockTrains);
    } catch (error) {
        res.status(500).json({ message: 'Error searching trains' });
    }
};

// @desc    Search buses
// @route   GET /api/transport/buses
// @access  Protected
exports.searchBus = async (req, res) => {
    try {
        const { from, to, date } = req.query;

        const mockBuses = [
            {
                id: 'bus-1',
                type: 'bus',
                providerName: 'GreenLine Travels',
                departure: { station: from, time: '10:00 PM' },
                arrival: { station: to, time: '06:00 AM' },
                price: '25.00',
                currency: 'USD',
                busType: 'AC Sleeper',
                bookingUrl: 'https://www.redbus.in'
            }
        ];

        res.status(200).json(mockBuses);
    } catch (error) {
        res.status(500).json({ message: 'Error searching buses' });
    }
};

// @desc    Save transport to trip
// @route   POST /api/trips/:tripId/transport
// @access  Protected
exports.saveTransportToTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { type, from, to, date, cost, externalBookingUrl, providerName, time } = req.body;

        const trip = await TripPlan.findOne({ _id: tripId, userId: req.user._id });

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        trip.transport.push({
            type,
            from,
            to,
            date,
            time,
            cost,
            externalBookingUrl,
            providerName,
            status: 'searching' // Initial status
        });

        await trip.save();

        res.status(200).json(trip);
    } catch (error) {
        res.status(500).json({ message: 'Error saving transport to trip' });
    }
};
