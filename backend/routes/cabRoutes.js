const express = require('express');
const router = express.Router();
const {
    requestCab,
    acceptRide,
    driverArrived,
    startRide,
    endRide,
    toggleOnline,
    updateLiveLocation
} = require('../controllers/cabController');
const { protect } = require('../middleware/auth');
const { isDriver } = require('../middleware/roleMiddleware');

router.post('/request', protect, requestCab);
router.post('/track', protect, isDriver, updateLiveLocation);
router.post('/online', protect, isDriver, (req, res) => { req.body.status = true; toggleOnline(req, res); });
router.post('/offline', protect, isDriver, (req, res) => { req.body.status = false; toggleOnline(req, res); });

router.put('/:id/accept', protect, isDriver, acceptRide);
router.put('/:id/arrived', protect, isDriver, driverArrived);
router.put('/:id/start', protect, isDriver, startRide);
router.put('/:id/end', protect, isDriver, endRide);

module.exports = router;
