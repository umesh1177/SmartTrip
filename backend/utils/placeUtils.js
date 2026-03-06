/**
 * Detect a SmartTrip place category from Google Places API types array.
 * @param {string[]} types - Array of Google place types
 * @returns {string} - One of our schema-valid categories
 */
function detectCategoryFromTypes(types) {
    if (types.includes('natural_feature') ||
        types.includes('campground')) return 'adventure';

    if (types.includes('museum') ||
        types.includes('church') ||
        types.includes('hindu_temple')) return 'cultural';

    if (types.includes('park') ||
        types.includes('zoo')) return 'wildlife';

    if (types.includes('amusement_park')) return 'adventure';

    if (types.includes('spa') ||
        types.includes('lodging')) return 'city';   // 'luxury' not in schema enum; map to 'city'

    if (types.includes('beach')) return 'beach';

    if (types.includes('locality') ||
        types.includes('political')) return 'city';

    return 'city';
}

/**
 * Extract city and country strings from a Google formatted_address.
 * e.g. "Taj Mahal, Tajganj, Agra, Uttar Pradesh 282001, India"
 *      → { city: "Uttar Pradesh", country: "India" }
 * @param {string} formattedAddress
 * @returns {{ city: string, country: string }}
 */
function extractCityCountry(formattedAddress) {
    const parts = (formattedAddress || '').split(',');
    const country = parts[parts.length - 1].trim();
    // Strip trailing postal codes from the city segment
    const rawCity = parts[parts.length - 2]?.trim() || parts[0].trim();
    const city = rawCity.replace(/\s*\d+\s*/g, '').trim();
    return { city, country };
}

module.exports = { detectCategoryFromTypes, extractCityCountry };
