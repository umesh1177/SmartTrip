module.exports = async (req, res, next) => {
    if (req.user?.role !== 'hotel_partner' && req.user?.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Hotel partner access required'
        });
    }
    next();
};
