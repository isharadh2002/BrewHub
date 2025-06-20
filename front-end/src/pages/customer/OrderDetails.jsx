// front-end/src/pages/customer/OrderDetails.jsx
import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import orderService from '../../services/orderService';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    MapPin,
    Phone,
    CreditCard,
    Calendar
} from 'lucide-react';

const OrderDetails = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
        // Poll for updates if order is active
        const interval = setInterval(() => {
            if (order && ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)) {
                fetchOrderDetails();
            }
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, [id, order?.status]);

    const fetchOrderDetails = async () => {
        try {
            const response = await orderService.getOrder(id);
            setOrder(response.data);
        } catch (error) {
            toast.error('Failed to load order details');
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusSteps = () => {
        const steps = [
            {status: 'pending', label: 'Order Placed', icon: Package},
            {status: 'confirmed', label: 'Confirmed', icon: CheckCircle},
            {status: 'preparing', label: 'Preparing', icon: Clock},
            {status: 'ready', label: 'Ready', icon: CheckCircle},
            {status: 'completed', label: 'Completed', icon: CheckCircle}
        ];

        if (order.status === 'cancelled') {
            return [
                {status: 'cancelled', label: 'Cancelled', icon: XCircle, active: true}
            ];
        }

        const currentIndex = steps.findIndex(step => step.status === order.status);
        return steps.map((step, index) => ({
            ...step,
            active: index <= currentIndex,
            current: index === currentIndex
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600"></div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    const statusSteps = getStatusSteps();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 text-gray-600 hover:text-brown-600 mb-6"
                >
                    <ArrowLeft className="w-5 h-5"/>
                    Back to Orders
                </button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Order Header */}
                    <div className="bg-brown-600 text-white p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">{order.orderNumber}</h1>
                                <div className="flex items-center gap-4 text-brown-100">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4"/>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4"/>
                                        {new Date(order.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                order.status === 'cancelled'
                                    ? 'bg-red-500'
                                    : order.status === 'completed'
                                        ? 'bg-green-500'
                                        : 'bg-orange-500'
                            }`}>
                                {orderService.formatOrderStatus(order.status)}
                            </span>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            {statusSteps.map((step, index) => (
                                <div key={index} className="flex items-center">
                                    <div className={`flex flex-col items-center ${
                                        index < statusSteps.length - 1 ? 'flex-1' : ''
                                    }`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            step.active
                                                ? step.status === 'cancelled'
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-green-100 text-green-600'
                                                : 'bg-gray-100 text-gray-400'
                                        } ${step.current ? 'ring-4 ring-brown-200' : ''}`}>
                                            <step.icon className="w-6 h-6"/>
                                        </div>
                                        <p className={`text-xs mt-2 ${
                                            step.active ? 'text-gray-900 font-medium' : 'text-gray-400'
                                        }`}>
                                            {step.label}
                                        </p>
                                    </div>
                                    {index < statusSteps.length - 1 && (
                                        <div className={`h-1 flex-1 mx-2 ${
                                            statusSteps[index + 1].active ? 'bg-green-500' : 'bg-gray-200'
                                        }`}/>
                                    )}
                                </div>
                            ))}
                        </div>

                        {order.estimatedTime && order.status !== 'completed' && order.status !== 'cancelled' && (
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-600">
                                    Estimated time: {new Date(order.estimatedTime).toLocaleTimeString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Order Details */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Order Info */}
                        <div>
                            <h3 className="font-semibold mb-4">Order Information</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-600">Order Type</p>
                                    <p className="font-medium capitalize">{order.orderType}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Payment Method</p>
                                    <p className="font-medium capitalize flex items-center gap-2">
                                        <CreditCard className="w-4 h-4"/>
                                        {order.paymentMethod}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Payment Status</p>
                                    <p className={`font-medium capitalize ${
                                        order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                                    }`}>
                                        {order.paymentStatus}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        {order.orderType === 'delivery' && order.deliveryAddress && (
                            <div>
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5"/>
                                    Delivery Address
                                </h3>
                                <div className="space-y-1 text-sm">
                                    <p>{order.deliveryAddress.street}</p>
                                    <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                                    <p className="flex items-center gap-1 mt-2">
                                        <Phone className="w-4 h-4"/>
                                        {order.deliveryAddress.phone}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="p-6 border-t">
                        <h3 className="font-semibold mb-4">Order Items</h3>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <img
                                        src={item.menuItem.image}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded-md"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.name}</h4>
                                        {item.customizations.length > 0 && (
                                            <div className="text-sm text-gray-600 mt-1">
                                                {item.customizations.map((custom, idx) => (
                                                    <p key={idx}>
                                                        {custom.name}: {custom.option.name}
                                                        {custom.option.priceModifier > 0 && (
                                                            <span className="text-gray-500">
                                                                {' '}(+${custom.option.priceModifier.toFixed(2)})
                                                            </span>
                                                        )}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-sm mt-1">
                                            ${item.price.toFixed(2)} x {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Special Instructions */}
                    {order.notes && (
                        <div className="px-6 pb-6">
                            <h3 className="font-semibold mb-2">Special Instructions</h3>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{order.notes}</p>
                        </div>
                    )}

                    {/* Order Summary */}
                    <div className="bg-gray-50 p-6">
                        <h3 className="font-semibold mb-4">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>${order.tax.toFixed(2)}</span>
                            </div>
                            {order.deliveryFee > 0 && (
                                <div className="flex justify-between">
                                    <span>Delivery Fee</span>
                                    <span>${order.deliveryFee.toFixed(2)}</span>
                                </div>
                            )}
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-${order.discount.toFixed(2)}</span>
                                </div>
                            )}
                            {order.loyaltyPointsRedeemed > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Loyalty Points Used</span>
                                    <span>-${order.loyaltyPointsRedeemed.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-semibold text-lg pt-3 border-t">
                                <span>Total Paid</span>
                                <span>${order.total.toFixed(2)}</span>
                            </div>
                            {order.loyaltyPointsEarned > 0 && (
                                <p className="text-green-600 text-sm mt-2">
                                    You earned {order.loyaltyPointsEarned} loyalty points from this order!
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Cancel Reason */}
                    {order.status === 'cancelled' && order.cancelReason && (
                        <div className="bg-red-50 p-6 border-t">
                            <h3 className="font-semibold text-red-800 mb-2">Cancellation Reason</h3>
                            <p className="text-sm text-red-700">{order.cancelReason}</p>
                            {order.cancelledAt && (
                                <p className="text-xs text-red-600 mt-2">
                                    Cancelled on {new Date(order.cancelledAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Completion Info */}
                    {order.status === 'completed' && order.completedAt && (
                        <div className="bg-green-50 p-6 border-t">
                            <p className="text-green-800 font-medium">
                                ✓ Order completed on {new Date(order.completedAt).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-4 justify-center">
                    {order.status === 'completed' && (
                        <button
                            onClick={() => navigate('/menu')}
                            className="px-6 py-3 bg-brown-600 text-white rounded-md hover:bg-brown-700"
                        >
                            Order Again
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/orders')}
                        className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;