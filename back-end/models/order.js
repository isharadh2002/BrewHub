// back-end/models/order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    customizations: [{
        name: String,
        option: {
            name: String,
            priceModifier: Number
        }
    }],
    subtotal: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending'
    },
    orderType: {
        type: String,
        enum: ['dine-in', 'takeaway', 'delivery'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online', 'wallet'],
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        default: 0
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    loyaltyPointsEarned: {
        type: Number,
        default: 0
    },
    loyaltyPointsRedeemed: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        maxLength: 500
    },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        phone: String
    },
    estimatedTime: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    cancelReason: {
        type: String
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
    }
}, {
    timestamps: true
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

// Generate order number
orderSchema.statics.generateOrderNumber = async function() {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Count today's orders
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await this.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const orderNum = (count + 1).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${orderNum}`;
};

// Calculate totals before saving
orderSchema.pre('save', function(next) {
    // Always calculate subtotal from items
    if (this.items && this.items.length > 0) {
        this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }

    // Always calculate total
    if (this.subtotal !== undefined) {
        this.total = this.subtotal + (this.tax || 0) + (this.deliveryFee || 0) - (this.discount || 0) - (this.loyaltyPointsRedeemed || 0);

        // Ensure total is not negative
        this.total = Math.max(0, this.total);

        // Calculate loyalty points earned (1 point for every $10 spent)
        this.loyaltyPointsEarned = Math.floor(this.total/10);
    }

    // Set completed/cancelled timestamps
    if (this.isModified('status')) {
        if (this.status === 'completed' && !this.completedAt) {
            this.completedAt = new Date();
        } else if (this.status === 'cancelled' && !this.cancelledAt) {
            this.cancelledAt = new Date();
        }
    }

    next();
});

// Virtual for status color
orderSchema.virtual('statusColor').get(function() {
    const colors = {
        pending: 'yellow',
        confirmed: 'blue',
        preparing: 'orange',
        ready: 'green',
        completed: 'gray',
        cancelled: 'red'
    };
    return colors[this.status] || 'gray';
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
    return ['pending', 'confirmed'].includes(this.status);
};

// Method to check if order can be updated
orderSchema.methods.canBeUpdated = function() {
    return ['pending'].includes(this.status);
};

// Static method to get orders by status
orderSchema.statics.getByStatus = function(status) {
    return this.find({ status }).populate('customer menuItem').sort('-createdAt');
};

// Static method to get today's orders
orderSchema.statics.getTodayOrders = function() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.find({
        createdAt: { $gte: start, $lte: end }
    }).sort('-createdAt');
};

module.exports = mongoose.model('Order', orderSchema);