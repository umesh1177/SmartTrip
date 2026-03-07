import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProtectedRoute({ children, reqPremium = false, allowedRoles }) {
    const { user, isLoggedIn, isPremium, loading } = useAuth();
    const location = useLocation();
    const [hasNotified, setHasNotified] = useState(false);

    useEffect(() => {
        if (!loading && !hasNotified) {
            if (!isLoggedIn) {
                toast.error('Please log in to access this page.');
                setHasNotified(true);
            } else if (reqPremium && !isPremium) {
                toast.error('This feature requires a Premium account.');
                setHasNotified(true);
            } else if (allowedRoles && !allowedRoles.includes(user?.role)) {
                toast.error('Access denied for your role.');
                setHasNotified(true);
            }
        }
    }, [loading, isLoggedIn, isPremium, reqPremium, allowedRoles, user, hasNotified]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col justify-center items-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Verifying credentials...</p>
            </div>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (reqPremium && !isPremium) {
        return <Navigate to="/pricing" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
        if (user.role === 'guide') return <Navigate to="/guide/dashboard" />;
        if (user.role === 'driver') return <Navigate to="/driver/app" />;
        return <Navigate to="/explore" replace />;
    }

    return children;
}
