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
    const [cartCount, setCartCount] = useState(0);

    // Load cart from sessionStorage on mount
    useEffect(() => {
        const savedCart = sessionStorage.getItem('brewhub_cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setItems(parsedCart);
                updateCartCount(parsedCart);
            } catch (error) {
                console.error('Error loading cart:', error);
                sessionStorage.removeItem('brewhub_cart');
            }
        }
    }, []);

    // Save cart to sessionStorage whenever it changes
    useEffect(() => {
        if (items.length > 0) {
            sessionStorage.setItem('brewhub_cart', JSON.stringify(items));
        } else {
            sessionStorage.removeItem('brewhub_cart');
        }
        updateCartCount(items);
    }, [items]);

    // Update cart count
    const updateCartCount = (cartItems) => {
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
    };

    // Add item to cart
    const addToCart = (menuItem, quantity = 1, customizations = []) => {
        // Check if item with same customizations already exists
        const existingItemIndex = items.findIndex(item => {
            if (item.menuItem._id !== menuItem._id) return false;

            // Check if customizations match
            if (item.customizations.length !== customizations.length) return false;

            return item.customizations.every((custom, index) => {
                const newCustom = customizations[index];
                return custom.name === newCustom.name &&
                    custom.option.name === newCustom.option.name;
            });
        });

        if (existingItemIndex >= 0) {
            // Update quantity of existing item
            const updatedItems = [...items];
            updatedItems[existingItemIndex].quantity += quantity;
            setItems(updatedItems);
            toast.success(`Updated ${menuItem.name} quantity in cart`);
        } else {
            // Add new item
            const cartItem = {
                id: `${menuItem._id}-${Date.now()}`,
                menuItem,
                quantity,
                customizations,
                price: calculateItemPrice(menuItem, customizations)
            };
            setItems(prev => [...prev, cartItem]);
            toast.success(`${menuItem.name} added to cart!`);
        }
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
        const item = items.find(i => i.id === itemId);
        if (item) {
            setItems(prev => prev.filter(item => item.id !== itemId));
            toast.success(`${item.menuItem.name} removed from cart`);
        }
    };

    // Clear entire cart
    const clearCart = () => {
        setItems([]);
        sessionStorage.removeItem('brewhub_cart');
        setCartCount(0);
        toast.success('Cart cleared');
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

    // Check if item is in cart
    const isInCart = (menuItemId) => {
        return items.some(item => item.menuItem._id === menuItemId);
    };

    // Get item quantity in cart
    const getItemQuantity = (menuItemId) => {
        return items
            .filter(item => item.menuItem._id === menuItemId)
            .reduce((sum, item) => sum + item.quantity, 0);
    };

    // Validate cart items (check if all items are still available)
    const validateCart = async () => {
        // This would typically make an API call to validate items
        // For now, just return true
        return true;
    };

    const value = {
        items,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        calculateTotals,
        calculateItemPrice,
        isInCart,
        getItemQuantity,
        validateCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};