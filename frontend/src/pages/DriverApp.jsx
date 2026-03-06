import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { Power, MapPin, Navigation, DollarSign, Clock, CheckCircle, X, ShieldCheck, ChevronRight, Phone, MessageSquare, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const DriverApp = () => {
    const { user } = useAuth();
    const { socket, emit } = useSocket();

    const [isOnline, setIsOnline] = useState(false);
    const [activeRide, setActiveRide] = useState(null);
    const [incomingRequest, setIncomingRequest] = useState(null);
    const [earnings, setEarnings] = useState({ today: 0, weekly: 0 });
    const [otp, setOtp] = useState('');
    const [countdown, setCountdown] = useState(30);

    const countdownRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('new_ride_request', (request) => {
            if (isOnline && !activeRide && !incomingRequest) {
                setIncomingRequest(request);
                setCountdown(30);
                startCountdown();
                // Play notification sound
                new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => { });
            }
        });

        socket.on('ride_cancelled', () => {
            setIncomingRequest(null);
            setActiveRide(null);
            toast.error('Ride was cancelled');
            stopCountdown();
        });

        return () => {
            socket.off('new_ride_request');
            socket.off('ride_cancelled');
            stopCountdown();
        };
    }, [socket, isOnline, activeRide, incomingRequest]);

    const startCountdown = () => {
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    handleDecline();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopCountdown = () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
    };

    const toggleStatus = () => {
        const newStatus = !isOnline;
        setIsOnline(newStatus);
        emit(newStatus ? 'driver_online' : 'driver_offline');
        toast(newStatus ? 'You are now online' : 'You are now offline', {
            icon: newStatus ? '✅' : '🔴',
            style: { borderRadius: '20px', fontWeight: 'bold' }
        });
    };

    const handleAccept = () => {
        stopCountdown();
        emit('accept_ride', { rideId: incomingRequest.rideId });
        setActiveRide({ ...incomingRequest, status: 'accepted' });
        setIncomingRequest(null);
        toast.success('Ride Accepted!');
    };

    const handleDecline = () => {
        stopCountdown();
        setIncomingRequest(null);
    };

    const verifyOTP = async () => {
        if (otp.length !== 4) return toast.error('Enter 4-digit OTP');
        try {
            await axios.post(`/api/driver/verify-otp`, { rideId: activeRide.rideId, otp });
            setActiveRide({ ...activeRide, status: 'active' });
            toast.success('Ride Started!');
        } catch (error) {
            toast.error('Incorrect OTP');
        }
    };

    const completeRide = async () => {
        try {
            await axios.post(`/api/driver/complete-ride`, { rideId: activeRide.rideId });
            setActiveRide(null);
            toast.success('Ride Completed!');
            fetchEarnings();
        } catch (error) {
            toast.error('Failed to complete ride');
        }
    };

    const fetchEarnings = async () => {
        const res = await axios.get('/api/driver/earnings');
        setEarnings(res.data);
    };

    useEffect(() => {
        fetchEarnings();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <img src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.name}`} className="w-10 h-10 rounded-full border-2 border-indigo-100" alt="driver" />
                    <div>
                        <h1 className="font-black text-lg leading-tight">{user.name}</h1>
                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck size={12} /> Verified Partner
                        </p>
                    </div>
                </div>
                <button
                    onClick={toggleStatus}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${isOnline ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
                >
                    <Power size={18} /> {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
                </button>
            </header>

            <main className="flex-grow p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8">
                {/* Stats Grid */}
                {!activeRide && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Earnings Today</span>
                            <div className="text-4xl font-black text-gray-900 mt-2">${earnings.today.toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Completed Rides</span>
                            <div className="text-4xl font-black text-indigo-600 mt-2">{earnings.completedCount || 0}</div>
                        </div>
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rating</span>
                            <div className="text-4xl font-black text-yellow-500 mt-2 flex items-center gap-2">
                                4.9 <span className="text-sm font-bold text-gray-300">/ 5.0</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Indicator */}
                {!activeRide && (
                    <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 text-center relative overflow-hidden">
                        <div className={`absolute inset-0 opacity-5 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ${isOnline ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {isOnline ? <MapPin size={48} /> : <Power size={48} />}
                        </div>
                        <h2 className="text-3xl font-black mb-2">{isOnline ? 'Waiting for ride requests...' : 'You are currently offline'}</h2>
                        <p className="text-gray-500 font-medium">{isOnline ? 'Stay on this screen to receive nearby requests' : 'Tap the button at the top to start earning'}</p>
                    </div>
                )}

                {/* Active Ride View */}
                {activeRide && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
                        <div className="bg-indigo-600 text-white p-8 rounded-[40px] shadow-2xl flex justify-between items-center">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Current Trip</span>
                                <h3 className="text-2xl font-black mt-1">Passenger: {activeRide.passengerName}</h3>
                                <div className="flex gap-4 mt-4">
                                    <button className="bg-white/20 p-2 rounded-xl backdrop-blur-md"><Phone size={20} /></button>
                                    <button className="bg-white/20 p-2 rounded-xl backdrop-blur-md"><MessageSquare size={20} /></button>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Ride Total</span>
                                <div className="text-4xl font-black mt-1">${activeRide.fare?.toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                            <div className="space-y-8 mb-8 relative">
                                <div className="absolute left-[9px] top-6 bottom-6 w-0.5 bg-gray-100 border-dashed border-l"></div>
                                <div className="flex gap-4 relative">
                                    <div className="w-5 h-5 rounded-full bg-green-500 border-4 border-white shadow-sm z-10"></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Pickup Location</p>
                                        <p className="text-sm font-bold text-gray-900">{activeRide.pickupAddress}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 relative">
                                    <div className="w-5 h-5 rounded-full bg-red-500 border-4 border-white shadow-sm z-10"></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Drop Destination</p>
                                        <p className="text-sm font-bold text-gray-900">{activeRide.dropAddress}</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-gray-100 text-gray-900 py-4 rounded-2xl font-black flex items-center justify-center gap-2 mb-6">
                                <Navigation size={20} className="text-blue-500" /> OPEN IN GOOGLE MAPS
                            </button>

                            {activeRide.status === 'accepted' ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            maxLength={4}
                                            placeholder="ENTER PASSENGER OTP"
                                            className="w-full bg-gray-50 py-6 rounded-3xl text-center text-3xl font-black tracking-[0.5em] outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                    </div>
                                    <button onClick={verifyOTP} className="w-full bg-green-600 text-white py-5 rounded-3xl font-black text-xl shadow-lg shadow-green-100">START RIDE</button>
                                </div>
                            ) : (
                                <button onClick={completeRide} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-lg shadow-indigo-100">END & COMPLETE RIDE</button>
                            )}
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Incoming Request Popup */}
            <AnimatePresence>
                {incomingRequest && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed inset-x-4 bottom-8 md:inset-x-auto md:right-8 md:w-96 z-50 bg-white rounded-[40px] shadow-3xl border border-gray-100 p-8"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-full font-black mb-2 inline-block">NEW REQUEST</div>
                                <h3 className="text-2xl font-black">Ride Request Incoming</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full border-4 border-indigo-100 flex items-center justify-center font-black text-indigo-600 relative">
                                {countdown}
                                <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                                    <circle cx="24" cy="24" r="21" fill="none" stroke="#4f46e5" strokeWidth="4" strokeDasharray="132" strokeDashoffset={132 - (132 * countdown) / 30} />
                                </svg>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <MapPin size={20} className="text-gray-400" />
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Pickup</p>
                                    <p className="text-sm font-bold truncate">{incomingRequest.pickupAddress}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <DollarSign size={20} className="text-indigo-600" />
                                <div>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase">Estimated Earnings</p>
                                    <p className="text-xl font-black tracking-tight">${(incomingRequest.fare * 0.85).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={handleDecline} className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-3xl font-black hover:bg-gray-100">DECLINE</button>
                            <button onClick={handleAccept} className="flex-[2] bg-green-600 text-white py-4 rounded-3xl font-black shadow-lg shadow-green-100 hover:bg-green-700">ACCEPT</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DriverApp;
