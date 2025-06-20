// front-end/src/components/customer/CartPage.jsx
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCart} from '../../contexts/CartContext';
import {useAuth} from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import toast from 'react-hot-toast';
import {X, Plus, Minus, ShoppingBag, Trash2} from 'lucide-react';

const CartPage = () => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const {items, updateQuantity, removeFromCart, clearCart, calculateTotals, isOpen, setIsOpen} = useCart();

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

    const totals = calculateTotals();
    const deliveryFee = orderType === 'delivery' ? 5 : 0;
    const finalTotal = totals.total + deliveryFee - loyaltyPointsToUse;
    const loyaltyPointsEarned = Math.floor(finalTotal);

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

        if (orderType === 'delivery' && (!deliveryAddress.street || !deliveryAddress.city ||
            !deliveryAddress.state || !deliveryAddress.zipCode || !deliveryAddress.phone)) {
            toast.error('Please fill in complete delivery address');
            return;
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
            setIsOpen(false);
            toast.success('Order placed successfully!');
            navigate(`/orders/${response.data._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                 onClick={() => setIsOpen(false)}/>

            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5"/>
                            Your Cart ({totals.itemCount} items)
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>

                    {/* CartPage Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {items.length === 0 ? (
                            <div className="text-center py-12">
                                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                                <p className="text-gray-500">Your cart is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map(item => (
                                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={item.menuItem.image}
                                                alt={item.menuItem.name}
                                                className="w-16 h-16 object-cover rounded-md"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-medium">{item.menuItem.name}</h3>
                                                {item.customizations.length > 0 && (
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {item.customizations.map((custom, idx) => (
                                                            <p key={idx}>{custom.name}: {custom.option.name}</p>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className="text-brown-600 font-medium mt-1">
                                                    ${item.price.toFixed(2)} each
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                >
                                                    <Minus className="w-4 h-4"/>
                                                </button>
                                                <span className="px-3 py-1 bg-white rounded">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                >
                                                    <Plus className="w-4 h-4"/>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-semibold">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </p>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Order Options */}
                    {items.length > 0 && (
                        <div className="border-t p-4 space-y-4">
                            {/* Order Type */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Order Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['dine-in', 'takeaway', 'delivery'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setOrderType(type)}
                                            className={`py-2 px-3 rounded-md text-sm font-medium capitalize ${
                                                orderType === type
                                                    ? 'bg-brown-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery Address */}
                            {orderType === 'delivery' && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Delivery Address</label>
                                    <input
                                        type="text"
                                        placeholder="Street Address"
                                        value={deliveryAddress.street}
                                        onChange={(e) => setDeliveryAddress({
                                            ...deliveryAddress,
                                            street: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border rounded-md text-sm"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={deliveryAddress.city}
                                            onChange={(e) => setDeliveryAddress({
                                                ...deliveryAddress,
                                                city: e.target.value
                                            })}
                                            className="px-3 py-2 border rounded-md text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="State"
                                            value={deliveryAddress.state}
                                            onChange={(e) => setDeliveryAddress({
                                                ...deliveryAddress,
                                                state: e.target.value
                                            })}
                                            className="px-3 py-2 border rounded-md text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Zip Code"
                                            value={deliveryAddress.zipCode}
                                            onChange={(e) => setDeliveryAddress({
                                                ...deliveryAddress,
                                                zipCode: e.target.value
                                            })}
                                            className="px-3 py-2 border rounded-md text-sm"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone"
                                            value={deliveryAddress.phone}
                                            onChange={(e) => setDeliveryAddress({
                                                ...deliveryAddress,
                                                phone: e.target.value
                                            })}
                                            className="px-3 py-2 border rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                >
                                    <option value="card">Credit/Debit Card</option>
                                    <option value="cash">Cash</option>
                                    <option value="online">Online Payment</option>
                                    <option value="wallet">Digital Wallet</option>
                                </select>
                            </div>

                            {/* Loyalty Points */}
                            {user && user.loyaltyPoints > 0 && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Use Loyalty Points (Available: {user.loyaltyPoints})
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={Math.min(user.loyaltyPoints, finalTotal)}
                                        value={loyaltyPointsToUse}
                                        onChange={(e) => setLoyaltyPointsToUse(parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border rounded-md text-sm"
                                    />
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Special Instructions</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any special requests?"
                                    rows={2}
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {/* Order Summary */}
                    {items.length > 0 && (
                        <div className="border-t p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>${totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Tax (10%)</span>
                                <span>${totals.tax.toFixed(2)}</span>
                            </div>
                            {orderType === 'delivery' && (
                                <div className="flex justify-between text-sm">
                                    <span>Delivery Fee</span>
                                    <span>${deliveryFee.toFixed(2)}</span>
                                </div>
                            )}
                            {loyaltyPointsToUse > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Loyalty Points Discount</span>
                                    <span>-${loyaltyPointsToUse.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                                <span>Total</span>
                                <span>${finalTotal.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-gray-600">
                                You'll earn {loyaltyPointsEarned} loyalty points
                            </p>

                            <button
                                onClick={handleCheckout}
                                disabled={loading || !user}
                                className="w-full py-3 bg-brown-600 text-white rounded-md font-medium hover:bg-brown-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : (user ? 'Place Order' : 'Login to Order')}
                            </button>

                            {items.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    className="w-full py-2 text-red-600 hover:bg-red-50 rounded-md text-sm"
                                >
                                    Clear Cart
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartPage;