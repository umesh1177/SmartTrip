import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Heart, Star, Sparkles, AlertCircle, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPlaceImage, imgErrorHandler } from '../utils/imageUtils';

export default function SavedPlaces() {
    const { user, isPremium, updateProfile } = useAuth();
    const [savedPlaces, setSavedPlaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);

    const fetchSavedPlaces = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get('/api/places/saved');
            setSavedPlaces(res.data);
        } catch (error) {
            console.error('Error fetching saved places:', error);
            toast.error('Failed to load your bucket list.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedPlaces();
    }, []);

    const handleRemove = async (placeId) => {
        try {
            setRemovingId(placeId);
            await axios.delete(`/api/places/save/${placeId}`);

            // Optimistic internal UX removal
            setSavedPlaces(prev => prev.filter(p => p._id !== placeId));
            updateProfile({
                savedPlaces: user.savedPlaces?.filter(id => id !== placeId) || []
            });

            toast.success('Removed from bucket list.');
        } catch (error) {
            console.error('Error removing place:', error);
            toast.error('Failed to remove place. Try again.');
        } finally {
            setRemovingId(null);
        }
    };

    // Calculations for Free user progress bar
    const maxSaves = 10;
    const currentSaves = savedPlaces.length;
    const progressPercentage = Math.min((currentSaves / maxSaves) * 100, 100);
    const isNearLimit = currentSaves >= 8 && !isPremium;

    return (
        <div className="min-h-[85vh] bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
                            Your Bucket List <Heart className="ml-3 w-8 h-8 text-pink-500 fill-pink-500/20" />
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg">Curated destinations waiting for your arrival.</p>
                    </div>

                    {/* User Limits & Progress */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm md:min-w-[300px]">
                        {isPremium ? (
                            <div className="flex items-center justify-center p-2 bg-amber-50 rounded-lg border border-amber-100">
                                <Sparkles className="w-5 h-5 text-amber-500 mr-2" />
                                <span className="font-bold text-amber-800">Unlimited Saves ⭐</span>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-gray-700">Storage Usage</span>
                                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${isNearLimit ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {currentSaves} / {maxSaves} saved
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`h-2.5 rounded-full transition-all duration-500 ${isNearLimit ? 'bg-red-500' : 'bg-blue-600'}`}
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                                {isNearLimit && (
                                    <p className="text-xs text-red-600 mt-2 flex items-center mt-2">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Approaching limit. <Link to="/pricing" className="underline font-semibold ml-1">Upgrade</Link>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                {isLoading ? (
                    // Loading Skeletons
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse h-96">
                                <div className="bg-gray-200 h-56 rounded-xl mb-4"></div>
                                <div className="bg-gray-200 h-6 w-3/4 rounded mb-2"></div>
                                <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : savedPlaces.length === 0 ? (
                    // Empty State
                    <div className="bg-white rounded-3xl border border-gray-200 border-dashed p-12 text-center max-w-2xl mx-auto mt-12 shadow-sm">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Compass className="w-12 h-12 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No saved places yet 🗺️</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Your bucket list is currently empty. Start exploring our massive catalog of curated destinations to find your perfect match.
                        </p>
                        <Link
                            to="/explore"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Start Exploring
                        </Link>
                    </div>
                ) : (
                    // Grid of Saved Places
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 animate-fade-in-up">
                        {savedPlaces.map((place) => (
                            <div key={place._id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col group relative">

                                {/* Image Section */}
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={getPlaceImage(place)}
                                        alt={place.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={imgErrorHandler(place.category)}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>

                                    {/* Category Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800 uppercase tracking-widest shadow-sm">
                                            {place.category}
                                        </span>
                                    </div>

                                    {/* Rating Badge */}
                                    <div className="absolute bottom-4 left-4 flex items-center bg-black/50 backdrop-blur-md rounded-lg p-1.5 shadow-inner">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        <span className="text-white text-xs font-bold ml-1">{place.rating}</span>
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{place.name}</h3>
                                    </div>

                                    <div className="flex items-center text-gray-500 mb-4 text-sm font-medium">
                                        <MapPin className="w-4 h-4 mr-1 text-blue-400 shrink-0" />
                                        {place.city}, {place.country}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded bg-gray-100 text-gray-600">
                                            {place.budget} Budget
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700">
                                            {place.season}
                                        </span>
                                    </div>

                                    {/* Actions (Always at bottom) */}
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
                                        <button
                                            onClick={() => handleRemove(place._id)}
                                            disabled={removingId === place._id}
                                            className="flex-1 flex justify-center items-center py-2.5 rounded-xl text-sm font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 border border-pink-100 transition-colors"
                                        >
                                            {removingId === place._id ? 'Removing...' : 'Remove'}
                                        </button>
                                        <button className="flex-1 flex justify-center items-center py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
                                            Book Trip
                                        </button>
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
