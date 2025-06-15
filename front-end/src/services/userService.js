// front-end/src/services/userService.js
import api from './api';

const userService = {
    // Get all users with optional search and pagination
    getAllUsers: async (params = {}) => {
        const response = await api.get('/users', {params});
        return response.data;
    },

    // Get single user by ID
    getUser: async (userId) => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    },

    // Update user role
    updateUserRole: async (userId, role) => {
        const response = await api.put(`/users/${userId}/role`, {role});
        return response.data;
    },

    // Delete user
    deleteUser: async (userId) => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    },

    // Get user statistics
    getUserStats: async () => {
        const response = await api.get('/users/stats');
        return response.data;
    }
};

export default userService;