const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const isHotelPartner = require('../middleware/hotelPartnerMiddleware');
const ctrl = require('../controllers/hotelPartnerController');

// Public webhook (raw body needed)
// Note: This must be handled carefully in server.js to use express.raw() only for this route
router.post('/webhook',
    express.raw({ type: 'application/json' }),
    ctrl.handleHotelPartnerWebhook
);

// Protected routes
router.post('/register', protect, ctrl.registerAsHotelPartner);
router.get('/dashboard', protect, isHotelPartner, ctrl.getPartnerDashboard);
router.post('/subscribe', protect, isHotelPartner, ctrl.createSubscriptionCheckout);
router.post('/apply', protect, isHotelPartner, ctrl.submitHotelApplication);
router.get('/application', protect, isHotelPartner, ctrl.getApplicationStatus);
router.get('/analytics', protect, isHotelPartner, ctrl.getPartnerAnalytics);

module.exports = router;
