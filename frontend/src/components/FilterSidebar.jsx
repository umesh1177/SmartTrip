/**
 * FilterSidebar.jsx
 * ─────────────────
 * Role-tiered smart filter panel for the Explore page.
 *
 * Tier 1  – Common filters (all users, including guests)
 * Tier 2  – Free-user filters (locked / blurred for guests)
 * Tier 3  – Premium-only filters (locked / blurred for free + guests)
 *
 * Props:
 *   filters          – current filter object (controlled from Explore.jsx)
 *   onChange(patch)  – partial filter update handler
 *   onReset()        – reset all filters
 *   onClose()        – close sidebar (mobile)
 *   isLoggedIn       – boolean
 *   isPremium        – boolean
 *   resultCount      – number of results being shown
 *   totalAvailable   – total count from API
 *   userRole         – 'guest' | 'free' | 'premium' | 'admin'
 */

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    SlidersHorizontal, X, Lock, Star, RotateCcw,
    MapPin, ChevronDown, ChevronUp
} from 'lucide-react';

// ── Reusable chip-pill component ──────────────────────────────────────────────
function Chip({ label, active, onClick, color = 'indigo' }) {
    const colors = {
        indigo: active ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-700',
        amber: active ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-700',
    };
    return (
        <button
            type="button"
            onClick={onClick}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap ${colors[color]}`}
        >
            {label}
        </button>
    );
}

// ── Collapsible section wrapper ───────────────────────────────────────────────
function Section({ title, defaultOpen = true, children, badge }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 last:border-0 pb-4 mb-1">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center justify-between w-full mb-3 group"
            >
                <span className="text-xs font-extrabold text-gray-500 uppercase tracking-widest group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                    {title}
                    {badge && (
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                            {badge}
                        </span>
                    )}
                </span>
                {open
                    ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                    : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                }
            </button>
            {open && <div className="space-y-3">{children}</div>}
        </div>
    );
}

// ── ChipGroup: single-select ──────────────────────────────────────────────────
function ChipGroup({ options, value, onChange, color }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {options.map(o => (
                <Chip
                    key={o.value}
                    label={o.label}
                    active={value === o.value}
                    onClick={() => onChange(value === o.value ? '' : o.value)}
                    color={color}
                />
            ))}
        </div>
    );
}

// ── MultiChipGroup: multi-select ──────────────────────────────────────────────
function MultiChipGroup({ options, value = [], onChange, color }) {
    const toggle = (v) => {
        onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
    };
    return (
        <div className="flex flex-wrap gap-1.5">
            {options.map(o => (
                <Chip
                    key={o.value}
                    label={o.label}
                    active={value.includes(o.value)}
                    onClick={() => toggle(o.value)}
                    color={color}
                />
            ))}
        </div>
    );
}

// ── Lock overlay shown over tier sections for unauthorized users ───────────────
function LockOverlay({ message, linkTo, linkLabel }) {
    return (
        <div className="relative">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 rounded-xl flex flex-col items-center justify-center py-6 gap-3">
                <Lock className="w-7 h-7 text-gray-400" />
                <p className="text-xs font-bold text-gray-500 text-center px-4">{message}</p>
                <Link
                    to={linkTo}
                    className="text-xs font-extrabold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                    {linkLabel}
                </Link>
            </div>
            {/* Blurred placeholder chips */}
            <div className="flex flex-wrap gap-1.5 pointer-events-none select-none blur-[3px] opacity-60">
                {['Option A', 'Option B', 'Option C', 'Option D'].map(l => (
                    <span key={l} className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-400">{l}</span>
                ))}
            </div>
        </div>
    );
}

// ── Indian states list ────────────────────────────────────────────────────────
const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

// ──────────────────────────────────────────────────────────────────────────────
// Main FilterSidebar component
// ──────────────────────────────────────────────────────────────────────────────
export default function FilterSidebar({
    filters = {},
    onChange,
    onReset,
    onClose,
    isLoggedIn = false,
    isPremium = false,
    resultCount = 0,
    totalAvailable = 0,
    userRole = 'guest',
}) {
    const set = useCallback((key, val) => onChange({ [key]: val }), [onChange]);

    // Count active filters
    const activeCount = Object.entries(filters).reduce((n, [k, v]) => {
        if (k === 'sortBy') return n;
        if (Array.isArray(v)) return n + (v.length > 0 ? 1 : 0);
        return n + (v ? 1 : 0);
    }, 0);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                    <span className="font-extrabold text-gray-900 text-sm">
                        Filters
                        {activeCount > 0 && (
                            <span className="ml-1.5 bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                {activeCount}
                            </span>
                        )}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {activeCount > 0 && (
                        <button
                            onClick={onReset}
                            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                        >
                            <RotateCcw className="w-3 h-3" /> Reset All
                        </button>
                    )}
                    <button onClick={onClose} className="md:hidden p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Result count message ── */}
            <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100">
                <p className="text-[11px] font-bold text-gray-500">
                    {userRole === 'guest'
                        ? `Showing 6 featured destinations`
                        : userRole === 'free'
                            ? `Found ${resultCount} places${activeCount > 0 ? ' matching your filters' : ''} (max 10)`
                            : `Found ${resultCount} places${activeCount > 0 ? ' matching your filters' : ''}${totalAvailable > resultCount ? ` of ${totalAvailable}` : ''}`
                    }
                </p>
            </div>

            {/* ── Scrollable filter body ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">

                {/* ════════════════════════════════════════════════════════
                    SECTION 1 — COMMON FILTERS (all users including guests)
                ════════════════════════════════════════════════════════ */}

                {/* Location */}
                <Section title="Location" defaultOpen={true}>
                    <div className="space-y-2">
                        <div className="relative">
                            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="City (e.g. Goa)"
                                value={filters.city || ''}
                                onChange={e => set('city', e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-400"
                            />
                        </div>
                        <select
                            value={filters.state || ''}
                            onChange={e => set('state', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        >
                            <option value="">All States</option>
                            {INDIAN_STATES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                            <option value="International">International</option>
                        </select>
                        <select
                            value={filters.country || ''}
                            onChange={e => set('country', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        >
                            <option value="">All Countries</option>
                            <option value="India">India</option>
                            {['France', 'Japan', 'Indonesia', 'UAE', 'USA', 'Italy', 'Thailand', 'UK', 'Greece', 'Australia', 'Canada', 'Maldives'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </Section>

                {/* Place Type */}
                <Section title="Place Type" badge={filters.type ? '1' : null}>
                    <ChipGroup
                        value={filters.type || ''}
                        onChange={v => set('type', v)}
                        options={[
                            { label: '🏛 Ancient', value: 'ancient' },
                            { label: '🛕 Temple', value: 'temple' },
                            { label: '🌿 Nature', value: 'nature' },
                            { label: '🏙 Modern', value: 'modern' },
                            { label: '🏖 Beach', value: 'beach' },
                            { label: '🏛 Museum', value: 'museum' },
                            { label: '🏰 Fort', value: 'fort' },
                            { label: '🦁 Wildlife', value: 'wildlife' },
                            { label: '⛰ Hill Station', value: 'hill_station' },
                            { label: '🏙 City', value: 'city' },
                        ]}
                    />
                </Section>

                {/* Best Time to Visit */}
                <Section title="Best Time to Visit" badge={filters.bestTime ? '1' : null}>
                    <ChipGroup
                        value={filters.bestTime || ''}
                        onChange={v => set('bestTime', v)}
                        options={[
                            { label: '🌅 Morning', value: 'morning' },
                            { label: '🌇 Evening', value: 'evening' },
                            { label: '☀️ All Day', value: 'all_day' },
                            { label: '🌙 Night', value: 'night' },
                        ]}
                    />
                </Section>

                {/* Entry Fee */}
                <Section title="Entry Fee" badge={filters.entryFee ? '1' : null}>
                    <ChipGroup
                        value={filters.entryFee || ''}
                        onChange={v => set('entryFee', v)}
                        options={[
                            { label: '🆓 Free', value: 'free' },
                            { label: '< ₹100', value: 'below_100' },
                            { label: '₹100–₹500', value: '100_to_500' },
                            { label: '> ₹500', value: 'above_500' },
                        ]}
                    />
                </Section>

                {/* ════════════════════════════════════════════════════════
                    SECTION 2 — FREE USER FILTERS
                ════════════════════════════════════════════════════════ */}
                <div className="pt-1">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            {!isLoggedIn && <Lock className="w-3 h-3" />}
                            More Filters
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {!isLoggedIn ? (
                        <LockOverlay
                            message="Login to unlock 9 more filters and see personalised results"
                            linkTo="/login"
                            linkLabel="Login / Register"
                        />
                    ) : (
                        <div className="space-y-1">
                            {/* Crowd Level */}
                            <Section title="Crowd Level" badge={filters.crowdLevel ? '1' : null}>
                                <ChipGroup
                                    value={filters.crowdLevel || ''}
                                    onChange={v => set('crowdLevel', v)}
                                    options={[
                                        { label: '🟢 Low', value: 'low' },
                                        { label: '🟡 Medium', value: 'medium' },
                                        { label: '🔴 High', value: 'high' },
                                    ]}
                                />
                            </Section>

                            {/* Family Friendly */}
                            <Section title="Family Friendly" badge={filters.familyFriendly !== '' && filters.familyFriendly !== undefined ? '1' : null}>
                                <ChipGroup
                                    value={filters.familyFriendly === true ? 'true' : filters.familyFriendly === false ? 'false' : ''}
                                    onChange={v => set('familyFriendly', v === '' ? '' : v === 'true')}
                                    options={[
                                        { label: '👨‍👩‍👧 Yes', value: 'true' },
                                        { label: '🚫 No', value: 'false' },
                                    ]}
                                />
                            </Section>

                            {/* Visit Duration */}
                            <Section title="Visit Duration" badge={filters.duration ? '1' : null}>
                                <ChipGroup
                                    value={filters.duration || ''}
                                    onChange={v => set('duration', v)}
                                    options={[
                                        { label: '⏱ 1–2 hrs', value: '1_2hrs' },
                                        { label: '⏰ 3–4 hrs', value: '3_4hrs' },
                                        { label: '🌞 Full Day', value: 'full_day' },
                                    ]}
                                />
                            </Section>

                            {/* Distance from Ahmedabad */}
                            <Section title="Distance from Ahmedabad" badge={filters.distance ? '1' : null}>
                                <ChipGroup
                                    value={filters.distance || ''}
                                    onChange={v => set('distance', v)}
                                    options={[
                                        { label: '< 100 km', value: 'below_100km' },
                                        { label: '100–300 km', value: '100_300km' },
                                        { label: '> 300 km', value: 'above_300km' },
                                    ]}
                                />
                            </Section>

                            {/* Best Season */}
                            <Section title="Best Season / Month" badge={filters.bestSeason ? '1' : null}>
                                <ChipGroup
                                    value={filters.bestSeason || ''}
                                    onChange={v => set('bestSeason', v)}
                                    options={[
                                        { label: 'Jan–Mar', value: 'jan_mar' },
                                        { label: 'Apr–Jun', value: 'apr_jun' },
                                        { label: 'Jul–Sep', value: 'jul_sep' },
                                        { label: 'Oct–Dec', value: 'oct_dec' },
                                    ]}
                                />
                            </Section>

                            {/* Activity Type */}
                            <Section title="Activity Type" badge={(filters.activityType || []).length > 0 ? (filters.activityType || []).length : null}>
                                <MultiChipGroup
                                    value={filters.activityType || []}
                                    onChange={v => set('activityType', v)}
                                    options={[
                                        { label: '🕉 Spiritual', value: 'spiritual' },
                                        { label: '🧗 Adventure', value: 'adventure' },
                                        { label: '🧘 Relaxation', value: 'relaxation' },
                                        { label: '📚 Educational', value: 'educational' },
                                        { label: '📷 Photography', value: 'photography' },
                                        { label: '👁 Sightseeing', value: 'sightseeing' },
                                    ]}
                                />
                            </Section>

                            {/* Indoor / Outdoor */}
                            <Section title="Indoor / Outdoor" badge={filters.indoorOutdoor ? '1' : null}>
                                <ChipGroup
                                    value={filters.indoorOutdoor || ''}
                                    onChange={v => set('indoorOutdoor', v)}
                                    options={[
                                        { label: '🏠 Indoor', value: 'indoor' },
                                        { label: '🌳 Outdoor', value: 'outdoor' },
                                        { label: '🔀 Mixed', value: 'mixed' },
                                    ]}
                                />
                            </Section>

                            {/* Accessibility */}
                            <Section title="Accessibility" badge={filters.accessibility ? '1' : null}>
                                <ChipGroup
                                    value={filters.accessibility || ''}
                                    onChange={v => set('accessibility', v)}
                                    options={[
                                        { label: '♿ Wheelchair', value: 'wheelchair' },
                                        { label: '🚶 Partial', value: 'partial' },
                                        { label: '⛔ None', value: 'none' },
                                    ]}
                                />
                            </Section>

                            {/* Sort By */}
                            <Section title="Sort By" defaultOpen={true}>
                                <select
                                    value={filters.sortBy || 'rating'}
                                    onChange={e => set('sortBy', e.target.value)}
                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="rating">⭐ Highest Rated</option>
                                    <option value="newest">🆕 Newest</option>
                                    <option value="popular">🔥 Most Popular</option>
                                    <option value="distance">📍 Nearest First</option>
                                    <option value="hidden_gems">💎 Hidden Gems</option>
                                </select>
                            </Section>
                        </div>
                    )}
                </div>

                {/* ════════════════════════════════════════════════════════
                    SECTION 3 — PREMIUM FILTERS
                ════════════════════════════════════════════════════════ */}
                <div className="pt-1">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-px bg-amber-200" />
                        <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500" /> Premium Filters
                        </span>
                        <div className="flex-1 h-px bg-amber-200" />
                    </div>

                    {!isPremium ? (
                        <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 text-center">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                            </div>
                            <p className="text-sm font-bold text-amber-900 mb-1">Unlock 12 Premium Filters</p>
                            <p className="text-xs text-amber-600 mb-4">Photography score, pet-friendly, guided tours, facilities &amp; more</p>
                            {/* Blurred preview */}
                            <div className="flex flex-wrap gap-1.5 mb-4 justify-center blur-[2px] pointer-events-none opacity-60 select-none">
                                {['Excellent 📸', 'Camping 🏕', 'Gujarati Thali 🍛', 'Audio Guide 🎧', 'Pet ✅', 'WiFi 📶'].map(l => (
                                    <span key={l} className="text-[10px] font-bold px-2 py-1 rounded-lg border border-amber-200 bg-white text-amber-700">{l}</span>
                                ))}
                            </div>
                            <Link
                                to="/pricing"
                                className="inline-block bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-900 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all"
                            >
                                Upgrade to Premium ✨
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {/* Photography Score */}
                            <Section title="📸 Photography Score" badge={filters.photographyScore ? '1' : null}>
                                <ChipGroup
                                    value={filters.photographyScore || ''}
                                    onChange={v => set('photographyScore', v)}
                                    color="amber"
                                    options={[
                                        { label: '🌟 Excellent', value: 'excellent' },
                                        { label: '✅ Good', value: 'good' },
                                        { label: '😐 Average', value: 'average' },
                                    ]}
                                />
                            </Section>

                            {/* Accommodation Nearby */}
                            <Section title="🏨 Accommodation Nearby" badge={(filters.accommodationNearby || []).length > 0 ? (filters.accommodationNearby || []).length : null}>
                                <MultiChipGroup
                                    value={filters.accommodationNearby || []}
                                    onChange={v => set('accommodationNearby', v)}
                                    color="amber"
                                    options={[
                                        { label: '🏨 Hotels', value: 'hotels' },
                                        { label: '💰 Budget', value: 'budget' },
                                        { label: '👑 Luxury', value: 'luxury' },
                                        { label: '🏕 Camping', value: 'camping' },
                                    ]}
                                />
                            </Section>

                            {/* Food Options */}
                            <Section title="🍽 Food Options" badge={(filters.foodOptions || []).length > 0 ? (filters.foodOptions || []).length : null}>
                                <MultiChipGroup
                                    value={filters.foodOptions || []}
                                    onChange={v => set('foodOptions', v)}
                                    color="amber"
                                    options={[
                                        { label: '🍴 Restaurant', value: 'restaurant' },
                                        { label: '🛒 Street Food', value: 'street_food' },
                                        { label: '🍛 Gujarati Thali', value: 'gujarati_thali' },
                                        { label: '🥡 Limited', value: 'limited' },
                                    ]}
                                />
                            </Section>

                            {/* Age Suitability */}
                            <Section title="👨‍👩‍👧 Age Suitability" badge={(filters.ageSuitability || []).length > 0 ? (filters.ageSuitability || []).length : null}>
                                <MultiChipGroup
                                    value={filters.ageSuitability || []}
                                    onChange={v => set('ageSuitability', v)}
                                    color="amber"
                                    options={[
                                        { label: '👶 Toddlers', value: 'toddlers' },
                                        { label: '🧒 Kids', value: 'kids' },
                                        { label: '🧑 Teens', value: 'teenagers' },
                                        { label: '🧑‍💼 Adults', value: 'adults' },
                                        { label: '👴 Seniors', value: 'seniors' },
                                        { label: '🌍 All', value: 'all' },
                                    ]}
                                />
                            </Section>

                            {/* Fitness Level */}
                            <Section title="💪 Fitness Level" badge={filters.fitnessLevel ? '1' : null}>
                                <ChipGroup
                                    value={filters.fitnessLevel || ''}
                                    onChange={v => set('fitnessLevel', v)}
                                    color="amber"
                                    options={[
                                        { label: '🟢 Easy', value: 'easy' },
                                        { label: '🟡 Moderate', value: 'moderate' },
                                        { label: '🔴 Challenging', value: 'challenging' },
                                    ]}
                                />
                            </Section>

                            {/* Guided Tours */}
                            <Section title="🎧 Guided Tours" badge={(filters.guidedTours || []).length > 0 ? (filters.guidedTours || []).length : null}>
                                <MultiChipGroup
                                    value={filters.guidedTours || []}
                                    onChange={v => set('guidedTours', v)}
                                    color="amber"
                                    options={[
                                        { label: '🎧 Audio', value: 'audio' },
                                        { label: '👔 Professional', value: 'professional' },
                                        { label: '🗺 Self-Guided', value: 'self_guided' },
                                        { label: '👥 Group', value: 'group' },
                                    ]}
                                />
                            </Section>

                            {/* Pet Friendly */}
                            <Section title="🐾 Pet Friendly" badge={filters.petFriendly ? '1' : null}>
                                <ChipGroup
                                    value={filters.petFriendly || ''}
                                    onChange={v => set('petFriendly', v)}
                                    color="amber"
                                    options={[
                                        { label: '✅ Allowed', value: 'allowed' },
                                        { label: '❌ Not Allowed', value: 'not_allowed' },
                                        { label: '🦮 Service Only', value: 'service_only' },
                                    ]}
                                />
                            </Section>

                            {/* Parking */}
                            <Section title="🅿️ Parking" badge={filters.parking ? '1' : null}>
                                <ChipGroup
                                    value={filters.parking || ''}
                                    onChange={v => set('parking', v)}
                                    color="amber"
                                    options={[
                                        { label: '🆓 Free', value: 'free' },
                                        { label: '💳 Paid', value: 'paid' },
                                        { label: '⚠️ Limited', value: 'limited' },
                                        { label: '❌ None', value: 'none' },
                                    ]}
                                />
                            </Section>

                            {/* Facilities */}
                            <Section title="🏗 Facilities" badge={(filters.facilities || []).length > 0 ? (filters.facilities || []).length : null}>
                                <MultiChipGroup
                                    value={filters.facilities || []}
                                    onChange={v => set('facilities', v)}
                                    color="amber"
                                    options={[
                                        { label: '🚻 Restrooms', value: 'restrooms' },
                                        { label: '🍔 Food Court', value: 'food_court' },
                                        { label: '🏥 First Aid', value: 'first_aid' },
                                        { label: '📶 WiFi', value: 'wifi' },
                                        { label: '🏧 ATM', value: 'atm' },
                                        { label: '🛍 Shopping', value: 'shopping' },
                                    ]}
                                />
                            </Section>

                            {/* Transport Access */}
                            <Section title="🚗 Transport Access" badge={(filters.transportMode || []).length > 0 ? (filters.transportMode || []).length : null}>
                                <MultiChipGroup
                                    value={filters.transportMode || []}
                                    onChange={v => set('transportMode', v)}
                                    color="amber"
                                    options={[
                                        { label: '🚗 Car', value: 'car' },
                                        { label: '🚂 Train', value: 'train' },
                                        { label: '🚌 Bus', value: 'bus' },
                                        { label: '✈️ Flight', value: 'flight' },
                                    ]}
                                />
                            </Section>

                            {/* Budget Per Person */}
                            <Section title="💰 Budget Per Person" badge={filters.budgetPerPerson ? '1' : null}>
                                <ChipGroup
                                    value={filters.budgetPerPerson || ''}
                                    onChange={v => set('budgetPerPerson', v)}
                                    color="amber"
                                    options={[
                                        { label: '💚 Budget (<₹500)', value: 'budget' },
                                        { label: '🟡 Mid-range', value: 'mid_range' },
                                        { label: '👑 Premium (>₹2000)', value: 'premium' },
                                    ]}
                                />
                            </Section>

                            {/* Languages */}
                            <Section title="🗣 Languages Supported" badge={(filters.languages || []).length > 0 ? (filters.languages || []).length : null}>
                                <MultiChipGroup
                                    value={filters.languages || []}
                                    onChange={v => set('languages', v)}
                                    color="amber"
                                    options={[
                                        { label: '🗣 Gujarati', value: 'gujarati' },
                                        { label: '🗣 Hindi', value: 'hindi' },
                                        { label: '🗣 English', value: 'english' },
                                        { label: '🗣 Regional', value: 'regional' },
                                    ]}
                                />
                            </Section>
                        </div>
                    )}
                </div>

            </div> {/* end scrollable body */}
        </div>
    );
}

// ── ActiveFilterChips — rendered above the cards grid in Explore.jsx ──────────
export function ActiveFilterChips({ filters, onChange, onReset }) {
    const LABEL_MAP = {
        city: v => `📍 ${v}`,
        state: v => `📍 ${v}`,
        country: v => `🌍 ${v}`,
        type: v => `Type: ${v}`,
        bestTime: v => ({ morning: '🌅 Morning', evening: '🌇 Evening', all_day: '☀️ All Day', night: '🌙 Night' }[v] || v),
        entryFee: v => ({ free: '🆓 Free', below_100: '<₹100', '100_to_500': '₹100–₹500', above_500: '>₹500' }[v] || v),
        crowdLevel: v => `Crowd: ${v}`,
        familyFriendly: v => v ? '👨‍👩‍👧 Family' : '🚫 No Kids',
        duration: v => ({ '1_2hrs': '⏱1–2hrs', '3_4hrs': '⏰3–4hrs', full_day: '🌞Full Day' }[v] || v),
        distance: v => ({ below_100km: '<100km', '100_300km': '100–300km', above_300km: '>300km' }[v] || v),
        bestSeason: v => ({ jan_mar: 'Jan–Mar', apr_jun: 'Apr–Jun', jul_sep: 'Jul–Sep', oct_dec: 'Oct–Dec' }[v] || v),
        indoorOutdoor: v => ({ indoor: '🏠 Indoor', outdoor: '🌳 Outdoor', mixed: '🔀 Mixed' }[v] || v),
        accessibility: v => `♿ ${v}`,
        photographyScore: v => `📸 ${v}`,
        fitnessLevel: v => `💪 ${v}`,
        petFriendly: v => ({ allowed: '🐾 Pets ✅', not_allowed: '🐾 No Pets', service_only: '🦮 Service' }[v] || v),
        parking: v => `🅿️ ${v}`,
        budgetPerPerson: v => ({ budget: '💚 Budget', mid_range: '🟡 Mid-range', premium: '👑 Premium' }[v] || v),
    };

    const ARRAY_KEYS = ['activityType', 'accommodationNearby', 'foodOptions', 'ageSuitability', 'guidedTours', 'facilities', 'transportMode', 'languages'];

    const chips = [];
    for (const [key, val] of Object.entries(filters)) {
        if (key === 'sortBy') continue;
        if (ARRAY_KEYS.includes(key)) {
            (val || []).forEach(v => chips.push({ key, val: v, label: v.replace(/_/g, ' ') }));
        } else if (val !== '' && val !== null && val !== undefined) {
            const labeler = LABEL_MAP[key];
            chips.push({ key, val, label: labeler ? labeler(val) : String(val) });
        }
    }

    if (chips.length === 0) return null;

    const remove = (key, val) => {
        const ARRAY_KEYS_SET = new Set(ARRAY_KEYS);
        if (ARRAY_KEYS_SET.has(key)) {
            onChange({ [key]: (filters[key] || []).filter(v => v !== val) });
        } else {
            onChange({ [key]: '' });
        }
    };

    return (
        <div className="flex flex-wrap gap-1.5 mb-3 items-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mr-1">Active:</span>
            {chips.map((c, i) => (
                <span key={i} className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {c.label}
                    <button onClick={() => remove(c.key, c.val)} className="hover:text-red-500 transition-colors ml-0.5">
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}
            <button onClick={onReset} className="text-[11px] font-bold text-red-400 hover:text-red-600 underline ml-1 transition-colors">
                Clear all
            </button>
        </div>
    );
}
