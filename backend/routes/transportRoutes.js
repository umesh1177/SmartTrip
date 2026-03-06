const express = require('express');
const router = express.Router();
const {
    searchFlights,
    searchTrains,
    searchBus,
    saveTransportToTrip
} = require('../controllers/transportController');
const { protect, premiumOnly } = require('../middleware/auth');

// Transport search
router.get('/flights', protect, premiumOnly, searchFlights); // Premium only logic here
router.get('/trains', protect, searchTrains);
router.get('/buses', protect, searchBus);

// Save to trip
router.post('/trips/:tripId/transport', protect, saveTransportToTrip);

module.exports = router;
