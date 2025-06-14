//front-end/src/components/auth/OAuthContext.jsx
import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {loadUser} = useAuth();
    const [authState, setAuthState] = useState('processing'); // 'processing', 'success', 'error'

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const token = searchParams.get('token');
            const error = searchParams.get('error');

            if (error) {
                setAuthState('error');
                toast.error('Authentication failed. Please try again.');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            if (token) {
                const success = await authService.handleOAuthRedirect(token);
                if (success) {
                    await loadUser();
                    setAuthState('success');
                    // Show success animation for 2 seconds before navigating
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);
                } else {
                    setAuthState('error');
                    toast.error('Failed to authenticate. Please try again.');
                    setTimeout(() => navigate('/login'), 1000);
                }
            } else {
                setAuthState('error');
                setTimeout(() => navigate('/login'), 1000);
            }
        };

        handleOAuthCallback();
    }, [searchParams, navigate, loadUser]);

    const renderContent = () => {
        switch (authState) {
            case 'success':
                return (
                    <div className="text-center">
                        <div className="relative">
                            {/* Success checkmark animation */}
                            <div
                                className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-green-600 animate-pulse"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        </div>
                        <p className="mt-4 text-green-600 font-semibold">Login successful!</p>
                        <p className="mt-2 text-gray-500 text-sm">Redirecting you now...</p>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <p className="mt-4 text-red-600 font-semibold">Authentication failed</p>
                        <p className="mt-2 text-gray-500 text-sm">Redirecting to login...</p>
                    </div>
                );

            default: // 'processing'
                return (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Completing authentication...</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            {renderContent()}
        </div>
    );
};

export default OAuthSuccess;