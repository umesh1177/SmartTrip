const express = require('express');
const router = express.Router();
const {
    getNearbyStores,
    trackStoreReferral,
    getStoresByDestination,
    saveStoreToTrip
} = require('../controllers/nearbyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNearbyStores);
router.get('/destination/:placeId', getStoresByDestination);
router.post('/track-referral/:id', trackStoreReferral);
router.post('/trips/:tripId/nearby-store', saveStoreToTrip);

module.exports = router;
