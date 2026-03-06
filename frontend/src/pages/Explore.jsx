import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    Filter, MapPin, Star, Heart, SlidersHorizontal,
    X, Lock, Sparkles, AlertCircle, Search, Globe2, ChevronDown
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import FilterSidebar, { ActiveFilterChips } from '../components/FilterSidebar';
import { getPlaceImage, imgErrorHandler } from '../utils/imageUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton card shown during loading
function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
            <div className="bg-gray-200 h-56" />
            <div className="p-5">
                <div className="bg-gray-200 h-5 w-3/4 rounded mb-2" />
                <div className="bg-gray-200 h-4 w-1/2 rounded mb-4" />
                <div className="flex gap-2 mb-4">
                    <div className="bg-gray-200 h-5 w-16 rounded-full" />
                    <div className="bg-gray-200 h-5 w-16 rounded-full" />
                </div>
                <div className="bg-gray-200 h-4 w-full rounded mb-2" />
                <div className="bg-gray-200 h-4 w-5/6 rounded" />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single place card (used for both DB and Google results)
function PlaceCard({ place, isSaved, isSaving, isPremium, onSave, activeFilters = {} }) {
    const imgSrc = getPlaceImage(place);

    // Compute matching badges (max 2)
    const matches = [];
    if (activeFilters.type && activeFilters.type === place.type) matches.push(`Type: ${activeFilters.type}`);
    if (activeFilters.bestTime && place.bestTime?.includes(activeFilters.bestTime)) matches.push(`Best matches ${activeFilters.bestTime}`);
    if (activeFilters.entryFee && activeFilters.entryFee === place.entryFee) matches.push(`Fee: ${activeFilters.entryFee}`);
    if (activeFilters.crowdLevel && activeFilters.crowdLevel === place.crowdLevel) matches.push(`${activeFilters.crowdLevel} crowd`);
    if (activeFilters.duration && activeFilters.duration === place.duration) matches.push(`Duration check`);
    if (activeFilters.activityType?.length > 0 && activeFilters.activityType.some(a => place.activityType?.includes(a))) matches.push(`Activity match`);
    if (activeFilters.indoorOutdoor && activeFilters.indoorOutdoor === place.indoorOutdoor) matches.push(activeFilters.indoorOutdoor);

    // Pick max 2
    const displayMatches = matches.slice(0, 2);

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col h-full group">
            {/* Image */}
            <div className="relative h-56 overflow-hidden flex-shrink-0">
                <Link to={`/place/${place._id}`}>
                    <img
                        src={imgSrc}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                        onError={imgErrorHandler(place.category)}
                    />
                </Link>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Top badges */}
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                    <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider shadow-sm">
                        {place.category}
                    </div>
                    {place.isTrending && (
                        <div className="bg-red-500/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-extrabold text-white uppercase tracking-wider shadow-sm">
                            🔥 Trending
                        </div>
                    )}
                    {/* Google badge */}
                    {place.isFromGoogle && (
                        <div className="bg-blue-600/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-extrabold text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <Globe2 className="w-3 h-3" /> via Google
                        </div>
                    )}
                </div>

                {/* Save / Heart button */}
                <button
                    onClick={() => onSave(place._id)}
                    disabled={!!isSaving}
                    className={`absolute top-4 right-4 p-2 rounded-full shadow-lg transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500
                        ${isSaved
                            ? 'bg-pink-500 text-white hover:bg-pink-600'
                            : 'bg-white/90 text-gray-400 hover:text-pink-500 backdrop-blur-md'
                        } ${isSaving ? 'opacity-50 cursor-not-allowed scale-90' : 'hover:scale-110'}`}
                >
                    {isSaving
                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-current rounded-full animate-spin" />
                        : <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    }
                </button>

                {/* Bottom overlay: name + rating */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                    <div>
                        <h3 className="text-xl font-bold text-white drop-shadow-md line-clamp-1">{place.name}</h3>
                        <div className="flex items-center text-white/90 text-sm font-medium mt-1 drop-shadow">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            {place.city}, {place.country}
                        </div>
                    </div>
                    <div className="flex bg-black/40 backdrop-blur-md rounded-lg p-1.5 shadow-inner">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-white text-xs font-bold ml-1">
                            {(place.averageRating || place.rating || 0).toFixed?.(1) ?? '—'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Card body */}
            <div className="p-5 flex-1 flex flex-col">
                {/* Tags row */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {place.budget && (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 border border-gray-200">
                            {place.budget} Budget
                        </span>
                    )}
                    {place.season && (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                            {place.season}
                        </span>
                    )}
                    {isPremium && place.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-100">
                            {tag}
                        </span>
                    ))}
                </div>

                <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                    {place.description}
                </p>

                {/* Footer with matches and buttons */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto gap-2">
                    <div className="flex flex-wrap gap-1.5 overflow-hidden w-full">
                        {displayMatches.length > 0 ? (
                            displayMatches.map((m, i) => (
                                <span key={i} className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-100 flex items-center gap-0.5 whitespace-nowrap">
                                    <span className="text-green-500">✓</span> {m}
                                </span>
                            ))
                        ) : (
                            <div className="text-xs font-medium text-gray-400 truncate">
                                Best for: <span className="text-gray-600 capitalize">{place.bestFor || 'All'}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                            to={`/place/${place._id}`}
                            className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors whitespace-nowrap"
                        >
                            Details
                        </Link>
                        <Link
                            to="/plan-trip"
                            state={{ destination: place }}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors whitespace-nowrap"
                        >
                            Plan Trip
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Explore page
export default function Explore() {
    const { user, isPremium, updateProfile } = useAuth();
    const navigate = useNavigate();

    // ── DB places (default grid) ─────────────────────────────────────────────
    const [allPlaces, setAllPlaces] = useState([]);
    const [isLoadingAll, setIsLoadingAll] = useState(true);

    // ── Search state machine ─────────────────────────────────────────────────
    // idle | searching | results | empty | error
    const [searchState, setSearchState] = useState('idle');
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // ── UI ───────────────────────────────────────────────────────────────────
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isSaving, setIsSaving] = useState(null);

    // ── Pagination (premium load-more) ───────────────────────────────────────
    const [canLoadMore, setCanLoadMore] = useState(false);
    const [nextPage, setNextPage] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // ── Filters (matches FilterSidebar props exactly) ────────────────────────────
    const INITIAL_FILTERS = {
        // Common
        city: '', state: '', country: '',
        type: '', bestTime: '', entryFee: '',
        // Free
        crowdLevel: '', familyFriendly: '', duration: '',
        distance: '', bestSeason: '',
        activityType: [], indoorOutdoor: '', accessibility: '',
        sortBy: 'rating',
        // Premium
        photographyScore: '', accommodationNearby: [],
        foodOptions: [], ageSuitability: [], fitnessLevel: '',
        guidedTours: [], petFriendly: '', parking: '',
        facilities: [], transportMode: [], budgetPerPerson: '', languages: [],
    };
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    if (!user) { navigate('/login'); return null; }

    const savedCount = user.savedPlaces?.length || 0;
    const isFreeMaxedOut = !isPremium && savedCount >= 10;

    // Rebuild fetchAllPlaces query from new filter shape
    const buildQuery = useCallback(() => {
        const q = new URLSearchParams();
        const append = (k, v) => { if (v !== '' && v !== null && v !== undefined) q.append(k, v); };
        const appendArr = (k, arr) => { if ((arr || []).length > 0) q.append(k, arr[0]); };

        append('city', filters.city);
        append('state', filters.state);
        append('country', filters.country);
        append('type', filters.type);
        append('bestTime', filters.bestTime);
        append('entryFee', filters.entryFee);
        append('sortBy', filters.sortBy || 'rating');

        if (user) {
            append('crowdLevel', filters.crowdLevel);
            if (filters.familyFriendly !== '') append('familyFriendly', String(filters.familyFriendly));
            append('duration', filters.duration);
            append('distance', filters.distance);
            append('season', filters.bestSeason);
            appendArr('activityType', filters.activityType);
            append('indoorOutdoor', filters.indoorOutdoor);
        }

        if (isPremium) {
            append('photographyScore', filters.photographyScore);
            appendArr('accommodationNearby', filters.accommodationNearby);
            appendArr('foodOptions', filters.foodOptions);
            appendArr('ageSuitability', filters.ageSuitability);
            append('fitnessLevel', filters.fitnessLevel);
            appendArr('guidedTours', filters.guidedTours);
            append('petFriendly', filters.petFriendly);
            append('parking', filters.parking);
            appendArr('facilities', filters.facilities);
            appendArr('transportMode', filters.transportMode);
            append('budgetPerPerson', filters.budgetPerPerson);
            appendArr('languages', filters.languages);
        }
        return q;
    }, [filters, user, isPremium]);

    // ── Fetch default places (sidebar filters) ───────────────────────────────
    const fetchAllPlaces = async () => {
        try {
            setIsLoadingAll(true);
            setCanLoadMore(false);
            const q = buildQuery();
            const res = await axios.get(`/api/places?${q.toString()}`);
            // Handle both old plain-array and new envelope responses
            const payload = res.data;
            if (payload && typeof payload === 'object' && payload.success !== undefined) {
                setAllPlaces(payload.data || []);
                setCanLoadMore(payload.canLoadMore || false);
                setNextPage(payload.nextPage || null);
            } else {
                setAllPlaces(Array.isArray(payload) ? payload : []);
            }
        } catch {
            toast.error('Failed to load destinations');
        } finally {
            setIsLoadingAll(false);
        }
    };

    // ── Load more (premium only) ─────────────────────────────────────────────
    const handleLoadMore = async () => {
        if (!canLoadMore || !nextPage || isLoadingMore) return;
        try {
            setIsLoadingMore(true);
            const q = new URLSearchParams();
            q.append('page', nextPage);
            if (filters.search) q.append('search', filters.search);
            if (filters.category) q.append('category', filters.category);
            if (filters.budget) q.append('budget', filters.budget);
            if (filters.season) q.append('season', filters.season);
            const sortMap = { '-createdAt': 'newest', '-rating': 'rating', '-reviews': 'popular' };
            q.append('sortBy', sortMap[filters.sort] || 'rating');
            if (filters.country) q.append('country', filters.country);
            const res = await axios.get(`/api/places/load-more?${q.toString()}`);
            const payload = res.data;
            if (payload?.success) {
                setAllPlaces(prev => [...prev, ...(payload.data || [])]);
                setCanLoadMore(payload.canLoadMore || false);
                setNextPage(payload.nextPage || null);
            }
        } catch {
            toast.error('Failed to load more places');
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(fetchAllPlaces, 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buildQuery]);

    // ── Search handlers (from SearchBar) ─────────────────────────────────────
    const handleSearch = (results, term) => {
        // null results = clear pressed
        if (results === null) {
            setSearchState('idle');
            setSearchResults([]);
            setSearchTerm('');
            return;
        }
        setSearchTerm(term);
        if (!term) { setSearchState('idle'); return; }
        setSearchState(results.length === 0 ? 'empty' : 'results');
        setSearchResults(results);
    };

    // Suggestion click: immediately show that one place
    const handleSuggestionSelect = (place) => {
        setSearchTerm(place.name);
        setSearchState('results');
        setSearchResults([place]);
    };

    const clearSearch = () => {
        setSearchState('idle');
        setSearchResults([]);
        setSearchTerm('');
    };

    // ── Save / unsave ────────────────────────────────────────────────────────
    const handleSavePlace = async (placeId) => {
        const isSaved = user.savedPlaces?.includes(placeId);
        if (isSaved) {
            try {
                setIsSaving(placeId);
                await axios.delete(`/api/places/save/${placeId}`);
                updateProfile({ savedPlaces: user.savedPlaces.filter(id => id !== placeId) });
                toast.success('Place removed from saved');
            } catch { toast.error('Failed to remove saved place'); }
            finally { setIsSaving(null); }
            return;
        }
        if (isFreeMaxedOut) { setShowUpgradeModal(true); return; }
        try {
            setIsSaving(placeId);
            await axios.post(`/api/places/save/${placeId}`);
            updateProfile({ savedPlaces: [...(user.savedPlaces || []), placeId] });
            toast.success('Place saved!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save place');
            if (err.response?.status === 403) setShowUpgradeModal(true);
        } finally { setIsSaving(null); }
    };

    // Filter change handler – accepts a partial patch object
    const handleFilterChange = useCallback((patch) => {
        setFilters(prev => ({ ...prev, ...patch }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
    }, []);


    const countriesList = ['Greece', 'Peru', 'Japan', 'Tanzania', 'Maldives', 'Canada', 'French Polynesia', 'Iceland', 'Switzerland', 'Italy', 'Indonesia', 'Morocco', 'USA', 'Ecuador', 'Netherlands', 'Argentina', 'France', 'UAE', 'Costa Rica', 'India'];
    const activitiesList = ['hiking', 'swimming', 'sightseeing', 'dining', 'shopping', 'safari', 'skiing'];
    // Decide what to render in the cards area
    const isInSearchMode = searchState !== 'idle';
    const displayedPlaces = isInSearchMode ? searchResults : allPlaces;
    const isLoadingGrid = searchState === 'searching' || (!isInSearchMode && isLoadingAll);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

            {/* ── Mobile sidebar toggle ── */}
            <div className="md:hidden bg-white p-4 border-b border-gray-200 flex justify-between items-center sticky top-16 z-30">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex items-center text-gray-700 font-medium bg-gray-100 px-4 py-2 rounded-lg"
                >
                    <Filter className="w-4 h-4 mr-2" /> Filters
                </button>
                <div className="text-sm font-medium text-gray-500">
                    {isInSearchMode
                        ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`
                        : `${allPlaces.length} destinations`}
                </div>
            </div>

            {/* ── Sidebar overlay (mobile) ── */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* ── Filters Sidebar ── */}
            <aside className={`
                fixed inset-y-0 left-0 bg-white w-80 shadow-2xl z-50 transform transition-transform duration-300
                md:relative md:translate-x-0 md:shadow-none md:border-r md:border-gray-200 md:z-10
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                flex flex-col h-[calc(100vh-64px)] overflow-hidden top-0 md:top-16
            `}>
                <FilterSidebar
                    filters={filters}
                    onChange={handleFilterChange}
                    onReset={resetFilters}
                    onClose={() => setIsSidebarOpen(false)}
                    isLoggedIn={!!user}
                    isPremium={isPremium}
                    resultCount={allPlaces.length}
                    totalAvailable={allPlaces.length}
                    userRole={user?.role || 'guest'}
                />
            </aside>

            {/* ── Main content ── */}
            < main className="flex-1 p-4 sm:p-6 lg:p-8 h-[calc(100vh-64px)] overflow-y-auto" >
                <div className="max-w-7xl mx-auto flex flex-col h-full">

                    {/* Header */}
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Explore Destinations</h1>
                            <p className="text-gray-500 mt-1">Discover places from around the world</p>
                        </div>
                        {!isPremium && (
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Saved Places</span>
                                <div className={`text-sm font-bold px-3 py-1 rounded-full border ${isFreeMaxedOut ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                    {savedCount} / 10
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Smart Search Bar ── */}
                    <div className="mb-4">
                        <SearchBar
                            onSearch={handleSearch}
                            onSuggestionSelect={handleSuggestionSelect}
                            placeholder="Search any city, country or destination worldwide…"
                        />
                    </div>

                    {/* ── Active filter chips ── */}
                    {!isInSearchMode && (
                        <ActiveFilterChips
                            filters={filters}
                            onChange={handleFilterChange}
                            onReset={resetFilters}
                        />
                    )}

                    {/* ── Search context banner ── */}
                    {isInSearchMode && searchState !== 'searching' && (
                        <div className="flex items-center justify-between mb-5 px-1">
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4 text-indigo-500" />
                                {searchState === 'results' && (
                                    <span className="text-gray-700 font-semibold text-sm">
                                        Found <span className="text-indigo-600 font-extrabold">{searchResults.length}</span> place{searchResults.length !== 1 ? 's' : ''} matching
                                        <span className="text-indigo-700 font-extrabold"> "{searchTerm}"</span>
                                    </span>
                                )}
                                {searchState === 'empty' && (
                                    <span className="text-gray-500 text-sm">
                                        No results for <span className="font-bold text-gray-700">"{searchTerm}"</span>
                                    </span>
                                )}
                                {searchState === 'error' && (
                                    <span className="text-red-500 text-sm font-medium">Search failed. Please try again.</span>
                                )}
                            </div>
                            <button
                                onClick={clearSearch}
                                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors border border-gray-200 hover:border-indigo-200"
                            >
                                <X className="w-3.5 h-3.5" /> Clear Search
                            </button>
                        </div>
                    )}

                    {/* ── Grid area (state machine) ── */}

                    {/* SEARCHING skeleton */}
                    {isLoadingGrid && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(n => <SkeletonCard key={n} />)}
                        </div>
                    )}

                    {/* EMPTY state (Search yielded 0 results) */}
                    {!isLoadingGrid && searchState === 'empty' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-gray-100 shadow-sm mt-4">
                            <div className="text-6xl mb-6">🗺️</div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">No places found</h3>
                            <p className="text-gray-500 max-w-md mb-8 font-medium">Try adjusting your filters or search a different location.</p>

                            {user && searchTerm && (
                                <div className="mb-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 max-w-md w-full">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3 text-center">Still can't find it?</h4>
                                    <button
                                        onClick={async () => {
                                            try {
                                                setSearchState('searching');
                                                const res = await axios.get(`/api/places/search?q=${encodeURIComponent(searchTerm)}`);
                                                if (res.data?.data) {
                                                    setSearchState(res.data.data.length ? 'results' : 'empty');
                                                    setSearchResults(res.data.data);
                                                }
                                            } catch {
                                                setSearchState('error');
                                            }
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-blue-700 font-extrabold rounded-xl border border-blue-200 shadow-sm transition-all hover:shadow-md"
                                    >
                                        <Globe2 className="w-4 h-4" /> Search Google for "{searchTerm}"
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 justify-center mb-8">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 mt-1.5 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Try:</span>
                                {['Ahmedabad', 'Goa', 'Manali', 'Jaipur', 'Mumbai'].map(s => (
                                    <button key={s}
                                        onClick={() => handleSearch([], s)}
                                        className="text-xs px-4 py-1.5 rounded-full bg-gray-50 text-gray-700 font-bold hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200 transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <button onClick={clearSearch} className="text-sm px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow transition-colors">
                                Reset Filters
                            </button>
                        </div>
                    )}

                    {/* ERROR state */}
                    {!isLoadingGrid && searchState === 'error' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="text-5xl mb-4">⚠️</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Search failed</h3>
                            <p className="text-gray-500 mb-4">Something went wrong. Please try again.</p>
                            <button onClick={clearSearch} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                                Clear Search
                            </button>
                        </div>
                    )}

                    {/* IDLE empty (no DB places) */}
                    {!isLoadingGrid && searchState === 'idle' && allPlaces.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-gray-100 border-dashed">
                            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <Search className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No destinations found</h3>
                            <p className="text-gray-500 max-w-md mb-6">Try easing up on some filters to broaden your search.</p>
                            <button onClick={resetFilters} className="px-6 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-lg transition-colors">
                                Clear all filters
                            </button>
                        </div>
                    )}

                    {/* RESULTS grid (search results OR default places) */}
                    {!isLoadingGrid && (searchState === 'results' || (searchState === 'idle' && allPlaces.length > 0)) && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                                {displayedPlaces.map(place => (
                                    <PlaceCard
                                        key={place._id}
                                        place={place}
                                        isSaved={user.savedPlaces?.includes(place._id)}
                                        isSaving={isSaving === place._id}
                                        isPremium={isPremium}
                                        onSave={handleSavePlace}
                                        activeFilters={filters}
                                    />
                                ))}

                                {/* FREE tier upgrade bump card at end of list */}
                                {!isPremium && user?.role === 'free' && displayedPlaces.length >= 10 && (
                                    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border-2 border-indigo-100 p-6 flex flex-col items-center justify-center text-center shadow-sm h-full group hover:shadow-xl transition-all">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                            <Lock className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 mb-2">More places available</h3>
                                        <p className="text-sm text-gray-500 mb-6 font-medium">Upgrade to Premium to see 20+ more destinations matching your exact filters.</p>
                                        <Link to="/pricing" className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl shadow hover:bg-indigo-700 transition-colors w-full">
                                            Upgrade Now
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Load More – premium only, idle mode only */}
                            {isPremium && canLoadMore && searchState === 'idle' && (
                                <div className="flex flex-col items-center justify-center pb-12 w-full mt-8">
                                    <div className="flex-1 flex items-center w-full">
                                        <div className="h-px bg-gray-200 flex-1" />
                                        <span className="text-xs font-bold text-gray-400 px-4 uppercase tracking-widest whitespace-nowrap">
                                            Showing {displayedPlaces.length} results
                                        </span>
                                        <div className="h-px bg-gray-200 flex-1" />
                                    </div>

                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoadingMore}
                                        className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-indigo-100 text-indigo-700 hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed font-bold rounded-2xl shadow-sm transition-all hover:border-indigo-200 hover:shadow mt-6 mb-12 group"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                Loading…
                                            </>
                                        ) : (
                                            <>
                                                Load More Destinies <ChevronDown className="w-4 h-4 text-indigo-400 group-hover:translate-y-0.5 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* ── Upgrade modal ── */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full">
                        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-6 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <AlertCircle className="w-8 h-8 text-white drop-shadow-sm" />
                            </div>
                            <h2 className="text-2xl font-black text-amber-900 leading-tight">Save Limit Reached!</h2>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                You've saved <strong className="text-gray-900">10 places</strong>! Free accounts are limited to 10 saves.
                            </p>
                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 mb-8 flex text-left">
                                <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0 mr-3 mt-0.5" />
                                <p className="text-sm font-medium text-amber-800">
                                    Upgrade to <strong className="font-extrabold text-amber-900 mt-1 block tracking-wide uppercase">SmartTrip Premium</strong>
                                    for unlimited saves, advanced filters, and AI travel matching.
                                </p>
                            </div>
                            <div className="flex flex-col space-y-3">
                                <Link to="/pricing" className="w-full bg-gradient-to-r from-gray-900 to-indigo-900 hover:from-black hover:to-indigo-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                    View Premium Plans
                                </Link>
                                <button onClick={() => setShowUpgradeModal(false)} className="w-full bg-white hover:bg-gray-50 text-gray-500 font-semibold py-3 px-6 rounded-xl border border-gray-200 transition-colors">
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}
