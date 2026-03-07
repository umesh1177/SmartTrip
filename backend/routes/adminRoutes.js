const router = require('express').Router();
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/adminMiddleware');
const admin = require('../controllers/adminController');

// All routes protected + admin only
router.use(protect, isAdmin);

// Dashboard
router.get('/stats', admin.getDashboardStats);
router.get('/revenue', admin.getRevenueStats);

// Users
router.get('/users', admin.getAllUsers);
router.put('/users/:id/role', admin.updateUserRole);
router.put('/users/:id/ban', admin.banUser);
router.delete('/users/:id', admin.deleteUser);

// Hotels
router.get('/hotels', admin.getAllHotels);
router.post('/hotels', admin.addHotel);
router.put('/hotels/:id', admin.updateHotel);
router.delete('/hotels/:id', admin.deleteHotel);
router.put('/hotels/:id/toggle-partner', admin.toggleHotelPartner);

// Hotel Applications
router.get('/hotel-applications', admin.getHotelApplications);
router.put('/hotel-applications/:id/approve', admin.approveHotelApplication);
router.put('/hotel-applications/:id/reject', admin.rejectHotelApplication);
router.put('/hotel-applications/:id/revision', admin.requestRevision);

// Places
router.get('/places', admin.getAllPlacesAdmin);
router.post('/places', admin.addPlace);
router.put('/places/:id', admin.updatePlace);
router.delete('/places/:id', admin.deletePlace);
router.put('/places/:id/featured', admin.toggleFeatured);
router.put('/places/:id/trending', admin.toggleTrending);

// Trips
router.get('/trips', admin.getAllTrips);

// Guides
router.get('/guides', admin.getAllGuides);
router.put('/guides/:id/verify', admin.verifyGuide);
router.put('/guides/:id/reject', admin.rejectGuide);

// Drivers
router.get('/drivers', admin.getAllDrivers);
router.put('/drivers/:id/verify', admin.verifyDriver);
router.put('/drivers/:id/reject', admin.rejectDriver);

// Reviews
router.get('/reviews', admin.getAllReviews);
router.put('/reviews/:id/approve', admin.approveReview);
router.put('/reviews/:id/reject', admin.rejectReview);

module.exports = router;
