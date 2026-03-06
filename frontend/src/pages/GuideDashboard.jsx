import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    DollarSign,
    Calendar,
    Clock,
    User as UserIcon,
    MapPin,
    Check,
    X,
    Star,
    ShieldCheck,
    TrendingUp,
    Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function GuideDashboard() {
    const { user } = useAuth();
    const [guide, setGuide] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGuideData();
    }, []);

    const fetchGuideData = async () => {
        try {
            setLoading(true);
            const [guideRes, bookingsRes] = await Promise.all([
                axios.get('/api/guides'), // In a real app we'd have /api/guides/me
                axios.get('/api/guides/my-bookings')
            ]);

            // Filter current user from guides list for demo purposes
            const myGuideProfile = guideRes.data.find(g => g.name === user.name) || guideRes.data[0];
            setGuide(myGuideProfile);
            setBookings(bookingsRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleBookingAction = async (tripId, bookingId, action) => {
        try {
            await axios.put(`/api/guides/bookings/${tripId}/${bookingId}/${action}`);
            toast.success(`Booking ${action}ed successfully!`);
            fetchGuideData();
        } catch (error) {
            toast.error(`Failed to ${action} booking`);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 p-12 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Profile Header */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 mb-10">
                    <img src={guide?.profilePhoto || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"} alt="" className="w-32 h-32 rounded-3xl object-cover ring-8 ring-gray-50 shadow-lg" />
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-gray-900">{guide?.name}</h1>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Verified Expert
                            </span>
                        </div>
                        <p className="text-gray-500 mb-4 max-w-2xl">{guide?.bio}</p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {guide?.specializations.map(s => <span key={s} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">{s}</span>)}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[150px]">
                        <button className="w-full py-3 bg-gray-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all">
                            <Settings className="w-4 h-4" /> Edit Profile
                        </button>
                        <button className="w-full py-3 bg-white text-gray-900 border border-gray-200 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                            Availability Settings
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Total Earnings', val: `$${guide?.totalEarnings?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Pending Requests', val: '2', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Total Bookings', val: '14', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Avg Rating', val: guide?.rating || '5.0', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{stat.val}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Booking Requests */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-500" /> New Demands
                            </h2>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">24 Hour Deadline</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {bookings.map(trip => (
                                trip.guides.filter(g => g.status === 'pending').map(booking => (
                                    <div key={booking._id} className="p-6 hover:bg-gray-50 transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><UserIcon className="text-gray-400" /></div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{trip.userId.name}</p>
                                                    <p className="text-xs text-blue-500 font-bold uppercase tracking-tight">{trip.destination?.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-gray-900">${booking.cost}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client Budget</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-xs text-gray-500 font-medium mb-6">
                                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(booking.date).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Full Day (8h)</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleBookingAction(trip._id, booking._id, 'accept')}
                                                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Check className="w-4 h-4" /> Accept Task
                                            </button>
                                            <button
                                                onClick={() => handleBookingAction(trip._id, booking._id, 'reject')}
                                                className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                            >
                                                <X className="w-4 h-4" /> Pass
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ))}
                            {bookings.every(t => !t.guides.some(g => g.status === 'pending')) && (
                                <div className="p-12 text-center text-gray-400 italic text-sm">No pending requests right now.</div>
                            )}
                        </div>
                    </div>

                    {/* Earnings Performance Summary */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                            <TrendingUp className="absolute -right-6 -bottom-6 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-blue-100">
                                <DollarSign className="w-5 h-5" /> SmartPayouts Summary
                            </h3>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-4xl font-black mb-2">${(guide?.totalEarnings || 0).toFixed(2)}</p>
                                    <p className="text-xs font-bold text-blue-100 flex items-center gap-1">
                                        Settlement Cycle: 15th - 30th <Clock className="w-3 h-3" />
                                    </p>
                                </div>
                                <button className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg active:scale-95">Withdraw Rewards</button>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Confirmed Engagements</h3>
                            <div className="space-y-6">
                                {bookings.slice(0, 3).map(trip => (
                                    trip.guides.filter(g => g.status === 'confirmed').map(booking => (
                                        <div key={booking._id} className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600"><Check className="w-6 h-6" /></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900">{trip.userId.name}</p>
                                                <p className="text-xs text-gray-500">{new Date(booking.date).toLocaleDateString()} &bull; {trip.destination?.city}</p>
                                            </div>
                                            <div className="text-right font-black text-gray-900">+${(booking.cost * 0.85).toFixed(2)}</div>
                                        </div>
                                    ))
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
