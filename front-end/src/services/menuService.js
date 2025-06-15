// front-end/src/services/menuService.js
import api from './api';

const menuService = {
    // Get all menu items with filters
    getAllItems: async (params = {}) => {
        const response = await api.get('/menu', {params});
        return response.data;
    },

    // Get single menu item
    getItem: async (id) => {
        const response = await api.get(`/menu/${id}`);
        return response.data;
    },

    // Create new menu item (Admin only)
    createItem: async (itemData) => {
        const response = await api.post('/menu', itemData);
        return response.data;
    },

    // Update menu item (Admin only)
    updateItem: async (id, itemData) => {
        const response = await api.put(`/menu/${id}`, itemData);
        return response.data;
    },

    // Delete menu item (Admin only)
    deleteItem: async (id) => {
        const response = await api.delete(`/menu/${id}`);
        return response.data;
    },

    // Toggle item availability (Staff and above)
    toggleAvailability: async (id) => {
        const response = await api.patch(`/menu/${id}/availability`);
        return response.data;
    },

    // Get categories with counts
    getCategories: async () => {
        const response = await api.get('/menu/categories');
        return response.data;
    },

    // Upload image (if using local storage)
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload/menu-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};

export default menuService;