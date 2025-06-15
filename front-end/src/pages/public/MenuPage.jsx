// front-end/src/pages/public/MenuPage.jsx
import {useState, useEffect} from 'react';
import {useAuth} from '../../contexts/AuthContext';
import {Link, useNavigate} from 'react-router-dom';
import menuService from '../../services/menuService';
import toast from 'react-hot-toast';
import {ShoppingCart, Edit2, Trash2, ToggleLeft, ToggleRight} from 'lucide-react';

const MenuPage = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const defaultCategories = [
        {id: 'all', name: 'All Items', icon: '🍽️'},
        {id: 'coffee', name: 'Coffee', icon: '☕'},
        {id: 'tea', name: 'Tea', icon: '🍵'},
        {id: 'pastries', name: 'Pastries', icon: '🥐'},
        {id: 'sandwiches', name: 'Sandwiches', icon: '🥪'},
        {id: 'desserts', name: 'Desserts', icon: '🍰'},
        {id: 'beverages', name: 'Beverages', icon: '🥤'}
    ];

    useEffect(() => {
        fetchMenuItems();
        fetchCategories();
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

    const fetchCategories = async () => {
        try {
            const response = await menuService.getCategories();
            const categoriesWithIcons = response.data.map(cat => {
                const defaultCat = defaultCategories.find(dc => dc.id === cat.category);
                return {
                    ...cat,
                    id: cat.category,
                    name: defaultCat?.name || cat.category,
                    icon: defaultCat?.icon || '🍽️'
                };
            });
            setCategories(categoriesWithIcons);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleAddToCart = (item) => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Add to cart logic here
        console.log('Adding to cart:', item);
        toast.success(`${item.name} added to cart!`);
    };

    const handleToggleAvailability = async (itemId, currentStatus) => {
        try {
            await menuService.toggleAvailability(itemId);
            toast.success(`Item ${currentStatus ? 'disabled' : 'enabled'} successfully`);
            fetchMenuItems();
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
            fetchCategories();
        } catch (error) {
            toast.error('Failed to delete item');
            console.error(error);
        }
    };

    const isStaffOrAdmin = user && ['staff', 'manager', 'admin'].includes(user.role);
    const isAdmin = user && user.role === 'admin';

    const filteredItems = menuItems.filter(item => {
        if (!isStaffOrAdmin && !item.isAvailable) {
            return false;
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">Our Menu</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Discover our carefully crafted selection of coffee, tea, pastries, and more.
                        Made fresh daily with the finest ingredients.
                    </p>
                </div>

                {/* Admin Add Button */}
                {isAdmin && (
                    <div className="flex justify-end mb-6">
                        <Link
                            to="/admin/menu/new"
                            className="px-6 py-3 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors"
                        >
                            Add New Item
                        </Link>
                    </div>
                )}

                {/* Search Bar */}
                <div className="max-w-md mx-auto mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brown-500"
                        />
                        <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                             viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-6 py-3 rounded-full font-medium transition-colors ${
                            selectedCategory === 'all'
                                ? 'bg-brown-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <span className="mr-2">🍽️</span>
                        All Items
                    </button>
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-6 py-3 rounded-full font-medium transition-colors ${
                                selectedCategory === category.id
                                    ? 'bg-brown-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <span className="mr-2">{category.icon}</span>
                            {category.name} ({category.availableCount}/{category.count})
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Menu Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {filteredItems.map(item => (
                                <div key={item._id}
                                     className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative flex flex-col h-full ${
                                         !item.isAvailable && isStaffOrAdmin ? 'opacity-60' : ''
                                     }`}>
                                    {/* Admin Controls */}
                                    {isStaffOrAdmin && (
                                        <div className="absolute top-2 right-2 z-10 flex gap-2">
                                            <button
                                                onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                                                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                                                title={item.isAvailable ? 'Disable item' : 'Enable item'}
                                            >
                                                {item.isAvailable ? (
                                                    <ToggleRight className="w-4 h-4 text-green-600"/>
                                                ) : (
                                                    <ToggleLeft className="w-4 h-4 text-gray-400"/>
                                                )}
                                            </button>
                                            {isAdmin && (
                                                <>
                                                    <Link
                                                        to={`/admin/menu/edit/${item._id}`}
                                                        className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-brown-600"/>
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteConfirm(item._id)}
                                                        className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600"/>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                                        {item.isPopular && (
                                            <span
                                                className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                                Popular
                                            </span>
                                        )}
                                        {item.isSeasonal && (
                                            <span
                                                className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                                Seasonal
                                            </span>
                                        )}
                                        {!item.isAvailable && (
                                            <span
                                                className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                                Unavailable
                                            </span>
                                        )}
                                    </div>

                                    <Link to={`/menu/${item._id}`} className="block">
                                        <div className="h-48 overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    </Link>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <Link to={`/menu/${item._id}`}>
                                                <h3 className="text-xl font-semibold hover:text-brown-600 transition-colors">{item.name}</h3>
                                            </Link>
                                            <span
                                                className="text-xl font-bold text-brown-600">${item.price.toFixed(2)}</span>
                                        </div>
                                        <p className="text-gray-600 mb-4">{item.description}</p>

                                        {/* Allergen Icons */}
                                        {item.allergens && item.allergens.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {item.allergens.map((allergen, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                                                        title={allergen}
                                                    >
                                                        {allergen}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Spacer to push button to bottom */}
                                        <div className="flex-grow"></div>

                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            disabled={!item.isAvailable}
                                            className={`w-full px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                                                item.isAvailable
                                                    ? 'bg-brown-600 text-white hover:bg-brown-700'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            <ShoppingCart className="w-4 h-4"/>
                                            {item.isAvailable ? (user ? 'Add to Cart' : 'Login to Order') : 'Unavailable'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* No Results */}
                        {filteredItems.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No items found matching your search.</p>
                            </div>
                        )}
                    </>
                )}

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

                {/* CTA Section */}
                {!user && (
                    <div className="bg-brown-100 rounded-lg p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Ready to Order?</h2>
                        <p className="text-gray-700 mb-6">
                            Sign up or log in to start ordering and earn loyalty points with every purchase!
                        </p>
                        <div className="space-x-4">
                            <Link
                                to="/login"
                                className="inline-block px-6 py-3 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="inline-block px-6 py-3 border-2 border-brown-600 text-brown-600 rounded-md hover:bg-brown-600 hover:text-white transition-colors"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuPage;