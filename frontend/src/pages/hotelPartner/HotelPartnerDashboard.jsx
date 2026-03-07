import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
    Building2, LayoutDashboard, CreditCard, CheckCircle2, Calendar, Clock, ChevronRight,
    TrendingUp, BarChart3, Users, Star, ShieldCheck, AlertCircle, Plus, Trash2,
    Image as ImageIcon, MapPin, ExternalLink, ChevronDown, HelpCircle, Settings,
    LogOut, Bell, Menu, X, Target, Zap, Coffee, Wifi, Waves, Utensils, Car, Lock,
    ArrowRight, Phone, Mail, Instagram, Globe, Upload, Eye
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function HotelPartnerDashboard() {
    const { user, logout, setUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // ── HOTEL FORM STATE ──
    const [formState, setFormState] = useState({
        hotelName: "", description: "", tagline: "", address: "", city: "", state: "",
        country: "India", pincode: "", latitude: "", longitude: "",
        nearbyPlaces: [{ place: "", distance: "" }], distanceFromCity: "",
        contactPhone: "", contactEmail: "", website: "", whatsappNumber: "",
        pricePerNight: "", currency: "INR", minStayNights: 1, category: "budget",
        propertyType: "hotel", totalRooms: "",
        roomTypes: [{ type: "Standard", price: "", maxOccupancy: 2, quantity: 1 }],
        amenities: {
            wifi: false, pool: false, gym: false, spa: false, parking: false,
            restaurant: false, ac: false, roomService: false, laundry: false,
            bar: false, conferenceRoom: false, airportShuttle: false,
            petFriendly: false, kidsPlay: false, beachAccess: false
        },
        mainImage: "", galleryImages: [""],
        checkInTime: "14:00", checkOutTime: "11:00",
        cancellationPolicy: "free_cancellation", breakfastIncluded: false,
        petsAllowed: false, smokingAllowed: false, highlightFeatures: [""],
        languagesSpoken: ["English", "Hindi"]
    });

    const fetchDashboardData = async () => {
        try {
            const res = await axios.get("/api/hotel-partner/dashboard");
            if (res.data.success) {
                setDashboardData(res.data);
            }
        } catch (err) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        if (searchParams.get('payment') === 'success') {
            toast.success("Payment successful! Your subscription is now active.");
        }
    }, [searchParams]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormState(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: type === 'checkbox' ? checked : value }
            }));
        } else {
            setFormState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleDynamicChange = (field, index, value) => {
        const updated = [...formState[field]];
        updated[index] = value;
        setFormState(prev => ({ ...prev, [field]: updated }));
    };

    const addDynamicField = (field, defaultValue = "") => {
        setFormState(prev => ({ ...prev, [field]: [...prev[field], defaultValue] }));
    };

    const removeDynamicField = (field, index) => {
        if (formState[field].length > 1) {
            setFormState(prev => ({ ...prev, [field]: formState[field].filter((_, i) => i !== index) }));
        }
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("/api/hotel-partner/apply", formState);
            if (res.data.success) {
                toast.success("Application submitted successfully!");
                fetchDashboardData();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    // ── RENDER HELPERS ──
    const renderSubscriptionPlans = () => (
        <div className="py-10">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Choose Your Plan to Get Started</h2>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">Subscribe to unlock the hotel listing form and start getting recommended to travelers.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {['basic', 'featured', 'premium'].map((plan) => (
                    <div key={plan} className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all ${plan === 'featured' ? 'border-blue-500 shadow-2xl scale-105' : 'border-gray-100 shadow-sm'}`}>
                        <h3 className="text-2xl font-black capitalize mb-4">{plan}</h3>
                        <div className="text-4xl font-black mb-6">${plan === 'basic' ? '49' : plan === 'featured' ? '99' : '149'}<span className="text-sm text-gray-400 font-bold">/mo</span></div>
                        <ul className="space-y-3 mb-10">
                            <li className="flex items-center gap-2 text-sm font-bold text-gray-600"><CheckCircle2 className="text-green-500" size={16} /> Business Listing</li>
                            <li className="flex items-center gap-2 text-sm font-bold text-gray-600"><CheckCircle2 className="text-green-500" size={16} /> Direct Inquiries</li>
                            {plan !== 'basic' && <li className="flex items-center gap-2 text-sm font-bold text-gray-600"><CheckCircle2 className="text-green-500" size={16} /> Featured Badge</li>}
                        </ul>
                        <button onClick={() => axios.post("/api/hotel-partner/subscribe", { plan }).then(res => window.location.href = res.data.checkoutUrl).catch(() => toast.error("Checkout failed"))} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Select {plan}</button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderHotelForm = () => (
        <div className="max-w-5xl mx-auto py-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-600 rounded-[2.5rem] p-10 text-white mb-10 shadow-xl shadow-blue-500/20 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-2">🎉 Subscription Active!</h2>
                    <p className="text-blue-100 opacity-90">Please fill in your hotel details below. Our team will review your application within 24-48 hours.</p>
                </div>
                <Building2 className="absolute -right-10 -bottom-10 w-64 h-64 text-white/10 rotate-12" />
            </motion.div>

            <form onSubmit={submitApplication} className="space-y-10 pb-20">
                {/* SECTION 1: BASIC INFO */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Building2 className="text-blue-600" /> Basic Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Hotel Name *</label>
                            <input type="text" name="hotelName" required value={formState.hotelName} onChange={handleFormChange} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Tagline</label>
                            <input type="text" name="tagline" value={formState.tagline} onChange={handleFormChange} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Description (Min 100 chars) *</label>
                            <textarea name="description" required minLength={100} value={formState.description} onChange={handleFormChange} rows={5} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none resize-none" placeholder="Describe your property, its vibe, and unique selling points..." />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: LOCATION */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><MapPin className="text-blue-600" /> Location Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Full Address *</label>
                            <input type="text" name="address" required value={formState.address} onChange={handleFormChange} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">City *</label>
                            <input type="text" name="city" required value={formState.city} onChange={handleFormChange} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">State *</label>
                            <input type="text" name="state" required value={formState.state} onChange={handleFormChange} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Pincode</label>
                            <input type="text" name="pincode" value={formState.pincode} onChange={handleFormChange} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Distance from City Center</label>
                            <input type="text" name="distanceFromCity" value={formState.distanceFromCity} onChange={handleFormChange} placeholder="e.g. 2.5 km" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all" />
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <label className="text-xs font-black uppercase text-gray-400 ml-1">Nearby Tourist Places</label>
                        {formState.nearbyPlaces.map((item, idx) => (
                            <div key={idx} className="flex gap-4">
                                <input type="text" value={item.place} onChange={(e) => {
                                    const updated = [...formState.nearbyPlaces];
                                    updated[idx].place = e.target.value;
                                    setFormState(prev => ({ ...prev, nearbyPlaces: updated }));
                                }} className="flex-grow px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none" placeholder="Place's Name" />
                                <input type="text" value={item.distance} onChange={(e) => {
                                    const updated = [...formState.nearbyPlaces];
                                    updated[idx].distance = e.target.value;
                                    setFormState(prev => ({ ...prev, nearbyPlaces: updated }));
                                }} className="w-32 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-center" placeholder="Dist." />
                                <button type="button" onClick={() => removeDynamicField('nearbyPlaces', idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addDynamicField('nearbyPlaces', { place: "", distance: "" })} className="text-sm font-black text-blue-600 flex items-center gap-2 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all w-fit"><Plus size={16} /> Add another place</button>
                    </div>
                </div>

                {/* SECTION 3: CONTACT */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Phone className="text-blue-600" /> Contact Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Public Phone (For Customers) *</label>
                            <input type="tel" name="contactPhone" required value={formState.contactPhone} onChange={handleFormChange} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Public Email *</label>
                            <input type="email" name="contactEmail" required value={formState.contactEmail} onChange={handleFormChange} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Website URL</label>
                            <input type="url" name="website" value={formState.website} onChange={handleFormChange} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all" placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">WhatsApp Business</label>
                            <input type="tel" name="whatsappNumber" value={formState.whatsappNumber} onChange={handleFormChange} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all" />
                        </div>
                    </div>
                </div>

                {/* SECTION 4: PRICING & CATEGORY */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><CreditCard className="text-blue-600" /> Pricing & Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Base Price / Night (INR) *</label>
                            <input type="number" name="pricePerNight" required value={formState.pricePerNight} onChange={handleFormChange} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Category *</label>
                            <select name="category" required value={formState.category} onChange={handleFormChange} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all font-bold">
                                <option value="budget">Budget</option>
                                <option value="moderate">Moderate</option>
                                <option value="luxury">Luxury</option>
                                <option value="5-star">5-Star</option>
                                <option value="boutique">Boutique</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Total Rooms</label>
                            <input type="number" name="totalRooms" value={formState.totalRooms} onChange={handleFormChange} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all" />
                        </div>
                    </div>

                    <div className="mt-10 space-y-6">
                        <label className="text-xs font-black uppercase text-gray-400 ml-1">Room Types & Specific Prices</label>
                        {formState.roomTypes.map((room, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 relative pt-12 md:pt-6">
                                <button type="button" onClick={() => removeDynamicField('roomTypes', idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-500"><Trash2 size={18} /></button>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Type</label>
                                    <input type="text" value={room.type} onChange={(e) => {
                                        const updated = [...formState.roomTypes];
                                        updated[idx].type = e.target.value;
                                        setFormState(prev => ({ ...prev, roomTypes: updated }));
                                    }} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none font-bold" placeholder="Deluxe" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Price</label>
                                    <input type="number" value={room.price} onChange={(e) => {
                                        const updated = [...formState.roomTypes];
                                        updated[idx].price = e.target.value;
                                        setFormState(prev => ({ ...prev, roomTypes: updated }));
                                    }} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Occupancy</label>
                                    <input type="number" value={room.maxOccupancy} onChange={(e) => {
                                        const updated = [...formState.roomTypes];
                                        updated[idx].maxOccupancy = e.target.value;
                                        setFormState(prev => ({ ...prev, roomTypes: updated }));
                                    }} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Qty</label>
                                    <input type="number" value={room.quantity} onChange={(e) => {
                                        const updated = [...formState.roomTypes];
                                        updated[idx].quantity = e.target.value;
                                        setFormState(prev => ({ ...prev, roomTypes: updated }));
                                    }} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none font-bold" />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addDynamicField('roomTypes', { type: "Standard", price: "", maxOccupancy: 2, quantity: 1 })} className="text-sm font-black text-blue-600 flex items-center gap-2 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all w-fit"><Plus size={16} /> Add room type</button>
                    </div>
                </div>

                {/* SECTION 6: AMENITIES */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Wifi className="text-blue-600" /> Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.keys(formState.amenities).map(key => (
                            <label key={key} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formState.amenities[key] ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}>
                                <input type="checkbox" name={`amenities.${key}`} checked={formState.amenities[key]} onChange={handleFormChange} className="hidden" />
                                <span className={`text-sm font-bold capitalize ${formState.amenities[key] ? 'text-blue-700' : 'text-gray-500'}`}>{key}</span>
                                {formState.amenities[key] && <CheckCircle2 size={16} className="ml-auto text-blue-600" />}
                            </label>
                        ))}
                    </div>
                </div>

                {/* SECTION 7: IMAGES */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><ImageIcon className="text-blue-600" /> Property Images</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Main Cover Image URL *</label>
                            <div className="flex gap-4">
                                <input type="url" name="mainImage" required value={formState.mainImage} onChange={handleFormChange} className="flex-grow px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none" placeholder="https://unsplash.com/photos/..." />
                                {formState.mainImage && <img src={formState.mainImage} className="w-16 h-16 rounded-xl object-cover shadow-md" alt="Preview" />}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Gallery Images (Min 3)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formState.galleryImages.map((img, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input type="url" value={img} onChange={(e) => handleDynamicChange('galleryImages', idx, e.target.value)} className="flex-grow px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm" placeholder="Image URL" />
                                        <button type="button" onClick={() => removeDynamicField('galleryImages', idx)} className="p-2 text-red-400"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => addDynamicField('galleryImages')} className="text-sm font-black text-blue-600 flex items-center gap-2"><Plus size={16} /> Add another image</button>
                        </div>
                    </div>
                </div>

                {/* SECTION 8: POLICIES */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Lock className="text-blue-600" /> House Rules & Policies</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase">Check-in</label>
                                <input type="time" name="checkInTime" value={formState.checkInTime} onChange={handleFormChange} className="w-full p-4 bg-gray-50 rounded-xl border-none outline-none font-bold" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase">Check-out</label>
                                <input type="time" name="checkOutTime" value={formState.checkOutTime} onChange={handleFormChange} className="w-full p-4 bg-gray-50 rounded-xl border-none outline-none font-bold" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase">Cancellation Policy</label>
                            <select name="cancellationPolicy" value={formState.cancellationPolicy} onChange={handleFormChange} className="w-full p-4 bg-gray-50 rounded-xl border-none outline-none font-bold">
                                <option value="free_cancellation">Free Cancellation (24h)</option>
                                <option value="flexible">Flexible (Refundable)</option>
                                <option value="non_refundable">Non-Refundable</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-6 bg-gray-900 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4">
                    {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : <>Submit Final Review <ChevronRight /></>}
                </button>
            </form>
        </div>
    );

    const renderContent = () => {
        if (!dashboardData) return null;

        const { subscriptionActive, canSubmitForm, application, hotelApproved } = dashboardData;

        if (!subscriptionActive) return renderSubscriptionPlans();
        if (canSubmitForm) return renderHotelForm();

        return (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm px-10">
                {hotelApproved ? (
                    <>
                        <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-8" />
                        <h2 className="text-4xl font-black text-gray-900 mb-6">Property is Live!</h2>
                        <p className="text-gray-500 text-xl max-w-xl mx-auto mb-12">Congratulations! Your hotel listing has been approved and is now visible to travelers.</p>
                        <Link to={`/hotels/${application?.hotelId?._id}`} className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold">
                            View Listing <ExternalLink size={18} />
                        </Link>
                    </>
                ) : (
                    <>
                        <ShieldCheck className="w-20 h-20 text-blue-600 mx-auto mb-8 animate-bounce" />
                        <h2 className="text-4xl font-black text-gray-900 mb-6">Application Under Review</h2>
                        <p className="text-gray-500 text-xl max-w-xl mx-auto mb-12">We've received your property details. Our verification experts are currently reviewing your listing. You'll receive an email confirmation shortly.</p>
                        <div className="flex justify-center gap-6">
                            <div className="px-8 py-4 bg-blue-50 text-blue-700 rounded-2xl font-black">Status: {application?.status?.replace('_', ' ') || 'In Review'}</div>
                            <div className="px-8 py-4 bg-gray-50 text-gray-700 rounded-2xl font-black">Est. Time: 24h</div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className={`bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-24'}`}>
                <div className="p-8 border-b border-gray-50 flex items-center gap-4">
                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/20"><Building2 size={24} /></div>
                    {isSidebarOpen && <span className="font-black text-2xl tracking-tighter text-gray-900">Partner Hub</span>}
                </div>
                <nav className="flex-grow p-6 space-y-3">
                    {['dashboard', 'application', 'analytics', 'subscription', 'settings'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <LayoutDashboard size={20} />
                            {isSidebarOpen && <span className="font-bold text-sm capitalize">{tab}</span>}
                        </button>
                    ))}
                </nav>
                <div className="p-6 border-t border-gray-50">
                    <button onClick={logout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 font-bold transition-all"><LogOut size={20} /> {isSidebarOpen && "Logout"}</button>
                </div>
            </aside>

            <main className="flex-grow overflow-y-auto max-h-screen">
                <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-100 px-10 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"><Menu size={20} /></button>
                        <h2 className="font-black text-2xl text-gray-900 capitalize">{activeTab}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="font-black text-gray-900 leading-tight">{user?.name}</p>
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Premium Partner</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/20">{user?.name?.charAt(0)}</div>
                    </div>
                </header>

                <div className="p-10">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                            {activeTab === 'dashboard' ? renderContent() : <div className="py-20 text-center text-gray-400 font-bold">Coming Soon: {activeTab}</div>}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
