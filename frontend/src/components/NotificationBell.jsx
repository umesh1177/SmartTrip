import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, Check, Clock, AlertCircle, Info, Calendar, Car, Sparkles, Utensils, Star, Camera } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications');
            setNotifications(res.data.data);
            setUnreadCount(res.data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every 60s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await axios.put('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All marked as read');
        } catch (error) {
            toast.error('Failed to update notifications');
        }
    };

    const handleNotificationClick = async (notif) => {
        try {
            if (!notif.isRead) {
                await axios.put(`/api/notifications/${notif._id}/read`);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
            }
            setIsOpen(false);

            // Navigate to relevant part
            if (notif.type === 'reminder' || notif.type === 'guide_accepted') {
                navigate('/my-trips');
            } else if (notif.type === 'cab_arrival') {
                navigate('/book-cab');
            } else if (notif.type === 'suggestion' || notif.type === 'meal_reminder') {
                navigate('/explore');
            } else if (notif.type === 'trip_ended' || notif.type === 'photo_reminder') {
                navigate(`/write-review/${notif.data?.placeId}/${notif.data?.tripId}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'reminder': return <Calendar className="w-4 h-4 text-blue-500" />;
            case 'guide_accepted': return <Check className="w-4 h-4 text-green-500" />;
            case 'cab_arrival': return <Car className="w-4 h-4 text-indigo-500" />;
            case 'suggestion': return <Sparkles className="w-4 h-4 text-amber-500" />;
            case 'meal_reminder': return <Utensils className="w-4 h-4 text-orange-500" />;
            case 'trip_ended': return <Star className="w-4 h-4 text-yellow-500" />;
            case 'photo_reminder': return <Camera className="w-4 h-4 text-pink-500" />;
            case 'system': return <Info className="w-4 h-4 text-gray-500" />;
            default: return <AlertCircle className="w-4 h-4 text-amber-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto no-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm italic">
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-all flex gap-3 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-white' : 'bg-gray-100'}`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                    {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/my-trips')}
                        className="w-full py-3 bg-gray-50 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors border-t border-gray-100"
                    >
                        View My Trip Timeline
                    </button>
                </div>
            )}
        </div>
    );
}
