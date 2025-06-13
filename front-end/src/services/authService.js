//front-end/src/services/authService.js
import api from './api';

const authService = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    // Login user
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    // Get current user
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Handle OAuth redirect
    handleOAuthRedirect: async (token) => {
        if (token) {
            localStorage.setItem('token', token);
            return true;
        }
        return false;
    }
};

export default authService;