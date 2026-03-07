require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { initSocket } = require('./services/socketService');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
initSocket(server);




// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection - try real MongoDB first, fall back to in-memory
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.warn('Local MongoDB not available, falling back to in-memory database...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            console.log('In-memory MongoDB started successfully (data resets on restart)');
        } catch (memErr) {
            console.error('Failed to start any MongoDB:', memErr);
            process.exit(1);
        }
    }
};
connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
const placeRoutes = require('./routes/placeRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const tripRoutes = require('./routes/tripRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const transportRoutes = require('./routes/transportRoutes');
const guideRoutes = require('./routes/guideRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const nearbyRoutes = require('./routes/nearbyRoutes');
const cabRoutes = require('./routes/cabRoutes');
const publicTransportRoutes = require('./routes/publicTransportRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const activityRoutes = require('./routes/activityRoutes');
const driverRoutes = require('./routes/driverRoutes');
const endOfTripRoutes = require('./routes/endOfTripRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const hotelPartnerRoutes = require('./routes/hotelPartnerRoutes');

const { notificationScheduler, tripCompletionChecker } = require('./services/notificationService');
const { checkEndOfTripOpportunity } = require('./services/endOfTripService');
const cron = require('node-cron');

app.use('/api/auth', authRoutes);

app.use('/api/places', placeRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/nearby', nearbyRoutes);
app.use('/api/cab', cabRoutes);
app.use('/api/transit', publicTransportRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/trips', activityRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/trips', endOfTripRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/hotel-partner', hotelPartnerRoutes);

// Initialize Schedulers
notificationScheduler();
tripCompletionChecker();
cron.schedule('0 */6 * * *', checkEndOfTripOpportunity);

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('SmartTrip API is running...');
    });
}

// Start Server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
