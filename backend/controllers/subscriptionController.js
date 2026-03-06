const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// @desc    Create Stripe checkout session
// @route   POST /api/subscription/checkout
// @access  Protected
exports.createCheckoutSession = async (req, res) => {
    const { plan } = req.body;
    const userId = req.user._id;

    let priceId;
    if (plan === 'monthly') {
        priceId = 'price_H5ggY9H18456as'; // Placeholder
    } else if (plan === 'yearly') {
        priceId = 'price_H5ggY9H18456bs'; // Placeholder
    } else {
        return res.status(400).json({ message: 'Invalid plan' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/payment-success?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
            client_reference_id: userId.toString(),
            customer_email: req.user.email,
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Stripe session creation failed' });
    }
};

// @desc    Stripe Webhook
// @route   POST /api/subscription/webhook
// @access  Public
exports.stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    let subscription;
    let dbSub;

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const userId = session.client_reference_id;
            const stripeSubscriptionId = session.subscription;
            const stripeCustomerId = session.customer;

            if (userId && stripeSubscriptionId) {
                subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
                const plan = subscription.plan.interval === 'year' ? 'yearly' : 'monthly';

                await User.findByIdAndUpdate(userId, { role: 'premium' });

                await Subscription.create({
                    userId,
                    plan,
                    stripeCustomerId,
                    stripeSubscriptionId,
                    status: subscription.status,
                    startDate: new Date(subscription.current_period_start * 1000),
                    endDate: new Date(subscription.current_period_end * 1000),
                });

                console.log(`Checkout session completed for user: ${userId}`);
            }
            break;

        case 'customer.subscription.updated':
            subscription = event.data.object;
            dbSub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
            if (dbSub) {
                dbSub.status = subscription.status;
                dbSub.endDate = new Date(subscription.current_period_end * 1000);
                await dbSub.save();

                if (subscription.status === 'active') {
                    const subUser = await User.findById(dbSub.userId);
                    if (subUser) {
                        subUser.premiumTripsUsed = 0;
                        subUser.role = 'premium';
                        await subUser.save();
                    }
                }
            }
            break;

        case 'customer.subscription.deleted':
            subscription = event.data.object;
            dbSub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
            if (dbSub) {
                dbSub.status = subscription.status;
                dbSub.endDate = new Date(subscription.current_period_end * 1000);
                await dbSub.save();

                if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
                    await User.findByIdAndUpdate(dbSub.userId, { role: 'free' });
                }
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

// @desc    Get subscription status
// @route   GET /api/subscription/status
// @access  Protected
exports.getSubscriptionStatus = async (req, res) => {
    try {
        const sub = await Subscription.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

        if (!sub) {
            return res.status(200).json({ active: false });
        }

        res.status(200).json({
            active: sub.status === 'active' || sub.status === 'trialing',
            plan: sub.plan,
            endDate: sub.endDate,
            status: sub.status,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subscription status' });
    }
};

// @desc    Cancel subscription
// @route   POST /api/subscription/cancel
// @access  Protected
exports.cancelSubscription = async (req, res) => {
    try {
        const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' });

        if (!sub) {
            return res.status(404).json({ message: 'No active subscription found' });
        }

        // Cancel at period end
        await stripe.subscriptions.update(sub.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });

        res.status(200).json({ message: 'Subscription will be canceled at the end of the period' });
    } catch (error) {
        res.status(500).json({ message: 'Error canceling subscription' });
    }
};
