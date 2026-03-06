import { Link } from 'react-router-dom';
import { Plane, Heart, Twitter, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Logo & Intro */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center space-x-2 mb-4">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg text-white">
                                <Plane className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                                SmartTrip ✈️
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            We match you with your mathematically perfect destination using 12+ data metrics. Stop dreaming, start exploring.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-pink-50 hover:text-pink-500 transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Navigation</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Home</Link></li>
                            <li><Link to="/explore" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Explore</Link></li>
                            <li><Link to="/pricing" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Pricing</Link></li>
                            <li><Link to="/login" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Member Login</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Support</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Help Center</a></li>
                            <li><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Newsletter</h3>
                        <p className="text-sm text-gray-500 mb-4">Get the latest destination metrics delivered right to your inbox.</p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full text-sm px-4 py-2 bg-gray-50 border border-gray-200 rounded-l-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-r-lg hover:bg-blue-700 transition-colors"
                                onClick={() => alert("Added to newsletter!")}
                            >
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
                    <p className="text-gray-400 mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} SmartTrip Inc. All rights reserved.
                    </p>
                    <p className="text-gray-500 flex items-center font-medium">
                        Made with <Heart className="h-4 w-4 mx-1.5 text-pink-500 fill-pink-500/20" /> for modern travelers
                    </p>
                </div>
            </div>
        </footer>
    );
}
