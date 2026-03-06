const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllHotels,
    addHotelForRecommendation,
    updateHotel,
    deleteHotel,
    toggleHotelStatus,
    getAllTripPlans,
    getAllPlaces,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication AND admin role
router.use(protect, adminOnly);

// Stats
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

// Hotels
router.get('/hotels', getAllHotels);
router.post('/hotels', addHotelForRecommendation);
router.put('/hotels/:id', updateHotel);
router.delete('/hotels/:id', deleteHotel);
router.put('/hotels/:id/toggle-status', toggleHotelStatus);

// Trips
router.get('/trips', getAllTripPlans);

// Places
router.get('/places', getAllPlaces);

module.exports = router;
