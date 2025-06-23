// back-end/controllers/orderController.js
const Order = require('../models/order');
const MenuItem = require('../models/menuItem');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

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
            const menuItem = await MenuItem.findById(item.menuItem).session(session);

            if (!menuItem) {
                await session.abortTransaction();
                return res.status(404).json({
                    success: false,
                    message: `Menu item not found: ${item.menuItem}`
                });
            }

            if (!menuItem.isAvailable) {
                await session.abortTransaction();
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
                    if (!customization) {
                        await session.abortTransaction();
                        return res.status(400).json({
                            success: false,
                            message: `Invalid customization for ${menuItem.name}: ${custom.name}`
                        });
                    }

                    // Check if customization is required
                    if (customization.required && !custom.option) {
                        await session.abortTransaction();
                        return res.status(400).json({
                            success: false,
                            message: `Required customization missing for ${menuItem.name}: ${custom.name}`
                        });
                    }

                    const option = customization.options.find(o => o.name === custom.option.name);
                    if (!option) {
                        await session.abortTransaction();
                        return res.status(400).json({
                            success: false,
                            message: `Invalid option for ${custom.name}: ${custom.option.name}`
                        });
                    }

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

            // Check for required customizations
            const missingRequired = menuItem.customizations
                .filter(c => c.required)
                .find(c => !customizations.find(custom => custom.name === c.name));

            if (missingRequired) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: `Required customization missing for ${menuItem.name}: ${missingRequired.name}`
                });
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

        // Calculate fees and totals
        const taxRate = 0.1; // 10% tax
        const tax = subtotal * taxRate;
        const deliveryFee = orderType === 'delivery' ? 5 : 0;
        const discount = 0; // You can add discount logic here if needed

        // Validate loyalty points
        const user = await User.findById(req.user.id).session(session);
        const pointsToRedeem = loyaltyPointsRedeemed || 0;

        if (pointsToRedeem > 0) {
            if (pointsToRedeem > user.loyaltyPoints) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient loyalty points'
                });
            }

            // Ensure points don't exceed order total
            const maxRedeemable = Math.floor(subtotal + tax + deliveryFee);
            if (pointsToRedeem > maxRedeemable) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: `Cannot redeem more points than order total: ${maxRedeemable}`
                });
            }
        }

        // Calculate total
        const total = subtotal + tax + deliveryFee - discount - pointsToRedeem;
        const loyaltyPointsEarned = Math.floor(total/10); // 1 point for every $10 spent

        // Generate order number
        const orderNumber = await Order.generateOrderNumber();

        // Create order
        const orderData = {
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
            discount,
            total,
            loyaltyPointsRedeemed: pointsToRedeem,
            loyaltyPointsEarned,
            estimatedTime: new Date(Date.now() + 30 * 60000), // 30 minutes from now
            paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid'
        };

        const order = await Order.create([orderData], { session });

        // Update user loyalty points
        if (pointsToRedeem > 0) {
            user.loyaltyPoints -= pointsToRedeem;
        }
        user.loyaltyPoints += order[0].loyaltyPointsEarned;
        await user.save({ session });

        await session.commitTransaction();

        // Populate order details
        await order[0].populate('customer items.menuItem');

        // Send order confirmation email (implement email service)
        // await emailService.sendOrderConfirmation(user.email, order[0]);

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order[0]
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    } finally {
        session.endSession();
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
            limit = 20,
            sort = '-createdAt'
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
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } }
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
            .sort(sort)
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
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
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
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
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

        // Update payment status if order is completed
        if (status === 'completed' && order.paymentMethod === 'cash') {
            order.paymentStatus = 'paid';
        }

        await order.save();
        await order.populate('customer items.menuItem processedBy');

        // Send notification to customer (implement notification service)
        // await notificationService.sendOrderStatusUpdate(order);

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};

// @desc    Cancel order
// @route   POST /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { reason } = req.body;

        const order = await Order.findById(req.params.id).session(session);

        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (req.user.role === 'customer' && order.customer.toString() !== req.user.id) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Check if order can be cancelled
        if (!order.canBeCancelled()) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        order.status = 'cancelled';
        order.cancelReason = reason;
        order.processedBy = req.user.id;

        // Refund loyalty points if used
        if (order.loyaltyPointsRedeemed > 0 || order.loyaltyPointsEarned > 0) {
            const user = await User.findById(order.customer).session(session);

            // Refund redeemed points
            if (order.loyaltyPointsRedeemed > 0) {
                user.loyaltyPoints += order.loyaltyPointsRedeemed;
            }

            // Remove earned points from this order
            if (order.loyaltyPointsEarned > 0 && order.status !== 'pending') {
                user.loyaltyPoints = Math.max(0, user.loyaltyPoints - order.loyaltyPointsEarned);
            }

            await user.save({ session });
        }

        // Handle refund based on payment status
        if (order.paymentStatus === 'paid') {
            order.paymentStatus = 'refunded';
            // Implement actual refund logic here based on payment method
            // await paymentService.refund(order);
        }

        await order.save({ session });
        await session.commitTransaction();

        await order.populate('customer items.menuItem processedBy');

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Staff
exports.getOrderStats = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Date range for queries
        const dateRange = {
            $gte: startDate ? new Date(startDate) : today,
            $lt: endDate ? new Date(endDate) : tomorrow
        };

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
                    totalItems: { $sum: { $sum: '$items.quantity' } }
                }
            }
        ]);

        // Status breakdown
        const statusBreakdown = await Order.aggregate([
            {
                $match: {
                    createdAt: dateRange
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    revenue: { $sum: '$total' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Order type breakdown
        const orderTypeBreakdown = await Order.aggregate([
            {
                $match: {
                    createdAt: dateRange,
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: '$orderType',
                    count: { $sum: 1 },
                    revenue: { $sum: '$total' }
                }
            }
        ]);

        // Popular items
        const popularItems = await Order.aggregate([
            {
                $match: {
                    createdAt: dateRange,
                    status: { $ne: 'cancelled' }
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
            { $limit: 10 }
        ]);

        // Hourly distribution (for today only)
        const hourlyDistribution = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    count: { $sum: 1 },
                    revenue: { $sum: '$total' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Revenue trend (last 7 days)
        const revenueTrend = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    },
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$total' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                today: todayStats[0] || {
                    totalOrders: 0,
                    totalRevenue: 0,
                    avgOrderValue: 0,
                    totalItems: 0
                },
                statusBreakdown,
                orderTypeBreakdown,
                popularItems,
                hourlyDistribution,
                revenueTrend
            }
        });
    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order statistics',
            error: error.message
        });
    }
};

// @desc    Get customer order history
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const query = { customer: req.user.id };
        if (status) {
            query.status = status;
        }

        const startIndex = (page - 1) * limit;
        const total = await Order.countDocuments(query);

        const orders = await Order.find(query)
            .populate('items.menuItem', 'name image category price')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip(startIndex);

        // Get order stats for the customer
        const stats = await Order.aggregate([
            {
                $match: { customer: new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: {
                        $sum: {
                            $cond: [
                                { $ne: ['$status', 'cancelled'] },
                                '$total',
                                0
                            ]
                        }
                    },
                    favoriteCategory: {
                        $push: '$items.menuItem'
                    }
                }
            }
        ]);

        res.json({
            success: true,
            count: orders.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            stats: stats[0] || { totalOrders: 0, totalSpent: 0 },
            data: orders
        });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your orders',
            error: error.message
        });
    }
};

// @desc    Rate order items
// @route   POST /api/orders/:id/rate
// @access  Private
exports.rateOrder = async (req, res) => {
    try {
        const { ratings } = req.body; // Array of { menuItem: id, rating: 1-5, review: text }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check authorization
        if (order.customer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to rate this order'
            });
        }

        // Check if order is completed
        if (order.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only rate completed orders'
            });
        }

        // Save ratings (implement rating model/service)
        // await ratingService.saveRatings(order._id, req.user.id, ratings);

        res.json({
            success: true,
            message: 'Thank you for your feedback!'
        });
    } catch (error) {
        console.error('Rate order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit rating',
            error: error.message
        });
    }
};

// @desc    Get active orders for kitchen/staff display
// @route   GET /api/orders/active
// @access  Private/Staff
exports.getActiveOrders = async (req, res) => {
    try {
        const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready'];

        const orders = await Order.find({
            status: { $in: activeStatuses },
            createdAt: {
                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
        })
            .populate('customer', 'name phone')
            .populate('items.menuItem', 'name category preparationTime')
            .sort({ createdAt: 1 }); // Oldest first (FIFO)

        // Group by status for kitchen display
        const groupedOrders = activeStatuses.reduce((acc, status) => {
            acc[status] = orders.filter(order => order.status === status);
            return acc;
        }, {});

        res.json({
            success: true,
            data: groupedOrders,
            summary: {
                total: orders.length,
                pending: groupedOrders.pending.length,
                confirmed: groupedOrders.confirmed.length,
                preparing: groupedOrders.preparing.length,
                ready: groupedOrders.ready.length
            }
        });
    } catch (error) {
        console.error('Get active orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active orders',
            error: error.message
        });
    }
};