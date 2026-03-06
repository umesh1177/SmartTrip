const express = require('express');
const router = express.Router();
const {
    getEndOfTripSuggestions,
    addSuggestionToTrip,
    reportCurrentLocation
} = require('../controllers/endOfTripController');
const { protect } = require('../middleware/auth');

router.get('/:tripId/end-suggestions', protect, getEndOfTripSuggestions);
router.post('/:tripId/add-suggestion/:placeId', protect, addSuggestionToTrip);
router.post('/:tripId/location', protect, reportCurrentLocation);

module.exports = router;
