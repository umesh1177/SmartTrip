import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, MapPin, Hotel, Users,
    Map as TripIcon, Compass, Car, Star,
    CreditCard, Settings, ChevronRight,
    Menu, X, LogOut, Bell, Search,
    TrendingUp, TrendingDown, Clock, CheckCircle,
    AlertCircle, Plus, Edit2, Trash2, Filter, Shield, Building2,
    PieChart as PieIcon, BarChart as BarIcon, LineChart as LineIcon
} from 'lucide-react';
import HotelApplicationsPanel from './HotelApplicationsPanel';

import {
    LineChart, BarChart, PieChart,
    Line, Bar, Pie, Cell,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    // Sidebar Items
    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'places', label: 'Places Management', icon: MapPin },
        { id: 'hotels', label: 'Hotels Management', icon: Hotel },
        { id: 'hotel-applications', label: 'Hotel Applications', icon: Building2 },
        { id: 'users', label: 'Users Management', icon: Users },
        { id: 'trips', label: 'Trips Management', icon: TripIcon },
        { id: 'guides', label: 'Guides Management', icon: Compass },
        { id: 'drivers', label: 'Drivers Management', icon: Car },
        { id: 'reviews', label: 'Reviews Management', icon: Star },
        { id: 'revenue', label: 'Revenue & Subscriptions', icon: CreditCard },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/admin/stats');
            if (res.data.success) {
                setStats(res.data.stats);
            }
        } catch (error) {
            toast.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <Overview stats={stats} setActiveTab={setActiveTab} />;
            case 'places': return <PlacesManagement />;
            case 'hotels': return <HotelsManagement />;
            case 'hotel-applications': return <HotelApplicationsPanel />;
            case 'users': return <UsersManagement />;
            case 'trips': return <TripsManagement />;
            case 'guides': return <GuidesManagement />;
            case 'drivers': return <DriversManagement />;
            case 'reviews': return <ReviewsManagement />;
            case 'revenue': return <RevenueManagement />;
            case 'settings': return <SettingsSection />;
            default: return <Overview stats={stats} setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? '260px' : '80px' }}
                className="bg-gray-900 text-white flex flex-col transition-all duration-300 z-50 overflow-hidden"
            >
                <div className="p-4 flex items-center justify-between border-b border-gray-800">
                    {isSidebarOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                        >
                            SmartTrip Admin
                        </motion.span>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center p-4 transition-all duration-200 group relative ${activeTab === item.id
                                ? 'bg-blue-600/10 text-blue-400'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={22} className={activeTab === item.id ? 'text-blue-400' : 'group-hover:text-white'} />
                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="ml-4 font-medium flex items-center justify-between flex-1"
                                >
                                    {item.label}
                                    {item.id === 'hotel-applications' && stats?.applications?.pending > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-red-500/30">
                                            {stats.applications.pending}
                                        </span>
                                    )}
                                </motion.span>
                            )}
                            {activeTab === item.id && (
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={logout}
                        className="w-full flex items-center p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
                    >
                        <LogOut size={22} />
                        {isSidebarOpen && <span className="ml-4 font-medium group-hover:translate-x-1 transition-transform">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm z-40">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">
                        {activeTab.replace('-', ' ')}
                    </h2>

                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                                3
                            </span>
                            <Bell className="text-gray-500 cursor-pointer hover:text-blue-500 transition-colors" size={20} />
                        </div>
                        <div className="flex items-center space-x-3 border-l pl-6 border-gray-200">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-800">{user?.name || 'Admin'}</p>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white ring-offset-2">
                                {user?.name?.[0].toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {loading ? <DashboardSkeleton /> : renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

const DashboardSkeleton = () => (
    <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl shadow-sm" />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-2xl shadow-sm" />
            <div className="h-80 bg-gray-200 rounded-2xl shadow-sm" />
        </div>
    </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: OVERVIEW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const Overview = ({ stats, setActiveTab }) => {
    if (!stats) return null;

    const userDistribution = [
        { name: 'Free', value: stats.users.free, color: '#94a3b8' },
        { name: 'Premium', value: stats.users.premium, color: '#eab308' },
        { name: 'Guides', value: stats.guides.total, color: '#22c55e' },
        { name: 'Drivers', value: stats.drivers.total, color: '#3b82f6' }
    ];

    return (
        <div className="space-y-8">
            {/* Pending Actions Alert */}
            {(stats.guides.pending > 0 || stats.drivers.pending > 0 || stats.reviews > 0 || stats.applications?.pending > 0) && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3 text-amber-800">
                        <AlertCircle className="text-amber-500" size={24} />
                        <p className="font-medium">
                            {stats.applications?.pending > 0 && `${stats.applications.pending} hotel applications, `}
                            {stats.guides.pending > 0 && `${stats.guides.pending} guide, `}
                            {stats.drivers.pending > 0 && `${stats.drivers.pending} driver, `}
                            {stats.reviews > 0 && `${stats.reviews} review `}
                            approvals pending.
                        </p>
                    </div>
                    <button
                        onClick={() => setActiveTab(stats.applications?.pending > 0 ? 'hotel-applications' : 'guides')}
                        className="text-amber-800 text-sm font-bold flex items-center hover:underline"
                    >
                        Take Action <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Stats Cards Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users.total}
                    trend={`+${stats.users.newThisWeek} this week`}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Premium Users"
                    value={stats.users.premium}
                    trend={`${Math.round((stats.users.premium / stats.users.total) * 100)}% of total`}
                    icon={Star}
                    color="yellow"
                />
                <StatCard
                    title="Total Trips"
                    value={stats.trips.total}
                    trend={`${stats.trips.active} active now`}
                    icon={TripIcon}
                    color="purple"
                />
                <StatCard
                    title="Hotel Applications"
                    value={stats.applications?.pending || 0}
                    trend="Awaiting review"
                    icon={Building2}
                    color="rose"
                />
            </div>

            {/* Stats Cards Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Places" value={stats.places.total} icon={MapPin} color="rose" />
                <StatCard title="Partner Hotels" value={stats.hotels.partners} icon={Hotel} color="indigo" />
                <StatCard title="Total Guides" value={stats.guides.total} icon={Compass} color="teal" />
                <StatCard title="Total Drivers" value={stats.drivers.total} icon={Car} color="orange" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <LineIcon className="mr-2 text-blue-500" size={22} /> Revenue Chart (6 Months)
                    </h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={stats.revenue.chart}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="_id" tickFormatter={m => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} />
                            <YAxis />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3b82f6"
                                strokeWidth={4}
                                dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <PieIcon className="mr-2 text-purple-500" size={22} /> User Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height="75%">
                        <PieChart>
                            <Pie
                                data={userDistribution}
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {userDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, trend, icon: Icon, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        yellow: 'bg-amber-50 text-amber-600',
        green: 'bg-emerald-50 text-emerald-600',
        purple: 'bg-purple-50 text-purple-600',
        rose: 'bg-rose-50 text-rose-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        teal: 'bg-teal-50 text-teal-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors[color]}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h4 className="text-3xl font-black text-gray-800 tracking-tight">{value}</h4>
            </div>
        </div>
    );
};

// Placeholder components for other sections to keep the file valid while I implement them
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT: PLACE MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const PlaceModal = ({ isOpen, onClose, onSave, editingPlace }) => {
    const [formData, setFormData] = useState({
        name: '', city: '', state: '', country: '',
        category: 'nature', budget: 'moderate', description: '',
        image: '', seasons: [], bestFor: [], isFeatured: false, isTrending: false
    });

    useEffect(() => {
        if (editingPlace) setFormData(editingPlace);
        else setFormData({
            name: '', city: '', state: '', country: '',
            category: 'nature', budget: 'moderate', description: '',
            image: '', seasons: [], bestFor: [], isFeatured: false, isTrending: false
        });
    }, [editingPlace, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-800">{editingPlace ? 'Edit Place' : 'Add New Place'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Place Name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} placeholder="e.g. Manali" />
                        <InputField label="City" value={formData.city} onChange={v => setFormData({ ...formData, city: v })} placeholder="City" />
                        <InputField label="State" value={formData.state} onChange={v => setFormData({ ...formData, state: v })} placeholder="State" />
                        <InputField label="Country" value={formData.country} onChange={v => setFormData({ ...formData, country: v })} placeholder="Country" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField
                            label="Category"
                            options={['nature', 'adventure', 'religious', 'heritage', 'beach', 'mountain']}
                            value={formData.category}
                            onChange={v => setFormData({ ...formData, category: v })}
                        />
                        <SelectField
                            label="Budget"
                            options={['budget', 'moderate', 'luxury']}
                            value={formData.budget}
                            onChange={v => setFormData({ ...formData, budget: v })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                        <textarea
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none transition-all"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Tell us about this place..."
                        />
                    </div>

                    <div className="space-y-4">
                        <InputField label="Image URL" value={formData.image} onChange={v => setFormData({ ...formData, image: v })} placeholder="https://..." />
                        {formData.image && (
                            <div className="w-full h-48 rounded-2xl overflow-hidden shadow-inner border border-gray-100">
                                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <ToggleField label="Featured Place" checked={formData.isFeatured} onChange={v => setFormData({ ...formData, isFeatured: v })} />
                        <ToggleField label="Trending Now" checked={formData.isTrending} onChange={v => setFormData({ ...formData, isTrending: v })} />
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-6 py-2.5 font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                    <button
                        onClick={() => onSave(formData)}
                        className="px-10 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
                    >
                        {editingPlace ? 'Update Place' : 'Save Place'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: PLACES MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const PlacesManagement = () => {
    const { user } = useAuth();
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [onlyMine, setOnlyMine] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlace, setEditingPlace] = useState(null);

    useEffect(() => {
        fetchPlaces();
    }, [search, onlyMine]);

    const fetchPlaces = async () => {
        try {
            const res = await axios.get(`/api/admin/places?search=${search}`);
            if (res.data.success) {
                let filteredPlaces = res.data.places || [];
                if (onlyMine) filteredPlaces = filteredPlaces.filter(p => p.addedBy?._id === user?._id);
                setPlaces(filteredPlaces);
            }
        } catch (error) {
            toast.error('Failed to load places');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlace = async (formData) => {
        try {
            const dataToSave = {
                ...formData,
                category: formData.category.toLowerCase(),
                type: formData.type.toLowerCase(),
                budget: (formData.budget || 'moderate').toLowerCase()
            };
            if (editingPlace) {
                await axios.put(`/api/admin/places/${editingPlace._id}`, dataToSave);
                toast.success('Place updated');
            } else {
                await axios.post('/api/admin/places', dataToSave);
                toast.success('Place added');
            }
            setIsModalOpen(false);
            fetchPlaces();
        } catch (error) {
            toast.error('Failed to save place');
        }
    };

    const handleToggleStatus = async (id, field) => {
        try {
            const res = await axios.put(`/api/admin/places/${id}/${field}`);
            if (res.data.success) {
                toast.success(`Place updated`);
                fetchPlaces();
            }
        } catch (error) {
            toast.error('Failed to update place');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this place?')) return;
        try {
            const res = await axios.delete(`/api/admin/places/${id}`);
            if (res.data.success) {
                toast.success('Place deleted');
                fetchPlaces();
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search places or cities..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <button
                    onClick={() => setOnlyMine(!onlyMine)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${onlyMine ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                >
                    My Registry
                </button>
                <button
                    onClick={() => { setEditingPlace(null); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 whitespace-nowrap"
                >
                    <Plus size={18} className="mr-2" /> Add Place
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                        <tr>
                            <th className="px-6 py-4">Image</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {places.map((place) => (
                            <tr key={place._id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 text-sm font-medium">
                                    <img src={place.image} className="w-12 h-12 rounded-lg object-cover shadow-sm" alt="" />
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-800">{place.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {place.city}, {place.country}
                                    {place.addedBy && place.addedBy._id !== user?._id && (
                                        <div className="text-[8px] font-black uppercase text-blue-500 mt-1">By {place.addedBy.name}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold text-[10px] uppercase border border-blue-100">
                                        {place.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm space-x-2">
                                    <button
                                        onClick={() => handleToggleStatus(place._id, 'featured')}
                                        className={`p-2 rounded-lg transition-all ${place.isFeatured ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}
                                    >
                                        <Star size={16} fill={place.isFeatured ? "currentColor" : "none"} />
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(place._id, 'trending')}
                                        className={`p-2 rounded-lg transition-all ${place.isTrending ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}
                                    >
                                        <TrendingUp size={16} />
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setEditingPlace(place); setIsModalOpen(true); }}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(place._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <PlaceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePlace}
                editingPlace={editingPlace}
            />
        </div>
    );
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: HOTELS MANAGEMENT (B2B)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const HotelsManagement = () => {
    const { user } = useAuth();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ partner: 'all', city: '', category: 'all', onlyMine: false });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHotel, setEditingHotel] = useState(null);

    useEffect(() => {
        fetchHotels();
    }, [filter]);

    const fetchHotels = async () => {
        try {
            const { partner, city, onlyMine } = filter;
            let url = `/api/admin/hotels?city=${city}`;
            if (partner !== 'all') url += `&isPartner=${partner === 'partner'}`;
            const res = await axios.get(url);
            if (res.data.success) {
                let filteredHotels = res.data.hotels || [];
                if (onlyMine) filteredHotels = filteredHotels.filter(h => h.addedBy?._id === user?._id);
                setHotels(filteredHotels);
            }
        } catch (error) {
            toast.error('Failed to load hotels');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveHotel = async (formData) => {
        try {
            const dataToSave = {
                ...formData,
                category: formData.category.toLowerCase(),
                partnerTier: formData.partnerTier.toLowerCase()
            };
            if (editingHotel) {
                await axios.put(`/api/admin/hotels/${editingHotel._id}`, dataToSave);
                toast.success('Property updated');
            } else {
                await axios.post('/api/admin/hotels', dataToSave);
                toast.success('Property registered and Partner status activated');
            }
            setIsModalOpen(false);
            fetchHotels();
        } catch (error) {
            toast.error('Failed to save property');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property?')) return;
        try {
            await axios.delete(`/api/admin/hotels/${id}`);
            toast.success('Property deleted');
            fetchHotels();
        } catch (error) {
            toast.error('Failed to delete property');
        }
    };

    const handleTogglePartner = async (id) => {
        try {
            await axios.put(`/api/admin/hotels/${id}/toggle-partner`);
            toast.success('Partner status updated');
            fetchHotels();
        } catch (error) {
            toast.error('Failed to update partner status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 flex-1">
                    <select
                        value={filter.partner}
                        onChange={(e) => setFilter({ ...filter, partner: e.target.value })}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-600 shadow-sm"
                    >
                        <option value="all">All Properties</option>
                        <option value="partner">Partner Network</option>
                        <option value="non-partner">Standard Listings</option>
                    </select>
                    <button
                        onClick={() => setFilter({ ...filter, onlyMine: !filter.onlyMine })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${filter.onlyMine ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    >
                        My Registry
                    </button>
                    <div className="relative flex-1 max-w-xs">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by city..."
                            value={filter.city}
                            onChange={(e) => setFilter({ ...filter, city: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                    </div>
                </div>
                <button
                    onClick={() => { setEditingHotel(null); setIsModalOpen(true); }}
                    className="bg-gray-900 text-white px-8 py-2.5 rounded-xl font-black flex items-center hover:bg-black transition-all shadow-xl hover:-translate-y-0.5"
                >
                    <Plus size={18} className="mr-2" /> Register Property
                </button>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                        <tr>
                            <th className="px-8 py-6">Property Name</th>
                            <th className="px-6 py-6">Location</th>
                            <th className="px-6 py-6">Price/Night</th>
                            <th className="px-6 py-6">B2B Tier</th>
                            <th className="px-6 py-6">Status</th>
                            <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {hotels.map((hotel) => (
                            <tr key={hotel._id} className="hover:bg-gray-50/80 transition-all group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100 ring-2 ring-white">
                                            <img src={hotel.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div>
                                            <span className="font-black text-gray-800 text-sm block tracking-tight">{hotel.name}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">{hotel.category}</span>
                                            {hotel.addedBy && hotel.addedBy._id !== user._id && (
                                                <span className="ml-2 bg-gray-100 text-gray-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                                                    By {hotel.addedBy.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-sm font-bold text-gray-500">{hotel.city}, {hotel.country}</td>
                                <td className="px-6 py-5 text-sm font-black text-emerald-600">₹{hotel.pricePerNight?.toLocaleString()}</td>
                                <td className="px-6 py-5">
                                    {hotel.isPartner ? (
                                        <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center w-fit border border-amber-100">
                                            <Star size={12} className="mr-1" fill="currentColor" /> {hotel.partnerTier}
                                        </span>
                                    ) : (
                                        <span className="text-gray-300 text-[10px] uppercase font-black tracking-widest">Standard</span>
                                    )}
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${hotel.subscriptionStatus === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {hotel.subscriptionStatus}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => handleTogglePartner(hotel._id)}
                                            className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors border border-transparent hover:border-amber-100"
                                            title="Quick Toggle Partner"
                                        >
                                            <Star size={18} fill={hotel.isPartner ? "currentColor" : "none"} />
                                        </button>
                                        <button
                                            onClick={() => { setEditingHotel(hotel); setIsModalOpen(true); }}
                                            className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(hotel._id)}
                                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <HotelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveHotel}
                editingHotel={editingHotel}
            />
        </div >
    );
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: USERS MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ role: '', search: '' });

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            const { role, search } = filter;
            const res = await axios.get(`/api/admin/users?role=${role}&search=${search}`);
            if (res.data.success) setUsers(res.data.users);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await axios.put(`/api/admin/users/${id}/role`, { role: newRole });
            toast.success('Role updated');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const handleBanUser = async (id) => {
        const reason = window.prompt('Enter reason for banning:');
        if (reason === null) return;
        try {
            await axios.put(`/api/admin/users/${id}/ban`, { reason });
            toast.success('User banned');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to ban user');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;
        try {
            await axios.delete(`/api/admin/users/${id}`);
            toast.success('User deleted');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const roleColors = {
        admin: 'bg-red-50 text-red-600 border-red-100',
        premium: 'bg-amber-50 text-amber-600 border-amber-100',
        guide: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        driver: 'bg-blue-50 text-blue-600 border-blue-100',
        free: 'bg-gray-50 text-gray-600 border-gray-100'
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    />
                </div>
                <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                    {['', 'free', 'premium', 'guide', 'driver', 'admin'].map(r => (
                        <button
                            key={r}
                            onClick={() => setFilter({ ...filter, role: r })}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${filter.role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {r || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(users || []).map((u) => (
                            <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-800 text-sm">{u.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${roleColors[u.role]}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <select
                                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                            value={u.role}
                                            className="text-xs font-bold border rounded-lg px-2 py-1 outline-none bg-white"
                                        >
                                            <option value="free">Free</option>
                                            <option value="premium">Premium</option>
                                            <option value="guide">Guide</option>
                                            <option value="driver">Driver</option>
                                            <option value="admin">Admin</option>
                                            <option value="non-partner">Standard Listings</option>
                                        </select>
                                        <button
                                            onClick={() => handleBanUser(u._id)}
                                            className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                            title="Ban User"
                                        >
                                            <AlertCircle size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(u._id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: TRIPS MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const TripsManagement = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchTrips();
    }, [statusFilter]);

    const fetchTrips = async () => {
        try {
            const res = await axios.get(`/api/admin/trips?status=${statusFilter}`);
            if (res.data.success) setTrips(res.data.trips);
        } catch (error) {
            toast.error('Failed to load trips');
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        planning: 'bg-blue-50 text-blue-600',
        confirmed: 'bg-green-50 text-green-600',
        completed: 'bg-gray-100 text-gray-600',
        cancelled: 'bg-red-50 text-red-600',
        active: 'bg-orange-50 text-orange-600 border border-orange-200'
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <Filter size={20} className="text-gray-400" />
                <div className="flex gap-2">
                    {['', 'planning', 'confirmed', 'completed', 'cancelled'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${statusFilter === s ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {s || 'All Trips'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Destination</th>
                            <th className="px-6 py-4">Dates</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Budget</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(trips || []).map((trip) => (
                            <tr key={trip._id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800 text-sm">{trip.userId?.name}</span>
                                        <span className="text-[10px] text-gray-400">{trip.userId?.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                    {trip.destination?.name}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors[trip.status]}`}>
                                        {trip.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-blue-600">
                                    ₹{trip.totalBudget?.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-500 hover:underline text-xs font-bold">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: GUIDES MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const GuidesManagement = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGuides();
    }, []);

    const fetchGuides = async () => {
        try {
            const res = await axios.get('/api/admin/guides');
            if (res.data.success) setGuides(res.data.guides);
        } catch (error) {
            toast.error('Failed to load guides');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            await axios.put(`/api/admin/guides/${id}/verify`);
            toast.success('Guide verified successfully!');
            fetchGuides();
        } catch (error) {
            toast.error('Verification failed');
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Reason for rejection:');
        if (reason === null) return;
        try {
            await axios.put(`/api/admin/guides/${id}/reject`, { reason });
            toast.success('Guide application rejected');
            fetchGuides();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                        <tr>
                            <th className="px-6 py-4">Guide</th>
                            <th className="px-6 py-4">Specialization</th>
                            <th className="px-6 py-4">City</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(guides || []).map((g) => (
                            <tr key={g._id} className={`hover:bg-gray-50 transition-colors ${!g.isVerified ? 'bg-amber-50/30' : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800 text-sm">{g.userId?.name}</span>
                                        <span className="text-[10px] text-gray-400">{g.userId?.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{g.specialization}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{g.city}</td>
                                <td className="px-6 py-4">
                                    {g.isVerified ? (
                                        <span className="flex items-center text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded-full uppercase">
                                            <CheckCircle size={12} className="mr-1" /> Verified
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-amber-600 text-[10px] font-bold bg-amber-100 px-2 py-1 rounded-full uppercase">
                                            <Clock size={12} className="mr-1" /> Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        {!g.isVerified && (
                                            <>
                                                <button
                                                    onClick={() => handleVerify(g._id)}
                                                    className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                                                >
                                                    Verify
                                                </button>
                                                <button
                                                    onClick={() => handleReject(g._id)}
                                                    className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: DRIVERS MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const DriversManagement = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const res = await axios.get('/api/admin/drivers');
            if (res.data.success) setDrivers(res.data.drivers);
        } catch (error) {
            toast.error('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            await axios.put(`/api/admin/drivers/${id}/verify`);
            toast.success('Driver verified!');
            fetchDrivers();
        } catch (error) {
            toast.error('Verification failed');
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Reason for rejection:');
        if (reason === null) return;
        try {
            await axios.put(`/api/admin/drivers/${id}/reject`, { reason });
            toast.success('Driver application rejected');
            fetchDrivers();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                        <tr>
                            <th className="px-6 py-4">Driver</th>
                            <th className="px-6 py-4">Vehicle</th>
                            <th className="px-6 py-4">City</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {drivers.map((d) => (
                            <tr key={d._id} className={`hover:bg-gray-50 transition-colors ${!d.isVerified ? 'bg-blue-50/20' : ''}`}>
                                <td className="px-6 py-4 font-bold text-gray-800 text-sm">
                                    {d.userId?.name}
                                    <p className="text-[10px] text-gray-400 font-normal">{d.userId?.email}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {d.vehicleType}
                                    <p className="text-[10px] text-gray-400 font-mono uppercase">{d.vehicleNumber}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{d.city}</td>
                                <td className="px-6 py-4">
                                    {d.isVerified ? (
                                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Verified</span>
                                    ) : (
                                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Pending</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        {!d.isVerified && (
                                            <>
                                                <button
                                                    onClick={() => handleVerify(d._id)}
                                                    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                                >
                                                    Verify
                                                </button>
                                                <button
                                                    onClick={() => handleReject(d._id)}
                                                    className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: REVIEWS MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const ReviewsManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [status, setStatus] = useState('pending');

    useEffect(() => {
        fetchReviews();
    }, [status]);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`/api/admin/reviews?status=${status}`);
            if (res.data.success) setReviews(res.data.reviews);
        } catch (error) {
            toast.error('Failed to load reviews');
        }
    };

    const handleAction = async (id, action) => {
        try {
            await axios.put(`/api/admin/reviews/${id}/${action}`);
            toast.success(`Review ${action}ed`);
            fetchReviews();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-2">
                {['pending', 'approved', 'rejected'].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all ${status === s ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(reviews || []).map((r) => (
                    <div key={r._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    {r.userId?.name?.[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{r.userId?.name}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{r.placeId?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg">
                                <Star size={14} className="text-amber-500 mr-1" fill="currentColor" />
                                <span className="text-amber-700 font-bold text-sm">{r.rating}</span>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm italic mb-6">"{r.comment}"</p>

                        {status === 'pending' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAction(r._id, 'approve')}
                                    className="flex-1 bg-emerald-50 text-emerald-600 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleAction(r._id, 'reject')}
                                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: REVENUE & SUBSCRIPTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const RevenueManagement = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRevenue();
    }, []);

    const fetchRevenue = async () => {
        try {
            const res = await axios.get('/api/admin/revenue');
            if (res.data.success) setData(res.data);
        } catch (error) {
            toast.error('Failed to load revenue data');
        } finally {
            setLoading(false);
        }
    };

    if (!data) return null;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value={`₹${data.subscriptions.reduce((acc, s) => acc + s.amount, 0).toLocaleString()}`} icon={CreditCard} color="green" />
                <StatCard title="Active Subscriptions" value={data.monthlyRevenue[0]?.count || 0} icon={Users} color="blue" />
                <StatCard title="Avg. Ticket Size" value={`₹${Math.round(data.subscriptions.reduce((acc, s) => acc + s.amount, 0) / (data.subscriptions.length || 1))}`} icon={BarIcon} color="purple" />
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-[450px]">
                <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center">
                    <BarIcon className="mr-3 text-blue-600" size={24} /> Monthly Revenue Growth
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={data.monthlyRevenue.reverse()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="_id.month" tickFormatter={m => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} />
                        <YAxis />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(data?.subscriptions || []).map((s) => (
                            <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-bold text-gray-800">{s.userId?.name}</td>
                                <td className="px-6 py-4 text-xs font-medium uppercase text-gray-500">{s.plan}</td>
                                <td className="px-6 py-4 text-sm font-bold text-emerald-600">₹{s.amount}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                        {s.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-400">
                                    {new Date(s.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: SETTINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const SettingsSection = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        siteName: 'SmartTrip Official',
        contactEmail: 'admin@smarttrip.com',
        maintenanceMode: false,
        registrationOpen: true,
        currency: 'INR'
    });

    return (
        <div className="max-w-4xl space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="flex items-center space-x-8 relative z-10">
                    <div className="w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-2xl ring-8 ring-gray-50">
                        {user?.name?.[0]}
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-gray-800 tracking-tight">{user?.name}</h3>
                        <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-1 flex items-center">
                            <Shield size={14} className="mr-2" /> System Administrator
                        </p>
                        <div className="mt-4 flex gap-4">
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-emerald-100">Verified identity</span>
                            <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-gray-100">Joined Feb 2026</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                    <h4 className="font-black text-gray-800 uppercase tracking-tighter flex items-center">
                        <Settings className="mr-3 text-gray-400" size={20} /> Platform Configuration
                    </h4>
                    <div className="space-y-4">
                        <InputField label="Platform Name" value={settings.siteName} onChange={v => setSettings({ ...settings, siteName: v })} />
                        <InputField label="Support Email" value={settings.contactEmail} onChange={v => setSettings({ ...settings, contactEmail: v })} />
                        <SelectField label="Default Currency" options={['INR', 'USD', 'EUR']} value={settings.currency} onChange={v => setSettings({ ...settings, currency: v })} />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                    <h4 className="font-black text-gray-800 uppercase tracking-tighter flex items-center">
                        <Shield className="mr-3 text-gray-400" size={20} /> System Security
                    </h4>
                    <div className="space-y-4">
                        <ToggleField label="Maintenance Mode" checked={settings.maintenanceMode} onChange={v => setSettings({ ...settings, maintenanceMode: v })} />
                        <ToggleField label="User Registrations" checked={settings.registrationOpen} onChange={v => setSettings({ ...settings, registrationOpen: v })} />
                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 mt-4">
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Danger Zone</p>
                            <button className="w-full py-2 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all">Clear System Cache</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => toast.success('Settings synchronized')}
                    className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-2xl hover:bg-black transition-all active:scale-95"
                >
                    Save Global Config
                </button>
            </div>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT: HOTEL MODAL (B2B)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const HotelModal = ({ isOpen, onClose, onSave, editingHotel }) => {
    const [formData, setFormData] = useState({
        name: '', description: '', city: '', state: '', country: '',
        address: '', lat: '', lng: '', pricePerNight: 0,
        category: 'Moderate', currency: 'INR', checkIn: '12:00 PM',
        checkOut: '11:00 AM', amenities: [], isPartner: false,
        partnerTier: 'Basic', contactEmail: '', contactPhone: '',
        images: []
    });

    const amenityOptions = ['WiFi', 'Pool', 'Gym', 'Spa', 'Parking', 'Restaurant', 'AC', 'Room Service', 'Laundry', 'Bar', 'Conference Room'];

    useEffect(() => {
        if (editingHotel) setFormData(editingHotel);
        else setFormData({
            name: '', description: '', city: '', state: '', country: '',
            address: '', lat: '', lng: '', pricePerNight: 0,
            category: 'Moderate', currency: 'INR', checkIn: '12:00 PM',
            checkOut: '11:00 AM', amenities: [], isPartner: false,
            partnerTier: 'Basic', contactEmail: '', contactPhone: '',
            images: []
        });
    }, [editingHotel, isOpen]);

    const toggleAmenity = (amenity) => {
        const updated = formData.amenities.includes(amenity)
            ? formData.amenities.filter(a => a !== amenity)
            : [...formData.amenities, amenity];
        setFormData({ ...formData, amenities: updated });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-gray-100"
            >
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight">{editingHotel ? 'Update Property' : 'Register Partner Property'}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">B2B Property Management</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-gray-400 hover:text-red-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
                    {/* Section 1: Basic Info */}
                    <div className="space-y-6">
                        <SectionHeader icon={Hotel} title="Property Essentials" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Hotel Name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} placeholder="Grand Palace Resort" />
                            <SelectField label="Category" options={['Budget', 'Moderate', 'Luxury', '5-Star', 'Boutique']} value={formData.category} onChange={v => setFormData({ ...formData, category: v })} />
                        </div>
                        <textarea
                            className="w-full p-5 bg-gray-50 border border-gray-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none transition-all placeholder:text-gray-300"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Elevator pitch for the hotel..."
                        />
                    </div>

                    {/* Section 2: Location */}
                    <div className="space-y-6">
                        <SectionHeader icon={MapPin} title="Location Details" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="City" value={formData.city} onChange={v => setFormData({ ...formData, city: v })} placeholder="Mumbai" />
                            <InputField label="State" value={formData.state} onChange={v => setFormData({ ...formData, state: v })} placeholder="Maharashtra" />
                            <InputField label="Country" value={formData.country} onChange={v => setFormData({ ...formData, country: v })} placeholder="India" />
                        </div>
                        <InputField label="Full Address" value={formData.address} onChange={v => setFormData({ ...formData, address: v })} placeholder="Street, Landmark, etc." />
                    </div>

                    {/* Section 3: Pricing & Partner Settings */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <SectionHeader icon={Star} title="Pricing & Utilities" />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Price / Night" type="number" value={formData.pricePerNight} onChange={v => setFormData({ ...formData, pricePerNight: v })} placeholder="₹0" />
                                <SelectField label="Currency" options={['INR', 'USD', 'EUR']} value={formData.currency} onChange={v => setFormData({ ...formData, currency: v })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Check-in" value={formData.checkIn} onChange={v => setFormData({ ...formData, checkIn: v })} placeholder="12:00 PM" />
                                <InputField label="Check-out" value={formData.checkOut} onChange={v => setFormData({ ...formData, checkOut: v })} placeholder="11:00 AM" />
                            </div>
                        </div>

                        <div className="space-y-6 p-8 bg-amber-50/50 rounded-[2.5rem] border border-amber-100 shadow-inner">
                            <SectionHeader icon={CheckCircle} title="Partner (B2B) Settings" color="text-amber-600" />
                            <div className="space-y-6">
                                <ToggleField label="Active Partner Property" checked={formData.isPartner} onChange={v => setFormData({ ...formData, isPartner: v })} />
                                <div className={`${!formData.isPartner && 'opacity-30 pointer-events-none'}`}>
                                    <SelectField
                                        label="Subscription Tier"
                                        options={['Basic', 'Featured', 'Premium']}
                                        value={formData.partnerTier}
                                        onChange={v => setFormData({ ...formData, partnerTier: v })}
                                    />
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <InputField label="Contact Email" value={formData.contactEmail} onChange={v => setFormData({ ...formData, contactEmail: v })} placeholder="manager@hotel.com" />
                                        <InputField label="Contact Phone" value={formData.contactPhone} onChange={v => setFormData({ ...formData, contactPhone: v })} placeholder="+91..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Amenities */}
                    <div className="space-y-6">
                        <SectionHeader icon={CheckCircle} title="Premium Amenities" />
                        <div className="flex flex-wrap gap-3">
                            {amenityOptions.map(amenity => (
                                <button
                                    key={amenity}
                                    onClick={() => toggleAmenity(amenity)}
                                    className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all border ${formData.amenities.includes(amenity)
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                                        : 'bg-white text-gray-400 border-gray-100 hover:border-blue-200 hover:text-blue-500'
                                        }`}
                                >
                                    {amenity}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end items-center space-x-6">
                    <button onClick={onClose} className="text-sm font-bold text-gray-400 hover:text-gray-800 transition-colors uppercase tracking-widest">Discard Changes</button>
                    <button
                        onClick={() => onSave(formData)}
                        className="px-12 py-4 bg-gray-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-black hover:-translate-y-1 transition-all active:scale-95 text-lg"
                    >
                        {editingHotel ? 'Submit Update' : 'Initialize Property'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━
const SectionHeader = ({ icon: Icon, title, color = "text-blue-600" }) => (
    <div className="flex items-center space-x-3 pb-2 border-b-2 border-gray-50">
        <Icon className={color} size={20} />
        <h4 className="font-black text-gray-800 uppercase tracking-tighter text-sm">{title}</h4>
    </div>
);

const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div className="space-y-2 flex-1">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700 placeholder:text-gray-300"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);

const SelectField = ({ label, options, value, onChange }) => (
    <div className="space-y-2 flex-1">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <select
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-gray-700 appearance-none"
            value={value}
            onChange={e => onChange(e.target.value)}
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const ToggleField = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-gray-100">
        <span className="text-sm font-bold text-gray-700">{label}</span>
        <button
            onClick={() => onChange(!checked)}
            className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
            <motion.div
                animate={{ x: checked ? 26 : 2 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
            />
        </button>
    </div>
);

export default AdminDashboard;
