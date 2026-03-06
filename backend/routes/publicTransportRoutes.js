const express = require('express');
const router = express.Router();
const {
    getTransitRoutes,
    getNearestTransitStops,
    getMetroMap,
    saveFavoriteRoute
} = require('../controllers/publicTransportController');
const { protect } = require('../middleware/auth');

router.get('/routes', protect, getTransitRoutes);
router.get('/nearby-stops', protect, getNearestTransitStops);
router.get('/metro-map', protect, getMetroMap);
router.post('/save-route/:tripId', protect, saveFavoriteRoute);

module.exports = router;
