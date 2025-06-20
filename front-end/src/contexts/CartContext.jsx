// front-end/src/contexts/CartContext.jsx
import {createContext, useState, useContext, useEffect} from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({children}) => {
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load cart from sessionStorage on mount
    useEffect(() => {
        const savedCart = sessionStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error loading cart:', error);
            }
        }
    }, []);

    // Save cart to sessionStorage whenever it changes
    useEffect(() => {
        sessionStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    // Add item to cart
    const addToCart = (menuItem, quantity = 1, customizations = []) => {
        const cartItem = {
            id: `${menuItem._id}-${Date.now()}`, // Unique ID for each cart item
            menuItem,
            quantity,
            customizations,
            price: calculateItemPrice(menuItem, customizations)
        };

        setItems(prev => [...prev, cartItem]);
        toast.success(`${menuItem.name} added to cart!`);
        setIsOpen(true);
    };

    // Update item quantity
    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }

        setItems(prev =>
            prev.map(item =>
                item.id === itemId
                    ? {...item, quantity: newQuantity}
                    : item
            )
        );
    };

    // Remove item from cart
    const removeFromCart = (itemId) => {
        setItems(prev => prev.filter(item => item.id !== itemId));
        toast.success('Item removed from cart');
    };

    // Clear entire cart
    const clearCart = () => {
        setItems([]);
        sessionStorage.removeItem('cart');
        toast.success('CartPage cleared');
    };

    // Calculate item price with customizations
    const calculateItemPrice = (menuItem, customizations) => {
        let price = menuItem.price;

        customizations.forEach(custom => {
            if (custom.option && custom.option.priceModifier) {
                price += custom.option.priceModifier;
            }
        });

        return price;
    };

    // Calculate cart totals
    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;

        return {
            subtotal,
            tax,
            total,
            itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
        };
    };

    const value = {
        items,
        isOpen,
        setIsOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        calculateTotals,
        calculateItemPrice
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};