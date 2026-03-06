const express = require('express');
const router = express.Router();
const {
    createOrder,
    verifyPayment,
    getSubscriptionStatus,
    getPaymentHistory
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// All payment routes require authentication
router.use(protect);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/status', getSubscriptionStatus);
router.get('/history', getPaymentHistory);

module.exports = router;
