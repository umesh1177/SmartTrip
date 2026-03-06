const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Notification = require('../models/Notification');
const TripPlan = require('../models/TripPlan');
const User = require('../models/User');
const { scheduledRecommendations } = require('../controllers/activityController');

// Configure Nodemailer ... (lines 8-32 same)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: `"SmartTrip ✈️" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text
        };
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email Delivery Error:', error);
        return false;
    }
};

// Scheduler: Run every hour
const notificationScheduler = () => {
    cron.schedule('0 * * * *', async () => {
        console.log('Running Smart Scheduler...');

        try {
            const now = new Date();

            // 1. Process Scheduled Notifications
            const pendingNotifications = await Notification.find({
                status: 'pending',
                scheduledAt: { $lte: now }
            }).populate('userId');

            for (const notification of pendingNotifications) {
                if (notification.channel === 'email' && notification.userId.email) {
                    const sent = await sendEmail(
                        notification.userId.email,
                        notification.title,
                        notification.message
                    );
                    notification.status = sent ? 'sent' : 'failed';
                    notification.sentAt = new Date();
                } else {
                    notification.status = 'sent';
                    notification.sentAt = new Date();
                }
                await notification.save();
            }

            // 2. Generate Trip Reminders
            const trips = await TripPlan.find({
                status: 'confirmed',
                startDate: { $gt: now }
            }).populate('userId destination');

            for (const trip of trips) {
                const daysToTrip = Math.ceil((trip.startDate - now) / (1000 * 60 * 60 * 24));
                let title = '', message = '', shouldNotify = false;

                if (daysToTrip === 7) {
                    title = `Your trip to ${trip.destination.name} is in 7 days!`;
                    message = `Pack your bags! Your adventure in ${trip.destination.city} starts in exactly one week.`;
                    shouldNotify = true;
                } else if (daysToTrip === 3) {
                    title = `3 days to go!`;
                    message = `Almost time! Re-check your hotel and transport details for your trip to ${trip.destination.name}.`;
                    shouldNotify = true;
                } else if (daysToTrip === 1) {
                    title = `Tomorrow is the day! ✈️`;
                    message = `Your complete trip summary for ${trip.destination.name} is ready.`;
                    shouldNotify = true;
                }

                if (shouldNotify) {
                    const exists = await Notification.findOne({
                        userId: trip.userId._id,
                        tripId: trip._id,
                        title: title,
                        createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) }
                    });
                    if (!exists) {
                        await Notification.create({
                            userId: trip.userId._id,
                            tripId: trip._id,
                            type: 'reminder',
                            title,
                            message,
                            channel: trip.userId.notificationPreferences?.email ? 'email' : 'in_app'
                        });
                    }
                }
            }

            // 3. Smart Partner Recommendations
            await scheduledRecommendations();

        } catch (error) {
            console.error('Scheduler Error:', error);
        }
    });
};

// Daily Trip Status & Auto-Deactivation Checker
const tripCompletionChecker = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('Running Trip Completion & Deactivation Checker...');
        const now = new Date();

        // Mark as completed
        await TripPlan.updateMany(
            { endDate: { $lt: now }, status: 'confirmed' },
            { $set: { status: 'completed' } }
        );

        // Auto-deactivate active tracking
        await TripPlan.updateMany(
            { endDate: { $lt: now }, isActive: true },
            { $set: { isActive: false } }
        );
    });
};

module.exports = {
    notificationScheduler,
    tripCompletionChecker,
    sendEmail
};
