const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const B2BPartner = require('../models/B2BPartner');
const Hotel = require('../models/Hotel');
const Store = require('../models/Store');

// @desc    Register a B2B Partner and start checkout
// @route   POST /api/b2b/register
// @access  Public
exports.registerB2BPartner = async (req, res) => {
    const { businessName, ownerName, email, phone, businessType, subscriptionPlan, billingCycle } = req.body;

    try {
        // Check if partner already exists
        let partner = await B2BPartner.findOne({ email });
        if (partner) {
            return res.status(400).json({ message: 'Business with this email already registered' });
        }

        // Determine cost based on type and plan
        let cost = 0;
        if (businessType === 'hotel') {
            cost = subscriptionPlan === 'featured' ? 99 : 49;
        } else if (businessType === 'store') {
            cost = subscriptionPlan === 'featured' ? 59 : 29;
        } else {
            cost = 39; // default
        }

        if (billingCycle === 'yearly') cost *= 10; // 2 months free

        partner = await B2BPartner.create({
            businessName, ownerName, email, phone, businessType,
            subscriptionPlan, subscriptionCost: cost, billingCycle,
            status: 'pending'
        });

        // Create Stripe checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `SmartTrip B2B - ${businessName} (${subscriptionPlan})` },
                    unit_amount: cost * 100,
                    recurring: { interval: billingCycle === 'yearly' ? 'year' : 'month' },
                },
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/b2b/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/b2b/cancel`,
            client_reference_id: partner._id.toString(),
            customer_email: email,
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'B2B Registration failed' });
    }
};

// @desc    B2B Stripe Webhook
// @route   POST /api/b2b/webhook
// @access  Public
exports.b2bStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_B2B_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const partnerId = session.client_reference_id;

        const partner = await B2BPartner.findById(partnerId);
        if (partner) {
            partner.status = 'active';
            partner.stripeCustomerId = session.customer;
            partner.stripeSubscriptionId = session.subscription;
            await partner.save();

            // Activate sub-entities (Hotels/Stores)
            if (partner.businessType === 'hotel') {
                await Hotel.updateMany({ contactEmail: partner.email }, {
                    subscriptionStatus: 'active',
                    isPartner: true,
                    partnerTier: partner.subscriptionPlan
                });
            } else if (partner.businessType === 'store') {
                await Store.updateMany({ contactPhone: partner.phone }, { // using phone as second key if email varies
                    isPartner: true,
                    partnerTier: partner.subscriptionPlan
                });
            }
        }
    }

    res.json({ received: true });
};

// @desc    Track referral clicks
// @route   POST /api/b2b/track-referral/:id
// @access  Protected
exports.trackReferral = async (req, res) => {
    try {
        const { type } = req.body; // 'hotel' or 'store'
        let entity;

        if (type === 'hotel') {
            entity = await Hotel.findById(req.params.id);
        } else {
            entity = await Store.findById(req.params.id);
        }

        if (entity && entity.isPartner) {
            await B2BPartner.findOneAndUpdate(
                { email: entity.contactEmail || entity.contactPhone },
                { $inc: { referrals: 1 } }
            );
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Referral tracking failed' });
    }
};
