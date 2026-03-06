import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Search, X, Loader2, MapPin } from 'lucide-react';
import { getPlaceImage, imgErrorHandler } from '../utils/imageUtils';

/**
 * Smart global search bar with debounced API calls, dropdown suggestions,
 * keyboard navigation, and a clear button.
 *
 * Props:
 *   onSearch(results, term)   – called when user submits (Enter / button)
 *   onSuggestionSelect(place) – called when user clicks a dropdown suggestion
 *   placeholder               – input placeholder text
 *   initialValue              – pre-filled query (e.g. after a clear-search)
 */
export default function SearchBar({
    onSearch,
    onSuggestionSelect,
    placeholder = 'Search any city or destination…',
    initialValue = '',
}) {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1); // keyboard nav

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const debounceTimer = useRef(null);

    // ── Debounced suggestions fetch ──────────────────────────────────────────
    const fetchSuggestions = useCallback(async (term) => {
        if (!term || term.length < 2) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }
        setIsLoadingSuggestions(true);
        try {
            const res = await axios.get(`/api/places/search?q=${encodeURIComponent(term)}`);
            const top5 = (res.data || []).slice(0, 5);
            setSuggestions(top5);
            setShowDropdown(top5.length > 0);
            setActiveIndex(-1);
        } catch {
            setSuggestions([]);
            setShowDropdown(false);
        } finally {
            setIsLoadingSuggestions(false);
        }
    }, []);

    useEffect(() => {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(query);
        }, 500);
        return () => clearTimeout(debounceTimer.current);
    }, [query, fetchSuggestions]);

    // ── Close dropdown on outside click ─────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Submit search ────────────────────────────────────────────────────────
    const handleSubmit = async (term = query) => {
        const t = term.trim();
        if (!t) return;
        setShowDropdown(false);
        setIsSubmitting(true);
        try {
            const res = await axios.get(`/api/places/search?q=${encodeURIComponent(t)}`);
            onSearch?.(res.data || [], t);
        } catch {
            onSearch?.([], t);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Click a suggestion ───────────────────────────────────────────────────
    const handleSuggestionClick = (place) => {
        setQuery(place.name);
        setShowDropdown(false);
        setSuggestions([]);
        onSuggestionSelect?.(place);
    };

    // ── Clear ────────────────────────────────────────────────────────────────
    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setShowDropdown(false);
        onSearch?.(null, ''); // signal empty = go back to default
        inputRef.current?.focus();
    };

    // ── Keyboard navigation ──────────────────────────────────────────────────
    const handleKeyDown = (e) => {
        if (!showDropdown || suggestions.length === 0) {
            if (e.key === 'Enter') handleSubmit();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                handleSuggestionClick(suggestions[activeIndex]);
            } else {
                handleSubmit();
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
            setActiveIndex(-1);
        }
    };

    const isLoading = isLoadingSuggestions || isSubmitting;

    return (
        <div className="relative w-full">
            {/* ── Input row ── */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        {isLoading
                            ? <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                            : <Search className="w-5 h-5 text-gray-400" />
                        }
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                        placeholder={placeholder}
                        className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all"
                    />
                    {/* Clear button */}
                    {query && (
                        <button
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Search button */}
                <button
                    onClick={() => handleSubmit()}
                    disabled={!query.trim() || isSubmitting}
                    className="flex items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-sm transition-all hover:shadow-md active:scale-95"
                >
                    {isSubmitting
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Search className="w-4 h-4" />
                    }
                    <span className="hidden sm:inline">Search</span>
                </button>
            </div>

            {/* ── Suggestions dropdown ── */}
            {showDropdown && suggestions.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                >
                    {suggestions.map((place, idx) => {
                        const isActive = idx === activeIndex;
                        const img = getPlaceImage(place);
                        return (
                            <button
                                key={place._id || idx}
                                onClick={() => handleSuggestionClick(place)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-0
                                    ${isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                            >
                                {/* Thumbnail */}
                                <img
                                    src={img}
                                    alt={place.name}
                                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                                    onError={imgErrorHandler(place.category)}
                                />
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm text-gray-900 truncate">{place.name}</div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{place.city}, {place.country}</span>
                                    </div>
                                </div>
                                {/* Category badge */}
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 flex-shrink-0">
                                    {place.category}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
