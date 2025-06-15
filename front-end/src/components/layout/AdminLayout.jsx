// front-end/src/components/layouts/AdminLayout.jsx
import {Outlet, NavLink, useLocation} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Coffee,
    Users,
    ShoppingCart,
    TrendingUp,
    Gift,
    Settings,
    Store
} from 'lucide-react';

const AdminLayout = () => {
    const {user} = useAuth();
    const location = useLocation();

    const navItems = [
        {path: '/admin/dashboard', name: 'Overview', icon: LayoutDashboard},
        {path: '/admin/menu', name: 'Menu Management', icon: Coffee},
        {path: '/admin/orders', name: 'Orders', icon: ShoppingCart},
        {path: '/admin/staff', name: 'Staff Management', icon: Users},
        {path: '/admin/analytics', name: 'Analytics', icon: TrendingUp},
        {path: '/admin/promotions', name: 'Promotions', icon: Gift},
        {path: '/admin/stores', name: 'Store Management', icon: Store},
        {path: '/admin/settings', name: 'Settings', icon: Settings}
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-white shadow-md h-screen sticky top-16">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({isActive}) =>
                                        `w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                            isActive
                                                ? 'bg-brown-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5"/>
                                    <span className="font-medium">{item.name}</span>
                                </NavLink>
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

                    {/* Render nested routes */}
                    <Outlet/>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;