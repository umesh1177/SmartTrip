import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Navigation, Bus, Train, Info, ArrowRight, Footprints, Map as MapIcon, Save, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const PublicTransport = () => {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [loading, setLoading] = useState(false);
    const [routes, setRoutes] = useState([]);
    const [activeTab, setActiveTab] = useState('routes'); // 'routes', 'stops', 'metro'
    const [expandedRoute, setExpandedRoute] = useState(null);

    const fetchRoutes = async () => {
        if (!from || !to) {
            toast.error('Please enter both origin and destination');
            return;
        }
        setLoading(true);
        try {
            // Mocking API call for now as we don't have lat/lng conversion in simple UI
            // In real app, we'd use Google Places to get coords first
            const res = await axios.get(`/api/transit/routes?from=${from}&to=${to}`);
            setRoutes(res.data.routes || []);
            setActiveTab('routes');
        } catch (error) {
            toast.error('Failed to fetch routes. Try different locations.');
        } finally {
            setLoading(false);
        }
    };

    const getTransportIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'bus': return <Bus className="text-blue-500" />;
            case 'metro':
            case 'subway':
            case 'train': return <Train className="text-red-500" />;
            case 'walking': return <Footprints className="text-gray-500" />;
            default: return <Info className="text-indigo-500" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
                <Bus className="text-indigo-600" size={32} /> Public Transport
            </h1>

            {/* Search Section */}
            <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                        <input
                            type="text"
                            placeholder="From (e.g. Central Station)"
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
                        <input
                            type="text"
                            placeholder="To (e.g. Airport Terminal 1)"
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    onClick={fetchRoutes}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    {loading ? <Loader className="animate-spin" /> : 'Find Best Routes'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-100 pb-2 overflow-x-auto">
                {['routes', 'stops', 'metro'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 font-bold capitalize whitespace-nowrap transition-all ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {tab === 'routes' ? 'Route Options' : tab === 'stops' ? 'Nearest Stops' : 'Metro Map'}
                    </button>
                ))}
            </div>

            {/* Content Section */}
            <AnimatePresence mode="wait">
                {activeTab === 'routes' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {routes.length > 0 ? (
                            routes.map((route, idx) => (
                                <div key={idx} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <div
                                        className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                                        onClick={() => setExpandedRoute(expandedRoute === idx ? null : idx)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 font-black text-xl">
                                                {route.totalDuration} <span className="text-xs uppercase">min</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {route.steps.map((step, i) => (
                                                        <React.Fragment key={i}>
                                                            {getTransportIcon(step.type)}
                                                            {i < route.steps.length - 1 && <ArrowRight size={14} className="text-gray-300" />}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-500 font-medium">
                                                    {route.numTransfers} transfers • {route.totalDistance} km
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-gray-900">${route.fare}</div>
                                            <button className="text-indigo-600 text-sm font-bold hover:underline">View Details</button>
                                        </div>
                                    </div>

                                    {expandedRoute === idx && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            className="border-t border-gray-50 bg-gray-50/50 p-6 space-y-6"
                                        >
                                            {route.steps.map((step, i) => (
                                                <div key={i} className="flex gap-4 relative">
                                                    {i < route.steps.length - 1 && (
                                                        <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-gray-200 border-dashed border-l"></div>
                                                    )}
                                                    <div className={`z-10 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${step.type === 'walking' ? 'bg-gray-400' : 'bg-indigo-600'}`}>
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold flex items-center gap-1">
                                                                {getTransportIcon(step.type)} {step.type}
                                                            </span>
                                                            {step.lineNumber && (
                                                                <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                                    {step.lineNumber}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-700 text-sm font-medium">{step.instruction}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{step.duration} • {step.distance}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <button className="w-full mt-4 flex items-center justify-center gap-2 text-indigo-600 font-bold py-3 bg-white border border-indigo-100 rounded-2xl hover:bg-indigo-50 transition-colors">
                                                <Save size={18} /> Save to TripPlan
                                            </button>
                                        </motion.div>
                                    )}
                                </div>
                            ))
                        ) : !loading && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 italic text-gray-400">
                                Enter locations to find public transport routes...
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'stops' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-black text-lg">Central Subway Station</h3>
                                        <p className="text-xs text-gray-400 font-medium">350m • 5 min walk</p>
                                    </div>
                                    <div className="bg-red-50 text-red-600 p-2 rounded-xl">
                                        <Train size={20} />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-bold uppercase">Blue Line</span>
                                    <span className="bg-yellow-500 text-white text-[10px] px-2 py-1 rounded font-bold uppercase">Yellow Line</span>
                                    <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded font-bold uppercase">Bus 142</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'metro' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-8"
                    >
                        <MapIcon size={64} className="text-indigo-100 mb-4" />
                        <h2 className="text-2xl font-black mb-2">Interactive Metro Map</h2>
                        <p className="text-gray-500 max-w-sm">
                            Real-time interactive metro maps for major worldwide cities coming soon to the web portal.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PublicTransport;
