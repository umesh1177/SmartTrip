const express = require('express');
const router = express.Router();
const {
    createTrip,
    getMyTrips,
    getActiveTrip,
    getTripById,
    updateTrip,
    deleteTrip,
    getTripStats
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');
const { checkTripLimit } = require('../middleware/tripLimitMiddleware');

// Base routes
router.route('/')
    .post(protect, checkTripLimit, createTrip) // Enforce hard limits here
    .get(protect, getMyTrips);

router.get('/stats', protect, getTripStats);
router.get('/active', protect, getActiveTrip);

// Parameterized routes
router.route('/:id')
    .get(protect, getTripById)
    .put(protect, updateTrip)
    .delete(protect, deleteTrip);

module.exports = router;
