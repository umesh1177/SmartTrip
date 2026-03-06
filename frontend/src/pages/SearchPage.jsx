import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Star, Loader2, TrendingUp, Globe2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categoryColors = {
    beach: 'bg-cyan-100 text-cyan-700',
    mountain: 'bg-emerald-100 text-emerald-700',
    city: 'bg-violet-100 text-violet-700',
    cultural: 'bg-amber-100 text-amber-700',
    adventure: 'bg-orange-100 text-orange-700',
    wildlife: 'bg-green-100 text-green-700',
    historical: 'bg-red-100 text-red-700',
    religious: 'bg-yellow-100 text-yellow-700',
};

export default function SearchPage() {
    const { user, token } = useAuth();
    const [query, setQuery] = useState('');
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const popularSearches = ['Goa', 'Surat', 'Mumbai', 'Jaipur', 'Kerala', 'Manali', 'Dubai', 'Bali'];

    const searchPlaces = useCallback(async (searchTerm) => {
        if (!searchTerm.trim()) {
            setPlaces([]);
            setSearched(false);
            return;
        }
        setLoading(true);
        setError('');
        setSearched(true);
        try {
            const res = await axios.get('/api/places', {
                params: { search: searchTerm },
                headers: { Authorization: `Bearer ${token}` },
            });
            setPlaces(res.data);
        } catch (err) {
            setError('Failed to fetch places. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Debounce the API call
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                searchPlaces(query);
            } else if (query.length === 0) {
                setPlaces([]);
                setSearched(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [query, searchPlaces]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
            {/* Hero Search Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>
                <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-white/10 text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/10">
                            <Globe2 className="w-4 h-4" />
                            {user?.role === 'premium' || user?.role === 'admin' ? 'Premium Search — All Filters Unlocked' : 'Search Famous Places'}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                            Discover Your Next<br />
                            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                                Adventure
                            </span>
                        </h1>
                        <p className="text-blue-200 text-lg mb-10">
                            Search any city or destination to explore famous places
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="relative max-w-2xl mx-auto"
                    >
                        <div className="flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden focus-within:border-blue-400/60 transition-all">
                            <Search className="ml-5 w-5 h-5 text-blue-300 flex-shrink-0" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search city, destination, or place..."
                                className="flex-1 bg-transparent text-white placeholder-blue-300/70 px-4 py-4 text-base outline-none"
                                autoFocus
                            />
                            {loading && (
                                <Loader2 className="mr-5 w-5 h-5 text-blue-400 animate-spin" />
                            )}
                        </div>

                        {/* Popular Searches */}
                        {!searched && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-4 flex flex-wrap justify-center gap-2"
                            >
                                <span className="text-blue-400 text-sm flex items-center gap-1 mr-1">
                                    <TrendingUp className="w-3.5 h-3.5" /> Popular:
                                </span>
                                {popularSearches.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setQuery(s)}
                                        className="bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white text-sm px-3 py-1 rounded-full border border-white/10 transition-all hover:border-white/30"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-4 pb-16">
                {error && (
                    <div className="text-center py-12 text-red-400 text-sm">{error}</div>
                )}

                {searched && !loading && places.length === 0 && !error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <MapPin className="w-16 h-16 text-blue-400/40 mx-auto mb-4" />
                        <p className="text-white text-xl font-semibold">No places found for "{query}"</p>
                        <p className="text-blue-300 mt-2">Try a different city or destination name</p>
                    </motion.div>
                )}

                {searched && !loading && places.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-white font-bold text-xl">
                                {places.length} place{places.length !== 1 ? 's' : ''} found for
                                <span className="text-blue-400 ml-1">"{query}"</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            <AnimatePresence>
                                {places.map((place, index) => (
                                    <motion.div
                                        key={place._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.4 }}
                                    >
                                        <PlaceCard place={place} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {!searched && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center py-20"
                    >
                        <div className="text-blue-300/40 text-6xl mb-4">🌏</div>
                        <p className="text-blue-200 text-lg">Start typing to discover amazing places</p>
                        <p className="text-blue-400/60 text-sm mt-2">Enter at least 2 characters to search</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function PlaceCard({ place }) {
    const categoryClass = categoryColors[place.category] || 'bg-gray-100 text-gray-700';
    const fallbackImage = `https://source.unsplash.com/400x300/?${encodeURIComponent(place.name + ' travel')}`;

    return (
        <Link to={`/place/${place._id}`}>
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-blue-400/40 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={place.images?.[0] || fallbackImage}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { e.target.src = fallbackImage; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {place.isFeatured && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                            ⭐ Featured
                        </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${categoryClass}`}>
                            {place.category}
                        </span>
                        {place.rating > 0 && (
                            <span className="flex items-center gap-1 bg-black/40 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {place.rating?.toFixed(1)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="p-4">
                    <h3 className="text-white font-bold text-base leading-tight group-hover:text-blue-300 transition-colors line-clamp-1">
                        {place.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1.5 text-blue-300/70 text-xs">
                        <MapPin className="w-3 h-3" />
                        <span>{place.country}</span>
                    </div>
                    {place.description && (
                        <p className="text-blue-200/60 text-xs mt-2 line-clamp-2 leading-relaxed">
                            {place.description}
                        </p>
                    )}
                    {place.budget && (
                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                            <span className="text-blue-400/70 text-xs">Budget</span>
                            <span className="text-white text-xs font-semibold capitalize">{place.budget}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
