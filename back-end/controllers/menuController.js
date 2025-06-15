// back-end/controllers/menuController.js
const MenuItem = require('../models/menuItem');
const { validationResult } = require('express-validator');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
exports.getAllMenuItems = async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            isAvailable,
            isPopular,
            allergens,
            sort = '-createdAt',
            page = 1,
            limit = 20
        } = req.query;

        // Build query
        let query = {};

        if (category && category !== 'all') {
            query.category = category.toLowerCase();
        }

        if (search) {
            query.$text = { $search: search };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        if (isAvailable !== undefined) {
            query.isAvailable = isAvailable === 'true';
        }

        if (isPopular !== undefined) {
            query.isPopular = isPopular === 'true';
        }

        if (allergens) {
            const allergenList = allergens.split(',');
            query.allergens = { $nin: allergenList };
        }

        // Calculate pagination
        const startIndex = (page - 1) * limit;
        const total = await MenuItem.countDocuments(query);

        // Execute query
        const menuItems = await MenuItem.find(query)
            .sort(sort)
            .limit(limit * 1)
            .skip(startIndex)
            .populate('createdBy updatedBy', 'name');

        res.json({
            success: true,
            count: menuItems.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            data: menuItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
exports.getMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id)
            .populate('createdBy updatedBy', 'name email');

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Admin
exports.createMenuItem = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        // Add creator info
        req.body.createdBy = req.user.id;

        const menuItem = await MenuItem.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Menu item created successfully',
            data: menuItem
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
exports.updateMenuItem = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        // Add updater info
        req.body.updatedBy = req.user.id;

        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.json({
            success: true,
            message: 'Menu item updated successfully',
            data: menuItem
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
exports.deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Toggle menu item availability
// @route   PATCH /api/menu/:id/availability
// @access  Private/Staff
exports.toggleAvailability = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        menuItem.isAvailable = !menuItem.isAvailable;
        menuItem.updatedBy = req.user.id;
        await menuItem.save();

        res.json({
            success: true,
            message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'} successfully`,
            data: menuItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get menu categories with counts
// @route   GET /api/menu/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await MenuItem.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    availableCount: {
                        $sum: { $cond: ['$isAvailable', 1, 0] }
                    }
                }
            },
            {
                $project: {
                    category: '$_id',
                    count: 1,
                    availableCount: 1,
                    _id: 0
                }
            },
            { $sort: { category: 1 } }
        ]);

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};