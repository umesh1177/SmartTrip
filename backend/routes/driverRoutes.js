const express = require('express');
const router = express.Router();
const {
    registerAsDriver,
    adminVerifyDriver,
    getDriverEarnings,
    updateDriverLocation,
    getDriverStats,
    driverWithdrawal
} = require('../controllers/driverController');
const { protect } = require('../middleware/auth');
const { isAdmin, isDriver } = require('../middleware/roleMiddleware');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

// Dedicated Multer for documents
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'smarttrip_docs',
        allowed_formats: ['jpg', 'png', 'pdf'],
    }
});
const upload = multer({ storage });
const docUpload = upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'rc', maxCount: 1 },
    { name: 'insurance', maxCount: 1 }
]);

router.post('/register', protect, docUpload, registerAsDriver);
router.put('/verify/:driverId', protect, isAdmin, adminVerifyDriver);
router.get('/earnings', protect, isDriver, getDriverEarnings);
router.put('/location', protect, isDriver, updateDriverLocation);
router.get('/stats', protect, isDriver, getDriverStats);
router.post('/withdrawal', protect, isDriver, driverWithdrawal);

module.exports = router;
