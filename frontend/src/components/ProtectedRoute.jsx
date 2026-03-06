import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProtectedRoute({ children, reqPremium = false }) {
    const { user, isLoggedIn, isPremium, loading } = useAuth();
    const location = useLocation();
    const [hasNotified, setHasNotified] = useState(false);

    useEffect(() => {
        // Only fire notifications once per mount to avoid React strict mode double-firing
        if (!loading && !hasNotified) {
            if (!isLoggedIn) {
                toast.error('Please log in to access this page.');
                setHasNotified(true);
            } else if (reqPremium && !isPremium) {
                toast.error('This feature requires a Premium account.');
                setHasNotified(true);
            }
        }
    }, [loading, isLoggedIn, isPremium, reqPremium, hasNotified]);

    if (loading) {
        // Return a full-page loading spinner while auth context figures out the JWT
        return (
            <div className="min-h-[80vh] flex flex-col justify-center items-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Verifying credentials...</p>
            </div>
        );
    }

    // Not logged in -> Login
    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Logged in but not premium (and premium requested) -> Pricing
    if (reqPremium && !isPremium) {
        return <Navigate to="/pricing" replace />;
    }

    // Render children
    return children;
}
