const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, adminSecretKey } = req.body;

        // Allowed roles for self-registration
        const allowedRoles = ['free', 'guide', 'driver'];

        // Admin role requires secret key
        if (role === 'admin') {
            if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid admin secret key'
                });
            }
        }

        // b2b_admin registered only by admin (not self-register)
        if (role === 'b2b_admin') {
            return res.status(403).json({
                success: false,
                message: 'B2B admin accounts are created by admin only'
            });
        }

        // premium role cannot be self-assigned
        if (role === 'premium') {
            return res.status(403).json({
                success: false,
                message: 'Premium access requires subscription'
            });
        }

        const finalRole = allowedRoles.includes(role) ? role :
            role === 'admin' ? 'admin' : 'free';

        // Check if all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: finalRole,
        });

        if (user) {
            res.status(201).json({
                success: true,
                token: generateToken(user._id),
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Check for user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const redirectMap = {
            'admin': '/admin/dashboard',
            'guide': '/guide/dashboard',
            'driver': '/driver/app',
            'free': '/explore',
            'premium': '/explore',
            'b2b_admin': '/b2b/dashboard'
        };

        res.json({
            success: true,
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            redirectTo: redirectMap[user.role] || '/explore'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // req.user is set in the protect middleware
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error while fetching user data' });
    }
};
