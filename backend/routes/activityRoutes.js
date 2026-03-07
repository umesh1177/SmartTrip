const express = require('express');
const router = express.Router();
const TripPlan = require('../models/TripPlan');
const {
    getTripTimeline,
    getTripBudget,
    logActivity,
    updateBudgetTracker,
    toggleTripStatus
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.get('/:tripId/timeline', protect, getTripTimeline);
router.post('/:tripId/activity', protect, logActivity);
router.get('/:tripId/budget', protect, getTripBudget);
router.put('/:tripId/budget', protect, updateBudgetTracker);
router.post('/:tripId/activate', protect, (req, res, next) => { req.body.status = true; next(); }, toggleTripStatus);
router.post('/:tripId/deactivate', protect, (req, res, next) => { req.body.status = false; next(); }, toggleTripStatus);

module.exports = router;
