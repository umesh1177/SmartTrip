const express = require('express');
const router = express.Router();
const {
    getMyNotifications,
    markAsRead,
    markAllRead,
    updateNotificationPreferences
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getMyNotifications);
router.put('/read-all', markAllRead);
router.put('/preferences', updateNotificationPreferences);
router.put('/:id/read', markAsRead);

module.exports = router;
