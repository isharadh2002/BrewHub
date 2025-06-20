// front-end/src/pages/admin/OrderManagement.jsx
import {useState, useEffect} from 'react';
import orderService from '../../services/orderService';
import toast from 'react-hot-toast';
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Package,
    DollarSign,
    TrendingUp,
    Search,
    Filter,
    ChevronRight
} from 'lucide-react';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        orderType: '',
        search: '',
        page: 1
    });

    useEffect(() => {
        fetchOrders();
        fetchStats();
    }, [filters]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await orderService.getAllOrders(filters);
            setOrders(response.data);
        } catch (error) {
            toast.error('Failed to fetch orders');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await orderService.getOrderStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            toast.success('Order status updated');
            fetchOrders();
            fetchStats();
            if (selectedOrder?._id === orderId) {
                setSelectedOrder(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Clock className="w-5 h-5"/>,
            confirmed: <AlertCircle className="w-5 h-5"/>,
            preparing: <Package className="w-5 h-5"/>,
            ready: <CheckCircle className="w-5 h-5"/>,
            completed: <CheckCircle className="w-5 h-5"/>,
            cancelled: <XCircle className="w-5 h-5"/>
        };
        return icons[status] || <AlertCircle className="w-5 h-5"/>;
    };

    const getNextStatus = (currentStatus) => {
        const transitions = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['preparing', 'cancelled'],
            preparing: ['ready', 'cancelled'],
            ready: ['completed'],
            completed: [],
            cancelled: []
        };
        return transitions[currentStatus] || [];
    };

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Today's Orders</p>
                                <p className="text-2xl font-bold">{stats.today.totalOrders || 0}</p>
                            </div>
                            <Package className="w-8 h-8 text-brown-600"/>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Today's Revenue</p>
                                <p className="text-2xl font-bold">${(stats.today.totalRevenue || 0).toFixed(2)}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-600"/>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg Order Value</p>
                                <p className="text-2xl font-bold">${(stats.today.avgOrderValue || 0).toFixed(2)}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-600"/>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Orders</p>
                                <p className="text-2xl font-bold">
                                    {stats.statusBreakdown?.filter(s =>
                                        ['pending', 'confirmed', 'preparing', 'ready'].includes(s._id)
                                    ).reduce((sum, s) => sum + s.count, 0) || 0}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-orange-600"/>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders Section */}
            <div className="bg-white rounded-lg shadow">
                {/* Filters */}
                <div className="p-6 border-b">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                            <input
                                type="text"
                                placeholder="Search by order number or customer..."
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                            />
                        </div>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                            value={filters.orderType}
                            onChange={(e) => setFilters({...filters, orderType: e.target.value})}
                            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-brown-500"
                        >
                            <option value="">All Types</option>
                            <option value="dine-in">Dine In</option>
                            <option value="takeaway">Takeaway</option>
                            <option value="delivery">Delivery</option>
                        </select>
                    </div>
                </div>

                {/* Orders Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-gray-200">
                    {/* Orders List */}
                    <div className="bg-white">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600"></div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No orders found</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {orders.map(order => (
                                    <div
                                        key={order._id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                            selectedOrder?._id === order._id ? 'bg-gray-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold">{order.orderNumber}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {order.customer.name} • {new Date(order.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                    orderService.getStatusColor(order.status)
                                                }`}>
                                                {getStatusIcon(order.status)}
                                                {orderService.formatOrderStatus(order.status)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex gap-4">
                                                <span className="text-gray-600">
                                                    {order.items.length} items • ${order.total.toFixed(2)}
                                                </span>
                                                <span className="capitalize text-gray-600">
                                                    {order.orderType}
                                                </span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Order Details */}
                    <div className="bg-white border-l">
                        {selectedOrder ? (
                            <div className="p-6">
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold mb-2">{selectedOrder.orderNumber}</h3>
                                    <p className="text-sm text-gray-600">
                                        Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                {/* Customer Info */}
                                <div className="mb-6">
                                    <h4 className="font-medium mb-2">Customer</h4>
                                    <p className="text-sm">{selectedOrder.customer.name}</p>
                                    <p className="text-sm text-gray-600">{selectedOrder.customer.email}</p>
                                    {selectedOrder.customer.phone && (
                                        <p className="text-sm text-gray-600">{selectedOrder.customer.phone}</p>
                                    )}
                                </div>

                                {/* Order Type & Delivery */}
                                <div className="mb-6">
                                    <h4 className="font-medium mb-2">Order Type</h4>
                                    <p className="text-sm capitalize">{selectedOrder.orderType}</p>
                                    {selectedOrder.orderType === 'delivery' && selectedOrder.deliveryAddress && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            <p>{selectedOrder.deliveryAddress.street}</p>
                                            <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.zipCode}</p>
                                            <p>Phone: {selectedOrder.deliveryAddress.phone}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Items */}
                                <div className="mb-6">
                                    <h4 className="font-medium mb-2">Items</h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item, index) => (
                                            <div key={index} className="flex items-start gap-3 text-sm">
                                                <img
                                                    src={item.menuItem.image}
                                                    alt={item.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.name} x{item.quantity}</p>
                                                    {item.customizations.length > 0 && (
                                                        <div className="text-gray-600 text-xs mt-1">
                                                            {item.customizations.map((custom, idx) => (
                                                                <p key={idx}>{custom.name}: {custom.option.name}</p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Summary */}
                                <div className="mb-6 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>${selectedOrder.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax</span>
                                        <span>${selectedOrder.tax.toFixed(2)}</span>
                                    </div>
                                    {selectedOrder.deliveryFee > 0 && (
                                        <div className="flex justify-between">
                                            <span>Delivery Fee</span>
                                            <span>${selectedOrder.deliveryFee.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {selectedOrder.loyaltyPointsRedeemed > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Loyalty Discount</span>
                                            <span>-${selectedOrder.loyaltyPointsRedeemed.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-semibold text-base pt-2 border-t">
                                        <span>Total</span>
                                        <span>${selectedOrder.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="mb-6">
                                    <h4 className="font-medium mb-2">Payment</h4>
                                    <p className="text-sm capitalize">{selectedOrder.paymentMethod}</p>
                                    <p className="text-sm">
                                        Status: <span className={`font-medium ${
                                        selectedOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                                    }`}>{selectedOrder.paymentStatus}</span>
                                    </p>
                                </div>

                                {/* Notes */}
                                {selectedOrder.notes && (
                                    <div className="mb-6">
                                        <h4 className="font-medium mb-2">Notes</h4>
                                        <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                                    </div>
                                )}

                                {/* Status Actions */}
                                <div className="mt-6 pt-6 border-t">
                                    <h4 className="font-medium mb-3">Update Status</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {getNextStatus(selectedOrder.status).map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusUpdate(selectedOrder._id, status)}
                                                className={`px-4 py-2 rounded-md text-sm font-medium ${
                                                    status === 'cancelled'
                                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                                        : 'bg-brown-600 text-white hover:bg-brown-700'
                                                }`}
                                            >
                                                Mark as {orderService.formatOrderStatus(status)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>Select an order to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderManagement;