import { createContext, useContext, useState, useEffect } from 'react';

const CabContext = createContext();

export const useCab = () => useContext(CabContext);

export const CabProvider = ({ children }) => {
    const [rideState, setRideState] = useState(() => {
        const saved = localStorage.getItem('activeRide');
        return saved ? JSON.parse(saved) : {
            status: 'idle', // idle, searching, accepted, active, completed
            pickup: null,
            drop: null,
            vehicleType: 'sedan',
            driver: null,
            rideId: null,
            otp: null,
            fare: 0,
            distance: 0,
            duration: 0
        };
    });

    useEffect(() => {
        localStorage.setItem('activeRide', JSON.stringify(rideState));
    }, [rideState]);

    const updateRideState = (updates) => {
        setRideState(prev => ({ ...prev, ...updates }));
    };

    const resetRide = () => {
        setRideState({
            status: 'idle',
            pickup: null,
            drop: null,
            vehicleType: 'sedan',
            driver: null,
            rideId: null,
            otp: null,
            fare: 0,
            distance: 0,
            duration: 0
        });
        localStorage.removeItem('activeRide');
    };

    return (
        <CabContext.Provider value={{ rideState, updateRideState, resetRide }}>
            {children}
        </CabContext.Provider>
    );
};
