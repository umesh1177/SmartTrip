import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, MapPin, Users, Zap, Clock, ThumbsUp, CheckCircle, Image as ImageIcon, Filter, ChevronDown, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPlaceImage, imgErrorHandler } from '../utils/imageUtils';

const PlaceDetail = () => {
    const { placeId } = useParams();
    const [place, setPlace] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ rating: '', travelType: '' });

    useEffect(() => {
        const fetchPlaceData = async () => {
            try {
                const [placeRes, reviewsRes] = await Promise.all([
                    axios.get(`/api/places/${placeId}`),
                    axios.get(`/api/reviews/place/${placeId}`)
                ]);
                setPlace(placeRes.data);
                setReviews(reviewsRes.data.reviews || []);
            } catch (error) {
                console.error('Error fetching place details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaceData();
    }, [placeId]);

    if (loading) return <div className="flex items-center justify-center h-screen">Loading Destination Details...</div>;
    if (!place) return <div className="p-20 text-center">Place not found.</div>;

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percent: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
    }));

    const crowdColors = {
        low: 'bg-green-100 text-green-600',
        moderate: 'bg-yellow-100 text-yellow-600',
        high: 'bg-red-100 text-red-600'
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[50vh] overflow-hidden">
                <img
                    src={getPlaceImage(place)}
                    alt={place.name}
                    className="w-full h-full object-cover"
                    onError={imgErrorHandler(place.category)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold mb-3 uppercase tracking-widest text-sm">
                        <MapPin size={18} /> {place.city}, {place.country}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">{place.name}</h1>
                    <div className="flex flex-wrap gap-4">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2 text-white font-bold">
                            <Star className="text-yellow-400 fill-yellow-400" size={20} /> {place.averageRating?.toFixed(1) || place.rating} ({place.totalReviews || 0} Reviews)
                        </div>
                        <div className={`${crowdColors[place.realTimeInfo?.currentCrowdLevel || 'low']} backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center gap-2 font-bold shadow-lg`}>
                            <Users size={20} /> {place.realTimeInfo?.currentCrowdLevel?.toUpperCase()} CROWD
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-3xl font-black mb-6">About this place</h2>
                        <p className="text-gray-600 text-lg leading-relaxed font-medium mb-8">
                            {place.description}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {place.tags.map(tag => (
                                <span key={tag} className="bg-white border border-gray-100 px-4 py-2 rounded-full text-sm font-bold text-gray-500 shadow-sm">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Photo Gallery */}
                    {place.recentPhotos?.length > 0 && (
                        <section>
                            <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                                <ImageIcon size={28} className="text-indigo-600" /> Traveler Photos
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {place.recentPhotos.map((photo, i) => (
                                    <motion.img
                                        key={i}
                                        whileHover={{ scale: 1.05 }}
                                        src={photo}
                                        className="w-full h-40 object-cover rounded-3xl shadow-md cursor-pointer"
                                        alt="traveler"
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Reviews Section */}
                    <section id="reviews">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black">Verified Reviews</h2>
                            <Link
                                to={`/write-review/${placeId}/current-trip`}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                            >
                                <Camera size={20} /> Write Review
                            </Link>
                        </div>

                        {/* Rating Breakdown */}
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 mb-12 flex flex-col md:flex-row gap-12 items-center">
                            <div className="text-center">
                                <div className="text-6xl font-black text-indigo-600 mb-2">{place.averageRating?.toFixed(1) || place.rating}</div>
                                <div className="flex gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} fill={s <= Math.round(place.averageRating || place.rating) ? '#4f46e5' : 'none'} className={s <= Math.round(place.averageRating || place.rating) ? 'text-indigo-600' : 'text-gray-200'} />)}
                                </div>
                                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{place.totalReviews || 0} REVIEWS</div>
                            </div>
                            <div className="flex-grow space-y-3 w-full">
                                {ratingCounts.map(item => (
                                    <div key={item.star} className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-gray-500 w-4">{item.star}★</span>
                                        <div className="flex-grow bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.percent}%` }}
                                                className="bg-indigo-600 h-full rounded-full"
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 w-8">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-4 mb-8">
                            <select className="bg-white px-4 py-2 rounded-xl border border-gray-200 font-bold text-sm outline-none">
                                <option>All Ratings</option>
                                <option>5 Stars</option>
                                <option>4 Stars</option>
                            </select>
                            <select className="bg-white px-4 py-2 rounded-xl border border-gray-200 font-bold text-sm outline-none">
                                <option>All Travel Types</option>
                                <option>Solo</option>
                                <option>Couple</option>
                            </select>
                        </div>

                        {/* Review List */}
                        <div className="space-y-6">
                            {reviews.map((review, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <img src={review.user?.profilePhoto || `https://ui-avatars.com/api/?name=${review.user?.name}`} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="avatar" />
                                            <div>
                                                <h4 className="font-black flex items-center gap-2">
                                                    {review.user?.name}
                                                    <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                        <CheckCircle size={10} /> Verified Visitor
                                                    </span>
                                                </h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{review.travelType} • {review.visitedMonth} {review.visitedYear}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= review.rating ? '#eab308' : 'none'} className={s <= review.rating ? 'text-yellow-500' : 'text-gray-200'} />)}
                                        </div>
                                    </div>

                                    {review.title && <h5 className="text-lg font-black mb-2 text-gray-900">{review.title}</h5>}
                                    <p className="text-gray-600 font-medium leading-relaxed mb-6">{review.body}</p>

                                    {review.photos?.length > 0 && (
                                        <div className="flex gap-2 mb-6">
                                            {review.photos.map((p, j) => (
                                                <img key={j} src={p} className="w-20 h-20 object-cover rounded-2xl cursor-pointer hover:opacity-80 transition-opacity" alt="review" />
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {review.tags?.map(tag => (
                                            <span key={tag} className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">#{tag}</span>
                                        ))}
                                    </div>

                                    <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors">
                                        <ThumbsUp size={16} /> Helpful ({review.helpfulVotes || 0})
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Sticky Quick Info */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-indigo-50 border border-gray-100 sticky top-24">
                        <h3 className="text-xl font-black mb-6">Quick Details</h3>
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-400">BEST SEASON</span>
                                <span className="font-black text-gray-900 capitalize">{place.season}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-400">BUDGET</span>
                                <span className="font-black text-gray-900 capitalize">{place.budget}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-400">BEST FOR</span>
                                <span className="font-black text-gray-900 capitalize">{place.bestFor}</span>
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-6 rounded-3xl mb-8">
                            <div className="flex items-center gap-3 text-indigo-600 font-black mb-2 uppercase text-xs">
                                <Clock size={16} /> Real-time Info
                            </div>
                            <p className="text-sm font-bold text-indigo-900 mb-1">
                                {place.realTimeInfo?.currentCrowdLevel === 'low' ? 'Peaceful & quiet right now.' : place.realTimeInfo?.currentCrowdLevel === 'moderate' ? 'Moderate crowds. Good time to visit.' : 'Very busy. Better avoid for an hour.'}
                            </p>
                            <span className="text-[10px] text-indigo-400 font-bold">Last updated {new Date(place.realTimeInfo?.lastUpdated).toLocaleTimeString()}</span>
                        </div>

                        <Link
                            to="/plan-trip"
                            state={{ destination: place }}
                            className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1"
                        >
                            <Zap size={24} fill="currentColor" /> Plan My Trip
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceDetail;
