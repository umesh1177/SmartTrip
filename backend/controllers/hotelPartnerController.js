const User = require('../models/User');
const HotelApplication = require('../models/HotelApplication');
const Hotel = require('../models/Hotel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

const MOCK_MODE = process.env.MOCK_PAYMENT === 'true' || process.env.STRIPE_SECRET_KEY === 'your_stripe_secret_key_here';

// ── REGISTER AS HOTEL PARTNER ──
exports.registerAsHotelPartner = async (req, res) => {
    try {
        const { businessName, ownerName, businessPhone,
            businessEmail, city, state, country,
            businessType, gstNumber } = req.body;

        // Update user role to hotel_partner
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                role: 'hotel_partner',
                hotelPartnerInfo: {
                    businessName, ownerName, businessPhone,
                    businessEmail, city, state,
                    country: country || 'India',
                    businessType, gstNumber,
                    subscriptionPlan: 'none',
                    subscriptionStatus: 'inactive'
                }
            },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Registered as hotel partner successfully! Please subscribe to continue.',
            user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── GET PARTNER DASHBOARD DATA ──
exports.getPartnerDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('hotelPartnerInfo.hotelId');

        const application = await HotelApplication.findOne({
            userId: req.user._id
        });

        res.json({
            success: true,
            partnerInfo: user.hotelPartnerInfo,
            application: application || null,
            subscriptionActive:
                user.hotelPartnerInfo?.subscriptionStatus === 'active',
            canSubmitForm:
                user.hotelPartnerInfo?.subscriptionStatus === 'active' &&
                !user.hotelPartnerInfo?.hotelFormSubmitted,
            formSubmitted: user.hotelPartnerInfo?.hotelFormSubmitted,
            hotelApproved: user.hotelPartnerInfo?.hotelApprovedByAdmin
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── CREATE SUBSCRIPTION CHECKOUT ──
exports.createSubscriptionCheckout = async (req, res) => {
    try {
        const { plan } = req.body;

        if (MOCK_MODE) {
            console.log(`[MOCK] Creating mock subscription for user ${req.user._id}, plan: ${plan}`);
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);

            await User.findByIdAndUpdate(req.user._id, {
                'hotelPartnerInfo.subscriptionPlan': plan,
                'hotelPartnerInfo.subscriptionStatus': 'active',
                'hotelPartnerInfo.subscriptionStartDate': new Date(),
                'hotelPartnerInfo.subscriptionEndDate': endDate,
                'hotelPartnerInfo.stripeSubscriptionId': 'sub_mock_' + Date.now()
            });

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.json({
                success: true,
                checkoutUrl: `${frontendUrl}/hotel-partner/dashboard?payment=success&plan=${plan}`,
                mock: true
            });
        }

        // plan: 'basic' | 'featured' | 'premium'

        const planPriceIds = {
            basic: process.env.HOTEL_BASIC_PRICE_ID,
            featured: process.env.HOTEL_FEATURED_PRICE_ID,
            premium: process.env.HOTEL_PREMIUM_PRICE_ID
        };

        if (!planPriceIds[plan] || planPriceIds[plan] === 'price_stripe_id_for_basic') {
            return res.status(400).json({
                success: false,
                message: 'Stripe Price IDs not configured. Please contact administrator.'
            });
        }

        const user = await User.findById(req.user._id);

        // Create or get Stripe customer
        let customerId = user.hotelPartnerInfo?.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.hotelPartnerInfo?.businessName || user.name,
                metadata: { userId: user._id.toString(), plan }
            });
            customerId = customer.id;
            await User.findByIdAndUpdate(req.user._id, {
                'hotelPartnerInfo.stripeCustomerId': customerId
            });
        }


        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{
                price: planPriceIds[plan],
                quantity: 1
            }],
            success_url: `${process.env.FRONTEND_URL}/hotel-partner/dashboard?payment=success&plan=${plan}`,
            cancel_url: `${process.env.FRONTEND_URL}/hotel-partner/dashboard?payment=cancelled`,
            metadata: {
                userId: req.user._id.toString(),
                plan,
                type: 'hotel_partner_subscription'
            }
        });

        res.json({ success: true, checkoutUrl: session.url });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── STRIPE WEBHOOK FOR HOTEL PARTNER ──
exports.handleHotelPartnerWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_HOTEL_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        if (session.metadata?.type === 'hotel_partner_subscription') {
            const userId = session.metadata.userId;
            const plan = session.metadata.plan;

            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);

            await User.findByIdAndUpdate(userId, {
                'hotelPartnerInfo.subscriptionPlan': plan,
                'hotelPartnerInfo.subscriptionStatus': 'active',
                'hotelPartnerInfo.subscriptionStartDate': new Date(),
                'hotelPartnerInfo.subscriptionEndDate': endDate,
                'hotelPartnerInfo.stripeSubscriptionId': session.subscription
            });

            console.log(`Hotel partner ${userId} subscribed to ${plan}`);
        }
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        await User.findOneAndUpdate(
            { 'hotelPartnerInfo.stripeSubscriptionId': subscription.id },
            {
                'hotelPartnerInfo.subscriptionStatus': 'expired',
                'hotelPartnerInfo.subscriptionPlan': 'none'
            }
        );
    }

    res.json({ received: true });
};

// ── SUBMIT HOTEL INFORMATION FORM ──
exports.submitHotelApplication = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Check subscription is active
        if (user.hotelPartnerInfo?.subscriptionStatus !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Active subscription required to submit hotel details'
            });
        }

        // Check if already submitted
        const existing = await HotelApplication.findOne({
            userId: req.user._id
        });

        if (existing && existing.status === 'pending') {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending application'
            });
        }

        // Create hotel application
        const application = await HotelApplication.create({
            userId: req.user._id,
            subscribedPlan: user.hotelPartnerInfo.subscriptionPlan,
            ...req.body
        });

        // Mark form as submitted
        await User.findByIdAndUpdate(req.user._id, {
            'hotelPartnerInfo.hotelFormSubmitted': true,
            'hotelPartnerInfo.hotelFormSubmittedAt': new Date()
        });

        // TODO: Send email notification to admin
        console.log(`New hotel application from ${user.email}`);

        res.status(201).json({
            success: true,
            message: 'Hotel application submitted! Admin will review within 24-48 hours.',
            application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── GET OWN APPLICATION STATUS ──
exports.getApplicationStatus = async (req, res) => {
    try {
        const application = await HotelApplication.findOne({
            userId: req.user._id
        });

        if (!application) {
            return res.json({
                success: true,
                application: null,
                message: 'No application found'
            });
        }

        res.json({ success: true, application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── GET PARTNER ANALYTICS ──
exports.getPartnerAnalytics = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            analytics: {
                totalReferrals: user.hotelPartnerInfo?.totalReferrals || 0,
                totalClicks: user.hotelPartnerInfo?.totalClicks || 0,
                subscriptionPlan: user.hotelPartnerInfo?.subscriptionPlan,
                subscriptionStatus: user.hotelPartnerInfo?.subscriptionStatus,
                subscriptionEndDate: user.hotelPartnerInfo?.subscriptionEndDate,
                hotelApproved: user.hotelPartnerInfo?.hotelApprovedByAdmin,
                daysRemaining: user.hotelPartnerInfo?.subscriptionEndDate ?
                    Math.ceil((new Date(user.hotelPartnerInfo.subscriptionEndDate) -
                        new Date()) / (1000 * 60 * 60 * 24)) : 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
