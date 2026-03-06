import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, DollarSign, Clock, X, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getPlaceImage, imgErrorHandler } from '../utils/imageUtils';

const EndOfTripSuggestions = ({ isOpen, onClose, suggestions, tripId }) => {
    const navigate = useNavigate();

    if (!isOpen || !suggestions || suggestions.length === 0) return null;

    const handleAddSuggestion = async (placeId) => {
        try {
            await axios.post(`/api/trips/${tripId}/add-suggestion/${placeId}`);
            // Logic for confetti would go here
            onClose();
            navigate(`/trips/${tripId}/timeline`);
        } catch (error) {
            console.error('Error adding suggestion:', error);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="bg-white w-full max-w-2xl rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden p-6 md:p-10"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-600 font-black text-sm uppercase tracking-widest mb-2">
                                <Sparkles size={18} fill="currentColor" /> Smart Recs
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 leading-tight">
                                You have time and budget left! 💎
                            </h2>
                            <p className="text-gray-500 font-medium">We found {suggestions.length} nearby gems for your last day.</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
                        {suggestions.map((place, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col"
                            >
                                <img
                                    src={getPlaceImage(place)}
                                    alt={place.name}
                                    className="w-full h-40 object-cover"
                                    onError={imgErrorHandler(place.category)}
                                />
                                <div className="p-5 flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-gray-900">{place.name}</h3>
                                        <span className="flex items-center text-xs font-black text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">
                                            <Star size={12} fill="currentColor" className="mr-1" /> 4.8
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium mb-4 line-clamp-2">{place.recommendationReason}</p>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                                            <MapPin size={12} className="text-indigo-500" /> {place.distance} away
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                                            <Clock size={12} className="text-indigo-500" /> {place.estimatedTravelTime} travel time
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase">
                                            <DollarSign size={12} className="text-indigo-600" /> Est. Cost: ${place.estimatedCost}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleAddSuggestion(place.placeId)}
                                        className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                                    >
                                        Add to Trip <ChevronRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center">
                        <button onClick={onClose} className="text-gray-400 font-bold hover:text-gray-600 transition-colors underline underline-offset-4">
                            No thanks, continue my plan
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EndOfTripSuggestions;
