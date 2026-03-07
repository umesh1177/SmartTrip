import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Clock, MapPin, Wallet, Calendar, PieChart, Activity, CheckCircle, ChevronRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const TripTimeline = () => {
    const { tripId } = useParams();
    const [trip, setTrip] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [budgetData, setBudgetData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tripRes, timelineRes, budgetRes] = await Promise.all([
                    axios.get(`/api/trips/${tripId}`),
                    axios.get(`/api/trips/${tripId}/timeline`),
                    axios.get(`/api/trips/${tripId}/budget`)
                ]);
                setTrip(tripRes.data);
                setTimeline(timelineRes.data);
                setBudgetData(budgetRes.data);
            } catch (error) {
                console.error('Error fetching timeline data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [tripId]);

    const getActivityIcon = (type) => {
        switch (type) {
            case 'cab_booked': return <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><TrendingUp size={16} /></div>;
            case 'hotel_booked': return <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Clock size={16} /></div>;
            case 'review_posted': return <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><Activity size={16} /></div>;
            case 'check_in': return <div className="p-2 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={16} /></div>;
            default: return <div className="p-2 bg-gray-100 text-gray-600 rounded-lg"><Activity size={16} /></div>;
        }
    };

    if (loading) return <div className="flex items-center justify-center h-96">Loading Timeline...</div>;
    if (!trip || !budgetData) return <div className="flex items-center justify-center h-96 text-gray-500 font-bold">Trip data unavailable. Please try again later.</div>;

    const budgetPercent = budgetData.total > 0 ? (budgetData.spent / budgetData.total) * 100 : 0;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row gap-8 mb-12">
                {/* Trip Info & Budget Header */}
                <div className="flex-grow">
                    <h1 className="text-4xl font-black mb-2">{trip.title}</h1>
                    <div className="flex items-center gap-4 text-gray-500 font-medium mb-6">
                        <span className="flex items-center gap-1"><Calendar size={18} /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><MapPin size={18} /> {trip.destination.city}</span>
                        {trip.isActive && <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">Live Trip</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase">Total Budget</span>
                            <div className="text-2xl font-black text-gray-900">${budgetData.total}</div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase">Spent So Far</span>
                            <div className="text-2xl font-black text-indigo-600">${budgetData.spent}</div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase">Remaining</span>
                            <div className="text-2xl font-black text-green-600">${budgetData.remaining}</div>
                        </div>
                    </div>
                </div>

                {/* Budget Gauge */}
                <div className="w-full md:w-64 bg-white p-8 rounded-[40px] shadow-xl shadow-indigo-50 border border-gray-100 flex flex-col items-center justify-center">
                    <div className="relative w-32 h-32 mb-4">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle className="text-gray-100 stroke-current" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" />
                            <circle
                                className={`${budgetPercent > 90 ? 'text-red-500' : 'text-indigo-600'} stroke-current`}
                                strokeWidth="10"
                                strokeDasharray={`${budgetPercent * 2.51}, 251.2`}
                                strokeLinecap="round"
                                fill="transparent" r="40" cx="50" cy="50"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black">{Math.round(budgetPercent)}%</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Used</span>
                        </div>
                    </div>
                    {budgetPercent > 80 && (
                        <div className="flex items-center gap-2 text-red-500 font-bold text-xs bg-red-50 px-3 py-1 rounded-full">
                            <AlertTriangle size={14} /> Low Budget
                        </div>
                    )}
                </div>
            </div>

            {/* Vertical Timeline */}
            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {timeline.map((day, dayIdx) => (
                    <div key={dayIdx} className="relative">
                        <div className="md:flex items-center justify-center mb-8">
                            <div className="bg-indigo-600 text-white px-6 py-2 rounded-full font-black shadow-lg shadow-indigo-100 z-10 relative">
                                {day.date}
                            </div>
                        </div>

                        <div className="space-y-8">
                            {day.activities.map((activity, actIdx) => (
                                <div key={actIdx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group`}>
                                    {/* Dot */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-100 group-hover:bg-indigo-600 transition-colors shadow-sm z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>

                                    {/* Content Card */}
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-50 transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{activity.time}</span>
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 mb-1">{activity.title}</h3>
                                        <p className="text-sm text-gray-500 font-medium mb-4">{activity.description}</p>

                                        {activity.location && (
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 p-3 rounded-2xl">
                                                <MapPin size={14} /> {activity.location.address}
                                                <ChevronRight size={14} className="ml-auto" />
                                            </div>
                                        )}

                                        {activity.metadata?.photos?.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2 mt-4">
                                                {activity.metadata.photos.map((p, i) => (
                                                    <img key={i} src={p} alt="activity" className="w-full h-16 object-cover rounded-xl" />
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TripTimeline;
