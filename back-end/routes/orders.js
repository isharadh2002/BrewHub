// back-end/routes/orders.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder,
    getOrderStats,
    getMyOrders
} = require('../controllers/orderController');

// Validation rules
const createOrderValidation = [
    body('items')
        .isArray({ min: 1 }).withMessage('Order must contain at least one item')
        .custom((items) => {
            for (const item of items) {
                if (!item.menuItem || !item.quantity || item.quantity < 1) {
                    return false;
                }
            }
            return true;
        }).withMessage('Invalid item format'),
    body('orderType')
        .isIn(['dine-in', 'takeaway', 'delivery']).withMessage('Invalid order type'),
    body('paymentMethod')
        .isIn(['cash', 'card', 'online', 'wallet']).withMessage('Invalid payment method'),
    body('notes')
        .optional()
        .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
    body('deliveryAddress')
        .if(body('orderType').equals('delivery'))
        .notEmpty().withMessage('Delivery address is required for delivery orders')
        .custom((address) => {
            return address.street && address.city && address.state && address.zipCode && address.phone;
        }).withMessage('Complete delivery address is required'),
    body('loyaltyPointsRedeemed')
        .optional()
        .isInt({ min: 0 }).withMessage('Invalid loyalty points value')
];

const updateStatusValidation = [
    body('status')
        .isIn(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
        .withMessage('Invalid status')
];

const cancelOrderValidation = [
    body('reason')
        .notEmpty().withMessage('Cancel reason is required')
        .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
];

// All routes require authentication
router.use(protect);

// Customer routes
router.get('/my-orders', getMyOrders);
router.post('/', createOrderValidation, createOrder);

// Staff routes
router.get('/stats', authorize('staff', 'manager', 'admin'), getOrderStats);
router.get('/', getOrders); // Customers see only their orders, staff see all
router.get('/:id', getOrder);
router.patch('/:id/status',
    authorize('staff', 'manager', 'admin'),
    updateStatusValidation,
    updateOrderStatus
);
router.post('/:id/cancel', cancelOrderValidation, cancelOrder);

module.exports = router;