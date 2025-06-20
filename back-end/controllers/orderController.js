// back-end/controllers/orderController.js
const Order = require('../models/order');
const MenuItem = require('../models/menuItem');
const User = require('../models/user');
const { validationResult } = require('express-validator');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { items, orderType, paymentMethod, notes, deliveryAddress, loyaltyPointsRedeemed } = req.body;

        // Validate and calculate items
        const orderItems = [];
        let subtotal = 0;

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItem);

            if (!menuItem) {
                return res.status(404).json({
                    success: false,
                    message: `Menu item not found: ${item.menuItem}`
                });
            }

            if (!menuItem.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: `Item unavailable: ${menuItem.name}`
                });
            }

            // Calculate item price with customizations
            let itemPrice = menuItem.price;
            const customizations = [];

            if (item.customizations) {
                for (const custom of item.customizations) {
                    const customization = menuItem.customizations.find(c => c.name === custom.name);
                    if (customization) {
                        const option = customization.options.find(o => o.name === custom.option);
                        if (option) {
                            itemPrice += option.priceModifier || 0;
                            customizations.push({
                                name: custom.name,
                                option: {
                                    name: option.name,
                                    priceModifier: option.priceModifier || 0
                                }
                            });
                        }
                    }
                }
            }

            const itemSubtotal = itemPrice * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                menuItem: menuItem._id,
                name: menuItem.name,
                price: itemPrice,
                quantity: item.quantity,
                customizations,
                subtotal: itemSubtotal
            });
        }

        // Calculate tax (10% for example)
        const tax = subtotal * 0.1;

        // Calculate delivery fee
        const deliveryFee = orderType === 'delivery' ? 5 : 0;

        // Check if user has enough loyalty points
        const user = await User.findById(req.user.id);
        if (loyaltyPointsRedeemed && loyaltyPointsRedeemed > user.loyaltyPoints) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient loyalty points'
            });
        }

        // Generate order number
        const orderNumber = await Order.generateOrderNumber();

        // Create order
        const order = await Order.create({
            orderNumber,
            customer: req.user.id,
            items: orderItems,
            orderType,
            paymentMethod,
            notes,
            deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
            subtotal,
            tax,
            deliveryFee,
            loyaltyPointsRedeemed: loyaltyPointsRedeemed || 0,
            estimatedTime: new Date(Date.now() + 30 * 60000) // 30 minutes from now
        });

        // Update user loyalty points
        if (loyaltyPointsRedeemed) {
            user.loyaltyPoints -= loyaltyPointsRedeemed;
        }
        user.loyaltyPoints += order.loyaltyPointsEarned;
        await user.save();

        // Populate order details
        await order.populate('customer items.menuItem');

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get all orders (with filters)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        const {
            status,
            orderType,
            paymentStatus,
            startDate,
            endDate,
            search,
            page = 1,
            limit = 20
        } = req.query;

        // Build query
        let query = {};

        // Role-based filtering
        if (req.user.role === 'customer') {
            query.customer = req.user.id;
        }

        if (status) {
            query.status = status;
        }

        if (orderType) {
            query.orderType = orderType;
        }

        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'customer.name': { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const startIndex = (page - 1) * limit;
        const total = await Order.countDocuments(query);

        // Execute query
        const orders = await Order.find(query)
            .populate('customer', 'name email phone')
            .populate('items.menuItem', 'name image category')
            .populate('processedBy', 'name')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip(startIndex);

        res.json({
            success: true,
            count: orders.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phone loyaltyPoints')
            .populate('items.menuItem')
            .populate('processedBy', 'name');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (req.user.role === 'customer' && order.customer._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Staff
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Validate status transition
        const validTransitions = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['preparing', 'cancelled'],
            preparing: ['ready', 'cancelled'],
            ready: ['completed'],
            completed: [],
            cancelled: []
        };

        if (!validTransitions[order.status].includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${order.status} to ${status}`
            });
        }

        order.status = status;
        order.processedBy = req.user.id;

        // Update estimated time for certain status changes
        if (status === 'preparing') {
            order.estimatedTime = new Date(Date.now() + 20 * 60000); // 20 minutes
        } else if (status === 'ready') {
            order.estimatedTime = new Date();
        }

        await order.save();
        await order.populate('customer items.menuItem processedBy');

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Cancel order
// @route   POST /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (req.user.role === 'customer' && order.customer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Check if order can be cancelled
        if (!order.canBeCancelled()) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        order.status = 'cancelled';
        order.cancelReason = reason;
        order.processedBy = req.user.id;

        // Refund loyalty points if used
        if (order.loyaltyPointsRedeemed > 0) {
            const user = await User.findById(order.customer);
            user.loyaltyPoints += order.loyaltyPointsRedeemed;
            // Remove earned points from this order
            user.loyaltyPoints -= order.loyaltyPointsEarned;
            await user.save();
        }

        await order.save();
        await order.populate('customer items.menuItem processedBy');

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Staff
exports.getOrderStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's stats
        const todayStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total' },
                    avgOrderValue: { $avg: '$total' },
                    byStatus: {
                        $push: '$status'
                    }
                }
            }
        ]);

        // Status breakdown
        const statusBreakdown = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Popular items today
        const popularItems = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: today, $lt: tomorrow }
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.menuItem',
                    name: { $first: '$items.name' },
                    quantity: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.subtotal' }
                }
            },
            { $sort: { quantity: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            success: true,
            data: {
                today: todayStats[0] || {
                    totalOrders: 0,
                    totalRevenue: 0,
                    avgOrderValue: 0
                },
                statusBreakdown,
                popularItems
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get customer order history
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const startIndex = (page - 1) * limit;
        const total = await Order.countDocuments({ customer: req.user.id });

        const orders = await Order.find({ customer: req.user.id })
            .populate('items.menuItem', 'name image category')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip(startIndex);

        res.json({
            success: true,
            count: orders.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};