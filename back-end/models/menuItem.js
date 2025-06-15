// back-end/models/menuItem.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Menu item name is required'],
        trim: true,
        maxLength: [100, 'Name cannot exceed 100 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['coffee', 'tea', 'pastries', 'sandwiches', 'desserts', 'beverages'],
        lowercase: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxLength: [500, 'Description cannot exceed 500 characters']
    },
    longDescription: {
        type: String,
        maxLength: [2000, 'Long description cannot exceed 2000 characters']
    },
    image: {
        type: String,
        required: [true, 'Image URL is required']
    },
    ingredients: [{
        type: String,
        trim: true
    }],
    nutritionalInfo: {
        calories: { type: Number, min: 0 },
        protein: { type: Number, min: 0 },
        carbs: { type: Number, min: 0 },
        fat: { type: Number, min: 0 },
        sugar: { type: Number, min: 0 },
        sodium: { type: Number, min: 0 }
    },
    allergens: [{
        type: String,
        enum: ['dairy', 'eggs', 'gluten', 'nuts', 'soy', 'shellfish', 'fish']
    }],
    customizations: [{
        name: {
            type: String,
            required: true
        },
        options: [{
            name: String,
            priceModifier: {
                type: Number,
                default: 0
            }
        }],
        required: {
            type: Boolean,
            default: false
        }
    }],
    isAvailable: {
        type: Boolean,
        default: true
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    isSeasonal: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    preparationTime: {
        type: Number, // in minutes
        min: 0
    },
    servingSize: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for better query performance
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ price: 1 });
menuItemSchema.index({ isPopular: 1 });

// Virtual for formatted price
menuItemSchema.virtual('formattedPrice').get(function() {
    return `$${this.price.toFixed(2)}`;
});

// Method to check if item has allergen
menuItemSchema.methods.hasAllergen = function(allergen) {
    return this.allergens.includes(allergen.toLowerCase());
};

// Static method to get items by category
menuItemSchema.statics.getByCategory = function(category) {
    return this.find({ category: category.toLowerCase(), isAvailable: true });
};

// Static method to get popular items
menuItemSchema.statics.getPopular = function(limit = 10) {
    return this.find({ isPopular: true, isAvailable: true }).limit(limit);
};

module.exports = mongoose.model('MenuItem', menuItemSchema);