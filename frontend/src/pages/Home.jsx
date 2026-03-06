import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Search, Star, Shield, Zap, Heart, Lock, Check, X } from 'lucide-react';
import { getPlaceImage, imgErrorHandler } from '../utils/imageUtils';

export default function Home() {
    const { isLoggedIn, isPremium } = useAuth();
    const navigate = useNavigate();

    const [places, setPlaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Basic Filter State
    const [filters, setFilters] = useState({
        category: '',
        budget: '',
        season: ''
    });

    // Fetch featured places on initial load
    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                setIsLoading(true);
                // Build query string
                const queryParams = new URLSearchParams();
                if (filters.category) queryParams.append('category', filters.category);
                if (filters.budget) queryParams.append('budget', filters.budget);
                if (filters.season) queryParams.append('season', filters.season);

                const res = await axios.get(`/api/places?${queryParams.toString()}`);

                // Handle both old array response and new envelope response
                if (res.data && res.data.success) {
                    setPlaces(res.data.data || []);
                } else if (Array.isArray(res.data)) {
                    setPlaces(res.data);
                } else {
                    setPlaces([]);
                }
            } catch (error) {
                console.error('Error fetching places:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaces();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearchClick = () => {
        if (isLoggedIn) {
            navigate('/explore');
        } else {
            document.getElementById('explore-section').scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* 1. Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80"
                        alt="Travel background"
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-indigo-900/80 to-purple-900/70 mix-blend-multiply"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up">
                        Find Your Perfect <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Travel Destination</span>
                    </h1>
                    <p className="mt-4 text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
                        Answer a few questions and we'll match you with your ideal trip based on your personal preferences.
                    </p>

                    <div className="animate-fade-in-up animation-delay-400">
                        <button
                            onClick={handleSearchClick}
                            className="px-8 py-4 text-lg font-bold bg-white text-indigo-600 rounded-full hover:bg-blue-50 hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center mx-auto"
                        >
                            Start Exploring <Search className="ml-2 w-5 h-5" />
                        </button>
                    </div>

                    {/* Floating Stats (Animated) */}
                    <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-8 max-w-4xl mx-auto animate-fade-in-up animation-delay-600">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="text-4xl font-bold text-teal-300 mb-1">500+</div>
                            <div className="text-sm font-medium text-blue-100 uppercase tracking-wider">Destinations</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform hover:-translate-y-2 transition-transform duration-300 delay-100">
                            <div className="text-4xl font-bold text-purple-300 mb-1">50+</div>
                            <div className="text-sm font-medium text-blue-100 uppercase tracking-wider">Countries</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform hover:-translate-y-2 transition-transform duration-300 delay-200">
                            <div className="text-4xl font-bold text-pink-300 mb-1">10k+</div>
                            <div className="text-sm font-medium text-blue-100 uppercase tracking-wider">Happy Travelers</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Basic Filter Bar (For non-logged in or free) */}
            {(!isLoggedIn || !isPremium) && (
                <section id="explore-section" className="relative -mt-10 z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Travel Type</label>
                                <select
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    className="w-full border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-gray-50 border p-3 h-12"
                                >
                                    <option value="">Any Category</option>
                                    <option value="beach">Beach</option>
                                    <option value="mountain">Mountain</option>
                                    <option value="city">City</option>
                                    <option value="adventure">Adventure</option>
                                    <option value="cultural">Cultural</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                                <select
                                    name="budget"
                                    value={filters.budget}
                                    onChange={handleFilterChange}
                                    className="w-full border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-gray-50 border p-3 h-12"
                                >
                                    <option value="">Any Budget</option>
                                    <option value="budget">Budget-friendly</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="luxury">Luxury</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                                <select
                                    name="season"
                                    value={filters.season}
                                    onChange={handleFilterChange}
                                    className="w-full border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-gray-50 border p-3 h-12"
                                >
                                    <option value="">Any Season</option>
                                    <option value="summer">Summer</option>
                                    <option value="winter">Winter</option>
                                    <option value="spring">Spring</option>
                                    <option value="autumn">Autumn</option>
                                </select>
                            </div>

                            <div>
                                <button
                                    onClick={() => !isLoggedIn && navigate('/login')}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-md flex items-center justify-center"
                                >
                                    Find Destinations
                                </button>
                            </div>
                        </div>

                        {!document.cookie.includes('token') && !isLoggedIn && (
                            <div className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center">
                                <Lock className="w-4 h-4 mr-1 text-amber-500" />
                                <span>Login to unlock 8 more filters and see all 50+ destinations</span>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 3. Destination Cards Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Trending Destinations</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover the most highly-rated spots currently selected by our community of travelers.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {places.slice(0, 6).map((place) => (
                                <div key={place._id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group">
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={getPlaceImage(place)}
                                            alt={place.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={imgErrorHandler(place.category)}
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 uppercase tracking-wide">
                                            {place.category}
                                        </div>
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center text-amber-500">
                                            <Star className="w-3 h-3 mr-1 fill-amber-500" />
                                            {place.rating}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{place.name}</h3>
                                        </div>
                                        <div className="flex items-center text-gray-500 mb-4 text-sm">
                                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                            {place.city}, {place.country}
                                        </div>
                                        <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">
                                            {place.description}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                            <span className="text-sm font-medium text-gray-500 capitalize px-2 py-1 bg-gray-100 rounded-md">
                                                {place.budget} Budget
                                            </span>
                                            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
                                                View Match
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Blurred Lock Overlay for non-logged in users viewing limited places */}
                        {!isLoggedIn && (
                            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent flex flex-col items-center justify-end pb-10 z-10">
                                <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-200 text-center max-w-md mx-auto transform translate-y-4 filter drop-shadow-lg">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <Lock className="w-6 h-6 text-indigo-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">50+ more destinations waiting for you</h3>
                                    <p className="text-gray-600 mb-6 text-sm">Sign in today to unlock full access, advanced filters, and begin building your bucket list.</p>
                                    <Link
                                        to="/login"
                                        className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md"
                                    >
                                        Login to See All
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* 4. Why SmartTrip Section */}
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why SmartTrip?</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            We take the guesswork out of vacation planning by matching you with the mathematically perfect destination.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center mb-6 transform rotate-3">
                                <Heart className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Hyper-Personalized</h3>
                            <p className="text-gray-600">Our algorithm looks at 12 distinct data points to ensure you never end up tracking snow in your beach sandals.</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-2xl flex items-center justify-center mb-6 transform -rotate-3">
                                <Zap className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Matchmaking</h3>
                            <p className="text-gray-600">Stop scrolling through endless blogs. Instantly find out where you should go based on real metrics and verified reviews.</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto bg-teal-100 rounded-2xl flex items-center justify-center mb-6 transform rotate-3">
                                <Shield className="w-8 h-8 text-teal-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Curated Quality</h3>
                            <p className="text-gray-600">We feature only the highest-rated destinations worldwide. No tourist traps, just pure verified excellence.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Pricing Teaser */}
            {!isPremium && (
                <section className="py-20 bg-gray-50 border-t border-gray-200">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Upgrade Your Adventure</h2>
                            <p className="text-lg text-gray-600">Choose the plan that fits your wanderlust.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
                            {/* Free Plan */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h3 className="text-xl font-semibold text-gray-500 mb-2">Basic Explorer</h3>
                                <div className="text-4xl font-bold text-gray-900 mb-6">Free</div>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center text-gray-600">
                                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        Access to 50+ basic destinations
                                    </li>
                                    <li className="flex items-center text-gray-600">
                                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        Basic filtering (Category, Budget, Season)
                                    </li>
                                    <li className="flex items-center text-gray-600">
                                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        Save up to 10 favorite places
                                    </li>
                                    <li className="flex items-center text-gray-400 opacity-50">
                                        <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                                        Advanced weather & climate filtering
                                    </li>
                                </ul>
                                <Link to="/register" className="block w-full text-center py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors">
                                    Current Plan
                                </Link>
                            </div>

                            {/* Premium Plan */}
                            <div className="bg-gradient-to-b from-indigo-900 to-purple-900 rounded-2xl shadow-xl border-t-4 border-amber-400 p-8 transform md:scale-105 relative">
                                <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">
                                    Most Popular
                                </div>
                                <h3 className="text-xl font-semibold text-indigo-200 mb-2">SmartTrip Premium</h3>
                                <div className="text-4xl font-bold text-white mb-2">$9.99<span className="text-lg text-indigo-300 font-normal">/mo</span></div>
                                <p className="text-indigo-200 text-sm mb-6">Or save 33% with an annual plan.</p>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center text-white">
                                        <Check className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
                                        <span className="font-semibold text-amber-100">Full access</span> to all filters & algorithm capabilities
                                    </li>
                                    <li className="flex items-center text-indigo-100">
                                        <Check className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
                                        Unlimited saved places & bucket lists
                                    </li>
                                    <li className="flex items-center text-indigo-100">
                                        <Check className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
                                        Early access to new destinations
                                    </li>
                                    <li className="flex items-center text-indigo-100">
                                        <Check className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
                                        Priority customer support
                                    </li>
                                </ul>
                                <Link to="/pricing" className="block w-full text-center py-3 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                    Upgrade to Premium
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
