import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    Check,
    ChevronRight,
    ChevronLeft,
    MapPin,
    Calendar,
    Users,
    Hotel,
    Plane,
    Train,
    Bus,
    User as GuideIcon,
    FileText,
    ShieldCheck,
    AlertCircle,
    Star,
    Wifi,
    Coffee,
    Waves,
    Search,
    Download,
    Share2,
    Lock,
    ArrowRight
} from 'lucide-react';

export default function TripPlanner() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isPremium } = useAuth();

    // Passed from Explore or Home page
    const destination = location.state?.destination;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);

    // Form State
    const [tripDetails, setTripDetails] = useState({
        title: '',
        startDate: '',
        endDate: '',
        travelers: 1,
        selectedHotel: null,
        transport: {
            type: 'flight', // flight, train, bus
            options: [],
            selected: null,
            bookingRef: ''
        },
        selectedGuide: null,
    });

    // Data State
    const [hotels, setHotels] = useState([]);
    const [guides, setGuides] = useState([]);
    const [nearbyStores, setNearbyStores] = useState([]);

    useEffect(() => {
        if (!destination) {
            toast.error('No destination selected. Starting from Explore.');
            navigate('/explore');
            return;
        }
        fetchStats();
    }, [destination]);

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/trips/stats');
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const steps = [
        { id: 1, name: 'Destination', icon: MapPin },
        { id: 2, name: 'Hotel', icon: Hotel },
        { id: 3, name: 'Transport', icon: Plane },
        { id: 4, name: 'Guide', icon: GuideIcon },
        { id: 5, name: 'Summary', icon: FileText },
    ];

    const handleNext = () => {
        if (step === 1) {
            if (!tripDetails.title || !tripDetails.startDate || !tripDetails.endDate) {
                toast.error('Please fill in all details');
                return;
            }
            fetchHotels();
        }
        if (step === 2) fetchTransport(); // Mock or real depending on selection
        if (step === 3) fetchGuides();
        if (step === 4) fetchNearby();

        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/hotels?placeId=${destination._id}`);
            setHotels(res.data);
        } catch (error) {
            toast.error('Failed to load hotels');
        } finally {
            setLoading(false);
        }
    };

    const fetchTransport = () => {
        // Logic for transport search would go here (Axios calls to /api/transport/...)
        // For now we use the state as placeholder
    };

    const fetchGuides = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/guides?city=${destination.city}`);
            setGuides(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNearby = async () => {
        try {
            const res = await axios.get(`/api/nearby/destination/${destination._id}`);
            setNearbyStores(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const saveTrip = async () => {
        try {
            setLoading(true);
            const res = await axios.post('/api/trips', {
                title: tripDetails.title,
                destinationId: destination._id,
                startDate: tripDetails.startDate,
                endDate: tripDetails.endDate,
                notes: `Trip for ${tripDetails.travelers} travelers.`
            });

            const tripId = res.data._id;

            // Save sub-resources if selected
            if (tripDetails.selectedHotel) {
                await axios.put(`/api/trips/${tripId}`, {
                    hotel: {
                        hotelId: tripDetails.selectedHotel._id,
                        checkIn: tripDetails.startDate,
                        checkOut: tripDetails.endDate
                    }
                });
            }

            toast.success('Trip planned and saved successfully! ✈️');
            navigate('/saved');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving trip');
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERING HELPERS ---

    const renderStep1 = () => (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
                        <img src={destination.image} alt="" className="w-full h-64 object-cover rounded-2xl mb-6 shadow-md" />
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{destination.name}</h2>
                        <div className="flex items-center text-gray-500 mb-4">
                            <MapPin className="w-4 h-4 mr-1" /> {destination.city}, {destination.country}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{destination.category}</span>
                            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{destination.budget}</span>
                        </div>
                    </div>

                    {stats && (
                        <div className={`p-6 rounded-3xl border-2 flex items-start ${stats.tripsRemaining === 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                            <AlertCircle className={`w-6 h-6 mr-3 mt-1 ${stats.tripsRemaining === 0 ? 'text-red-500' : 'text-green-500'}`} />
                            <div>
                                <h4 className="font-bold text-gray-900">Trip Entitlement</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    {user.role === 'free'
                                        ? `You have 1 free trip. After this, upgrade to Premium to plan more.`
                                        : `${stats.tripsRemaining} of 5 premium trips remaining in this cycle.`
                                    }
                                </p>
                                {stats.tripsRemaining === 0 && (
                                    <Link to="/pricing" className="text-blue-600 font-bold text-sm mt-3 inline-block">Upgrade Now &rarr;</Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Basic Trip Details</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Trip Title</label>
                            <input
                                type="text"
                                placeholder="Summer Getaway 2024"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={tripDetails.title}
                                onChange={(e) => setTripDetails({ ...tripDetails, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={tripDetails.startDate}
                                        onChange={(e) => setTripDetails({ ...tripDetails, startDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={tripDetails.endDate}
                                        onChange={(e) => setTripDetails({ ...tripDetails, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Number of Travelers</label>
                            <div className="flex bg-gray-50 rounded-2xl p-1 border border-gray-200">
                                {[1, 2, 3, 4, 5, 6].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setTripDetails({ ...tripDetails, travelers: num })}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${tripDetails.travelers === num ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {num}{num === 6 ? '+' : ''}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={stats?.tripsRemaining === 0}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-4"
                        >
                            Construct Itinerary <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Select Accommodation</h2>
                    <p className="text-gray-500 mt-1">Found {hotels.length} stays matching your destination.</p>
                </div>
                <button
                    onClick={handleNext}
                    className="text-gray-400 hover:text-gray-600 font-bold flex items-center gap-1 transition-colors"
                >
                    Skip for now <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {hotels.map(hotel => (
                    <div key={hotel._id} className={`bg-white rounded-3xl overflow-hidden border-2 transition-all duration-300 ${tripDetails.selectedHotel?._id === hotel._id ? 'border-blue-500 shadow-xl' : 'border-gray-100 hover:border-blue-100 shadow-sm'}`}>
                        <div className="relative h-56">
                            <img src={hotel.image || hotel.images?.[0]} alt="" className="w-full h-full object-cover" />
                            {hotel.isPartner && (
                                <div className="absolute top-4 left-4">
                                    <span className="bg-amber-400 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg animate-pulse">
                                        <Star className="w-3 h-3 mr-1 fill-white" /> Recommended Partner
                                    </span>
                                </div>
                            )}
                            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm">
                                <span className="text-sm font-black text-gray-900">${hotel.pricePerNight}</span>
                                <span className="text-[10px] text-gray-500 ml-1">/ night</span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900">{hotel.name}</h3>
                                <div className="flex items-center text-amber-500 text-xs font-bold">
                                    <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" /> {hotel.rating}
                                </div>
                            </div>

                            <div className="flex items-center text-gray-500 text-sm mb-4">
                                <MapPin className="w-3.5 h-3.5 mr-1" /> {hotel.city} &bull; 1.2km from center
                            </div>

                            <div className="flex gap-4 mb-6">
                                <Wifi className="w-4 h-4 text-gray-300" />
                                <Coffee className="w-4 h-4 text-gray-300" />
                                <Waves className="w-4 h-4 text-gray-300" />
                            </div>

                            <button
                                onClick={() => setTripDetails({ ...tripDetails, selectedHotel: hotel })}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${tripDetails.selectedHotel?._id === hotel._id ? 'bg-blue-600 text-white shadow-inner' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                            >
                                {tripDetails.selectedHotel?._id === hotel._id ? 'Selected stays' : 'Select Hotel'}
                            </button>
                        </div>
                    </div>
                ))}

                {!isPremium && hotels.length >= 5 && (
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 flex flex-col justify-center text-center text-white relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-10 transform rotate-12 group-hover:rotate-45 transition-transform duration-700">
                            <Hotel className="w-48 h-48" />
                        </div>
                        <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-black mb-2">Unlock 45+ More Hotels</h3>
                        <p className="text-blue-100 text-sm mb-6">Premium members can see all curated properties and advanced filters.</p>
                        <Link to="/pricing" className="bg-white text-blue-600 py-3 px-6 rounded-xl font-bold hover:scale-105 transition-all">Go Premium</Link>
                    </div>
                )}
            </div>

            <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
                <button onClick={handleBack} className="px-8 py-3 text-gray-400 font-bold hover:text-gray-600 flex items-center gap-2"><ChevronLeft /> Back</button>
                <button onClick={handleNext} className="px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg flex items-center gap-2">Next Step <ChevronRight /></button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Transport Logistics</h2>
                    <p className="text-gray-500 mt-1">Find the best way to reach your destination.</p>
                </div>
                <button onClick={handleNext} className="text-gray-400 hover:text-gray-600 font-bold flex items-center gap-1 transition-colors">
                    Skip for now <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {['flight', 'train', 'bus'].map(type => (
                    <button
                        key={type}
                        onClick={() => setTripDetails({ ...tripDetails, transport: { ...tripDetails.transport, type } })}
                        className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all duration-300 ${tripDetails.transport.type === type ? 'border-blue-500 bg-blue-50/50 shadow-md' : 'border-gray-100 hover:border-blue-100'}`}
                    >
                        <div className={`p-4 rounded-2xl ${tripDetails.transport.type === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {type === 'flight' ? <Plane /> : type === 'train' ? <Train /> : <Bus />}
                        </div>
                        <span className={`font-bold uppercase tracking-widest text-sm ${tripDetails.transport.type === type ? 'text-blue-600' : 'text-gray-400'}`}>{type}</span>
                    </button>
                ))}
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center py-20">
                <Search className="w-16 h-16 text-blue-100 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Search {tripDetails.transport.type}s</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">We use real-time data from Amadeus & Railway APIs to find the best routes for you.</p>

                <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                    <input type="text" placeholder="From (City/IATA)" className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                    <button className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg">Check Availability</button>
                </div>

                <div className="mt-12 pt-12 border-t border-gray-100 text-left max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-900">Have you already booked?</h4>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Update Trip</span>
                    </div>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="e.g. AB12345DEF"
                            className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none"
                            value={tripDetails.transport.bookingRef}
                            onChange={(e) => setTripDetails({ ...tripDetails, transport: { ...tripDetails.transport, bookingRef: e.target.value } })}
                        />
                        <button className="px-6 rounded-2xl bg-gray-900 text-white font-bold">Add Ref</button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
                <button onClick={handleBack} className="px-8 py-3 text-gray-400 font-bold hover:text-gray-600 flex items-center gap-2"><ChevronLeft /> Back</button>
                <button onClick={handleNext} className="px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg flex items-center gap-2">Next Step <ChevronRight /></button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hire Local Experts</h2>
                    <p className="text-gray-500 mt-1">Get an authentic experience with a verified guide.</p>
                </div>
                <button onClick={handleNext} className="text-gray-400 hover:text-gray-600 font-bold flex items-center gap-1 transition-colors">
                    Skip for now <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {!isPremium ? (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12 text-center max-w-3xl mx-auto">
                    <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                        <GuideIcon className="w-12 h-12 text-amber-500" />
                        <Lock className="absolute -bottom-2 -right-2 w-8 h-8 text-red-500 bg-white p-1.5 rounded-full shadow-lg border-2 border-red-50" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Expert Marketplace is Locked</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                        Booking local guides is an exclusive feature for our Premium members.
                        Connect with historical experts, photographers, and local foodies safely through SmartTrip.
                    </p>
                    <Link to="/pricing" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                        Upgrade to Premium <Star className="ml-2 w-5 h-5 fill-white" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {guides.map(guide => (
                        <div key={guide._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all group">
                            <div className="flex items-center gap-4 mb-6">
                                <img src={guide.profilePhoto || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"} alt="" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all" />
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{guide.name}</h3>
                                    <div className="flex items-center text-amber-500 text-xs font-bold mt-1">
                                        <Star className="w-3.5 h-3.5 mr-1 fill-amber-500" /> {guide.rating} ({guide.totalReviews})
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6 h-16 overflow-hidden">
                                {guide.specializations.map(s => (
                                    <span key={s} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">{s}</span>
                                ))}
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center mb-6">
                                <div>
                                    <span className="text-sm text-gray-500 font-medium">Daily Rate</span>
                                    <div className="text-xl font-black text-gray-900">${guide.pricePerDay}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-gray-500 font-medium">Experience</span>
                                    <div className="text-sm font-bold text-gray-900">{guide.experience} Years</div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setTripDetails({ ...tripDetails, selectedGuide: guide });
                                    toast.success(`Selected ${guide.name} as your guide!`);
                                }}
                                className={`w-full py-4 rounded-xl font-bold transition-all ${tripDetails.selectedGuide?._id === guide._id ? 'bg-green-100 text-green-700' : 'bg-gray-900 text-white hover:bg-black'}`}
                            >
                                {tripDetails.selectedGuide?._id === guide._id ? 'Expert Selected ✓' : 'Request Profile'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
                <button onClick={handleBack} className="px-8 py-3 text-gray-400 font-bold hover:text-gray-600 flex items-center gap-2"><ChevronLeft /> Back</button>
                <button onClick={handleNext} className="px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg flex items-center gap-2">Final Summary <ChevronRight /></button>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Confirm Your Itinerary</h2>
                <p className="text-gray-500 text-lg">Your master plan is ready. Review and finalize to secure bookings.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-10">
                <div className="relative h-64">
                    <img src={destination.image} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent flex flex-col justify-end p-8">
                        <h3 className="text-4xl font-black text-white mb-2">{tripDetails.title}</h3>
                        <p className="text-blue-100 flex items-center gap-2 font-medium">
                            <MapPin className="w-4 h-4" /> {destination.name} &bull; <Calendar className="w-4 h-4" /> {tripDetails.startDate} to {tripDetails.endDate}
                        </p>
                    </div>
                </div>

                <div className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Column 1: Core Bookings */}
                        <div className="space-y-10">
                            <section>
                                <h4 className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                                    <Hotel className="w-4 h-4" /> Stay Configuration
                                </h4>
                                {tripDetails.selectedHotel ? (
                                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                                        <img src={tripDetails.selectedHotel.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                                        <div>
                                            <p className="font-bold text-gray-900">{tripDetails.selectedHotel.name}</p>
                                            <p className="text-xs text-gray-500">${tripDetails.selectedHotel.pricePerNight} / Nightly Rate</p>
                                        </div>
                                    </div>
                                ) : <p className="text-gray-400 italic text-sm">No hotel selected.</p>}
                            </section>

                            <section>
                                <h4 className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                                    {tripDetails.transport.type === 'flight' ? <Plane className="w-4 h-4" /> : <Train className="w-4 h-4" />} Departure Route
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-900 uppercase">{tripDetails.transport.type}</p>
                                        <p className="text-xs text-gray-500">Ref: {tripDetails.transport.bookingRef || 'Not added'}</p>
                                    </div>
                                    <Lock className="w-4 h-4 text-gray-200" />
                                </div>
                            </section>
                        </div>

                        {/* Column 2: Enhancements */}
                        <div className="space-y-10">
                            <section>
                                <h4 className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                                    <GuideIcon className="w-4 h-4" /> Local Expert
                                </h4>
                                {tripDetails.selectedGuide ? (
                                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                                        <img src={tripDetails.selectedGuide.profilePhoto} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                                        <div>
                                            <p className="font-bold text-gray-900">{tripDetails.selectedGuide.name}</p>
                                            <div className="flex items-center text-amber-500 text-[10px] font-bold">
                                                <Star className="w-3 h-3 mr-1 fill-amber-500" /> {tripDetails.selectedGuide.rating} Verified
                                            </div>
                                        </div>
                                    </div>
                                ) : <p className="text-gray-400 italic text-sm">No guide requested.</p>}
                            </section>

                            <section>
                                <h4 className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                                    <Search className="w-4 h-4" /> Recommended Nearby
                                </h4>
                                <div className="flex -space-x-3">
                                    {nearbyStores.slice(0, 4).map((s, i) => (
                                        <img key={i} src={s.images?.[0]} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="" />
                                    ))}
                                    {nearbyStores.length > 4 && (
                                        <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">+{nearbyStores.length - 4}</div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Est. Travel Budget</p>
                            <div className="text-4xl font-black text-gray-900 ">$1,240 <span className="text-lg font-normal text-gray-400">USD</span></div>
                        </div>
                        <div className="flex gap-3">
                            <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-600 transition-all"><Download className="w-5 h-5" /></button>
                            <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-600 transition-all"><Share2 className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={saveTrip}
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-3xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    {loading ? 'Securing Bookings...' : 'Finalize Itinerary & Save Trip'}
                </button>
                <button onClick={handleBack} className="text-gray-400 font-bold hover:text-gray-600 py-2">Go Back and Edit</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Progress Stepper */}
                <div className="max-w-4xl mx-auto mb-16 px-4">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>
                        <div className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 -translate-y-1/2 transition-all duration-500 rounded-full" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>

                        {steps.map((s) => (
                            <div key={s.id} className="flex flex-col items-center group">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 relative ${step >= s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
                                    <s.icon className={`w-5 h-5 ${step === s.id ? 'animate-pulse' : ''}`} />
                                    {step > s.id && <div className="absolute -right-1 -top-1 bg-green-500 text-white p-0.5 rounded-full ring-2 ring-white"><Check className="w-3 h-3" /></div>}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest mt-3 transition-colors ${step >= s.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {s.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dynamic Step Content */}
                <div className="max-w-6xl mx-auto">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                </div>

            </div>
        </div>
    );
}
