import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CabProvider } from './context/CabContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import Pricing from './pages/Pricing';
import PaymentSuccess from './pages/PaymentSuccess';
import SavedPlaces from './pages/SavedPlaces';
import TripPlanner from './pages/TripPlanner';
import { useAuth } from './context/AuthContext';
import { useCab } from './context/CabContext';
import { MapPin, Navigation, Zap, Wallet, Star } from 'lucide-react';
import BookCab from './pages/BookCab';
import PublicTransport from './pages/PublicTransport';
import WriteReview from './pages/WriteReview';
import TripTimeline from './pages/TripTimeline';
import PlaceDetail from './pages/PlaceDetail';
import DriverApp from './pages/DriverApp';
import DriverRegister from './pages/DriverRegister';
import B2BPortal from './pages/B2BPortal';
import GuideDashboard from './pages/GuideDashboard';
import NotFound from './pages/NotFound';
import SearchPage from './pages/SearchPage';
import AdminDashboard from './pages/AdminDashboard';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const { user, isLoggedIn } = useAuth();
  const { rideState } = useCab();
  const [activeTrip, setActiveTrip] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      // Mocking active trip check - in real app, fetch from API
      const fetchActiveTrip = async () => {
        try {
          const res = await axios.get('/api/trips/active');
          setActiveTrip(res.data);
        } catch (err) { }
      };
      fetchActiveTrip();
    }
  }, [isLoggedIn]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 relative">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Protected Routes */}
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><SavedPlaces /></ProtectedRoute>} />
          <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/plan-trip" element={<ProtectedRoute><TripPlanner /></ProtectedRoute>} />
          <Route path="/book-cab" element={<ProtectedRoute><BookCab /></ProtectedRoute>} />
          <Route path="/transit" element={<ProtectedRoute><PublicTransport /></ProtectedRoute>} />
          <Route path="/write-review/:placeId/:tripId" element={<ProtectedRoute><WriteReview /></ProtectedRoute>} />
          <Route path="/place/:placeId" element={<ProtectedRoute><PlaceDetail /></ProtectedRoute>} />
          <Route path="/trips/:tripId/timeline" element={<ProtectedRoute><TripTimeline /></ProtectedRoute>} />

          {/* Search Route - Logged In Users */}
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />

          {/* Admin Route */}
          <Route path="/admin" element={
            <ProtectedRoute>
              {user?.role === 'admin' ? <AdminDashboard /> : <NotFound />}
            </ProtectedRoute>
          } />

          {/* Driver Routes */}
          <Route path="/driver" element={
            <ProtectedRoute>
              {user?.role === 'driver' && user?.isVerified ? <DriverApp /> : <NotFound />}
            </ProtectedRoute>
          } />
          <Route path="/driver/register" element={<ProtectedRoute><DriverRegister /></ProtectedRoute>} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Active Trip Banner */}
      <AnimatePresence>
        {activeTrip && rideState.status === 'idle' && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 md:px-8 pointer-events-none"
          >
            <div className="max-w-7xl mx-auto bg-gray-900/95 backdrop-blur-xl text-white p-4 md:p-6 rounded-t-3xl md:rounded-3xl shadow-3xl pointer-events-auto border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/20">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest leading-none mb-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span> Active Trip
                  </div>
                  <h4 className="text-xl font-black leading-tight truncate max-w-[200px] md:max-w-md">{activeTrip.title}</h4>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/book-cab" className="flex flex-col items-center p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                  <Zap size={20} className="text-yellow-400 mb-1" />
                  <span className="text-[10px] font-bold">Book Cab</span>
                </Link>
                <Link to={`/trips/${activeTrip._id}/timeline`} className="flex flex-col items-center p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                  <Navigation size={20} className="text-blue-400 mb-1" />
                  <span className="text-[10px] font-bold">Timeline</span>
                </Link>
                <div className="h-12 w-px bg-white/10 mx-2 hidden md:block"></div>
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Budget Used</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[65%] rounded-full shadow-lg shadow-indigo-500/50"></div>
                    </div>
                    <span className="text-xs font-black">65%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CabProvider>
        <Router>
          <AppContent />
        </Router>
      </CabProvider>
    </AuthProvider>
  );
}

export default App;
