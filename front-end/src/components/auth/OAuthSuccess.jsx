import {useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {loadUser} = useAuth();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const token = searchParams.get('token');
            const error = searchParams.get('error');

            if (error) {
                toast.error('Authentication failed. Please try again.');
                navigate('/login');
                return;
            }

            if (token) {
                const success = await authService.handleOAuthRedirect(token);
                if (success) {
                    await loadUser();
                    toast.success('Login successful!');
                    navigate('/');
                } else {
                    toast.error('Failed to authenticate. Please try again.');
                    navigate('/login');
                }
            } else {
                navigate('/login');
            }
        };

        handleOAuthCallback();
    }, [searchParams, navigate, loadUser]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing authentication...</p>
            </div>
        </div>
    );
};

export default OAuthSuccess;