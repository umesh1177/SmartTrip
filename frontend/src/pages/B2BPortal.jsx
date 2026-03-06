import { useState } from 'react';
import {
    Building2,
    MapPin,
    TrendingUp,
    Target,
    Users,
    CreditCard,
    ArrowRight,
    ShieldCheck,
    Star,
    Hotel as HotelIcon,
    Store as StoreIcon,
    PieChart,
    Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function B2BPortal() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('hotels');
    const [formData, setFormData] = useState({
        businessName: '',
        type: 'hotel',
        city: '',
        country: '',
        contactEmail: user?.email || '',
        tier: 'basic'
    });

    const handleRegister = (tierName) => {
        toast.success(`Initializing secure checkout for ${tierName} tier...`);
        // Logic for /api/b2b/register would go here
    };

    const hotelPlans = [
        { name: 'Hotel Basic', price: '$49', feature: 'Standard Listing in Recommendations', color: 'bg-white', text: 'text-gray-900' },
        { name: 'Hotel Featured', price: '$99', feature: 'Top-tier Placement + Golden Badge', color: 'bg-gradient-to-br from-amber-400 to-yellow-500', text: 'text-white', popular: true }
    ];

    const storePlans = [
        { name: 'Store Basic', price: '$29', feature: 'Priority nearby discovery showing', color: 'bg-white', text: 'text-gray-900' },
        { name: 'Store Featured', price: '$59', feature: 'Highlighted card + click tracking', color: 'bg-gradient-to-br from-blue-600 to-indigo-700', text: 'text-white' }
    ];

    const currentPlans = activeTab === 'hotels' ? hotelPlans : storePlans;

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-24 bg-gray-900 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <Building2 className="absolute -left-20 -top-20 w-96 h-96 text-blue-500" />
                    <Building2 className="absolute -right-20 -bottom-20 w-96 h-96 text-amber-500" />
                </div>

                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <span className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-500/30">Partner Network 3.0</span>
                    <h1 className="text-5xl md:text-7xl font-black text-white mt-8 mb-6 tracking-tight">SmartTrip for <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Business.</span></h1>
                    <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">Boost your local visibility, track traveler referrals, and join the world's most intelligent travel ecosystem.</p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="#register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2">Grow Your Business <ArrowRight /></a>
                        <button className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all">Download Media Kit</button>
                    </div>
                </div>
            </section>

            {/* Benefits Grid */}
            <section className="py-24 max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    {[
                        { title: 'Global Exposure', desc: 'Reach 10k+ active travelers planning their next getaway.', icon: Target },
                        { title: 'Verified Trust', desc: 'Get the "SmartTrip Recommended" badge on your profile.', icon: ShieldCheck },
                        { title: 'Real-time Analytics', desc: 'Track every click and referral directly from your dashboard.', icon: PieChart },
                    ].map((benefit, i) => (
                        <div key={i} className="group">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-all duration-500">
                                <benefit.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                            <p className="text-gray-500">{benefit.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing / Selection */}
            <section id="register" className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Choose Your Entry Point</h2>
                        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 inline-flex shadow-sm">
                            <button
                                onClick={() => setActiveTab('hotels')}
                                className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'hotels' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Hotels & Stays
                            </button>
                            <button
                                onClick={() => setActiveTab('stores')}
                                className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'stores' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Stores & Venues
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {currentPlans.map((plan, i) => (
                            <div key={i} className={`p-10 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-center text-center transition-all hover:-translate-y-2 ${plan.color} ${plan.text}`}>
                                {plan.popular && <div className="bg-white text-amber-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-amber-100 shadow-sm">Most Impactful</div>}
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-white/20`}>
                                    {activeTab === 'hotels' ? <HotelIcon className="w-8 h-8" /> : <StoreIcon className="w-8 h-8" />}
                                </div>
                                <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                                <div className="text-4xl font-black mb-4">{plan.price}<span className="text-xs font-bold opacity-70"> /mo</span></div>
                                <p className="mb-10 text-sm font-medium opacity-90 leading-relaxed uppercase tracking-wide">{plan.feature}</p>

                                <button
                                    onClick={() => handleRegister(plan.name)}
                                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${plan.color === 'bg-white' ? 'bg-gray-900 text-white hover:bg-black' : 'bg-white text-gray-900 hover:scale-[1.03]'}`}
                                >
                                    Get Listed Today
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-24 text-center">
                <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-12">Trusted Partners in 50+ Cities</p>
                <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
                    <HotelIcon className="w-12 h-12" />
                    <StoreIcon className="w-12 h-12" />
                    <Building2 className="w-12 h-12" />
                    <Crown className="w-12 h-12" />
                </div>
            </section>
        </div>
    );
}
