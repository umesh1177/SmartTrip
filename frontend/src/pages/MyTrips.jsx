import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Calendar,
    MapPin,
    ChevronRight,
    AlertCircle,
    Plus,
    Plane,
    CheckCircle2,
    Clock,
    XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function MyTrips() {
    const { isPremium } = useAuth();
    const [trips, setTrips] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const [tripsRes, statsRes] = await Promise.all([
                axios.get('/api/trips'),
                axios.get('/api/trips/stats')
            ]);
            setTrips(tripsRes.data.data || []);
            setStats(statsRes.data);
        } catch (error) {
            toast.error('Failed to load trips');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const filteredTrips = trips.filter(trip => {
        if (activeTab === 'upcoming') return trip.status === 'planning' || trip.status === 'confirmed';
        if (activeTab === 'completed') return trip.status === 'completed';
        return trip.status === 'cancelled';
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Confirmed</span>;
            case 'planning': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3" /> Planning</span>;
            case 'completed': return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Completed</span>;
            case 'cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelled</span>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header & Stats */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Adventures</h1>
                        <p className="text-gray-500 mt-2">Manage your itineraries and upcoming departures.</p>
                    </div>

                    {stats && (
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6 min-w-[300px]">
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Usage Limit</span>
                                    <span className="text-xs font-black text-blue-600">{stats.tripsRemaining} Left</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-1000"
                                        style={{ width: `${((isPremium ? 5 - stats.tripsRemaining : 1 - stats.tripsRemaining) / (isPremium ? 5 : 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <Link to="/explore" className="bg-gray-900 text-white p-3 rounded-2xl hover:scale-105 transition-all">
                                <Plus className="w-6 h-6" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Status Tabs */}
                <div className="flex gap-4 mb-8">
                    {['upcoming', 'completed', 'cancelled'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Trips Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="bg-white h-72 rounded-3xl border border-gray-100"></div>
                        ))}
                    </div>
                ) : filteredTrips.length === 0 ? (
                    <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Plane className="w-10 h-10 text-blue-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No {activeTab} trips found</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Ready to start planning your next great escape? We have 500+ destinations waiting.</p>
                        <Link to="/explore" className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">Start Exploring</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTrips.map(trip => (
                            <div key={trip._id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 group">
                                <div className="relative h-48">
                                    <img
                                        src={trip.destination?.image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"}
                                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828"; }}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        alt=""
                                    />
                                    <div className="absolute top-4 left-4">
                                        {getStatusBadge(trip.status)}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                                        <Calendar className="w-3.5 h-3.5 mr-1" /> {new Date(trip.startDate).toLocaleDateString()} &bull; {trip.destination?.city}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">{trip.title}</h3>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex items-center text-sm font-bold text-gray-400">
                                            <MapPin className="w-4 h-4 mr-1 text-gray-300" /> {trip.destination?.country}
                                        </div>
                                        <Link to={`/trips/${trip._id}/timeline`} className="flex items-center gap-1 text-sm font-black text-gray-900 group-hover:translate-x-1 transition-transform">
                                            View Details <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
