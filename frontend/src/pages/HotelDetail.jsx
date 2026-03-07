import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    MapPin, Star, Wifi, Coffee, Waves, Shield,
    ChevronLeft, Mail, Phone, Clock, CreditCard,
    CheckCircle2, Info, ArrowRight, Share2, Heart,
    Utensils, Tv, Wind, Car, Dumbbell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AMENITY_MAP = {
    'WiFi': <Wifi size={18} />,
    'Wifi': <Wifi size={18} />,
    'Pool': <Waves size={18} />,
    'Gym': <Dumbbell size={18} />,
    'Breakfast': <Coffee size={18} />,
    'AC': <Wind size={18} />,
    'TV': <Tv size={18} />,
    'Restaurant': <Utensils size={18} />,
    'Spa': <SparklesIcon />, // Custom or fallback
    'Parking': <Car size={18} />,
};

function SparklesIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>;
}

export default function HotelDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const res = await axios.get(`/api/hotels/${id}`);
                setHotel(res.data);
                setLoading(false);
            } catch (err) {
                toast.error('Failed to load hotel details');
                navigate(-1);
            }
        };
        fetchHotel();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!hotel) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Navigation Header */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => {
                            if (window.history.length > 1) {
                                navigate(-1);
                            } else {
                                navigate('/explore');
                            }
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 font-bold text-gray-600"
                    >
                        <ChevronLeft size={20} /> Back
                    </button>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <Share2 size={20} />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <Heart size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Gallery & Details */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Hero Gallery */}
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white"
                            >
                                <img
                                    src={hotel.images?.[activeImage] || 'https://via.placeholder.com/1200x800?text=No+Image+Available'}
                                    alt={hotel.name}
                                    className="w-full h-full object-cover"
                                />
                                {hotel.isPartner && (
                                    <div className="absolute top-6 left-6">
                                        <span className="bg-amber-400 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center shadow-xl">
                                            <Star size={14} className="mr-2 fill-white" /> Recommended Partner
                                        </span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Thumbnails */}
                            {hotel.images?.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {hotel.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 transition-all ${activeImage === idx ? 'ring-4 ring-indigo-600 ring-offset-2 scale-95' : 'opacity-60 hover:opacity-100'}`}
                                        >
                                            <img src={img} className="w-full h-full object-cover" alt="" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Title & Stats Card */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                                            {hotel.category}
                                        </span>
                                        {hotel.partnerTier && (
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">
                                                {hotel.partnerTier} Tier
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-4xl font-black text-gray-900 leading-tight mb-2">{hotel.name}</h1>
                                    <div className="flex items-center text-gray-500 font-bold">
                                        <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                                        {hotel.address}, {hotel.city}, {hotel.country}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl border border-amber-100 font-black">
                                        <Star size={18} className="fill-current" />
                                        <span className="text-xl">{hotel.rating || '4.5'}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">{hotel.totalReviews || '120+'} Verified Reviews</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Clock size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Check-in</span>
                                        <span className="text-sm font-black text-gray-800">{hotel.checkInTime || '12:00 PM'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Clock size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Check-out</span>
                                        <span className="text-sm font-black text-gray-800">{hotel.checkOutTime || '11:00 AM'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Shield size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                                        <span className="text-sm font-black text-gray-800 capitalize">{hotel.subscriptionStatus || 'Active'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <CreditCard size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Payment</span>
                                        <span className="text-sm font-black text-gray-800">Prepaid/Desk</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                <Info className="text-indigo-500" size={24} /> About this Property
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-lg font-medium">
                                {hotel.description}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 mb-6">Premium Amenities</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {(hotel.amenities || []).map((amenity, idx) => (
                                    <div key={idx} className="flex items-center gap-3 group">
                                        <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-transparent group-hover:border-indigo-100">
                                            {AMENITY_MAP[amenity] || <CheckCircle2 size={18} />}
                                        </div>
                                        <span className="font-bold text-gray-600 text-sm">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 mb-6">Contact & Support</h3>
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-100 transition-all group">
                                    <div className="w-12 h-12 bg-white text-indigo-600 rounded-xl shadow-sm flex items-center justify-center">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Email Address</span>
                                        <span className="font-black text-gray-800">{hotel.contactEmail || 'reception@property.com'}</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-100 transition-all group">
                                    <div className="w-12 h-12 bg-white text-emerald-600 rounded-xl shadow-sm flex items-center justify-center">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Phone Number</span>
                                        <span className="font-black text-gray-800">{hotel.contactPhone || '+91 99887 76655'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border border-gray-100">
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-4xl font-black text-gray-900">₹{hotel.pricePerNight?.toLocaleString()}</span>
                                <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">/ Night</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm font-bold p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-gray-500">Service Fee</span>
                                    <span className="text-emerald-600">INCLUDED</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-gray-500">Taxes & Charges</span>
                                    <span className="text-emerald-600">INCLUDED</span>
                                </div>
                            </div>

                            <Link
                                to="/plan-trip"
                                state={{
                                    destination: hotel.placeId,
                                    selectedHotel: hotel
                                }}
                                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-1 mb-4"
                            >
                                Book this Property <ArrowRight size={18} />
                            </Link>

                            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                                🔒 Secure booking facilitated by SmartTrip
                            </p>
                        </div>

                        {/* Trust Badges */}
                        <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2rem] text-white">
                            <h4 className="font-black text-sm uppercase tracking-widest mb-6 text-indigo-400">Why choose us?</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                    <span className="text-xs font-bold text-gray-300">Curated by SmartTrip Admins</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                    <span className="text-xs font-bold text-gray-300">Verified Partner Network</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                    <span className="text-xs font-bold text-gray-300">Best Price Guarantee</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
