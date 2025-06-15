// front-end/src/pages/admin/MenuManagement.jsx
import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import menuService from '../../services/menuService';
import toast from 'react-hot-toast';
import {
    Plus,
    Edit2,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Search,
    Filter
} from 'lucide-react';
import MenuForm from "./MenuForm.jsx";

const MenuManagement = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        categories: []
    });

    const categories = [
        {value: 'all', label: 'All Categories'},
        {value: 'coffee', label: 'Coffee'},
        {value: 'tea', label: 'Tea'},
        {value: 'pastries', label: 'Pastries'},
        {value: 'sandwiches', label: 'Sandwiches'},
        {value: 'desserts', label: 'Desserts'},
        {value: 'beverages', label: 'Beverages'}
    ];

    useEffect(() => {
        fetchMenuItems();
        fetchStats();
    }, [selectedCategory, searchTerm]);

    const fetchMenuItems = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedCategory !== 'all') {
                params.category = selectedCategory;
            }
            if (searchTerm) {
                params.search = searchTerm;
            }

            const response = await menuService.getAllItems(params);
            setMenuItems(response.data);
        } catch (error) {
            toast.error('Failed to load menu items');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await menuService.getCategories();
            const total = response.data.reduce((sum, cat) => sum + cat.count, 0);
            const available = response.data.reduce((sum, cat) => sum + cat.availableCount, 0);

            setStats({
                total,
                available,
                categories: response.data
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const handleToggleAvailability = async (itemId, currentStatus) => {
        try {
            await menuService.toggleAvailability(itemId);
            toast.success(`Item ${currentStatus ? 'disabled' : 'enabled'} successfully`);
            fetchMenuItems();
            fetchStats();
        } catch (error) {
            toast.error('Failed to update item availability');
            console.error(error);
        }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            await menuService.deleteItem(itemId);
            toast.success('Item deleted successfully');
            setDeleteConfirm(null);
            fetchMenuItems();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete item');
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">Total Items</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">Available Items</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.available}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600">Unavailable Items</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.total - stats.available}</p>
                </div>
            </div>

            {/* Management Section */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-xl font-semibold">Menu Items</h2>
                        <Link
                            to="/admin/menu/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors"
                        >
                            <Plus className="w-4 h-4"/>
                            Add New Item
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="mt-4 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search menu items..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brown-500"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brown-500"
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600"></div>
                        </div>
                    ) : menuItems.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No menu items found</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {menuItems.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                className="h-10 w-10 rounded-full object-cover"
                                                src={item.image}
                                                alt={item.name}
                                            />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {item.description.substring(0, 50)}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900 capitalize">
                                                {item.category}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                ${item.price.toFixed(2)}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                        item.isAvailable
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                                </span>
                                            {item.isPopular && (
                                                <span
                                                    className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                                        Popular
                                                    </span>
                                            )}
                                            {item.isSeasonal && (
                                                <span
                                                    className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                                                        Seasonal
                                                    </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                                                className="text-gray-600 hover:text-gray-900"
                                                title={item.isAvailable ? 'Disable' : 'Enable'}
                                            >
                                                {item.isAvailable ? (
                                                    <ToggleRight className="w-5 h-5 text-green-600"/>
                                                ) : (
                                                    <ToggleLeft className="w-5 h-5 text-gray-400"/>
                                                )}
                                            </button>
                                            <Link
                                                to={`/admin/menu/edit/${item._id}`}
                                                className="text-brown-600 hover:text-brown-900"
                                            >
                                                <Edit2 className="w-4 h-4"/>
                                            </Link>
                                            <button
                                                onClick={() => setDeleteConfirm(item._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Menu Item</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Are you sure you want to delete this menu item? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteItem(deleteConfirm)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuManagement;