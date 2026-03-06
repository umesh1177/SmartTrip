import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Camera, Tag, Send, X, Calendar, User, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const WriteReview = () => {
    const { placeId, tripId } = useParams();
    const navigate = useNavigate();

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tags, setTags] = useState([]);
    const [travelType, setTravelType] = useState('solo');
    const [photos, setPhotos] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const availableTags = ['Budget-friendly', 'Family-friendly', 'Crowded', 'Pet-friendly', 'Scenic', 'Historical', 'Adventure', 'Relaxing'];

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 5 - photos.length);
        setPhotos([...photos, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removePhoto = (index) => {
        const newPhotos = [...photos];
        newPhotos.splice(index, 1);
        setPhotos(newPhotos);

        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const toggleTag = (tag) => {
        if (tags.includes(tag)) setTags(tags.filter(t => t !== tag));
        else setTags([...tags, tag]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return toast.error('Please select a rating');
        if (body.length < 50) return toast.error('Review body must be at least 50 characters');

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('placeId', placeId);
            formData.append('tripPlanId', tripId);
            formData.append('rating', rating);
            formData.append('title', title);
            formData.append('body', body);
            formData.append('travelType', travelType);
            formData.append('visitedMonth', new Date().toLocaleString('default', { month: 'long' }));
            formData.append('visitedYear', new Date().getFullYear());
            tags.forEach(tag => formData.append('tags', tag));
            photos.forEach(photo => formData.append('photos', photo));

            await axios.post('/api/reviews', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSubmitted(true);
            toast.success('Review posted successfully!');
            setTimeout(() => navigate(`/explore`), 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post review');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-[40px] shadow-2xl text-center max-w-sm border border-indigo-50"
                >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} />
                    </div>
                    <h1 className="text-3xl font-black mb-4">Awesome!</h1>
                    <p className="text-gray-500 mb-6">Your verified review has been posted. You've earned the <b>Verified Reviewer ✅</b> badge!</p>
                    <div className="animate-bounce inline-block bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm">
                        +50 Trip Points
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                <Star className="text-yellow-400 fill-yellow-400" size={32} /> Write a Review
            </h1>
            <p className="text-gray-500 mb-8 font-medium">Share your experience with other travelers.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Star Rating */}
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-50 border border-gray-100 flex flex-col items-center">
                    <h3 className="font-bold text-lg mb-4">How was your visit?</h3>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                className="transition-transform hover:scale-125 focus:outline-none"
                            >
                                <Star
                                    size={40}
                                    fill={star <= (hover || rating) ? "#eab308" : "none"}
                                    className={star <= (hover || rating) ? "text-yellow-500" : "text-gray-200"}
                                />
                            </button>
                        ))}
                    </div>
                    <span className="mt-4 font-black text-yellow-600 text-xl">
                        {rating === 0 ? 'Select Rating' : rating === 5 ? 'Excellent!' : rating === 1 ? 'Poor' : 'Good'}
                    </span>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Review Title (Optional)"
                        className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <div className="relative">
                        <textarea
                            placeholder="Tell us more about your experience... (Min 50 characters)"
                            className="w-full px-6 py-4 h-40 rounded-3xl bg-white border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none font-medium resize-none"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />
                        <div className={`absolute bottom-4 right-6 text-xs font-bold ${body.length < 50 ? 'text-red-400' : 'text-green-500'}`}>
                            {body.length} / 50 min
                        </div>
                    </div>
                </div>

                {/* Photo Upload */}
                <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Camera size={20} className="text-indigo-600" /> Add Photos
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {previews.map((src, idx) => (
                            <div key={idx} className="relative w-24 h-24">
                                <img src={src} className="w-full h-full object-cover rounded-2xl border-2 border-indigo-100 shadow-sm" alt="Preview" />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(idx)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {photos.length < 5 && (
                            <label className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all text-gray-400">
                                <Camera size={24} />
                                <span className="text-[10px] font-bold mt-1">Upload</span>
                                <input type="file" className="hidden" multiple accept="image/*" onChange={handlePhotoChange} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Tags & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Tag size={20} className="text-indigo-600" /> Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${tags.includes(tag) ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <User size={20} className="text-indigo-600" /> Travel Type
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {['Solo', 'Couple', 'Family', 'Friends'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setTravelType(type.toLowerCase())}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${travelType === type.toLowerCase() ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:bg-gray-300 flex items-center justify-center gap-2"
                >
                    {submitting ? <Loader className="animate-spin" /> : <><Send size={24} /> Post Verified Review</>}
                </button>
            </form>
        </div>
    );
};

export default WriteReview;
