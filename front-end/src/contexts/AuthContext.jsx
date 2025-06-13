//front-end/src/contexts/AuthContext.jsx
import {createContext, useState, useContext, useEffect} from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user on mount
    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            if (authService.isAuthenticated()) {
                const response = await authService.getMe();
                setUser(response.user);
            }
        } catch (error) {
            console.error('Error loading user:', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            setUser(response.user);
            toast.success('Registration successful!');
            return {success: true};
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return {success: false, error: message};
        }
    };

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            setUser(response.user);
            toast.success('Login successful!');
            return {success: true};
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return {success: false, error: message};
        }
    };

    const logout = () => {
        setUser(null);
        authService.logout();
        toast.success('Logged out successfully');
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        loadUser,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};