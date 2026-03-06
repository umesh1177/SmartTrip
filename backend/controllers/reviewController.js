const Review = require('../models/Review');
const Place = require('../models/Place');
const TripPlan = require('../models/TripPlan');
const TripActivity = require('../models/TripActivity');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Filter = require('bad-words');
const mongoose = require('mongoose');

const filter = new Filter();

// @desc    Post a verified review
// @route   POST /api/reviews
exports.postReview = async (req, res) => {
    try {
        const { placeId, tripPlanId, rating, title, body, tags, visitedMonth, visitedYear, travelType } = req.body;

        // 1. VERIFIED VISIT CHECK
        const trip = await TripPlan.findOne({
            _id: tripPlanId,
            userId: req.user._id,
            destination: placeId,
            $or: [{ status: 'completed' }, { startDate: { $lte: new Date() } }]
        });

        if (!trip) {
            return res.status(403).json({ message: "You can only review places you've visited as part of a confirmed trip." });
        }

        // 2. Check for existing review
        const existingReview = await Review.findOne({ userId: req.user._id, placeId, tripPlanId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this place for this trip." });
        }

        // 3. Moderation
        const sanitizedBody = filter.clean(body);
        const sanitizedTitle = title ? filter.clean(title) : '';

        // 4. Photos (Cloudinary)
        const photoUrls = req.files ? req.files.map(file => file.path) : [];

        const review = await Review.create({
            userId: req.user._id,
            placeId,
            tripPlanId,
            rating,
            title: sanitizedTitle,
            body: sanitizedBody,
            photos: photoUrls,
            tags,
            visitedMonth,
            visitedYear,
            travelType,
            isVerified: true,
            status: 'approved'
        });

        // 5. Update Place Aggregate
        const allReviews = await Review.find({ placeId, status: 'approved' });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await Place.findByIdAndUpdate(placeId, {
            averageRating: avgRating.toFixed(1),
            totalReviews: allReviews.length,
            $push: {
                recentPhotos: { $each: photoUrls, $slice: -20 }
            }
        });

        // 6. Log Activity
        await TripActivity.create({
            userId: req.user._id,
            tripPlanId,
            type: 'review_posted',
            title: `Reviewed ${trip.title || 'Destination'}`,
            description: `Gave a ${rating}-star rating: "${sanitizedTitle}"`
        });

        // 7. Award Badge
        const reviewCount = await Review.countDocuments({ userId: req.user._id });
        if (reviewCount === 1) {
            await User.findByIdAndUpdate(req.user._id, {
                $addToSet: { badges: { name: "Verified Reviewer ✅" } }
            });
        }

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a place
exports.getPlaceReviews = async (req, res) => {
    try {
        const { sort = 'recent', travelType, rating, page = 1, limit = 10 } = req.query;
        let query = { placeId: req.params.placeId, status: 'approved' };
        if (travelType) query.travelType = travelType;
        if (rating) query.rating = rating;

        let sortBy = { createdAt: -1 };
        if (sort === 'highest') sortBy = { rating: -1 };
        if (sort === 'helpful') sortBy = { helpfulVotes: -1 };

        const reviews = await Review.find(query)
            .populate('userId', 'name profilePhoto')
            .sort(sortBy)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Vote review as helpful
exports.voteHelpful = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, { $inc: { helpfulVotes: 1 } }, { new: true });
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get real-time crowd and info
exports.getPlaceRealTimeInfo = async (req, res) => {
    try {
        const activeVisitors = await TripPlan.countDocuments({
            destination: req.params.id,
            isActive: true
        });

        const ratingBreakdown = await Review.aggregate([
            { $match: { placeId: new mongoose.Types.ObjectId(req.params.id), status: 'approved' } },
            { $group: { _id: "$rating", count: { $sum: 1 } } }
        ]);

        res.json({ activeVisitors, ratingBreakdown });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Moderate review
exports.moderateReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
