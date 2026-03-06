import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, X, Shield, Zap, Sparkles, CheckCircle2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Pricing() {
    const [isAnnual, setIsAnnual] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { user, isPremium } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        if (query.get('canceled')) {
            toast.error("Checkout canceled. You can try again whenever you're ready.");
        }
    }, [location]);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async (plan) => {
        if (!user) {
            toast.error('Please log in to upgrade');
            navigate('/login?redirect=pricing');
            return;
        }

        if (isPremium) {
            toast.success('You are already a Premium member!');
            return;
        }

        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
            toast.error('Failed to load Razorpay SDK. Please check your connection.');
            return;
        }

        try {
            setIsLoading(true);

            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const { data } = await axios.post('/api/payment/create-order', { plan }, config);

            if (!data.success) {
                toast.error(data.message);
                setIsLoading(false);
                return;
            }

            const options = {
                key: data.key,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'SmartTrip',
                description: data.order.planDetails.description,
                order_id: data.order.id,
                prefill: {
                    name: data.user.name,
                    email: data.user.email,
                },
                theme: {
                    color: '#4f46e5'
                },
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post('/api/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan: data.order.plan
                        }, config);

                        if (verifyRes.data.success) {
                            toast.success(verifyRes.data.message);
                            // Refresh page to load updated premium role into AuthContext
                            window.location.href = '/dashboard';
                        }
                    } catch (err) {
                        toast.error(err.response?.data?.message || 'Payment verification failed');
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                toast.error(response.error.description);
            });
            paymentObject.open();

        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.message || 'Failed to start checkout process');
        } finally {
            setIsLoading(false);
        }
    };

    const featuresList = [
        { name: 'Access to Destinations', free: '6 Featured Only', premium: 'All 500+' },
        { name: 'Filter Criteria', free: 'Basic (Category, Budget, Season)', premium: '11 Advanced Filters' },
        { name: 'Saved Places Limit', free: '10 Places Max', premium: 'Unlimited' },
        { name: 'Place Details', free: 'Basic Info', premium: 'Full Description & Tips' },
        { name: 'Customer Support', free: 'Community Forum', premium: 'Priority Email Support' },
        { name: 'AI Trip Planner', free: false, premium: 'Early Access (Phase 2)' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-24 font-sans">

            {/* 1. Pricing Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-12">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-6">
                    <Shield className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900">
                    Upgrade Your Travel Experience
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                    Unlock the full power of SmartTrip's algorithm and start exploring without limits.
                </p>

                {/* Toggle Switch */}
                <div className="flex items-center justify-center mt-6">
                    <span className={`text-sm font-bold ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
                    <button
                        type="button"
                        className="relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out focus:outline-none mx-4"
                        role="switch"
                        aria-checked={isAnnual}
                        onClick={() => setIsAnnual(!isAnnual)}
                    >
                        <span aria-hidden="true" className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}></span>
                    </button>
                    <span className={`text-sm font-bold ${isAnnual ? 'text-gray-900' : 'text-gray-500'} flex items-center`}>
                        Yearly
                        <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-black text-green-800 border border-green-200 shadow-sm">
                            Save 33%
                        </span>
                    </span>
                </div>
            </div>

            {/* 2. Pricing Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">

                    {/* Card 1 - Free */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Explorer</h3>
                        <p className="text-sm text-gray-500 mb-6">Perfect for getting a taste of what SmartTrip offers.</p>
                        <div className="mb-6 flex items-baseline">
                            <span className="text-4xl font-extrabold text-gray-900">$0</span>
                            <span className="text-gray-500 ml-1 font-medium">/month</span>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                                <span className="text-gray-600">View 6 featured destinations</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                                <span className="text-gray-600">3 basic filters</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                                <span className="text-gray-600">Save up to 10 places</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                                <span className="text-gray-600">Basic place details</span>
                            </li>
                        </ul>

                        <button
                            disabled={!isPremium}
                            className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-sm ${!isPremium
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-600'
                                }`}
                        >
                            {!isPremium ? 'Current Plan' : 'Downgrade to Free'}
                        </button>
                    </div>

                    {/* Card 2 - Premium Monthly */}
                    <div className={`rounded-3xl p-8 border shadow-xl flex flex-col relative transform transition-transform duration-300 ${!isAnnual ? 'bg-gradient-to-b from-blue-900 to-indigo-900 border-blue-400 scale-105 z-10' : 'bg-white border-blue-100 hover:border-blue-300'}`}>
                        {!isAnnual && (
                            <div className="absolute top-0 inset-x-0 transform -translate-y-1/2 flex justify-center">
                                <span className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-black text-xs uppercase tracking-widest py-1 px-4 rounded-full shadow-md">
                                    Selected
                                </span>
                            </div>
                        )}
                        <h3 className={`text-xl font-bold mb-2 ${!isAnnual ? 'text-white' : 'text-gray-900'}`}>Premium Monthly</h3>
                        <p className={`text-sm mb-6 ${!isAnnual ? 'text-blue-200' : 'text-gray-500'}`}>Flexibility without long-term commitment.</p>
                        <div className="mb-6 flex items-baseline">
                            <span className={`text-4xl font-extrabold ${!isAnnual ? 'text-white' : 'text-gray-900'}`}>$9.99</span>
                            <span className={`ml-1 font-medium ${!isAnnual ? 'text-blue-300' : 'text-gray-500'}`}>/month</span>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start">
                                <Zap className={`w-5 h-5 mr-3 shrink-0 ${!isAnnual ? 'text-amber-400' : 'text-blue-500'}`} />
                                <span className={`${!isAnnual ? 'text-blue-50' : 'text-gray-700 font-medium'}`}>All 500+ destinations</span>
                            </li>
                            <li className="flex items-start">
                                <Check className={`w-5 h-5 mr-3 shrink-0 ${!isAnnual ? 'text-green-400' : 'text-green-500'}`} />
                                <span className={`${!isAnnual ? 'text-blue-50' : 'text-gray-600'}`}>11 advanced filters</span>
                            </li>
                            <li className="flex items-start">
                                <Check className={`w-5 h-5 mr-3 shrink-0 ${!isAnnual ? 'text-green-400' : 'text-green-500'}`} />
                                <span className={`${!isAnnual ? 'text-blue-50' : 'text-gray-600'}`}>Unlimited saves</span>
                            </li>
                            <li className="flex items-start">
                                <Check className={`w-5 h-5 mr-3 shrink-0 ${!isAnnual ? 'text-green-400' : 'text-green-500'}`} />
                                <span className={`${!isAnnual ? 'text-blue-50' : 'text-gray-600'}`}>Full place details & tips</span>
                            </li>
                            <li className="flex items-start">
                                <Check className={`w-5 h-5 mr-3 shrink-0 ${!isAnnual ? 'text-green-400' : 'text-green-500'}`} />
                                <span className={`${!isAnnual ? 'text-blue-50' : 'text-gray-600'}`}>Priority support</span>
                            </li>
                            <li className="flex items-start">
                                <Sparkles className={`w-5 h-5 mr-3 shrink-0 ${!isAnnual ? 'text-purple-300' : 'text-purple-500'}`} />
                                <span className={`${!isAnnual ? 'text-blue-50' : 'text-gray-600'}`}>Early access to Phase 2 AI Planner</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => handleCheckout('monthly')}
                            disabled={isLoading}
                            className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md flex justify-center items-center ${!isAnnual
                                ? 'bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                                }`}
                        >
                            {isLoading && !isAnnual ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : null}
                            {isPremium ? 'Switch to Monthly' : 'Upgrade Monthly'}
                        </button>
                    </div>

                    {/* Card 3 - Premium Yearly */}
                    <div className={`rounded-3xl p-8 border shadow-xl flex flex-col relative transform transition-transform duration-300 ${isAnnual ? 'bg-gradient-to-b from-indigo-900 to-purple-900 border-amber-400 scale-105 z-10' : 'bg-white border-purple-100 hover:border-purple-300'}`}>
                        <div className="absolute top-0 inset-x-0 transform -translate-y-1/2 flex justify-center">
                            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 font-extrabold text-xs uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg border border-yellow-300 drop-shadow-sm flex items-center">
                                <Star className="w-3 h-3 mr-1 fill-amber-900" /> Best Value
                            </span>
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${isAnnual ? 'text-white' : 'text-gray-900'}`}>Premium Yearly</h3>
                        <p className={`text-sm mb-6 ${isAnnual ? 'text-indigo-200' : 'text-gray-500'}`}>Save $39.89 a year. Our most popular plan.</p>
                        <div className="mb-6 flex items-baseline">
                            <span className={`text-4xl font-extrabold ${isAnnual ? 'text-white' : 'text-gray-900'}`}>$79.99</span>
                            <span className={`ml-1 font-medium ${isAnnual ? 'text-indigo-300' : 'text-gray-500'}`}>/year</span>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start">
                                <Zap className={`w-5 h-5 mr-3 shrink-0 ${isAnnual ? 'text-amber-400' : 'text-purple-500'}`} />
                                <span className={`${isAnnual ? 'text-indigo-50 font-medium' : 'text-gray-700 font-medium'}`}>Everything in Monthly</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle2 className={`w-5 h-5 mr-3 shrink-0 ${isAnnual ? 'text-green-400' : 'text-green-500'}`} />
                                <span className={`${isAnnual ? 'text-indigo-50 font-bold text-amber-100' : 'text-gray-600 font-bold'}`}>Save 33% instantly</span>
                            </li>
                            <li className="flex items-start">
                                <Check className={`w-5 h-5 mr-3 shrink-0 ${isAnnual ? 'text-green-400' : 'text-green-500'}`} />
                                <span className={`${isAnnual ? 'text-indigo-50' : 'text-gray-600'}`}>All 500+ destinations</span>
                            </li>
                            <li className="flex items-start">
                                <Check className={`w-5 h-5 mr-3 shrink-0 ${isAnnual ? 'text-green-400' : 'text-green-500'}`} />
                                <span className={`${isAnnual ? 'text-indigo-50' : 'text-gray-600'}`}>All 11 intelligent filters</span>
                            </li>
                            <li className="flex items-start">
                                <Check className={`w-5 h-5 mr-3 shrink-0 ${isAnnual ? 'text-green-400' : 'text-green-500'}`} />
                                <span className={`${isAnnual ? 'text-indigo-50' : 'text-gray-600'}`}>Unlimited bucket lists</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => handleCheckout('yearly')}
                            disabled={isLoading}
                            className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md flex justify-center items-center ${isAnnual
                                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-900 shadow-xl shadow-amber-500/20'
                                : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                                }`}
                        >
                            {isLoading && isAnnual ? <div className="w-5 h-5 border-2 border-amber-900/30 border-t-amber-900 rounded-full animate-spin mr-2" /> : null}
                            {isPremium ? 'Switch to Yearly' : 'Get Yearly Plan'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Feature Comparison Table */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">Compare Plans</h2>
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="w-1/3 p-6 border-b-2 border-gray-100 bg-gray-50 text-sm font-bold text-gray-500 uppercase tracking-wider">Features</th>
                                    <th className="w-1/3 p-6 border-b-2 border-gray-100 bg-white text-center">
                                        <div className="text-xl font-black text-gray-900">Free</div>
                                    </th>
                                    <th className="w-1/3 p-6 border-b-2 border-gray-100 bg-indigo-50/50 text-center border-l border-indigo-100">
                                        <div className="text-xl font-black text-indigo-900 flex items-center justify-center">
                                            <Star className="w-5 h-5 fill-amber-400 text-amber-400 mr-2" /> Premium
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {featuresList.map((feature, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6 text-sm font-medium text-gray-900">{feature.name}</td>

                                        <td className="p-6 text-sm text-gray-600 text-center">
                                            {typeof feature.free === 'boolean' ? (
                                                feature.free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                                            ) : (
                                                feature.free
                                            )}
                                        </td>

                                        <td className="p-6 text-sm font-bold text-indigo-700 text-center bg-indigo-50/30 border-l border-indigo-50/50">
                                            {typeof feature.premium === 'boolean' ? (
                                                feature.premium ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                                            ) : (
                                                feature.premium
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
