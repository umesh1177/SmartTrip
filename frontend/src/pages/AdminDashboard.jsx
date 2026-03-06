import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Hotel, Users, Map, TrendingUp, CheckCircle2,
    XCircle, PlusCircle, Trash2, ToggleLeft, ToggleRight, LogOut,
    Edit3, Star, RefreshCw, ChevronDown, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'trips', label: 'Trip Plans', icon: Map },
];

const roleColorMap = {
    admin: 'bg-red-100 text-red-700 border-red-200',
    premium: 'bg-amber-100 text-amber-700 border-amber-200',
    free: 'bg-gray-100 text-gray-600 border-gray-200',
    guide: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    b2b_admin: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function AdminDashboard() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [hotels, setHotels] = useState([]);
    const [users, setUsers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddHotel, setShowAddHotel] = useState(false);
    const [hotelForm, setHotelForm] = useState({
        name: '', description: '', address: '', city: '', country: '',
        pricePerNight: '', currency: 'INR', category: 'moderate',
        amenities: '', contactEmail: '', contactPhone: '',
        checkInTime: '12:00', checkOutTime: '11:00',
        placeId: '', partnerTier: 'featured', images: '',
    });

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchStats();
        fetchPlaces();
    }, [user]);

    useEffect(() => {
        if (activeTab === 'hotels') fetchHotels();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'trips') fetchTrips();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/admin/stats', authHeaders);
            setStats(res.data);
        } catch (e) { toast.error('Failed to load stats'); }
    };

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/hotels', authHeaders);
            setHotels(res.data);
        } catch (e) { toast.error('Failed to load hotels'); }
        setLoading(false);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/users', authHeaders);
            setUsers(res.data);
        } catch (e) { toast.error('Failed to load users'); }
        setLoading(false);
    };

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/trips', authHeaders);
            setTrips(res.data);
        } catch (e) { toast.error('Failed to load trips'); }
        setLoading(false);
    };

    const fetchPlaces = async () => {
        try {
            const res = await axios.get('/api/admin/places', authHeaders);
            setPlaces(res.data);
        } catch (e) { }
    };

    const handleAddHotel = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...hotelForm,
                pricePerNight: Number(hotelForm.pricePerNight),
                amenities: hotelForm.amenities.split(',').map(a => a.trim()).filter(Boolean),
                images: hotelForm.images.split(',').map(i => i.trim()).filter(Boolean),
            };
            await axios.post('/api/admin/hotels', payload, authHeaders);
            toast.success('Hotel added for recommendation!');
            setShowAddHotel(false);
            setHotelForm({ name: '', description: '', address: '', city: '', country: '', pricePerNight: '', currency: 'INR', category: 'moderate', amenities: '', contactEmail: '', contactPhone: '', checkInTime: '12:00', checkOutTime: '11:00', placeId: '', partnerTier: 'featured', images: '' });
            fetchHotels();
            fetchStats();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to add hotel'); }
    };

    const toggleHotelStatus = async (id) => {
        try {
            await axios.put(`/api/admin/hotels/${id}/toggle-status`, {}, authHeaders);
            toast.success('Hotel status updated!');
            fetchHotels();
        } catch (e) { toast.error('Failed to update hotel status'); }
    };

    const deleteHotel = async (id) => {
        if (!window.confirm('Delete this hotel?')) return;
        try {
            await axios.delete(`/api/admin/hotels/${id}`, authHeaders);
            toast.success('Hotel deleted');
            fetchHotels();
            fetchStats();
        } catch (e) { toast.error('Failed to delete hotel'); }
    };

    const updateUserRole = async (userId, role) => {
        try {
            await axios.put(`/api/admin/users/${userId}`, { role }, authHeaders);
            toast.success('User role updated!');
            fetchUsers();
        } catch (e) { toast.error('Failed to update user role'); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await axios.delete(`/api/admin/users/${id}`, authHeaders);
            toast.success('User deleted');
            fetchUsers();
            fetchStats();
        } catch (e) { toast.error('Failed to delete user'); }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-slate-900 border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-0.5">SmartTrip Control Panel</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full text-sm font-bold border border-red-500/30">
                            <Star className="w-3.5 h-3.5 fill-red-400" /> Admin
                        </div>
                        <span className="text-gray-400 text-sm">{user?.name}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                                    }`}
                            >
                                <Icon className="w-4 h-4" /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                            {[
                                { label: 'Total Users', value: stats?.usersCount, color: 'from-blue-600 to-blue-700', icon: '👥' },
                                { label: 'Premium Users', value: stats?.premiumUsers, color: 'from-amber-500 to-orange-600', icon: '⭐' },
                                { label: 'Total Hotels', value: stats?.hotelsCount, color: 'from-emerald-600 to-teal-700', icon: '🏨' },
                                { label: 'Active Hotels', value: stats?.activeHotels, color: 'from-green-600 to-emerald-700', icon: '✅' },
                                { label: 'Places', value: stats?.placesCount, color: 'from-violet-600 to-purple-700', icon: '📍' },
                                { label: 'Trip Plans', value: stats?.tripsCount, color: 'from-rose-600 to-pink-700', icon: '🗺️' },
                            ].map((item) => (
                                <motion.div
                                    key={item.label}
                                    whileHover={{ scale: 1.03 }}
                                    className={`bg-gradient-to-br ${item.color} p-4 rounded-2xl shadow-lg`}
                                >
                                    <div className="text-2xl mb-1">{item.icon}</div>
                                    <div className="text-2xl font-black text-white">
                                        {stats ? item.value ?? 0 : <RefreshCw className="w-4 h-4 animate-spin" />}
                                    </div>
                                    <div className="text-white/80 text-xs font-medium mt-1">{item.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-400" /> Quick Actions
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { label: 'Manage Hotels', onClick: () => setActiveTab('hotels'), icon: '🏨', color: 'bg-emerald-600 hover:bg-emerald-500' },
                                    { label: 'Manage Users', onClick: () => setActiveTab('users'), icon: '👥', color: 'bg-blue-600 hover:bg-blue-500' },
                                    { label: 'View Trip Plans', onClick: () => setActiveTab('trips'), icon: '🗺️', color: 'bg-violet-600 hover:bg-violet-500' },
                                ].map((action) => (
                                    <button
                                        key={action.label}
                                        onClick={action.onClick}
                                        className={`${action.color} text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2`}
                                    >
                                        {action.icon} {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Hotels Tab */}
                {activeTab === 'hotels' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-white font-bold text-xl">Hotels & Recommendations</h2>
                            <button
                                onClick={() => setShowAddHotel(true)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                            >
                                <PlusCircle className="w-4 h-4" /> Add Hotel for Recommendation
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 text-blue-400 animate-spin" /></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-gray-400 border-b border-white/10 text-left">
                                            <th className="pb-3 font-semibold pr-4">Hotel Name</th>
                                            <th className="pb-3 font-semibold pr-4">City</th>
                                            <th className="pb-3 font-semibold pr-4">Category</th>
                                            <th className="pb-3 font-semibold pr-4">Price/Night</th>
                                            <th className="pb-3 font-semibold pr-4">Partner Tier</th>
                                            <th className="pb-3 font-semibold pr-4">Status</th>
                                            <th className="pb-3 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="space-y-2">
                                        {hotels.map((hotel) => (
                                            <tr key={hotel._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-3 pr-4">
                                                    <div className="font-semibold text-white">{hotel.name}</div>
                                                    <div className="text-gray-500 text-xs">{hotel.country}</div>
                                                </td>
                                                <td className="py-3 pr-4 text-gray-300">{hotel.city}</td>
                                                <td className="py-3 pr-4">
                                                    <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-xs capitalize">
                                                        {hotel.category}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-4 text-gray-300">
                                                    {hotel.currency} {hotel.pricePerNight?.toLocaleString()}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    {hotel.partnerTier && (
                                                        <span className={`px-2 py-0.5 rounded text-xs capitalize ${hotel.partnerTier === 'featured' ? 'bg-amber-500/20 text-amber-300' : hotel.partnerTier === 'premium' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-400'}`}>
                                                            {hotel.partnerTier}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${hotel.subscriptionStatus === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {hotel.subscriptionStatus === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        {hotel.subscriptionStatus}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => toggleHotelStatus(hotel._id)}
                                                            title={hotel.subscriptionStatus === 'active' ? 'Deactivate' : 'Activate'}
                                                            className="text-gray-400 hover:text-blue-400 transition-colors"
                                                        >
                                                            {hotel.subscriptionStatus === 'active' ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5" />}
                                                        </button>
                                                        <button onClick={() => deleteHotel(hotel._id)} className="text-gray-500 hover:text-red-400 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {hotels.length === 0 && (
                                            <tr><td colSpan={7} className="text-center py-12 text-gray-500">No hotels found. Add one above!</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Add Hotel Modal */}
                        <AnimatePresence>
                            {showAddHotel && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                    onClick={(e) => e.target === e.currentTarget && setShowAddHotel(false)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.95, opacity: 0 }}
                                        className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                    >
                                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                                            <h3 className="text-white font-bold text-lg">Add Hotel for Recommendation</h3>
                                            <button onClick={() => setShowAddHotel(false)} className="text-gray-400 hover:text-white">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleAddHotel} className="p-6 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Hotel Name *</label>
                                                    <input required value={hotelForm.name} onChange={e => setHotelForm(f => ({ ...f, name: e.target.value }))}
                                                        className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors" placeholder="e.g. The Taj Surat" />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Description *</label>
                                                    <textarea required value={hotelForm.description} onChange={e => setHotelForm(f => ({ ...f, description: e.target.value }))}
                                                        rows={3} className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors resize-none" placeholder="Hotel description..." />
                                                </div>
                                                <div>
                                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">City *</label>
                                                    <input required value={hotelForm.city} onChange={e => setHotelForm(f => ({ ...f, city: e.target.value }))}
                                                        className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Surat" />
                                                </div>
                                                <div>
                                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Country *</label>
                                                    <input required value={hotelForm.country} onChange={e => setHotelForm(f => ({ ...f, country: e.target.value }))}
                                                        className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors" placeholder="e.g. India" />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Address *</label>
                                                    <input required value={hotelForm.address} onChange={e => setHotelForm(f => ({ ...f, address: e.target.value }))}
                                                        className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors" placeholder="Full hotel address" />
                                                </div>
                                                <div>
                                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Price/Night (INR) *</label>
                                                    <input required type="number" value={hotelForm.pricePerNight} onChange={e => setHotelForm(f => ({ ...f, pricePerNight: e.target.value }))}
                                                        className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 5000" />
                                                </div>
                                                <div>
                                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Category *</label>
                                                    <select required value={hotelForm.category} onChange={e => setHotelForm(f => ({ ...f, category: e.target.value }))}
                                                        className="w-full mt-1 bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors">
                                                        <option value="budget">Budget</option>
                                                        <option value="moderate">Moderate</option>
                                                        <option value="luxury">Luxury</option>
                                                        <option value="5-star">5-Star</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Partner Tier</label>
                                                    <select value={hotelForm.partnerTier} onChange={e => setHotelForm(f => ({ ...f, partnerTier: e.target.value }))}
                                                        className="w-full mt-1 bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors">
                                                        <option value="basic">Basic</option>
                                                        <option value="featured">Featured</option>
                                                        <option value="premium">Premium</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Place (Link to Place) *</label>
                                                    <select required value={hotelForm.placeId} onChange={e => setHotelForm(f => ({ ...f, placeId: e.target.value }))}
                                                        className="w-full mt-1 bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors">
                                                        <option value="">-- Select a Place --</option>
                                                        {places.map(p => (
                                                            <option key={p._id} value={p._id}>{p.name} ({p.country})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Amenities (comma-separated)</label>
                                                    <input value={hotelForm.amenities} onChange={e => setHotelForm(f => ({ ...f, amenities: e.target.value }))}
                                                        className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors" placeholder="WiFi, Pool, Gym, Spa" />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Image URLs (comma-separated)</label>
                                                    <input value={hotelForm.images} onChange={e => setHotelForm(f => ({ ...f, images: e.target.value }))}
                                                        className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors" placeholder="https://..." />
                                                </div>
                                                <div>
                                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Contact Email</label>
                                                    <input type="email" value={hotelForm.contactEmail} onChange={e => setHotelForm(f => ({ ...f, contactEmail: e.target.value }))}
                                                        className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Contact Phone</label>
                                                    <input value={hotelForm.contactPhone} onChange={e => setHotelForm(f => ({ ...f, contactPhone: e.target.value }))}
                                                        className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors" />
                                                </div>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button type="button" onClick={() => setShowAddHotel(false)}
                                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 rounded-xl font-semibold text-sm transition-all border border-white/10">
                                                    Cancel
                                                </button>
                                                <button type="submit"
                                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-semibold text-sm transition-all">
                                                    Add Hotel
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 className="text-white font-bold text-xl mb-5">All Users ({users.length})</h2>
                        {loading ? (
                            <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 text-blue-400 animate-spin" /></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-gray-400 border-b border-white/10 text-left">
                                            <th className="pb-3 font-semibold pr-4">Name</th>
                                            <th className="pb-3 font-semibold pr-4">Email</th>
                                            <th className="pb-3 font-semibold pr-4">Role</th>
                                            <th className="pb-3 font-semibold pr-4">Trips</th>
                                            <th className="pb-3 font-semibold pr-4">Joined</th>
                                            <th className="pb-3 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-3 pr-4 font-semibold text-white">{u.name}</td>
                                                <td className="py-3 pr-4 text-gray-400 text-xs">{u.email}</td>
                                                <td className="py-3 pr-4">
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => updateUserRole(u._id, e.target.value)}
                                                        disabled={u._id === user?._id}
                                                        className={`text-xs px-2 py-1 rounded-lg border font-semibold bg-gray-800 ${roleColorMap[u.role] || 'text-gray-200'} focus:outline-none`}
                                                    >
                                                        <option value="free">Free</option>
                                                        <option value="premium">Premium</option>
                                                        <option value="guide">Guide</option>
                                                        <option value="b2b_admin">B2B Admin</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="py-3 pr-4 text-gray-400">{u.tripsPlanned}</td>
                                                <td className="py-3 pr-4 text-gray-400 text-xs">
                                                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="py-3">
                                                    {u._id !== user?._id && (
                                                        <button onClick={() => deleteUser(u._id)} className="text-gray-500 hover:text-red-400 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr><td colSpan={6} className="text-center py-12 text-gray-500">No users found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Trips Tab */}
                {activeTab === 'trips' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 className="text-white font-bold text-xl mb-5">All Trip Plans ({trips.length})</h2>
                        {loading ? (
                            <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 text-blue-400 animate-spin" /></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-gray-400 border-b border-white/10 text-left">
                                            <th className="pb-3 font-semibold pr-4">Trip Title</th>
                                            <th className="pb-3 font-semibold pr-4">User</th>
                                            <th className="pb-3 font-semibold pr-4">Dates</th>
                                            <th className="pb-3 font-semibold pr-4">Budget</th>
                                            <th className="pb-3 font-semibold pr-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trips.map((trip) => (
                                            <tr key={trip._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-3 pr-4 font-semibold text-white">{trip.title}</td>
                                                <td className="py-3 pr-4">
                                                    <div className="text-gray-300 text-sm">{trip.userId?.name}</div>
                                                    <div className="text-gray-500 text-xs">{trip.userId?.email}</div>
                                                </td>
                                                <td className="py-3 pr-4 text-gray-400 text-xs">
                                                    {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : '-'}
                                                    <span className="mx-1">→</span>
                                                    {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="py-3 pr-4 text-gray-300">
                                                    ₹{trip.totalBudget?.toLocaleString() || 0}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${trip.status === 'completed' ? 'bg-green-500/20 text-green-400' : trip.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' : trip.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {trip.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {trips.length === 0 && (
                                            <tr><td colSpan={5} className="text-center py-12 text-gray-500">No trip plans found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
