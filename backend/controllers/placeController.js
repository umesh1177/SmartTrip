const Place = require('../models/Place');
const User = require('../models/User');
const axios = require('axios');
const { detectCategoryFromTypes, extractCityCountry } = require('../utils/placeUtils');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers: Google Places API
// ─────────────────────────────────────────────────────────────────────────────

async function saveGooglePlaceToMongo(mappedPlace) {
    try {
        const existing = await Place.findOne({
            name: { $regex: `^${mappedPlace.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
        });
        if (existing) return existing;

        const doc = await Place.create({
            name: mappedPlace.name,
            city: mappedPlace.city || 'Unknown',
            country: mappedPlace.country || 'Unknown',
            image: mappedPlace.image || `https://source.unsplash.com/800x600/?${encodeURIComponent(mappedPlace.name + ' travel')}`,
            description: mappedPlace.description || mappedPlace.name,
            category: mappedPlace.category || 'city',
            budget: mappedPlace.budget || 'moderate',
            season: mappedPlace.season || 'all-season',
            duration: '1-week',
            climate: 'temperate',
            bestFor: mappedPlace.bestFor || 'friends',
            tags: mappedPlace.tags || [],
            activities: mappedPlace.activities || [],
            rating: mappedPlace.rating || 0,
            averageRating: mappedPlace.averageRating || 0,
            totalReviews: mappedPlace.totalReviews || 0,
            isTrending: false,
            isFeatured: false,
            isFromGoogle: true,
            googlePlaceId: mappedPlace.googlePlaceId || null,
            source: 'google',
        });

        console.log(`[PlaceController] Auto-saved Google place: "${doc.name}"`);
        return doc;
    } catch (err) {
        console.warn('[PlaceController] Could not auto-save Google place:', err.message);
        return mappedPlace;
    }
}

function mapGoogleResult(result, apiKey) {
    const types = result.types || [];
    const category = detectCategoryFromTypes(types);
    const { city, country } = extractCityCountry(result.formatted_address || '');

    let image;
    if (result.photos && result.photos.length > 0) {
        image = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${result.photos[0].photo_reference}&key=${apiKey}`;
    } else {
        image = `https://source.unsplash.com/800x600/?${encodeURIComponent(result.name + ' travel')}`;
    }

    return {
        _id: result.place_id,
        googlePlaceId: result.place_id,
        name: result.name,
        city, country, image,
        description: result.formatted_address || result.name,
        averageRating: result.rating || 4.0,
        rating: result.rating || 4.0,
        totalReviews: result.user_ratings_total || 0,
        category,
        budget: 'moderate',
        season: 'all-season',
        duration: '1-week',
        climate: 'temperate',
        bestFor: 'friends',
        tags: types.slice(0, 5),
        activities: [],
        isTrending: false,
        isFeatured: false,
        isFromGoogle: true,
        source: 'google',
    };
}

async function fetchGooglePlaces(searchTerm, context = '') {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY not configured');

    const qParts = [encodeURIComponent(searchTerm), 'tourist+attraction'];
    if (context) qParts.push(encodeURIComponent(context));

    const googleUrl = `https://maps.googleapis.com/maps/api/textsearch/json?query=${qParts.join('+')}&key=${apiKey}`;
    const response = await axios.get(googleUrl, { timeout: 8000 });
    const data = response.data;

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status} — ${data.error_message || ''}`);
    }
    if (!data.results || data.results.length === 0) return [];

    const mapped = data.results.map(r => mapGoogleResult(r, apiKey));
    const saved = await Promise.all(mapped.map(p => saveGooglePlaceToMongo(p)));
    return saved;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sorting config
// ─────────────────────────────────────────────────────────────────────────────
const SORT_OPTIONS = {
    rating: { averageRating: -1 },
    newest: { createdAt: -1 },
    popular: { totalReviews: -1 },
    distance: { distanceFromAhmedabad: 1 },
    hidden_gems: { averageRating: -1, crowdLevel: 1 },
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Hybrid Search Helper: DB -> Local JSON -> Google API
// ─────────────────────────────────────────────────────────────────────────────
async function hybridPlacesSearch(searchTerm, context = '') {
    if (!searchTerm || searchTerm.length < 2) return [];

    // 1. Search MongoDB first
    const mongoQuery = {
        $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { city: { $regex: searchTerm, $options: 'i' } },
            { state: { $regex: searchTerm, $options: 'i' } },
            { country: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } },
            { description: { $regex: searchTerm, $options: 'i' } }
        ]
    };
    const dbResults = await Place.find(mongoQuery).sort('-createdAt').lean();
    if (dbResults.length > 0) return dbResults;

    // 2. Search local fallback JSON data
    const localData = require('../utils/placesData');
    const searchLower = searchTerm.toLowerCase();

    let localResults = localData.filter(place =>
        place.name.toLowerCase().includes(searchLower) ||
        place.city.toLowerCase().includes(searchLower) ||
        place.state.toLowerCase().includes(searchLower) ||
        place.country.toLowerCase().includes(searchLower) ||
        (place.tags && place.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );

    if (localResults.length > 0) {
        console.log(`[HybridSearch] Found ${localResults.length} matches in local placesData for "${searchTerm}"`);
        // Auto-save to MongoDB
        for (const place of localResults) {
            const exists = await Place.findOne({ name: place.name, city: place.city });
            if (!exists) {
                await Place.create({ ...place, averageRating: place.rating, source: 'local_fallback' });
            }
        }
        // Return fresh from DB to get ObjectIds
        return await Place.find(mongoQuery).lean();
    }

    // 3. Fallback to Google API ONLY if a valid key is actually set and working
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (apiKey && apiKey !== 'your_key_here') {
        try {
            console.log(`[HybridSearch] Falling back to Google API for "${searchTerm}"...`);
            return await fetchGooglePlaces(searchTerm, context);
        } catch (googleErr) {
            console.warn('[HybridSearch] Google API failed:', googleErr.message);
        }
    }

    return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all places — dynamic, role-aware filtering + pagination
// @route   GET /api/places
// @access  Public (optional auth — tiered results)
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllPlaces = async (req, res) => {
    try {
        const user = req.user || null;
        const userRole = user?.role || 'guest';
        const query = req.query;

        // ── Build filter ───────────────────────────────────────────────────────
        const filter = {};
        const activeFilters = {};

        // Guests: only featured places, no other filters
        if (!user) {
            filter.isFeatured = true;
        } else {
            // ── Filters available to ALL logged-in users ─────────────────────
            if (query.type) { filter.type = query.type; activeFilters.type = query.type; }
            if (query.city) { filter.city = { $regex: query.city, $options: 'i' }; activeFilters.city = query.city; }
            if (query.state) { filter.state = { $regex: query.state, $options: 'i' }; activeFilters.state = query.state; }
            if (query.country) { filter.country = { $regex: query.country, $options: 'i' }; activeFilters.country = query.country; }
            if (query.bestTime) { filter.bestTime = { $in: [query.bestTime] }; activeFilters.bestTime = query.bestTime; }
            if (query.entryFee) { filter.entryFee = query.entryFee; activeFilters.entryFee = query.entryFee; }
            if (query.category) { filter.category = query.category; activeFilters.category = query.category; }

            // Logged-in user filters (free + premium + admin)
            if (query.crowdLevel) { filter.crowdLevel = query.crowdLevel; activeFilters.crowdLevel = query.crowdLevel; }
            if (query.familyFriendly !== undefined) {
                filter.familyFriendly = query.familyFriendly === 'true';
                activeFilters.familyFriendly = query.familyFriendly;
            }
            if (query.duration) { filter.duration = query.duration; activeFilters.duration = query.duration; }
            if (query.distance) { filter.distanceFromAhmedabad = query.distance; activeFilters.distance = query.distance; }
            if (query.season) { filter.season = query.season; activeFilters.season = query.season; }
            if (query.activityType) { filter.activityType = { $in: [query.activityType] }; activeFilters.activityType = query.activityType; }
            if (query.indoorOutdoor) { filter.indoorOutdoor = query.indoorOutdoor; activeFilters.indoorOutdoor = query.indoorOutdoor; }
            if (query.budget) { filter.budget = query.budget; activeFilters.budget = query.budget; }

            // Full text search
            if (query.search) {
                filter.$or = [
                    { name: { $regex: query.search, $options: 'i' } },
                    { city: { $regex: query.search, $options: 'i' } },
                    { state: { $regex: query.search, $options: 'i' } },
                    { country: { $regex: query.search, $options: 'i' } },
                    { description: { $regex: query.search, $options: 'i' } },
                    { tags: { $in: [new RegExp(query.search, 'i')] } },
                ];
                activeFilters.search = query.search;
            }

            // ── Premium-only filters ─────────────────────────────────────────
            if (userRole === 'premium' || userRole === 'admin') {
                if (query.accommodationNearby) { filter.accommodationNearby = { $in: [query.accommodationNearby] }; activeFilters.accommodationNearby = query.accommodationNearby; }
                if (query.foodOptions) { filter.foodOptions = { $in: [query.foodOptions] }; activeFilters.foodOptions = query.foodOptions; }
                if (query.photographyScore) { filter.photographyScore = query.photographyScore; activeFilters.photographyScore = query.photographyScore; }
                if (query.ageSuitability) { filter.ageSuitability = { $in: [query.ageSuitability] }; activeFilters.ageSuitability = query.ageSuitability; }
                if (query.fitnessLevel) { filter.fitnessLevel = query.fitnessLevel; activeFilters.fitnessLevel = query.fitnessLevel; }
                if (query.guidedTours) { filter.guidedTours = { $in: [query.guidedTours] }; activeFilters.guidedTours = query.guidedTours; }
                if (query.petFriendly) { filter.petFriendly = query.petFriendly; activeFilters.petFriendly = query.petFriendly; }
                if (query.parking) { filter.parking = query.parking; activeFilters.parking = query.parking; }
                if (query.facilities) { filter.facilities = { $in: [query.facilities] }; activeFilters.facilities = query.facilities; }
                if (query.transportMode) { filter.transportMode = { $in: [query.transportMode] }; activeFilters.transportMode = query.transportMode; }
                if (query.budgetPerPerson) { filter.budgetPerPerson = query.budgetPerPerson; activeFilters.budgetPerPerson = query.budgetPerPerson; }
            }
        }

        // ── Limits & Pagination ────────────────────────────────────────────────
        let limit, skip;
        const page = Math.max(1, parseInt(query.page, 10) || 1);

        if (!user) {
            limit = 6;
            skip = 0;
        } else if (userRole === 'premium' || userRole === 'admin') {
            limit = 30;
            skip = (page - 1) * 30;
        } else {
            // free
            limit = 10;
            skip = 0;
        }

        // ── Sorting ────────────────────────────────────────────────────────────
        const sort = SORT_OPTIONS[query.sortBy] || SORT_OPTIONS.rating;

        // ── Query MongoDB ──────────────────────────────────────────────────────
        const [places, totalCount] = await Promise.all([
            Place.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            Place.countDocuments(filter),
        ]);

        // ── Hybrid Search Fallback ─────────────────────────────────────────────
        let finalPlaces = places;

        if (user && places.length < 3 && (query.search || query.city || query.state)) {
            const searchTerm = query.search || query.city || query.state;
            const context = query.city || query.state || query.country || 'India';

            try {
                const searchResults = await hybridPlacesSearch(searchTerm, context);
                // Exclude matches already in Mongoose results to prevent duplicates
                const existingNames = new Set(places.map(p => p.name.toLowerCase()));
                const fresh = searchResults.filter(p => !existingNames.has(p.name.toLowerCase()));
                finalPlaces = [...places, ...fresh];
            } catch (err) {
                console.warn('[getAllPlaces] Hybrid search fallback error:', err.message);
            }
        }

        // ── Response ───────────────────────────────────────────────────────────
        const isPremiumOrAdmin = userRole === 'premium' || userRole === 'admin';
        const canLoadMore = isPremiumOrAdmin && totalCount > skip + limit;

        res.json({
            success: true,
            count: finalPlaces.length,
            totalAvailable: totalCount,
            canLoadMore,
            nextPage: canLoadMore ? page + 1 : null,
            userRole,
            filtersApplied: Object.keys(activeFilters).length,
            data: finalPlaces,
        });
    } catch (error) {
        console.error('[getAllPlaces] Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching places' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Load more places (premium pagination — page 2+)
// @route   GET /api/places/load-more?page=2&sortBy=rating&...
// @access  Premium only
// ─────────────────────────────────────────────────────────────────────────────
exports.loadMorePlaces = async (req, res) => {
    try {
        const query = req.query;
        const page = Math.max(2, parseInt(query.page, 10) || 2);
        const limit = 20;
        const skip = (page - 1) * 20;

        // Re-apply all premium filters
        const filter = {};
        const activeFilters = {};

        if (query.type) { filter.type = query.type; }
        if (query.city) { filter.city = { $regex: query.city, $options: 'i' }; }
        if (query.state) { filter.state = { $regex: query.state, $options: 'i' }; }
        if (query.country) { filter.country = { $regex: query.country, $options: 'i' }; }
        if (query.bestTime) { filter.bestTime = { $in: [query.bestTime] }; }
        if (query.entryFee) { filter.entryFee = query.entryFee; }
        if (query.category) { filter.category = query.category; }
        if (query.crowdLevel) { filter.crowdLevel = query.crowdLevel; }
        if (query.duration) { filter.duration = query.duration; }
        if (query.distance) { filter.distanceFromAhmedabad = query.distance; }
        if (query.season) { filter.season = query.season; }
        if (query.activityType) { filter.activityType = { $in: [query.activityType] }; }
        if (query.indoorOutdoor) { filter.indoorOutdoor = query.indoorOutdoor; }
        if (query.budget) { filter.budget = query.budget; }
        if (query.familyFriendly !== undefined) {
            filter.familyFriendly = query.familyFriendly === 'true';
        }
        if (query.accommodationNearby) { filter.accommodationNearby = { $in: [query.accommodationNearby] }; }
        if (query.foodOptions) { filter.foodOptions = { $in: [query.foodOptions] }; }
        if (query.photographyScore) { filter.photographyScore = query.photographyScore; }
        if (query.ageSuitability) { filter.ageSuitability = { $in: [query.ageSuitability] }; }
        if (query.fitnessLevel) { filter.fitnessLevel = query.fitnessLevel; }
        if (query.guidedTours) { filter.guidedTours = { $in: [query.guidedTours] }; }
        if (query.petFriendly) { filter.petFriendly = query.petFriendly; }
        if (query.parking) { filter.parking = query.parking; }
        if (query.facilities) { filter.facilities = { $in: [query.facilities] }; }
        if (query.transportMode) { filter.transportMode = { $in: [query.transportMode] }; }
        if (query.budgetPerPerson) { filter.budgetPerPerson = query.budgetPerPerson; }

        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { city: { $regex: query.search, $options: 'i' } },
                { state: { $regex: query.search, $options: 'i' } },
                { country: { $regex: query.search, $options: 'i' } },
                { description: { $regex: query.search, $options: 'i' } },
                { tags: { $in: [new RegExp(query.search, 'i')] } },
            ];
        }

        const sort = SORT_OPTIONS[query.sortBy] || SORT_OPTIONS.rating;

        const [places, totalCount] = await Promise.all([
            Place.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            Place.countDocuments(filter),
        ]);

        const canLoadMore = totalCount > skip + limit;

        res.json({
            success: true,
            count: places.length,
            totalAvailable: totalCount,
            canLoadMore,
            nextPage: canLoadMore ? page + 1 : null,
            userRole: req.user.role,
            filtersApplied: Object.keys(activeFilters).length,
            data: places,
        });
    } catch (error) {
        console.error('[loadMorePlaces] Error:', error);
        res.status(500).json({ success: false, message: 'Server error loading more places' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Dedicated worldwide place search endpoint
// @route   GET /api/places/search?q=delhi
// @access  Protected (logged-in users only)
// ─────────────────────────────────────────────────────────────────────────────
exports.searchPlaces = async (req, res) => {
    try {
        const searchTerm = (req.query.q || '').trim();

        if (!searchTerm || searchTerm.length < 2) {
            return res.status(400).json({
                message: 'Please provide a search term of at least 2 characters (use ?q=...)'
            });
        }

        const combined = await hybridPlacesSearch(searchTerm, 'India');

        const results = combined.slice(0, 10).map(p => ({
            _id: p._id,
            name: p.name,
            city: p.city,
            country: p.country,
            image: p.image || (p.images && p.images[0]) || null,
            category: p.category,
            budget: p.budget,
            rating: p.averageRating ?? p.rating ?? 0,
            description: p.description,
            bestFor: p.bestFor || null,
            isFromGoogle: p.isFromGoogle || false,
            source: p.source || 'manual',
        }));

        res.json(results);
    } catch (error) {
        console.error('[searchPlaces] Error:', error);
        res.status(500).json({ message: 'Server error during search' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single place by ID
// @route   GET /api/places/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.getSinglePlace = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) return res.status(404).json({ message: 'Place not found' });
        res.json(place);
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Place not found' });
        console.error('[getSinglePlace] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Save a place to user's favourites
// @route   POST /api/places/save/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.saveFavouritePlace = async (req, res) => {
    try {
        const placeId = req.params.id;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const place = await Place.findById(placeId);
        if (!place) return res.status(404).json({ message: 'Place not found' });

        if (user.savedPlaces.includes(placeId)) {
            return res.status(400).json({ message: 'Place already saved' });
        }

        if (user.role === 'free' && user.savedPlaces.length >= 10) {
            return res.status(403).json({
                message: 'Free users can only save up to 10 places. Upgrade to Premium for unlimited saves.'
            });
        }

        user.savedPlaces.push(placeId);
        await user.save();

        res.status(200).json({ message: 'Place saved successfully', savedPlaces: user.savedPlaces });
    } catch (error) {
        console.error('[saveFavouritePlace] Error:', error);
        res.status(500).json({ message: 'Server error while saving place', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Remove a place from user's favourites
// @route   DELETE /api/places/save/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.removeSavedPlace = async (req, res) => {
    try {
        const placeId = req.params.id;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        user.savedPlaces = user.savedPlaces.filter(id => id.toString() !== placeId.toString());
        await user.save();

        res.status(200).json({ message: 'Place removed successfully', savedPlaces: user.savedPlaces });
    } catch (error) {
        console.error('[removeSavedPlace] Error:', error);
        res.status(500).json({ message: 'Server error while removing place' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get user's saved places
// @route   GET /api/places/saved
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.getSavedPlaces = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('savedPlaces');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.savedPlaces);
    } catch (error) {
        console.error('[getSavedPlaces] Error:', error);
        res.status(500).json({ message: 'Server error fetching saved places' });
    }
};
