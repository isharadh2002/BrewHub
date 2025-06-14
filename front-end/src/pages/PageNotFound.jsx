import React from 'react';
import {Home, ArrowLeft, Search} from 'lucide-react';
import {useNavigate} from "react-router-dom";

export default function PageNotFound() {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full text-center">
                {/* Animated 404 */}
                <div className="mb-8">
                    <h1 className="text-8xl sm:text-9xl font-bold text-brown-600 opacity-20 select-none">
                        404
                    </h1>
                    <div className="relative -mt-16 sm:-mt-20">
                        <div
                            className="inline-block p-6 bg-white rounded-full shadow-lg border-4 border-brown-600 transform hover:scale-105 transition-transform duration-300">
                            <Search className="w-12 h-12 text-brown-600"/>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                            Oops! Page Not Found
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            The page you're looking for seems to have wandered off.
                            Don't worry, even the best explorers lose their way sometimes.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center space-x-2 px-6 py-3 bg-white border-2 border-brown-600 text-brown-600 rounded-lg font-semibold hover:bg-brown-600 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1"/>
                            <span>Go Back</span>
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="group flex items-center space-x-2 px-6 py-3 bg-brown-600 text-white rounded-lg font-semibold hover:bg-brown-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                            <Home className="w-5 h-5 transition-transform group-hover:scale-110"/>
                            <span>Go Home</span>
                        </button>
                    </div>

                    {/* Decorative Elements */}
                    <div className="pt-8">
                        <div className="flex justify-center space-x-2">
                            <div className="w-3 h-3 bg-brown-600 rounded-full opacity-40 animate-pulse"></div>
                            <div className="w-3 h-3 bg-brown-600 rounded-full opacity-60 animate-pulse"
                                 style={{animationDelay: '0.5s'}}></div>
                            <div className="w-3 h-3 bg-brown-600 rounded-full opacity-80 animate-pulse"
                                 style={{animationDelay: '1s'}}></div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute top-1/4 left-1/4 w-4 h-4 bg-brown-600 rounded-full opacity-20 animate-bounce"
                        style={{animationDelay: '2s'}}></div>
                    <div
                        className="absolute top-3/4 right-1/4 w-6 h-6 bg-brown-500 rounded-full opacity-10 animate-bounce"
                        style={{animationDelay: '3s'}}></div>
                    <div
                        className="absolute top-1/2 left-1/6 w-3 h-3 bg-brown-600 rounded-full opacity-30 animate-bounce"
                        style={{animationDelay: '1s'}}></div>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }

                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}