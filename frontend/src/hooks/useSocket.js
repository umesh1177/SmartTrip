import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useCab } from '../context/CabContext';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
    const { token, user } = useAuth();
    const { rideState, updateRideState } = useCab();
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket']
        });

        socketRef.current.on('connect', () => {
            console.log('Connected to socket server');
            // Join user-specific room
            socketRef.current.emit('join', `user:${user._id}`);
        });

        socketRef.current.on('ride_accepted', (data) => {
            updateRideState({
                status: 'accepted',
                driver: data.driver,
                rideId: data.rideId,
                otp: data.otp,
                fare: data.fare
            });
            toast.success('Driver found! Your ride is confirmed.');
        });

        socketRef.current.on('driver_location_update', (location) => {
            if (rideState.driver) {
                updateRideState({
                    driver: { ...rideState.driver, currentLocation: location }
                });
            }
        });

        socketRef.current.on('driver_arrived', () => {
            toast('Your driver has arrived at the pickup location!', { icon: '🚕' });
        });

        socketRef.current.on('ride_started', () => {
            updateRideState({ status: 'active' });
            toast.success('Ride started. Have a safe trip!');
        });

        socketRef.current.on('ride_completed', (data) => {
            updateRideState({ status: 'completed', finalFare: data.fare });
            toast.success('You have reached your destination.');
        });

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [token, user?._id]);

    const emit = (event, data) => {
        if (socketRef.current) {
            socketRef.current.emit(event, data);
        }
    };

    return { socket: socketRef.current, emit };
};
