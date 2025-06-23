// front-end/src/services/orderService.js
import api from './api';

const orderService = {
    // Create new order
    createOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    // Get all orders with filters
    getAllOrders: async (params = {}) => {
        const response = await api.get('/orders', {params});
        return response.data;
    },

    // Get single order
    getOrder: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    // Update order status (Staff only)
    updateOrderStatus: async (id, status) => {
        const response = await api.patch(`/orders/${id}/status`, {status});
        return response.data;
    },

    // Cancel order
    cancelOrder: async (id, reason) => {
        const response = await api.post(`/orders/${id}/cancel`, {reason});
        return response.data;
    },

    // Get order statistics (Staff only)
    getOrderStats: async () => {
        const response = await api.get('/orders/stats');
        return response.data;
    },

    // Get customer's orders
    getMyOrders: async (params = {}) => {
        const response = await api.get('/orders/my-orders', {params});
        return response.data;
    },

    // Calculate order totals (frontend utility)
    calculateOrderTotals: (items, loyaltyPointsRedeemed = 0, orderType = 'dine-in') => {
        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => {
            let itemPrice = item.price || 0;

            // Add customization costs
            if (item.customizations) {
                item.customizations.forEach(custom => {
                    if (custom.option && custom.option.priceModifier) {
                        itemPrice += custom.option.priceModifier;
                    }
                });
            }

            return sum + (itemPrice * item.quantity);
        }, 0);

        // Calculate tax (10%)
        const tax = subtotal * 0.1;

        // Calculate delivery fee
        const deliveryFee = orderType === 'delivery' ? 5 : 0;

        // Calculate total
        const total = subtotal + tax + deliveryFee - loyaltyPointsRedeemed;

        // Calculate loyalty points earned
        const loyaltyPointsEarned = Math.floor(total / 10); // 1 point for every $10 spent

        return {
            subtotal,
            tax,
            deliveryFee,
            total,
            loyaltyPointsEarned
        };
    },

    // Format order status for display
    formatOrderStatus: (status) => {
        const statusMap = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            preparing: 'Preparing',
            ready: 'Ready for Pickup',
            completed: 'Completed',
            cancelled: 'Cancelled'
        };
        return statusMap[status] || status;
    },

    // Get status color
    getStatusColor: (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            preparing: 'bg-orange-100 text-orange-800',
            ready: 'bg-green-100 text-green-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }
};

export default orderService;