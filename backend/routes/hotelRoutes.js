const express = require('express');
const router = express.Router();
const {
    getHotelsByPlace,
    getHotelById,
    registerHotel,
    updateHotel,
    getPartnerDashboard
} = require('../controllers/hotelController');
const {
    registerB2BPartner,
    trackReferral
} = require('../controllers/b2bController');
const { protect, premiumOnly } = require('../middleware/auth');

// Hotel Search & Detail (Protected for users)
router.get('/', protect, getHotelsByPlace);
router.get('/:id', protect, getHotelById);

// B2B Partner Routes
router.post('/b2b/register', registerB2BPartner);
router.get('/b2b/dashboard', protect, getPartnerDashboard);
router.post('/b2b/track-referral/:id', protect, trackReferral);

// B2B Admin Hotel Management
router.post('/', protect, registerHotel);
router.put('/:id', protect, updateHotel);

module.exports = router;
