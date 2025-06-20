// front-end/src/pages/customer/OrdersPage.jsx
import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import orderService from '../../services/orderService';
import toast from 'react-hot-toast';
import {
    Package,
    Clock,
    CheckCircle,
    XCircle,
    ChevronRight,
    Calendar,
    MapPin
} from 'lucide-react';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, [currentPage]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await orderService.getMyOrders({page: currentPage, limit: 10});
            setOrders(response.data);
            setTotalPages(response.pagination.pages);
        } catch (error) {
            toast.error('Failed to fetch orders');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        try {
            await orderService.cancelOrder(selectedOrder._id, cancelReason);
            toast.success('Order cancelled successfully');
            setShowCancelModal(false);
            setCancelReason('');
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
            case 'confirmed':
            case 'preparing':
                return <Clock className="w-5 h-5"/>;
            case 'ready':
                return <Package className="w-5 h-5"/>;
            case 'completed':
                return <CheckCircle className="w-5 h-5"/>;
            case 'cancelled':
                return <XCircle className="w-5 h-5"/>;
            default:
                return <Clock className="w-5 h-5"/>;
        }
    };

    const getEstimatedTime = (order) => {
        if (order.status === 'completed' || order.status === 'cancelled') {
            return null;
        }

        if (order.estimatedTime) {
            const time = new Date(order.estimatedTime);
            const now = new Date();
            if (time > now) {
                const minutes = Math.round((time - now) / 1000 / 60);
                return `${minutes} minutes`;
            }
        }
        return 'Calculating...';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                        <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
                        <Link
                            to="/menu"
                            className="inline-block px-6 py-3 bg-brown-600 text-white rounded-md hover:bg-brown-700"
                        >
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4"/>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4"/>
                                                    {new Date(order.createdAt).toLocaleTimeString()}
                                                </span>
                                                {order.orderType === 'delivery' && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4"/>
                                                        Delivery
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                                    orderService.getStatusColor(order.status)
                                                }`}>
                                                {getStatusIcon(order.status)}
                                                {orderService.formatOrderStatus(order.status)}
                                            </span>
                                            {getEstimatedTime(order) && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    Est. time: {getEstimatedTime(order)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items Preview */}
                                    <div className="border-t border-b py-4 mb-4">
                                        <div className="space-y-2">
                                            {order.items.slice(0, 2).map((item, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <img
                                                        src={item.menuItem.image}
                                                        alt={item.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">
                                                            {item.name} x{item.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-medium">${item.subtotal.toFixed(2)}</p>
                                                </div>
                                            ))}
                                            {order.items.length > 2 && (
                                                <p className="text-sm text-gray-600">
                                                    +{order.items.length - 2} more items
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Amount</p>
                                            <p className="text-xl font-semibold">${order.total.toFixed(2)}</p>
                                            {order.loyaltyPointsEarned > 0 && (
                                                <p className="text-xs text-green-600">
                                                    +{order.loyaltyPointsEarned} loyalty points earned
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {order.status === 'pending' || order.status === 'confirmed' ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowCancelModal(true);
                                                    }}
                                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                                                >
                                                    Cancel Order
                                                </button>
                                            ) : null}
                                            <Link
                                                to={`/orders/${order._id}`}
                                                className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 flex items-center gap-2"
                                            >
                                                View Details
                                                <ChevronRight className="w-4 h-4"/>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Cancel Order Modal */}
                {showCancelModal && selectedOrder && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Are you sure you want to cancel order {selectedOrder.orderNumber}?
                            </p>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Please provide a reason for cancellation"
                                className="w-full px-3 py-2 border rounded-md mb-4"
                                rows={3}
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancelReason('');
                                    }}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                                >
                                    Keep Order
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Cancel Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;