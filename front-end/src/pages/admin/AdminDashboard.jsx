// front-end/src/pages/admin/AdminDashboard.jsx
import {useState} from 'react';
import {useAuth} from '../../contexts/AuthContext';
import StaffManagement from './StaffManagement';
import {
    LayoutDashboard,
    Coffee,
    Users,
    ShoppingCart,
    TrendingUp,
    Gift,
    Settings,
    Store,
    Calendar,
    DollarSign,
    Package,
    Star
} from 'lucide-react';

const AdminDashboard = () => {
    const {user} = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        {id: 'overview', name: 'Overview', icon: LayoutDashboard},
        {id: 'menu', name: 'Menu Management', icon: Coffee},
        {id: 'orders', name: 'Orders', icon: ShoppingCart},
        {id: 'staff', name: 'Staff Management', icon: Users},
        {id: 'analytics', name: 'Analytics', icon: TrendingUp},
        {id: 'promotions', name: 'Promotions', icon: Gift},
        {id: 'stores', name: 'Store Management', icon: Store},
        {id: 'settings', name: 'Settings', icon: Settings}
    ];

    // Mock data for overview
    const overviewStats = [
        {
            title: 'Total Revenue',
            value: '$45,231',
            change: '+12.5%',
            icon: DollarSign,
            color: 'bg-green-500'
        },
        {
            title: 'Total Orders',
            value: '1,234',
            change: '+8.2%',
            icon: ShoppingCart,
            color: 'bg-blue-500'
        },
        {
            title: 'Active Customers',
            value: '3,456',
            change: '+15.3%',
            icon: Users,
            color: 'bg-purple-500'
        },
        {
            title: 'Avg Order Value',
            value: '$36.70',
            change: '+4.1%',
            icon: TrendingUp,
            color: 'bg-orange-500'
        }
    ];

    const recentOrders = [
        {id: '#12345', customer: 'John Doe', amount: '$24.50', status: 'completed', time: '5 min ago'},
        {id: '#12346', customer: 'Jane Smith', amount: '$18.75', status: 'preparing', time: '12 min ago'},
        {id: '#12347', customer: 'Mike Johnson', amount: '$32.00', status: 'pending', time: '15 min ago'},
        {id: '#12348', customer: 'Sarah Williams', amount: '$45.25', status: 'completed', time: '22 min ago'},
        {id: '#12349', customer: 'Tom Brown', amount: '$15.50', status: 'preparing', time: '28 min ago'}
    ];

    const topProducts = [
        {name: 'Cappuccino', orders: 234, revenue: '$1,053', trend: '+12%'},
        {name: 'Latte', orders: 198, revenue: '$990', trend: '+8%'},
        {name: 'Avocado Toast', orders: 156, revenue: '$1,326', trend: '+15%'},
        {name: 'Croissant', orders: 145, revenue: '$507.50', trend: '+5%'},
        {name: 'Americano', orders: 132, revenue: '$495', trend: '+10%'}
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'preparing':
                return 'bg-yellow-100 text-yellow-800';
            case 'pending':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {overviewStats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-lg ${stat.color}`}>
                                            <stat.icon className="w-6 h-6 text-white"/>
                                        </div>
                                        <span className="text-sm font-medium text-green-600">{stat.change}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Orders and Top Products */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Orders */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold">Recent Orders</h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {recentOrders.map((order) => (
                                            <div key={order.id} className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{order.id}</p>
                                                    <p className="text-sm text-gray-600">{order.customer}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-900">{order.amount}</p>
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        className="mt-4 w-full text-center text-sm text-brown-600 hover:text-brown-700 font-medium">
                                        View All Orders →
                                    </button>
                                </div>
                            </div>

                            {/* Top Products */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold">Top Products</h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {topProducts.map((product, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{product.name}</p>
                                                    <p className="text-sm text-gray-600">{product.orders} orders</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-900">{product.revenue}</p>
                                                    <p className="text-sm text-green-600">{product.trend}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button
                                    className="p-4 border border-gray-200 rounded-lg hover:border-brown-600 hover:bg-brown-50 transition-colors">
                                    <Coffee className="w-8 h-8 text-brown-600 mx-auto mb-2"/>
                                    <span className="text-sm font-medium">Add Menu Item</span>
                                </button>
                                <button
                                    className="p-4 border border-gray-200 rounded-lg hover:border-brown-600 hover:bg-brown-50 transition-colors">
                                    <Users className="w-8 h-8 text-brown-600 mx-auto mb-2"/>
                                    <span className="text-sm font-medium">Add Staff</span>
                                </button>
                                <button
                                    className="p-4 border border-gray-200 rounded-lg hover:border-brown-600 hover:bg-brown-50 transition-colors">
                                    <Gift className="w-8 h-8 text-brown-600 mx-auto mb-2"/>
                                    <span className="text-sm font-medium">Create Promo</span>
                                </button>
                                <button
                                    className="p-4 border border-gray-200 rounded-lg hover:border-brown-600 hover:bg-brown-50 transition-colors">
                                    <TrendingUp className="w-8 h-8 text-brown-600 mx-auto mb-2"/>
                                    <span className="text-sm font-medium">View Reports</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'menu':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold">Menu Management</h3>
                            <button
                                className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors">
                                Add New Item
                            </button>
                        </div>
                        <p className="text-gray-600">Menu management functionality will be implemented here...</p>
                    </div>
                );

            case 'orders':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-6">Order Management</h3>
                        <p className="text-gray-600">Order management functionality will be implemented here...</p>
                    </div>
                );

            case 'staff':
                return (

                    <StaffManagement/>

                );

            case 'analytics':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-6">Analytics & Reports</h3>
                        <p className="text-gray-600">Analytics functionality will be implemented here...</p>
                    </div>
                );

            case 'promotions':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold">Promotions</h3>
                            <button
                                className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors">
                                Create Promotion
                            </button>
                        </div>
                        <p className="text-gray-600">Promotions functionality will be implemented here...</p>
                    </div>
                );

            case 'stores':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-6">Store Management</h3>
                        <p className="text-gray-600">Store management functionality will be implemented here...</p>
                    </div>
                );

            case 'settings':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-6">Settings</h3>
                        <p className="text-gray-600">Settings functionality will be implemented here...</p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-white shadow-md h-screen sticky top-16">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-brown-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <tab.icon className="w-5 h-5"/>
                                    <span className="font-medium">{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-t border-gray-200">
                        <div className="flex items-center space-x-3">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : (
                                <div
                                    className="w-10 h-10 rounded-full bg-brown-600 flex items-center justify-center text-white font-semibold">
                                    {user?.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-gray-900">{user?.name}</p>
                                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {user?.name.split(' ')[0]}!
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;