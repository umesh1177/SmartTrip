/**
 * seedPlaceFields.js
 * ──────────────────
 * Backfills all existing Place documents with the new filter fields
 * added to the schema. Run once:
 *
 *   node scripts/seedPlaceFields.js
 *
 * Safe to re-run (uses $set, never overwrites already-set values
 * unless FORCE=1 env var is passed).
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../models/Place');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smarttrip';

// ── Per-place overrides keyed by name (partial, case-insensitive match) ──────
// Each entry provides values that are specific to that destination.
// Places not listed here get smart defaults derived from their category.
const PLACE_OVERRIDES = [
    // ── Indian / Gujarat / Rajasthan temples & forts ─────────────────────────
    {
        match: /taj mahal/i,
        data: {
            type: 'ancient', state: 'Uttar Pradesh',
            activityType: ['sightseeing', 'photography', 'educational'],
            bestTime: ['morning', 'evening'],
            bestSeason: ['oct_dec', 'jan_mar'],
            crowdLevel: 'high',
            entryFee: '100_to_500',
            duration: 'full_day',
            distanceFromAhmedabad: 'above_300km',
            accessibility: 'partial',
            parking: 'paid',
            transportMode: ['car', 'train', 'bus'],
            ageSuitability: ['all'],
            fitnessLevel: 'easy',
            indoorOutdoor: 'outdoor',
            familyFriendly: true,
            photographyScore: 'excellent',
            facilities: ['restrooms', 'food_court', 'first_aid', 'atm'],
            guidedTours: ['professional', 'audio', 'group'],
            foodOptions: ['restaurant', 'street_food'],
            accommodationNearby: ['hotels', 'budget', 'luxury'],
            languages: ['hindi', 'english'],
            budgetPerPerson: 'mid_range',
            petFriendly: 'not_allowed',
            crowdCalendar: { jan: 'peak', feb: 'peak', mar: 'peak', apr: 'moderate', may: 'off', jun: 'off', jul: 'moderate', aug: 'moderate', sep: 'moderate', oct: 'peak', nov: 'peak', dec: 'peak' },
        },
    },
    {
        match: /goa/i,
        data: {
            type: 'beach', state: 'Goa',
            activityType: ['relaxation', 'adventure', 'photography', 'sightseeing'],
            bestTime: ['morning', 'evening'],
            bestSeason: ['oct_dec', 'jan_mar'],
            crowdLevel: 'high',
            entryFee: 'free',
            duration: 'full_day',
            distanceFromAhmedabad: 'above_300km',
            accessibility: 'partial',
            parking: 'free',
            transportMode: ['car', 'train', 'flight', 'bus'],
            ageSuitability: ['teenagers', 'adults'],
            fitnessLevel: 'easy',
            indoorOutdoor: 'outdoor',
            familyFriendly: true,
            photographyScore: 'excellent',
            facilities: ['restrooms', 'food_court', 'wifi', 'atm', 'shopping'],
            guidedTours: ['self_guided', 'group'],
            foodOptions: ['restaurant', 'street_food'],
            accommodationNearby: ['hotels', 'budget', 'luxury'],
            languages: ['hindi', 'english', 'regional'],
            budgetPerPerson: 'mid_range',
            petFriendly: 'partial',
            crowdCalendar: { jan: 'peak', feb: 'peak', mar: 'peak', apr: 'moderate', may: 'off', jun: 'off', jul: 'off', aug: 'off', sep: 'moderate', oct: 'peak', nov: 'peak', dec: 'peak' },
        },
    },
    {
        match: /manali/i,
        data: {
            type: 'hill_station', state: 'Himachal Pradesh',
            activityType: ['adventure', 'photography', 'relaxation', 'sightseeing'],
            bestTime: ['morning', 'all_day'],
            bestSeason: ['apr_jun', 'oct_dec'],
            crowdLevel: 'medium',
            entryFee: 'free',
            duration: 'full_day',
            distanceFromAhmedabad: 'above_300km',
            accessibility: 'none',
            parking: 'limited',
            transportMode: ['car', 'bus'],
            ageSuitability: ['teenagers', 'adults', 'seniors'],
            fitnessLevel: 'moderate',
            indoorOutdoor: 'outdoor',
            familyFriendly: true,
            photographyScore: 'excellent',
            facilities: ['restrooms', 'first_aid'],
            guidedTours: ['professional', 'group'],
            foodOptions: ['restaurant', 'street_food'],
            accommodationNearby: ['hotels', 'budget', 'camping'],
            languages: ['hindi', 'english', 'regional'],
            budgetPerPerson: 'mid_range',
            petFriendly: 'allowed',
            crowdCalendar: { jan: 'moderate', feb: 'moderate', mar: 'moderate', apr: 'peak', may: 'peak', jun: 'peak', jul: 'moderate', aug: 'moderate', sep: 'moderate', oct: 'peak', nov: 'moderate', dec: 'moderate' },
        },
    },
    {
        match: /kerala|munnar|alleppey|backwaters/i,
        data: {
            type: 'nature', state: 'Kerala',
            activityType: ['relaxation', 'photography', 'sightseeing', 'adventure'],
            bestTime: ['morning', 'evening'],
            bestSeason: ['oct_dec', 'jan_mar'],
            crowdLevel: 'medium',
            entryFee: 'free',
            duration: 'full_day',
            distanceFromAhmedabad: 'above_300km',
            accessibility: 'partial',
            parking: 'limited',
            transportMode: ['car', 'train', 'flight'],
            ageSuitability: ['all'],
            fitnessLevel: 'easy',
            indoorOutdoor: 'outdoor',
            familyFriendly: true,
            photographyScore: 'excellent',
            facilities: ['restrooms', 'food_court'],
            guidedTours: ['professional', 'group'],
            foodOptions: ['restaurant', 'street_food'],
            accommodationNearby: ['hotels', 'budget', 'luxury'],
            languages: ['hindi', 'english', 'regional'],
            budgetPerPerson: 'mid_range',
            petFriendly: 'not_allowed',
            crowdCalendar: { jan: 'peak', feb: 'moderate', mar: 'moderate', apr: 'moderate', may: 'off', jun: 'off', jul: 'off', aug: 'off', sep: 'moderate', oct: 'peak', nov: 'peak', dec: 'peak' },
        },
    },
    {
        match: /paris/i,
        data: {
            type: 'modern', state: 'Île-de-France',
            activityType: ['sightseeing', 'educational', 'photography', 'relaxation'],
            bestTime: ['morning', 'evening'],
            bestSeason: ['apr_jun', 'jul_sep'],
            crowdLevel: 'high',
            entryFee: '100_to_500',
            duration: 'full_day',
            accessibility: 'wheelchair',
            parking: 'paid',
            transportMode: ['flight', 'train'],
            ageSuitability: ['all'],
            fitnessLevel: 'easy',
            indoorOutdoor: 'mixed',
            familyFriendly: true,
            photographyScore: 'excellent',
            facilities: ['restrooms', 'food_court', 'wifi', 'atm', 'shopping'],
            guidedTours: ['audio', 'professional', 'group'],
            foodOptions: ['restaurant'],
            accommodationNearby: ['hotels', 'luxury', 'budget'],
            languages: ['english'],
            budgetPerPerson: 'premium',
            petFriendly: 'allowed',
            crowdCalendar: { jan: 'off', feb: 'off', mar: 'moderate', apr: 'peak', may: 'peak', jun: 'peak', jul: 'peak', aug: 'peak', sep: 'peak', oct: 'moderate', nov: 'moderate', dec: 'moderate' },
        },
    },
    {
        match: /tokyo|japan/i,
        data: {
            type: 'modern', state: 'Tokyo',
            activityType: ['sightseeing', 'educational', 'photography', 'relaxation'],
            bestTime: ['all_day'],
            bestSeason: ['jan_mar', 'oct_dec'],
            crowdLevel: 'high',
            entryFee: 'free',
            duration: 'full_day',
            accessibility: 'wheelchair',
            parking: 'paid',
            transportMode: ['flight', 'train'],
            ageSuitability: ['all'],
            fitnessLevel: 'easy',
            indoorOutdoor: 'mixed',
            familyFriendly: true,
            photographyScore: 'excellent',
            facilities: ['restrooms', 'food_court', 'wifi', 'atm', 'shopping'],
            guidedTours: ['audio', 'self_guided', 'group'],
            foodOptions: ['restaurant', 'street_food'],
            accommodationNearby: ['hotels', 'budget', 'luxury'],
            languages: ['english'],
            budgetPerPerson: 'premium',
            petFriendly: 'not_allowed',
            crowdCalendar: { jan: 'moderate', feb: 'moderate', mar: 'peak', apr: 'peak', may: 'moderate', jun: 'moderate', jul: 'moderate', aug: 'moderate', sep: 'moderate', oct: 'peak', nov: 'peak', dec: 'moderate' },
        },
    },
    {
        match: /maldives/i,
        data: {
            type: 'beach',
            activityType: ['relaxation', 'adventure', 'photography'],
            bestTime: ['morning', 'evening', 'all_day'],
            bestSeason: ['oct_dec', 'jan_mar'],
            crowdLevel: 'low',
            entryFee: 'free',
            duration: 'full_day',
            accessibility: 'partial',
            parking: 'none',
            transportMode: ['flight'],
            ageSuitability: ['adults', 'seniors'],
            fitnessLevel: 'easy',
            indoorOutdoor: 'outdoor',
            familyFriendly: true,
            photographyScore: 'excellent',
            facilities: ['restrooms', 'food_court', 'wifi'],
            guidedTours: ['professional', 'group'],
            foodOptions: ['restaurant'],
            accommodationNearby: ['luxury'],
            languages: ['english'],
            budgetPerPerson: 'premium',
            petFriendly: 'not_allowed',
            crowdCalendar: { jan: 'peak', feb: 'peak', mar: 'peak', apr: 'moderate', may: 'off', jun: 'off', jul: 'off', aug: 'off', sep: 'moderate', oct: 'peak', nov: 'peak', dec: 'peak' },
        },
    },
    {
        match: /new york|usa/i,
        data: {
            type: 'modern', state: 'New York',
            activityType: ['sightseeing', 'educational', 'photography', 'relaxation'],
            bestTime: ['all_day'],
            bestSeason: ['jan_mar', 'apr_jun', 'jul_sep', 'oct_dec'],
            crowdLevel: 'high',
            entryFee: 'free',
            duration: 'full_day',
            accessibility: 'wheelchair',
            parking: 'paid',
            transportMode: ['flight', 'train'],
            ageSuitability: ['all'],
            fitnessLevel: 'easy',
            indoorOutdoor: 'mixed',
            familyFriendly: true,
            photographyScore: 'excellent',
            facilities: ['restrooms', 'food_court', 'wifi', 'atm', 'shopping'],
            guidedTours: ['audio', 'professional', 'group'],
            foodOptions: ['restaurant', 'street_food'],
            accommodationNearby: ['hotels', 'budget', 'luxury'],
            languages: ['english'],
            budgetPerPerson: 'premium',
            petFriendly: 'allowed',
            crowdCalendar: { jan: 'moderate', feb: 'moderate', mar: 'moderate', apr: 'peak', may: 'peak', jun: 'peak', jul: 'peak', aug: 'peak', sep: 'peak', oct: 'peak', nov: 'moderate', dec: 'moderate' },
        },
    },
    {
        match: /bali|indonesia/i,
        data: {
            type: 'temple', state: 'Bali',
            activityType: ['relaxation', 'spiritual', 'photography', 'adventure'],
            bestTime: ['morning', 'evening'],
            bestSeason: ['apr_jun', 'jul_sep'],
            crowdLevel: 'medium',
            entryFee: 'below_100',
            duration: 'full_day',
            accessibility: 'partial',
            parking: 'free',
            transportMode: ['flight', 'car'],
            ageSuitability: ['all'],
            fitnessLevel: 'easy',
            indoorOutdoor: 'outdoor',
            familyFriendly: true,
            photographyScore: 'excellent',
            facilities: ['restrooms', 'food_court', 'atm', 'shopping'],
            guidedTours: ['professional', 'group'],
            foodOptions: ['restaurant', 'street_food'],
            accommodationNearby: ['hotels', 'budget', 'luxury'],
            languages: ['english'],
            budgetPerPerson: 'mid_range',
            petFriendly: 'not_allowed',
            crowdCalendar: { jan: 'moderate', feb: 'moderate', mar: 'moderate', apr: 'peak', may: 'peak', jun: 'peak', jul: 'peak', aug: 'peak', sep: 'peak', oct: 'moderate', nov: 'moderate', dec: 'moderate' },
        },
    },
    {
        match: /dubai|uae/i,
        data: {
            type: 'modern', state: 'Dubai',
            activityType: ['sightseeing', 'relaxation', 'photography', 'adventure'],
            bestTime: ['morning', 'evening', 'night'],
            bestSeason: ['oct_dec', 'jan_mar'],
            crowdLevel: 'high',
            entryFee: '100_to_500',
            duration: 'full_day',
            accessibility: 'wheelchair',
            parking: 'paid',
            transportMode: ['flight', 'car'],
            ageSuitability: ['all'],
            fitnessLevel: 'easy',
            indoorOutdoor: 'mixed',
            familyFriendly: true,
            photographyScore: 'excellent',
            facilities: ['restrooms', 'food_court', 'wifi', 'atm', 'shopping', 'first_aid'],
            guidedTours: ['audio', 'professional', 'group'],
            foodOptions: ['restaurant'],
            accommodationNearby: ['hotels', 'luxury', 'budget'],
            languages: ['hindi', 'english'],
            budgetPerPerson: 'premium',
            petFriendly: 'not_allowed',
            crowdCalendar: { jan: 'peak', feb: 'peak', mar: 'peak', apr: 'moderate', may: 'off', jun: 'off', jul: 'off', aug: 'off', sep: 'moderate', oct: 'peak', nov: 'peak', dec: 'peak' },
        },
    },
];

// ── Category-based smart defaults (applied to all places not in overrides) ───
function defaultsForCategory(cat) {
    const base = {
        indoorOutdoor: 'outdoor',
        familyFriendly: true,
        ageSuitability: ['all'],
        fitnessLevel: 'easy',
        petFriendly: 'not_allowed',
        parking: 'limited',
        transportMode: ['car', 'bus'],
        facilities: ['restrooms'],
        guidedTours: ['self_guided'],
        foodOptions: ['street_food'],
        accommodationNearby: ['hotels', 'budget'],
        languages: ['hindi', 'english'],
        budgetPerPerson: 'mid_range',
        photographyScore: 'good',
        crowdLevel: 'medium',
        entryFee: 'free',
        bestTime: ['morning', 'all_day'],
        bestSeason: ['oct_dec'],
        activityType: ['sightseeing'],
        facilities: ['restrooms'],
        crowdCalendar: { jan: 'moderate', feb: 'moderate', mar: 'moderate', apr: 'off', may: 'off', jun: 'off', jul: 'moderate', aug: 'moderate', sep: 'moderate', oct: 'peak', nov: 'peak', dec: 'peak' },
    };

    const overrides = {
        beach: {
            type: 'beach', indoorOutdoor: 'outdoor', fitnessLevel: 'easy',
            activityType: ['relaxation', 'adventure', 'photography'],
            photographyScore: 'excellent', entryFee: 'free',
            bestSeason: ['oct_dec', 'jan_mar'],
        },
        mountain: {
            type: 'hill_station', indoorOutdoor: 'outdoor', fitnessLevel: 'challenging',
            activityType: ['adventure', 'photography', 'relaxation'],
            photographyScore: 'excellent', entryFee: 'free',
            bestSeason: ['apr_jun'],
        },
        city: {
            type: 'city', indoorOutdoor: 'mixed', fitnessLevel: 'easy',
            activityType: ['sightseeing', 'educational', 'relaxation'],
            photographyScore: 'good',
        },
        adventure: {
            type: 'nature', indoorOutdoor: 'outdoor', fitnessLevel: 'challenging',
            activityType: ['adventure', 'photography'],
            photographyScore: 'excellent', entryFee: 'below_100',
        },
        cultural: {
            type: 'ancient', indoorOutdoor: 'mixed', fitnessLevel: 'easy',
            activityType: ['educational', 'sightseeing', 'photography'],
            photographyScore: 'excellent', entryFee: '100_to_500',
            guidedTours: ['audio', 'professional'],
        },
        wildlife: {
            type: 'wildlife', indoorOutdoor: 'outdoor', fitnessLevel: 'moderate',
            activityType: ['adventure', 'photography', 'educational'],
            photographyScore: 'excellent', entryFee: '100_to_500',
            bestSeason: ['oct_dec', 'jan_mar'],
        },
        luxury: {
            type: 'modern', indoorOutdoor: 'mixed', fitnessLevel: 'easy',
            activityType: ['relaxation', 'sightseeing'],
            photographyScore: 'excellent', budgetPerPerson: 'premium',
            accommodationNearby: ['hotels', 'luxury'],
        },
    };

    return { ...base, ...(overrides[cat] || {}) };
}

// ────────────────────────────────────────────────────────────────────────────
async function run() {
    console.log('🔌 Connecting to MongoDB…');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected');

    const places = await Place.find({});
    console.log(`📦 Found ${places.length} place(s) to update`);

    let updated = 0;
    for (const place of places) {
        // 1. Try named override
        const override = PLACE_OVERRIDES.find(o => o.match.test(place.name));
        // 2. Fall back to category defaults
        const categoryDef = defaultsForCategory(place.category);
        const patch = { ...(override?.data || categoryDef) };

        // Only set fields that are not already populated (unless FORCE=1)
        const force = process.env.FORCE === '1';
        const $set = {};

        for (const [key, val] of Object.entries(patch)) {
            const current = place[key];
            const isEmpty =
                current === undefined ||
                current === null ||
                (Array.isArray(current) && current.length === 0) ||
                (typeof current === 'object' && !Array.isArray(current) &&
                    Object.keys(current).length === 0);

            if (force || isEmpty) {
                $set[key] = val;
            }
        }

        // always ensure duration is valid enum value
        if (!['weekend', '1-week', '2-weeks', 'month', '1_2hrs', '3_4hrs', 'full_day'].includes(place.duration)) {
            $set.duration = 'full_day';
        }

        if (Object.keys($set).length > 0) {
            await Place.updateOne({ _id: place._id }, { $set });
            updated++;
            console.log(`  ✔ Updated: ${place.name}`);
        } else {
            console.log(`  ⏭ Skipped (already full): ${place.name}`);
        }
    }

    console.log(`\n🎉 Done! Updated ${updated} / ${places.length} places.`);
    await mongoose.disconnect();
    process.exit(0);
}

run().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
