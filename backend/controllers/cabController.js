const CabRide = require('../models/CabRide');
const CabDriver = require('../models/CabDriver');
const TripPlan = require('../models/TripPlan');
const TripActivity = require('../models/TripActivity');
const { emitToDriver, emitToUser, emitToCity } = require('../services/socketService');

// @desc    Request a new cab ride
// @route   POST /api/cab/request
// @access  Protected
exports.requestCab = async (req, res) => {
    try {
        const { pickupLocation, dropLocation, vehicleType, tripPlanId, distance } = req.body;

        // 1. Calculate fare
        const rates = { auto: 0.5, bike: 0.3, sedan: 1, suv: 1.5 };
        const mins = { auto: 2, bike: 1.5, sedan: 3, suv: 4 };

        const estFare = Math.max(mins[vehicleType], (rates[vehicleType] * distance));

        // 2. Find nearby online drivers (within 5km)
        const drivers = await CabDriver.find({
            isOnline: true,
            vehicleType: vehicleType,
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [pickupLocation.lng, pickupLocation.lat]
                    },
                    $maxDistance: 5000 // 5km
                }
            }
        });

        // 3. Create Ride Record
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const ride = await CabRide.create({
            userId: req.user._id,
            tripPlanId,
            pickupLocation,
            dropLocation,
            vehicleType,
            fare: { estimated: estFare.toFixed(2) },
            distance,
            otp
        });

        if (drivers.length === 0) {
            return res.status(404).json({ message: "No drivers found nearby. Please try again." });
        }

        // 4. Notify drivers
        drivers.forEach(driver => {
            emitToDriver(driver._id, 'new_ride_request', {
                rideId: ride._id,
                pickup: pickupLocation.address,
                drop: dropLocation.address,
                fare: estFare.toFixed(2),
                distance
            });
        });

        // 5. Cleanup timeout (if no one accepts in 2 mins)
        setTimeout(async () => {
            const staleRide = await CabRide.findById(ride._id);
            if (staleRide.status === 'searching') {
                staleRide.status = 'cancelled';
                await staleRide.save();
                emitToUser(req.user._id, 'ride_timeout', { rideId: ride._id });
            }
        }, 120000);

        res.status(201).json(ride);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Driver accepts a ride
// @route   PUT /api/cab/:rideId/accept
// @access  Driver Only
exports.acceptRide = async (req, res) => {
    try {
        const ride = await CabRide.findById(req.params.id);
        if (!ride || ride.status !== 'searching') {
            return res.status(400).json({ message: "Ride unavailable or already accepted." });
        }

        const driver = await CabDriver.findOne({ userId: req.user._id });

        ride.driverId = driver._id;
        ride.status = 'accepted';
        await ride.save();

        // Notify User
        emitToUser(ride.userId, 'ride_accepted', {
            driver: {
                name: driver.name,
                phone: driver.phone,
                photo: driver.profilePhoto,
                rating: driver.rating
            },
            vehicle: {
                model: driver.vehicleModel,
                number: driver.vehicleNumber,
                color: driver.vehicleColor
            },
            otp: ride.otp
        });

        // Notify other drivers in city to clear the request
        emitToCity(driver.city, 'ride_taken', { rideId: ride._id });

        res.json(ride);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Driver arrived at pickup
// @route   PUT /api/cab/:rideId/arrived
// @access  Driver Only
exports.driverArrived = async (req, res) => {
    try {
        const ride = await CabRide.findByIdAndUpdate(req.params.id, { status: 'arrived' }, { new: true });

        // Log Activity
        await TripActivity.create({
            userId: ride.userId,
            tripPlanId: ride.tripPlanId,
            type: 'cab_booked',
            title: 'Cab Arrived',
            description: `Driver for ${ride.vehicleType} has arrived at pickup location.`
        });

        emitToUser(ride.userId, 'driver_arrived', { message: "Your driver has arrived!" });
        res.json(ride);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Start ride with OTP
// @route   PUT /api/cab/:rideId/start
// @access  Driver Only
exports.startRide = async (req, res) => {
    try {
        const { otp } = req.body;
        const ride = await CabRide.findById(req.params.id);

        if (ride.otp !== otp) {
            return res.status(401).json({ message: "Invalid OTP. Start denied." });
        }

        ride.status = 'in_progress';
        ride.startTime = new Date();
        await ride.save();

        emitToUser(ride.userId, 'ride_started', { message: "Ride started. Have a safe trip!" });
        res.json(ride);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    End ride and calculate fare
// @route   PUT /api/cab/:rideId/end
// @access  Driver Only
exports.endRide = async (req, res) => {
    try {
        const ride = await CabRide.findById(req.params.id);
        ride.status = 'completed';
        ride.endTime = new Date();
        ride.fare.final = ride.fare.estimated; // Mocking final same as est for now
        await ride.save();

        // Update Driver Earnings
        await CabDriver.findByIdAndUpdate(ride.driverId, {
            $inc: { totalEarnings: ride.fare.final * 0.85, totalRides: 1 }
        });

        // Update TripPlan Budget
        const trip = await TripPlan.findById(ride.tripPlanId);
        if (trip) {
            trip.budgetTracker.cabs += parseFloat(ride.fare.final);
            trip.cabRides.push(ride._id);
            await trip.save();
        }

        emitToUser(ride.userId, 'ride_ended', { fare: ride.fare.final });
        res.json(ride);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update live location (Real-time Broadcast)
// @route   POST /api/cab/track
// @access  Driver Only
exports.updateLiveLocation = async (req, res) => {
    const { lat, lng, rideId, userId } = req.body;
    // Broadcast to user room directly
    emitToUser(userId, 'driver_location_update', { lat, lng, rideId });
    res.status(200).send();
};

// @desc    Driver Online/Offline
exports.toggleOnline = async (req, res) => {
    const { status } = req.body; // true or false
    await CabDriver.findOneAndUpdate({ userId: req.user._id }, { isOnline: status });
    res.json({ status });
};
