import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Building2,
    Target,
    TrendingUp,
    BarChart3,
    CheckCircle2,
    ArrowRight,
    MapPin,
    Phone,
    Mail,
    User as UserIcon,
    ShieldCheck,
    ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function HotelPartnerRegister() {
    const { user, isLoggedIn, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        businessName: "",
        ownerName: "",
        businessPhone: "",
        businessEmail: "",
        city: "",
        state: "",
        country: "India",
        businessType: "hotel",
        gstNumber: "",
        agreedToTerms: false
    });

    useEffect(() => {
        if (isLoggedIn && user?.role === 'hotel_partner') {
            navigate('/hotel-partner/dashboard');
        }
    }, [isLoggedIn, user, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.agreedToTerms) {
            return toast.error("Please agree to the terms and conditions");
        }

        setLoading(true);
        try {
            console.log("Attempting hotel partner registration with:", formData);
            const res = await axios.post("/api/hotel-partner/register", formData);
            console.log("Registration response:", res.data);

            if (res.data.success) {
                toast.success(res.data.message);
                // Update local user state
                updateProfile(res.data.user);
                navigate("/hotel-partner/dashboard");
            }
        } catch (err) {
            console.error("Hotel Registration Error:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Registration failed. Check browser console for details.");
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        {
            icon: <Target className="w-8 h-8 text-blue-500" />,
            title: "Targeted Reach",
            desc: "Get recommended to users actively planning trips to your city"
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-indigo-500" />,
            title: "More Bookings",
            desc: "Direct booking inquiries from verified travel planners"
        },
        {
            icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
            title: "Analytics",
            desc: "Track how many users viewed and clicked your hotel"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6"
                    >
                        <Building2 className="w-4 h-4" /> B2B PARTNER PROGRAM
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight"
                    >
                        List Your Hotel on <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">SmartTrip</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600 max-w-3xl mx-auto"
                    >
                        Reach thousands of travelers planning their trips through our platform
                        and grow your business with our specialized partner tools.
                    </motion.p>
                </div>

                {/* Benefit Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {benefits.map((benefit, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                                {benefit.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Registration Form / Login State */}
                <div className="max-w-4xl mx-auto">
                    {!isLoggedIn ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-blue-500/5 text-center border border-gray-100"
                        >
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                <ShieldCheck className="w-10 h-10 text-blue-600" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4">Start Your Journey With Us</h2>
                            <p className="text-gray-600 mb-10 text-lg">Please login or register first to become a travel partner and list your properties.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/login" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
                                    Log In <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link to="/register" className="px-10 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                    Create Account
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-500/5 border border-gray-100"
                        >
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900">Partner Details</h2>
                                    <p className="text-gray-500 text-sm">Tell us about your business</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Business Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Business Name (Hotel/Resort name) *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                name="businessName"
                                                required
                                                value={formData.businessName}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900"
                                                placeholder="Grand Plaza Resort"
                                            />
                                        </div>
                                    </div>

                                    {/* Owner Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Owner Full Name *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <UserIcon className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                name="ownerName"
                                                required
                                                value={formData.ownerName}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Business Phone *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="tel"
                                                name="businessPhone"
                                                required
                                                value={formData.businessPhone}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900"
                                                placeholder="+91 9876543210"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Business Email *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="email"
                                                name="businessEmail"
                                                required
                                                value={formData.businessEmail}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900"
                                                placeholder="contact@hotel.com"
                                            />
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">City *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                name="city"
                                                required
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900"
                                                placeholder="Mumbai"
                                            />
                                        </div>
                                    </div>

                                    {/* State */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            required
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900"
                                            placeholder="Maharashtra"
                                        />
                                    </div>

                                    {/* Property Type */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Property Type *</label>
                                        <select
                                            name="businessType"
                                            required
                                            value={formData.businessType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900"
                                        >
                                            <option value="hotel">Hotel</option>
                                            <option value="resort">Resort</option>
                                            <option value="homestay">Homestay</option>
                                            <option value="hostel">Hostel</option>
                                            <option value="villa">Villa</option>
                                            <option value="guesthouse">Guesthouse</option>
                                        </select>
                                    </div>

                                    {/* GST Number */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">GST Number (Optional)</label>
                                        <input
                                            type="text"
                                            name="gstNumber"
                                            value={formData.gstNumber}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-900"
                                            placeholder="22AAAAA0000A1Z5"
                                        />
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <div className="flex items-center h-6">
                                        <input
                                            id="agreedToTerms"
                                            name="agreedToTerms"
                                            type="checkbox"
                                            checked={formData.agreedToTerms}
                                            onChange={handleChange}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </div>
                                    <label htmlFor="agreedToTerms" className="text-sm text-gray-600 leading-relaxed cursor-pointer select-none">
                                        I agree to the SmartTrip Partner Terms of Service and Privacy Policy. I confirm that the information provided is accurate and I have the authority to register this property.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Register as Hotel Partner <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
