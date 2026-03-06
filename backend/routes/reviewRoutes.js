const express = require('express');
const router = express.Router();
const { postReview, getPlaceReviews, voteHelpful } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, postReview);
router.get('/place/:placeId', getPlaceReviews);
router.put('/:id/helpful', protect, voteHelpful);

module.exports = router;
