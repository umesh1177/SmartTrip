import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Map, Heart, Zap, CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
    const { updateProfile } = useAuth();
    const [verifying, setVerifying] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user arrived here from Stripe
        const query = new URLSearchParams(location.search);
        if (!query.get('success')) {
            navigate('/');
            return;
        }

        // Verify status dynamically to update auth context immediately without refetching token
        const fetchStatus = async () => {
            try {
                const res = await axios.get('/api/subscription/status');
                if (res.data.active) {
                    // Force update local role state to reflect premium access immediately
                    updateProfile({ role: 'premium' });
                }
            } catch (error) {
                console.error("Error verifying final status: ", error);
            } finally {
                setVerifying(false);
            }
        };

        // Delay slightly to give Stripe webhook time to fire and database to write globally
        const timer = setTimeout(() => {
            fetchStatus();
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (verifying) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-gray-900 animate-pulse">Securing your premium status...</h2>
                <p className="text-gray-500 mt-2">Waiting for confirmation from Stripe.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            {/* Basic responsive Confetti effect via CSS */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-60 flex justify-center">
                <div className="w-full max-w-7xl h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse"></div>
            </div>

            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-gray-100 animate-fade-in-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 py-12 px-8 text-center text-white relative">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-400/20 border-4 border-white">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Payment Successful!</h1>
                        <p className="text-xl text-indigo-200 font-medium">Welcome to SmartTrip Premium 🎉</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your account has been upgraded</h2>
                        <p className="text-gray-600">You now have unlimited access to our entire mathematical travel catalog and all smart filters.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 shrink-0">
                                <Map className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">500+ Destinations</h3>
                                <p className="text-sm text-gray-500">Every corner of the earth unlocked.</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-4 shrink-0">
                                <Sparkles className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Advanced Filters</h3>
                                <p className="text-sm text-gray-500">Filter by climate, duration, and activities.</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start">
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-4 shrink-0">
                                <Heart className="w-5 h-5 text-pink-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Unlimited Saves</h3>
                                <p className="text-sm text-gray-500">Build as many bucket lists as you want.</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4 shrink-0">
                                <Zap className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Priority Status</h3>
                                <p className="text-sm text-gray-500">Faster support & early feature access.</p>
                            </div>
                        </div>
                    </div>

                    <Link
                        to="/explore"
                        className="block w-full text-center py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                        Start Exploring Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
