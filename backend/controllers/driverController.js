const CabDriver = require('../models/CabDriver');
const CabRide = require('../models/CabRide');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { cloudinary } = require('../config/cloudinary');

// @desc    Register as a driver
// @route   POST /api/driver/register
exports.registerAsDriver = async (req, res) => {
    try {
        const { vehicleType, vehicleNumber, vehicleModel, vehicleColor } = req.body;

        // Check if already a driver or pending
        const existingDriver = await CabDriver.findOne({ userId: req.user._id });
        if (existingDriver) {
            return res.status(400).json({ message: "You have already applied or are a registered driver." });
        }

        // Documents uploaded via Cloudinary middleware
        const docs = {};
        if (req.files) {
            if (req.files.license) docs.license = req.files.license[0].path;
            if (req.files.rc) docs.rc = req.files.rc[0].path;
            if (req.files.insurance) docs.insurance = req.files.insurance[0].path;
        }

        const driver = await CabDriver.create({
            userId: req.user._id,
            name: req.user.name,
            vehicleType,
            vehicleNumber,
            vehicleModel,
            vehicleColor,
            documents: docs,
            isVerified: false
        });

        res.status(201).json({
            message: "Application received, verification in 24-48 hours",
            driver
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify driver (Admin only)
// @route   PUT /api/driver/verify/:driverId
exports.adminVerifyDriver = async (req, res) => {
    try {
        const { status, remarks } = req.body; // 'approved' or 'rejected'
        const driver = await CabDriver.findById(req.params.driverId);

        if (!driver) return res.status(404).json({ message: "Driver not found" });

        if (status === 'approved') {
            driver.isVerified = true;
            await driver.save();

            // Update user role
            await User.findByIdAndUpdate(driver.userId, { role: 'driver' });

            await Notification.create({
                userId: driver.userId,
                type: 'system',
                title: "Application Approved! 🚕",
                message: "Congratulations! You are now a verified SmartTrip driver. You can go online to start receiving rides."
            });
        } else {
            // Logic for rejection
            await Notification.create({
                userId: driver.userId,
                type: 'system',
                title: "Application Status Update",
                message: `Your driver application was not approved. Reason: ${remarks}. You can resubmit corrected documents.`
            });
        }

        res.json({ message: `Driver status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get driver earnings breakdown
// @route   GET /api/driver/earnings
exports.getDriverEarnings = async (req, res) => {
    try {
        const driver = await CabDriver.findOne({ userId: req.user._id });
        if (!driver) return res.status(404).json({ message: "Driver profile not found" });

        // Calculate periodic earnings from CabRide model
        const rides = await CabRide.find({ driverId: driver._id, status: 'completed' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayEarnings = rides
            .filter(r => r.updatedAt >= today)
            .reduce((sum, r) => sum + (r.fare * 0.85), 0); // 15% commission deduction

        res.json({
            todayEarnings: todayEarnings.toFixed(2),
            totalEarnings: driver.totalEarnings.toFixed(2),
            commissionRate: "15%",
            rides: rides.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update live location
// @route   PUT /api/driver/location
exports.updateDriverLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const driver = await CabDriver.findOneAndUpdate(
            { userId: req.user._id },
            {
                currentLocation: { lat, lng, updatedAt: new Date() },
                isOnline: true
            },
            { new: true }
        );

        res.json({ message: "Location updated", isOnline: driver.isOnline });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get driver operational stats
// @route   GET /api/driver/stats
exports.getDriverStats = async (req, res) => {
    try {
        const driver = await CabDriver.findOne({ userId: req.user._id });
        const rides = await CabRide.find({ driverId: driver._id });

        const stats = {
            totalRides: rides.length,
            completedRides: rides.filter(r => r.status === 'completed').length,
            cancelledRides: rides.filter(r => r.status === 'cancelled').length,
            averageRating: driver.rating || 0,
            totalEarnings: driver.totalEarnings
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request withdrawal
// @route   POST /api/driver/withdrawal
exports.driverWithdrawal = async (req, res) => {
    try {
        const { amount } = req.body;
        const driver = await CabDriver.findOne({ userId: req.user._id });

        if (amount < 10) return res.status(400).json({ message: "Minimum withdrawal is $10" });
        if (driver.totalEarnings < amount) return res.status(400).json({ message: "Insufficient balance" });

        // Process withdrawal (In complex systems, this would trigger a Stripe/Paypal payout)
        driver.totalEarnings -= amount;
        await driver.save();

        res.json({ message: "Withdrawal request submitted. Your funds will be processed soon.", currentBalance: driver.totalEarnings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
