exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin role required." });
    }
};

exports.isDriver = (req, res, next) => {
    if (req.user && req.user.role === 'driver') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Driver role required." });
    }
};

exports.isGuide = (req, res, next) => {
    if (req.user && req.user.role === 'guide') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Guide role required." });
    }
};

exports.isB2BAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'b2b_admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. B2B Admin role required." });
    }
};
