const express = require('express');
const router = express.Router();
const {
    getTripTimeline,
    logActivity,
    updateBudgetTracker,
    toggleTripStatus
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.get('/:tripId/timeline', protect, getTripTimeline);
router.post('/:tripId/activity', protect, logActivity);
router.get('/:tripId/budget', protect, async (req, res) => {
    const trip = await TripPlan.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip.budgetTracker);
});
router.put('/:tripId/budget', protect, updateBudgetTracker);
router.post('/:tripId/activate', protect, (req, res, next) => { req.body.status = true; next(); }, toggleTripStatus);
router.post('/:tripId/deactivate', protect, (req, res, next) => { req.body.status = false; next(); }, toggleTripStatus);

module.exports = router;
