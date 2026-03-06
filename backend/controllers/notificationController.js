const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Protected
exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({
            userId: req.user._id,
            isRead: false
        });

        res.status(200).json({
            success: true,
            unreadCount,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Protected
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Protected
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications' });
    }
};

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Protected
exports.updateNotificationPreferences = async (req, res) => {
    try {
        const { email, push, sms } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.notificationPreferences = {
            email: email !== undefined ? email : user.notificationPreferences.email,
            push: push !== undefined ? push : user.notificationPreferences.push,
            sms: sms !== undefined ? sms : user.notificationPreferences.sms
        };

        await user.save();

        res.status(200).json({
            message: 'Preferences updated',
            preferences: user.notificationPreferences
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating preferences' });
    }
};
