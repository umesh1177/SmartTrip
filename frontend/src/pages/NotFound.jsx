import { Link } from 'react-router-dom';
import { Plane, Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[85vh] bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Animated Icon Container */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100">
                        <Plane className="w-12 h-12 text-blue-500 transform -rotate-45" />
                    </div>
                    <div className="absolute -top-4 -right-4 bg-amber-100 rounded-full p-2 animate-bounce flex items-center justify-center shadow-sm">
                        <Compass className="w-6 h-6 text-amber-500" />
                    </div>
                </div>

                <h1 className="text-8xl font-black text-gray-200 tracking-tighter mb-4">404</h1>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Lost in travel?</h2>
                <p className="text-gray-500 mb-8 text-lg">
                    It looks like this destination doesn't exist on our map. Let's get you back on the right path.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Return to Homepage
                </Link>
            </div>
        </div>
    );
}
