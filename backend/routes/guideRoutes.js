const express = require('express');
const router = express.Router();
const {
    registerAsGuide,
    getGuidesByPlace,
    requestGuide,
    guideAcceptBooking,
    guideRejectBooking,
    getMyBookings
} = require('../controllers/guideController');
const { protect, premiumOnly } = require('../middleware/auth');

// Public/Member search
router.get('/', protect, getGuidesByPlace);
router.post('/register', protect, registerAsGuide);

// Booking (Premium)
router.post('/:guideId/request', protect, premiumOnly, requestGuide);

// Guide Actions
router.put('/bookings/:tripId/:guideBookingId/accept', protect, guideAcceptBooking);
router.put('/bookings/:tripId/:guideBookingId/reject', protect, guideRejectBooking);
router.get('/my-bookings', protect, getMyBookings);

module.exports = router;
