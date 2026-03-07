import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
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
import HotelDetail from './pages/HotelDetail';
import DriverApp from './pages/DriverApp';
import DriverRegister from './pages/DriverRegister';
import B2BPortal from './pages/B2BPortal';
import GuideDashboard from './pages/GuideDashboard';
import NotFound from './pages/NotFound';
import SearchPage from './pages/SearchPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import MyTrips from './pages/MyTrips';
import HotelPartnerRegister from './pages/hotelPartner/HotelPartnerRegister';
import HotelPartnerDashboard from './pages/hotelPartner/HotelPartnerDashboard';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const { isLoggedIn } = useAuth();
  const { rideState } = useCab();

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
          <Route path="/explore" element={<ProtectedRoute allowedRoles={['free', 'premium', 'admin', 'guide', 'driver']}><Explore /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><SavedPlaces /></ProtectedRoute>} />
          <Route path="/my-trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
          <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/plan-trip" element={<ProtectedRoute><TripPlanner /></ProtectedRoute>} />
          <Route path="/book-cab" element={<ProtectedRoute><BookCab /></ProtectedRoute>} />
          <Route path="/transit" element={<ProtectedRoute><PublicTransport /></ProtectedRoute>} />
          <Route path="/write-review/:placeId/:tripId" element={<ProtectedRoute><WriteReview /></ProtectedRoute>} />
          <Route path="/place/:placeId" element={<ProtectedRoute><PlaceDetail /></ProtectedRoute>} />
          <Route path="/hotel/:id" element={<ProtectedRoute><HotelDetail /></ProtectedRoute>} />
          <Route path="/trips/:tripId/timeline" element={<ProtectedRoute><TripTimeline /></ProtectedRoute>} />

          {/* Search Route - Logged In Users */}
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />

          {/* Admin Route */}
          <Route path="/admin" element={
            <Navigate to="/admin/dashboard" replace />
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Guide Routes */}
          <Route path="/guide/dashboard" element={
            <ProtectedRoute allowedRoles={['guide']}>
              <GuideDashboard />
            </ProtectedRoute>
          } />

          {/* B2B Routes */}
          <Route path="/b2b/dashboard" element={
            <ProtectedRoute allowedRoles={['b2b_admin', 'admin']}>
              <B2BPortal />
            </ProtectedRoute>
          } />

          {/* Hotel Partner Routes */}
          <Route path="/hotel-partner/register" element={<HotelPartnerRegister />} />
          <Route path="/hotel-partner/dashboard" element={
            <ProtectedRoute allowedRoles={['hotel_partner', 'admin']}>
              <HotelPartnerDashboard />
            </ProtectedRoute>
          } />

          {/* Driver Routes */}
          <Route path="/driver/app" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverApp />
            </ProtectedRoute>
          } />
          <Route path="/driver" element={
            <Navigate to="/driver/app" replace />
          } />
          <Route path="/driver/register" element={<ProtectedRoute><DriverRegister /></ProtectedRoute>} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

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
