import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, Autocomplete } from '@react-google-maps/api';
import { useCab } from '../context/CabContext';
import { useSocket } from '../hooks/useSocket';
import { MapPin, Navigation, Car, Bike, Info, Phone, Star, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

const center = {
    lat: 28.6139,
    lng: 77.2090
};

const vehicleTypes = [
    { id: 'bike', name: 'Bike', icon: <Bike size={24} />, pricePerKm: 0.3, info: 'Fastest' },
    { id: 'auto', name: 'Auto', icon: <Car size={24} />, pricePerKm: 0.5, info: 'Affordable' },
    { id: 'sedan', name: 'Sedan', icon: <Car size={24} />, pricePerKm: 1.0, info: 'Comfortable' },
    { id: 'suv', name: 'SUV', icon: <Car size={24} />, pricePerKm: 1.5, info: 'Spacious' }
];

const BookCab = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ['places']
    });

    const { rideState, updateRideState, resetRide } = useCab();
    const { emit } = useSocket();

    const [map, setMap] = useState(null);
    const [pickupAutocomplete, setPickupAutocomplete] = useState(null);
    const [dropAutocomplete, setDropAutocomplete] = useState(null);
    const [pickupAddress, setPickupAddress] = useState('');
    const [dropAddress, setDropAddress] = useState('');
    const [routeData, setRouteData] = useState(null);
    const [drivers, setDrivers] = useState([]);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    // Fetch nearby drivers periodically
    useEffect(() => {
        if (!map || rideState.status !== 'idle') return;

        const fetchDrivers = async () => {
            const bounds = map.getBounds();
            if (!bounds) return;
            // Mocking nearby drivers for demonstration
            // In a real app, this would be a socket event or API call
            const mockDrivers = [
                { id: 1, lat: center.lat + 0.01, lng: center.lng + 0.01 },
                { id: 2, lat: center.lat - 0.01, lng: center.lng - 0.01 },
            ];
            setDrivers(mockDrivers);
        };

        const interval = setInterval(fetchDrivers, 5000);
        fetchDrivers();
        return () => clearInterval(interval);
    }, [map, rideState.status]);

    const onPickupPlaceChanged = () => {
        if (pickupAutocomplete !== null) {
            const place = pickupAutocomplete.getPlace();
            const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };
            setPickupAddress(place.formatted_address);
            updateRideState({ pickup: location });
            map.panTo(location);
        }
    };

    const onDropPlaceChanged = () => {
        if (dropAutocomplete !== null) {
            const place = dropAutocomplete.getPlace();
            const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };
            setDropAddress(place.formatted_address);
            updateRideState({ drop: location });
        }
    };

    const calculateRoute = async () => {
        if (!rideState.pickup || !rideState.drop) return;

        const directionsService = new google.maps.DirectionsService();
        const results = await directionsService.route({
            origin: rideState.pickup,
            destination: rideState.drop,
            travelMode: google.maps.TravelMode.DRIVING
        });

        setRouteData(results);
        const distance = results.routes[0].legs[0].distance.value / 1000;
        const duration = results.routes[0].legs[0].duration.value / 60;
        const vehicle = vehicleTypes.find(v => v.id === rideState.vehicleType);
        const fare = distance * vehicle.pricePerKm + 5; // Base fare $5

        updateRideState({ distance, duration, fare });
    };

    useEffect(() => {
        if (rideState.pickup && rideState.drop) {
            calculateRoute();
        }
    }, [rideState.pickup, rideState.drop, rideState.vehicleType]);

    const handleBookRide = () => {
        if (!rideState.pickup || !rideState.drop) {
            toast.error('Please select pickup and drop locations');
            return;
        }

        updateRideState({ status: 'searching' });
        emit('request_ride', {
            pickup: rideState.pickup,
            drop: rideState.drop,
            vehicleType: rideState.vehicleType,
            fare: rideState.fare
        });

        // Timeout after 2 minutes
        setTimeout(() => {
            if (rideState.status === 'searching') {
                updateRideState({ status: 'idle' });
                toast.error('No drivers found nearby. Please try again.');
            }
        }, 120000);
    };

    if (!isLoaded) return <div className="h-screen flex items-center justify-center">Loading Maps...</div>;

    return (
        <div className="h-[calc(100vh-64px)] relative overflow-hidden flex flex-col md:flex-row">
            {/* Map View */}
            <div className="flex-grow h-full relative">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={rideState.pickup || center}
                    zoom={14}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{ disableDefaultUI: true, zoomControl: true }}
                >
                    {rideState.pickup && <Marker position={pickupState.pickup} icon="https://maps.google.com/mapfiles/ms/icons/green-dot.png" />}
                    {rideState.drop && <Marker position={rideState.drop} icon="https://maps.google.com/mapfiles/ms/icons/red-dot.png" />}

                    {/* Nearby Drivers */}
                    {rideState.status === 'idle' && drivers.map(d => (
                        <Marker key={d.id} position={{ lat: d.lat, lng: d.lng }} icon={{
                            url: 'https://cdn-icons-png.flaticon.com/512/744/744465.png',
                            scaledSize: new google.maps.Size(30, 30)
                        }} />
                    ))}

                    {/* Driver Position during ride */}
                    {rideState.driver?.currentLocation && (
                        <Marker position={rideState.driver.currentLocation} icon={{
                            url: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
                            scaledSize: new google.maps.Size(40, 40)
                        }} />
                    )}

                    {routeData && <Polyline path={routeData.routes[0].overview_path} options={{ strokeColor: '#4f46e5', strokeWeight: 5 }} />}
                </GoogleMap>
            </div>

            {/* Side Panel / Bottom Sheet */}
            <div className="w-full md:w-96 bg-white shadow-2xl z-10 flex flex-col p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {rideState.status === 'idle' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Car className="text-indigo-600" /> Book a Cab
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-green-500" size={20} />
                                    <Autocomplete onLoad={setPickupAutocomplete} onPlaceChanged={onPickupPlaceChanged}>
                                        <input
                                            type="text"
                                            placeholder="Enter pickup location"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={pickupAddress}
                                            onChange={(e) => setPickupAddress(e.target.value)}
                                        />
                                    </Autocomplete>
                                </div>
                                <div className="relative">
                                    <Navigation className="absolute left-3 top-3 text-red-500" size={20} />
                                    <Autocomplete onLoad={setDropAutocomplete} onPlaceChanged={onDropPlaceChanged}>
                                        <input
                                            type="text"
                                            placeholder="Enter destination"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={dropAddress}
                                            onChange={(e) => setDropAddress(e.target.value)}
                                        />
                                    </Autocomplete>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold mb-3">Choose Ride</h3>
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {vehicleTypes.map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => updateRideState({ vehicleType: v.id })}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${rideState.vehicleType === v.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}
                                    >
                                        <div className="mb-2 text-indigo-600">{v.icon}</div>
                                        <div className="font-bold">{v.name}</div>
                                        <div className="text-xs text-gray-500 font-medium">{v.info}</div>
                                    </button>
                                ))}
                            </div>

                            {rideState.distance > 0 && (
                                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-500">Distance</span>
                                        <span className="font-bold">{rideState.distance.toFixed(1)} km</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-500">Estimated Time</span>
                                        <span className="font-bold">{rideState.duration.toFixed(0)} mins</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg mt-2 pt-2 border-t border-gray-200">
                                        <span className="font-semibold text-gray-900">Total Fare</span>
                                        <span className="font-extrabold text-indigo-600">${rideState.fare.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleBookRide}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg"
                            >
                                Book {vehicleTypes.find(v => v.id === rideState.vehicleType).name} Now
                            </button>
                        </motion.div>
                    )}

                    {rideState.status === 'searching' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10">
                            <div className="relative w-32 h-32 mx-auto mb-8">
                                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                                <motion.div
                                    className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Navigation className="text-indigo-600 animate-pulse" size={40} />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Finding your driver...</h2>
                            <p className="text-gray-500 mb-8">We are connecting you with the nearest {rideState.vehicleType} driver.</p>
                            <button onClick={resetRide} className="text-red-500 font-bold hover:underline">Cancel Request</button>
                        </motion.div>
                    )}

                    {rideState.status === 'accepted' && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 mb-6">
                                <CheckCircle size={24} />
                                <span className="font-bold text-sm">Driver Accepted Your Ride!</span>
                            </div>

                            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl">
                                <img src={rideState.driver?.avatar || 'https://via.placeholder.com/60'} alt="Driver" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                                <div>
                                    <h3 className="text-xl font-bold">{rideState.driver?.name || 'Driver'}</h3>
                                    <div className="flex items-center gap-1 text-sm font-bold text-yellow-600">
                                        <Star size={16} fill="currentColor" /> {rideState.driver?.rating || '4.9'}
                                    </div>
                                </div>
                                <button className="ml-auto p-3 bg-white rounded-full shadow-sm text-indigo-600 border border-indigo-100">
                                    <Phone size={24} />
                                </button>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Vehicle</span>
                                    <span className="font-bold text-gray-900">{rideState.driver?.vehicleModel || 'White Toyota Camry'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Number Plate</span>
                                    <span className="font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{rideState.driver?.vehicleNumber || 'KA-01-AB-1234'}</span>
                                </div>
                                <div className="bg-indigo-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                                    <span className="text-indigo-100 text-sm font-medium mb-1 uppercase tracking-widest">Your OTP</span>
                                    <span className="text-4xl font-black tracking-[0.5em]">{rideState.otp || '****'}</span>
                                </div>
                            </div>

                            <p className="text-center text-gray-500 text-sm italic">Share this OTP with driver to start the ride</p>
                        </motion.div>
                    )}

                    {rideState.status === 'completed' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Ride Completed!</h2>
                            <p className="text-gray-500 mb-8">Hope you had a comfortable trip.</p>

                            <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                                <div className="text-gray-500 mb-1">Total Fare</div>
                                <div className="text-4xl font-black text-indigo-600 mb-4">${rideState.fare.toFixed(2)}</div>

                                <h4 className="text-sm font-bold mb-3 uppercase text-gray-400">Rate your driver</h4>
                                <div className="flex justify-center gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={32} className="text-yellow-400 cursor-pointer hover:scale-110 transition-transform" />)}
                                </div>
                            </div>

                            <button
                                onClick={resetRide}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                            >
                                Done
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BookCab;
