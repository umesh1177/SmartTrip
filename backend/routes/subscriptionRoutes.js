const express = require('express');
const router = express.Router();
const {
    createCheckoutSession,
    stripeWebhook,
    getSubscriptionStatus,
    cancelSubscription
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// Note: Stripe Webhook needs the raw body to verify signature.
// This is typically handled at the top level in server.js using express.raw() 
// but we map the route here. It relies on the server NOT parsing JSON for this specific route.
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Protected routes
router.post('/checkout', protect, createCheckoutSession);
router.get('/status', protect, getSubscriptionStatus);
router.post('/cancel', protect, cancelSubscription);

module.exports = router;
