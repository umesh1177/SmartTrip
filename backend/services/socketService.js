const socketio = require('socket.io');
const CabDriver = require('../models/CabDriver');

let io;

const initSocket = (server) => {
    io = socketio(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket Connected: ${socket.id}`);

        // Join personal rooms
        socket.on('join_user', (userId) => {
            socket.join(`user:${userId}`);
            console.log(`User joined: user:${userId}`);
        });

        socket.on('join_driver', (driverId) => {
            socket.join(`driver:${driverId}`);
            console.log(`Driver joined: driver:${driverId}`);
        });

        // Join city room for broadcasts
        socket.on('join_city', (city) => {
            const cityName = city.toLowerCase().replace(/\s+/g, '_');
            socket.join(`city:${cityName}`);
            console.log(`Socket joined city: city:${cityName}`);
        });

        // Track live location from driver app
        socket.on('update_location', async (data) => {
            const { driverId, lat, lng } = data;
            try {
                await CabDriver.findByIdAndUpdate(driverId, {
                    currentLocation: {
                        type: 'Point',
                        coordinates: [lng, lat],
                        updatedAt: new Date()
                    }
                });
                // Broadcast to active ride room if any (future expansion)
                // For now, emit to specific user if ride is active handled in controller
            } catch (error) {
                console.error('Location update error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Socket Disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

// Helper for notifying specific users/drivers
const emitToUser = (userId, event, data) => {
    if (io) io.to(`user:${userId}`).emit(event, data);
};

const emitToDriver = (driverId, event, data) => {
    if (io) io.to(`driver:${driverId}`).emit(event, data);
};

const emitToCity = (city, event, data) => {
    const cityName = city.toLowerCase().replace(/\s+/g, '_');
    if (io) io.to(`city:${cityName}`).emit(event, data);
};

module.exports = { initSocket, getIO, emitToUser, emitToDriver, emitToCity };
