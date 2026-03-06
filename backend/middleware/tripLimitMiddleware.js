

const checkTripLimit = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Not authorized, please login' });
        }

        // Role-based limits
        if (user.role === 'free') {
            if (user.freeTripsUsed >= 1) {
                return res.status(403).json({
                    message: "You've used your 1 free trip. Upgrade to Premium to plan more trips.",
                    code: 'LIMIT_REACHED_FREE'
                });
            }
        } else if (user.role === 'premium') {
            if (user.premiumTripsUsed >= 5) {
                return res.status(403).json({
                    message: "You've used all 5 trips in this cycle. Renew your plan to continue.",
                    code: 'LIMIT_REACHED_PREMIUM'
                });
            }
        } else if (user.role !== 'guide' && user.role !== 'b2b_admin') {
            // unknown role fallback
            return res.status(403).json({ message: "Invalid user role for trip planning." });
        }

        // Guides and admins have no limits in this basic setup, or handle as needed
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error verifying limits' });
    }
};

module.exports = { checkTripLimit };
