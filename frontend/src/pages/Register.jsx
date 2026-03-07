import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Plane, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'free',
        specialization: '',
        city: '',
        vehicleType: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { register } = useAuth();

    // Handle form changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Password strength checker
    const getPasswordStrength = (pass) => {
        let score = 0;
        if (!pass) return { score: 0, label: '', color: 'bg-transparent' };
        if (pass.length > 6) score += 1;
        if (pass.length >= 10) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

        if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500', w: 'w-1/4' };
        if (score === 2) return { score, label: 'Fair', color: 'bg-yellow-500', w: 'w-2/4' };
        if (score === 3) return { score, label: 'Good', color: 'bg-blue-500', w: 'w-3/4' };
        return { score, label: 'Strong', color: 'bg-green-500', w: 'w-full' };
    };

    const strength = getPasswordStrength(formData.password);
    const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (strength.score <= 1) {
            return toast.error("Please use a stronger password");
        }

        setIsLoading(true);

        const result = await register(
            formData.name,
            formData.email,
            formData.password,
            formData.role,
            {
                specialization: formData.specialization,
                city: formData.city,
                vehicleType: formData.vehicleType,
                adminSecretKey: formData.adminSecretKey // Added this field
            }
        );

        if (result.success) {
            toast.success('Account created successfully!');
            navigate('/login'); // Redirect to login after registration
        } else {
            toast.error(result.message);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 font-sans p-4 py-12">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
                <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
                <div className="absolute top-[30%] right-[20%] w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[20%] left-[40%] w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md mt-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl overflow-hidden">

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 rounded-full mb-4 ring-1 ring-purple-500/50">
                            <Plane className="w-8 h-8 text-purple-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Join SmartTrip</h1>
                        <p className="text-purple-200 mt-2">Discover and save the world's best spots</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-purple-300" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl bg-white/5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-purple-300" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl bg-white/5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-purple-200">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-purple-300" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-10 py-3 border border-white/20 rounded-xl bg-white/5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-300 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {/* Password strength indicator */}
                            {formData.password && (
                                <div className="flex items-center justify-between pt-1">
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mr-3">
                                        <div className={`h-full ${strength.color} ${strength.w} transition-all duration-300`}></div>
                                    </div>
                                    <span className={`text-xs font-medium text-white/70`}>{strength.label}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-1">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-purple-300" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-10 py-3 border ${passwordsMatch ? 'border-green-500/50' : 'border-white/20'} rounded-xl bg-white/5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 ${passwordsMatch ? 'focus:ring-green-500' : 'focus:ring-purple-500'} focus:border-transparent transition-all`}
                                    placeholder="••••••••"
                                />
                                {formData.confirmPassword && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        {passwordsMatch ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-400" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-1">Join As</label>
                            <div className="relative">
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="block w-full pl-4 pr-10 py-3 border border-white/20 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-bold"
                                >
                                    <option value="free">Traveler</option>
                                    <option value="guide">Tour Guide</option>
                                    <option value="driver">Cab Driver</option>
                                    <option value="admin">System Admin</option>
                                </select>
                            </div>
                        </div>

                        {/* Admin Secret Key */}
                        {formData.role === 'admin' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <label className="block text-sm font-medium text-amber-300 mb-1 flex items-center gap-2">
                                    <Lock size={14} /> Admin Verification Key
                                </label>
                                <input
                                    type="password"
                                    name="adminSecretKey"
                                    required
                                    value={formData.adminSecretKey || ''}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 border border-amber-500/30 rounded-xl bg-amber-500/10 text-white placeholder-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                                    placeholder="Enter system secret"
                                />
                                <p className="text-[10px] text-amber-400 mt-2 font-bold uppercase tracking-wider italic">Only authorized staff can register as admin</p>
                            </motion.div>
                        )}

                        {/* Conditional Fields for Guide */}
                        {formData.role === 'guide' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-purple-200 mb-1">Specialization</label>
                                    <input
                                        type="text"
                                        name="specialization"
                                        required
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                        placeholder="e.g. Historical, Adventure"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-purple-200 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                        placeholder="Your base city"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Conditional Fields for Driver */}
                        {formData.role === 'driver' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-purple-200 mb-1">Vehicle Type</label>
                                    <select
                                        name="vehicleType"
                                        required
                                        value={formData.vehicleType}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 border border-white/20 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    >
                                        <option value="">Select vehicle</option>
                                        <option value="sedan">Sedan</option>
                                        <option value="suv">SUV</option>
                                        <option value="hatchback">Hatchback</option>
                                        <option value="luxury">Luxury</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-purple-200 mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                        placeholder="Service city"
                                    />
                                </div>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !passwordsMatch || strength.score <= 1}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-all ${(isLoading || !passwordsMatch || strength.score <= 1)
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:from-purple-500 hover:to-indigo-500 hover:shadow-lg hover:-translate-y-0.5'
                                }`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Create Account'
                            )}
                        </button>

                    </form>

                    <div className="mt-8 text-center text-sm text-purple-200">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-purple-400 hover:text-white transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
