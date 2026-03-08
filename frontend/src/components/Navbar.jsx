import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, Menu, X, LogOut, Bookmark, Settings, Star, Search, ShieldCheck } from 'lucide-react';

export default function Navbar() {
    const { user, logout, isLoggedIn, isPremium, isAdmin } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
    }, [location.pathname]);

    // isAdmin and isPremium are now booleans directly from useAuth

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Explore', path: '/explore' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'Partner With Us', path: '/hotel-partner/register' },
    ];

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo container */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg text-white">
                                <Plane className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                                SmartTrip <span className="text-xl inline-block -translate-y-0.5">✈️</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-blue-600 ${location.pathname === link.path ? 'text-blue-600' : 'text-gray-600'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right side buttons / Profile */}
                    <div className="hidden md:flex items-center space-x-4">
                        {!isLoggedIn ? (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    Sign up
                                </Link>
                            </>
                        ) : (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="flex items-center space-x-2 focus:outline-none p-1 rounded-full border border-gray-200 hover:border-blue-300 transition-colors bg-white hover:bg-gray-50"
                                    aria-expanded="false"
                                    aria-haspopup="true"
                                >
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                                        {user?.name}
                                    </span>
                                    {isPremium && (
                                        <div className="flex items-center bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 px-3 py-1 rounded-full text-[10px] font-black border border-amber-300 shadow-sm ml-2 group-hover:scale-105 transition-transform">
                                            <Star className="w-3 h-3 mr-1 fill-amber-900 text-amber-900" />
                                            PREMIUM
                                        </div>
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileDropdownOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white border border-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden py-1">
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>

                                        <Link to="/saved" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                            <Bookmark className="w-4 h-4 mr-3 text-gray-400" />
                                            My Saved Places
                                        </Link>

                                        <Link to="/my-trips" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                            <Plane className="w-4 h-4 mr-3 text-gray-400" />
                                            My Trips
                                        </Link>

                                        <Link to="/search" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                            <Search className="w-4 h-4 mr-3 text-gray-400" />
                                            Search Places
                                        </Link>

                                        {isAdmin && (
                                            <Link to="/admin" className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                                                <ShieldCheck className="w-4 h-4 mr-3 text-red-400" />
                                                Admin Dashboard
                                            </Link>
                                        )}

                                        <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                            <Settings className="w-4 h-4 mr-3 text-gray-400" />
                                            My Profile
                                        </Link>

                                        <div className="border-t border-gray-100 my-1"></div>

                                        <button
                                            onClick={logout}
                                            className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 mr-3 text-red-400" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Panel */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white shadow-xl absolute w-full left-0">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === link.path
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="pt-4 pb-3 border-t border-gray-100">
                        {!isLoggedIn ? (
                            <div className="px-4 flex flex-col space-y-3">
                                <Link
                                    to="/login"
                                    className="block text-center w-full px-4 py-2 text-base font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="block text-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                                >
                                    Sign up
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center px-4 mb-3">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800 flex items-center">
                                            {user?.name}
                                            {isPremium && (
                                                <span className="ml-2 flex items-center bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-amber-300 shadow-sm">
                                                    <Star className="w-3 h-3 mr-1 fill-amber-900 text-amber-900" />
                                                    PREMIUM
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                                    </div>
                                </div>
                                <div className="mt-3 px-2 space-y-1">
                                    <Link to="/saved" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                                        My Saved Places
                                    </Link>
                                    <Link to="/my-trips" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                                        My Trips
                                    </Link>
                                    <Link to="/search" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                                        Search Places
                                    </Link>
                                    {isAdmin && (
                                        <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                                        My Profile
                                    </Link>
                                    <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
