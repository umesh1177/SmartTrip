const express = require('express');
const router = express.Router();
const {
    getAllPlaces,
    loadMorePlaces,
    searchPlaces,
    getSinglePlace,
    saveFavouritePlace,
    getSavedPlaces,
    removeSavedPlace,
} = require('../controllers/placeController');
const { protect, optionalProtect, premiumOnly } = require('../middleware/auth');

// ── Public (tiered by role) ──────────────────────────────────────────────────
router.get('/', optionalProtect, getAllPlaces);

// ── Premium pagination ────────────────────────────────────────────────────────
// Must be BEFORE /:id so "load-more" is not treated as an ID param
router.get('/load-more', protect, premiumOnly, loadMorePlaces);

// ── Dedicated search (logged-in only) ────────────────────────────────────────
router.get('/search', protect, searchPlaces);

// ── Protected routes ──────────────────────────────────────────────────────────
router.get('/saved', protect, getSavedPlaces);       // before /:id
router.get('/:id', protect, getSinglePlace);
router.post('/save/:id', protect, saveFavouritePlace);
router.delete('/save/:id', protect, removeSavedPlace);

module.exports = router;
