// Curated, reliable Unsplash fallback images per place category
export const UNSPLASH_FALLBACKS = {
    beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    city: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
    adventure: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    cultural: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    wildlife: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
    luxury: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    default: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800',
};

/**
 * Returns the best available image URL for a place.
 * Priority: place.image → place.images[0] → category fallback → default
 * @param {{ image?: string, images?: string[], category?: string }} place
 * @returns {string} A valid image URL
 */
export function getPlaceImage(place) {
    if (place?.image && place.image.startsWith('http')) return place.image;
    if (place?.images?.[0] && place.images[0].startsWith('http')) return place.images[0];
    return UNSPLASH_FALLBACKS[place?.category] || UNSPLASH_FALLBACKS.default;
}

/**
 * Returns an onError handler that swaps to a reliable fallback.
 * @param {string} category
 * @returns {(e: React.SyntheticEvent<HTMLImageElement>) => void}
 */
export function imgErrorHandler(category) {
    return (e) => {
        // Prevent infinite error loops if fallback itself fails
        e.target.onerror = null;
        e.target.src = UNSPLASH_FALLBACKS[category] || UNSPLASH_FALLBACKS.default;
    };
}

/**
 * Returns a list of popular search suggestions, optionally filtered by term.
 * @param {string} searchTerm
 * @returns {string[]}
 */
export function getSearchSuggestions(searchTerm) {
    const popular = [
        'Goa, India', 'Paris, France', 'Tokyo, Japan',
        'Bali, Indonesia', 'Dubai, UAE', 'New York, USA',
        'Rome, Italy', 'Bangkok, Thailand', 'London, UK',
        'Maldives', 'Santorini, Greece', 'Manali, India',
    ];
    if (!searchTerm) return popular.slice(0, 6);
    return popular
        .filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 4);
}
