const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// PLAN PRICING (in paise - Indian currency smallest unit)
const PLANS = {
    monthly: {
        amount: 82900,      // ₹829/month (approx $9.99)
        duration: 30,       // days
        currency: 'INR',
        description: 'SmartTrip Premium Monthly Plan'
    },
    yearly: {
        amount: 665900,     // ₹6659/year (approx $79.99, save 33%)
        duration: 365,
        currency: 'INR',
        description: 'SmartTrip Premium Yearly Plan (Save 33%)'
    }
};

// STEP 1: Create Razorpay Order
exports.createOrder = async (req, res) => {
    try {
        const { plan } = req.body;
        const userId = req.user._id;

        if (!PLANS[plan]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan selected. Choose monthly or yearly.'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const selectedPlan = PLANS[plan];

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: selectedPlan.amount,
            currency: selectedPlan.currency,
            receipt: `rcpt_${Date.now()}`,
            notes: {
                userId: userId.toString(),
                plan: plan,
                userEmail: user.email,
                userName: user.name
            }
        });

        // Save status 'created' to DB for tracking intent
        await Subscription.create({
            userId: userId,
            plan: plan,
            amount: selectedPlan.amount / 100, // store in rupees
            currency: selectedPlan.currency,
            razorpayOrderId: order.id,
            status: 'created'
        });

        console.log(`Razorpay order created for user ${userId}: ${order.id}`);

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                plan: plan,
                planDetails: selectedPlan
            },
            key: process.env.RAZORPAY_KEY_ID,
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message
        });
    }
};

// STEP 2: Verify Payment After User Pays
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan
        } = req.body;

        const userId = req.user._id;

        // IMPORTANT: Verify signature to prevent fraud
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (!isSignatureValid) {
            // Update subscription status to failed
            await Subscription.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { status: 'failed' }
            );

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed. Invalid signature.'
            });
        }

        // Payment is verified! Now upgrade user
        const planDuration = plan === 'yearly' ? 365 : 30;
        const premiumExpiresAt = new Date();
        premiumExpiresAt.setDate(premiumExpiresAt.getDate() + planDuration);

        // Update subscription record
        await Subscription.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: 'paid',
                startDate: new Date(),
                endDate: premiumExpiresAt
            }
        );

        // Upgrade user role to premium
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                role: 'premium',
                premiumExpiresAt: premiumExpiresAt,
                premiumTripsUsed: 0  // reset trip count on upgrade
            },
            { new: true }
        ).select('-password');

        console.log(`User ${userId} upgraded to premium until ${premiumExpiresAt}`);

        res.json({
            success: true,
            message: 'Payment successful! Welcome to SmartTrip Premium!',
            user: updatedUser,
            subscription: {
                plan: plan,
                startDate: new Date(),
                endDate: premiumExpiresAt,
                paymentId: razorpay_payment_id
            }
        });

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
};

// STEP 3: Get Current Subscription Status
exports.getSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId)
            .select('role premiumExpiresAt premiumTripsUsed freeTripsUsed');

        const subscription = await Subscription.findOne({
            userId: userId,
            status: 'paid'
        }).sort({ createdAt: -1 });

        const isActive = user.role === 'premium' &&
            user.premiumExpiresAt > new Date();

        const daysRemaining = isActive ?
            Math.ceil((user.premiumExpiresAt - new Date()) / (1000 * 60 * 60 * 24))
            : 0;

        res.json({
            success: true,
            data: {
                role: user.role,
                isPremium: isActive,
                premiumExpiresAt: user.premiumExpiresAt,
                daysRemaining: daysRemaining,
                premiumTripsUsed: user.premiumTripsUsed || 0,
                freeTripsUsed: user.freeTripsUsed || 0,
                lastSubscription: subscription || null
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// STEP 4: Get Payment History
exports.getPaymentHistory = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            history: subscriptions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
