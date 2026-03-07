import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize from local storage on load
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            // Set default auth header
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    // Axios interceptor for setting dynamic token and handling 401s globally
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use((config) => {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid
                    logout();
                    toast.error('Session expired. Please log in again.');
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            const { token: newToken, user: userData, redirectTo } = res.data;

            setUser(userData);
            setToken(newToken);

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', newToken);

            return { success: true, redirectTo };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (name, email, password, role = 'free', extraData = {}) => {
        try {
            const res = await axios.post('/api/auth/register', {
                name, email, password, role, ...extraData
            });
            const { token: newToken, user: userData } = res.data;

            setUser(userData);
            setToken(newToken);

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', newToken);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateProfile = (newData) => {
        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // Helper properties/functions
    // Helper properties
    const isLoggedIn = !!user;
    const isAdmin = user?.role === 'admin';
    const isGuide = user?.role === 'guide';
    const isDriver = user?.role === 'driver';
    const isPremium = user?.role === 'premium';
    const isHotelPartner = user?.role === 'hotel_partner';
    const isB2B = user?.role === 'b2b_admin';

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                updateProfile,
                setUser,
                isLoggedIn,
                isAdmin,
                isGuide,
                isDriver,
                isPremium,
                isHotelPartner,
                isB2B
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};
