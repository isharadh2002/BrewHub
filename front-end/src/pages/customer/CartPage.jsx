// front-end/src/pages/customer/CartPage.jsx
import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useCart} from '../../contexts/CartContext';
import {useAuth} from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import toast from 'react-hot-toast';
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    ArrowLeft,
    CreditCard,
    MapPin,
    Gift,
    AlertCircle
} from 'lucide-react';

const CartPage = () => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const {items, updateQuantity, removeFromCart, clearCart, calculateTotals} = useCart();

    const [orderType, setOrderType] = useState('dine-in');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [notes, setNotes] = useState('');
    const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);
    const [deliveryAddress, setDeliveryAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);

    const totals = calculateTotals();
    const deliveryFee = orderType === 'delivery' ? 5 : 0;
    const finalTotal = totals.total + deliveryFee - loyaltyPointsToUse;
    const loyaltyPointsEarned = Math.floor(finalTotal / 10); // 1 point for every $10 spent

    const handleCheckout = async () => {
        if (!user) {
            toast.error('Please login to place an order');
            navigate('/login');
            return;
        }

        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        if (orderType === 'delivery') {
            const {street, city, state, zipCode, phone} = deliveryAddress;
            if (!street || !city || !state || !zipCode || !phone) {
                toast.error('Please fill in complete delivery address');
                return;
            }
        }

        setLoading(true);

        try {
            const orderData = {
                items: items.map(item => ({
                    menuItem: item.menuItem._id,
                    quantity: item.quantity,
                    customizations: item.customizations
                })),
                orderType,
                paymentMethod,
                notes,
                loyaltyPointsRedeemed: loyaltyPointsToUse,
                ...(orderType === 'delivery' && {deliveryAddress})
            };

            const response = await orderService.createOrder(orderData);

            clearCart();
            toast.success('Order placed successfully!');
            navigate(`/orders/${response.data._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0 && !showCheckout) {
        return (
            <div className="min-h-[75vh] bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center py-16">
                        <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6"/>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-600 mb-8">Add some delicious items from our menu!</p>
                        <Link
                            to="/menu"
                            className="inline-block px-6 py-3 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors"
                        >
                            Browse Menu
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            to="/menu"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-brown-600 mb-4"
                        >
                            <ArrowLeft className="w-5 h-5"/>
                            Continue Shopping
                        </Link>
                        <h1 className="text-3xl font-bold">Shopping Cart</h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            {!showCheckout ? (
                                <div className="bg-white rounded-lg shadow">
                                    <div className="p-6 border-b">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold">Cart Items ({totals.itemCount})</h2>
                                            <button
                                                onClick={clearCart}
                                                className="text-sm text-red-600 hover:text-red-700"
                                            >
                                                Clear Cart
                                            </button>
                                        </div>
                                    </div>

                                    <div className="divide-y">
                                        {items.map(item => (
                                            <div key={item.id} className="p-6">
                                                <div className="flex gap-4">
                                                    <img
                                                        src={item.menuItem.image}
                                                        alt={item.menuItem.name}
                                                        className="w-24 h-24 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <h3 className="font-semibold text-lg">{item.menuItem.name}</h3>
                                                                <p className="text-gray-600 text-sm mt-1">
                                                                    {item.menuItem.category} •
                                                                    ${item.price.toFixed(2)} each
                                                                </p>
                                                                {item.customizations.length > 0 && (
                                                                    <div className="mt-2 space-y-1">
                                                                        {item.customizations.map((custom, idx) => (
                                                                            <p key={idx}
                                                                               className="text-sm text-gray-500">
                                                                                {custom.name}: {custom.option.name}
                                                                                {custom.option.priceModifier > 0 && (
                                                                                    <span className="text-brown-600">
                                                                                        {' '}(+${custom.option.priceModifier.toFixed(2)})
                                                                                    </span>
                                                                                )}
                                                                            </p>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-5 h-5"/>
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between mt-4">
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    className="p-2 border rounded-md hover:bg-gray-50"
                                                                >
                                                                    <Minus className="w-4 h-4"/>
                                                                </button>
                                                                <span
                                                                    className="w-12 text-center font-medium">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    className="p-2 border rounded-md hover:bg-gray-50"
                                                                >
                                                                    <Plus className="w-4 h-4"/>
                                                                </button>
                                                            </div>
                                                            <p className="font-semibold text-lg">
                                                                ${(item.price * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* Checkout Form */
                                <div className="space-y-6">
                                    {/* Order Type */}
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h3 className="text-lg font-semibold mb-4">Order Type</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                {value: 'dine-in', label: 'Dine In', icon: '🍽️'},
                                                {value: 'takeaway', label: 'Takeaway', icon: '🥡'},
                                                {value: 'delivery', label: 'Delivery', icon: '🚚'}
                                            ].map(type => (
                                                <button
                                                    key={type.value}
                                                    onClick={() => setOrderType(type.value)}
                                                    className={`p-4 rounded-lg border-2 transition-colors ${
                                                        orderType === type.value
                                                            ? 'border-brown-600 bg-brown-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="text-2xl mb-2">{type.icon}</div>
                                                    <p className="font-medium">{type.label}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Delivery Address */}
                                    {orderType === 'delivery' && (
                                        <div className="bg-white rounded-lg shadow p-6">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <MapPin className="w-5 h-5"/>
                                                Delivery Address
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium mb-2">Street
                                                        Address</label>
                                                    <input
                                                        type="text"
                                                        value={deliveryAddress.street}
                                                        onChange={(e) => setDeliveryAddress({
                                                            ...deliveryAddress,
                                                            street: e.target.value
                                                        })}
                                                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                                                        placeholder="123 Main Street"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">City</label>
                                                    <input
                                                        type="text"
                                                        value={deliveryAddress.city}
                                                        onChange={(e) => setDeliveryAddress({
                                                            ...deliveryAddress,
                                                            city: e.target.value
                                                        })}
                                                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                                                        placeholder="New York"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">State</label>
                                                    <input
                                                        type="text"
                                                        value={deliveryAddress.state}
                                                        onChange={(e) => setDeliveryAddress({
                                                            ...deliveryAddress,
                                                            state: e.target.value
                                                        })}
                                                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                                                        placeholder="NY"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Zip Code</label>
                                                    <input
                                                        type="text"
                                                        value={deliveryAddress.zipCode}
                                                        onChange={(e) => setDeliveryAddress({
                                                            ...deliveryAddress,
                                                            zipCode: e.target.value
                                                        })}
                                                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                                                        placeholder="10001"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Phone
                                                        Number</label>
                                                    <input
                                                        type="tel"
                                                        value={deliveryAddress.phone}
                                                        onChange={(e) => setDeliveryAddress({
                                                            ...deliveryAddress,
                                                            phone: e.target.value
                                                        })}
                                                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                                                        placeholder="(555) 123-4567"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Method */}
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <CreditCard className="w-5 h-5"/>
                                            Payment Method
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                {value: 'card', label: 'Credit/Debit Card', icon: '💳'},
                                                {value: 'cash', label: 'Cash on Delivery', icon: '💵'},
                                                {value: 'online', label: 'Online Payment', icon: '🌐'},
                                                {value: 'wallet', label: 'Digital Wallet', icon: '📱'}
                                            ].map(method => (
                                                <label
                                                    key={method.value}
                                                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                                        paymentMethod === method.value
                                                            ? 'border-brown-600 bg-brown-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value={method.value}
                                                        checked={paymentMethod === method.value}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="mr-3"
                                                    />
                                                    <span className="text-2xl mr-3">{method.icon}</span>
                                                    <span className="font-medium">{method.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Special Instructions */}
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h3 className="text-lg font-semibold mb-4">Special Instructions</h3>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Any special requests or dietary requirements?"
                                            rows={4}
                                            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                                {/* Summary Items */}
                                <div className="space-y-3 mb-6">
                                    {items.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                {item.menuItem.name} x{item.quantity}
                                            </span>
                                            <span className="font-medium">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-4 space-y-3">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (10%)</span>
                                        <span className="font-medium">${totals.tax.toFixed(2)}</span>
                                    </div>
                                    {orderType === 'delivery' && (
                                        <div className="flex justify-between">
                                            <span>Delivery Fee</span>
                                            <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {/* Loyalty Points */}
                                    {user && user.loyaltyPoints > 0 && showCheckout && (
                                        <div className="border-t pt-3">
                                            <div className="bg-green-50 p-3 rounded-md mb-3">
                                                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                                                    <Gift className="w-4 h-4"/>
                                                    You have {user.loyaltyPoints} loyalty points
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Use Loyalty Points
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={Math.min(user.loyaltyPoints, Math.floor(totals.total + deliveryFee))}
                                                    value={loyaltyPointsToUse}
                                                    onChange={(e) => setLoyaltyPointsToUse(parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    1 point = $1 discount • Earn 1 point per $10 spent
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {loyaltyPointsToUse > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Loyalty Discount</span>
                                            <span>-${loyaltyPointsToUse.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="border-t pt-3">
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span>Total</span>
                                            <span>${finalTotal.toFixed(2)}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            You'll earn {loyaltyPointsEarned} loyalty points
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 space-y-3">
                                    {!showCheckout ? (
                                        <>
                                            <button
                                                onClick={() => user ? setShowCheckout(true) : navigate('/login')}
                                                className="w-full py-3 bg-brown-600 text-white rounded-md font-medium hover:bg-brown-700 transition-colors"
                                            >
                                                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                                            </button>
                                            <Link
                                                to="/menu"
                                                className="block w-full py-3 text-center border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Continue Shopping
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleCheckout}
                                                disabled={loading}
                                                className="w-full py-3 bg-brown-600 text-white rounded-md font-medium hover:bg-brown-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div
                                                            className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="w-5 h-5"/>
                                                        Place Order
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setShowCheckout(false)}
                                                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium"
                                            >
                                                Back to Cart
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Security Notice */}
                                {showCheckout && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                        <p className="text-xs text-gray-600 flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/>
                                            Your payment information is secure and encrypted. We never store your card
                                            details.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;