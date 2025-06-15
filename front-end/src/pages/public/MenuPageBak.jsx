// front-end/src/pages/public/MenuPage.jsx
import {useState} from 'react';
import {useAuth} from '../../contexts/AuthContext';
import {Link} from 'react-router-dom';

const MenuPage = () => {
    const {user} = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = [
        {id: 'all', name: 'All Items', icon: '🍽️'},
        {id: 'coffee', name: 'Coffee', icon: '☕'},
        {id: 'tea', name: 'Tea', icon: '🍵'},
        {id: 'pastries', name: 'Pastries', icon: '🥐'},
        {id: 'sandwiches', name: 'Sandwiches', icon: '🥪'},
        {id: 'desserts', name: 'Desserts', icon: '🍰'}
    ];

    const menuItems = [
        // Coffee
        {
            id: 1,
            name: 'Espresso',
            category: 'coffee',
            price: 3.50,
            description: 'Rich and bold single shot',
            image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3',
            popular: true
        },
        {
            id: 2,
            name: 'Cappuccino',
            category: 'coffee',
            price: 4.50,
            description: 'Espresso with steamed milk foam',
            image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-4.0.3'
        },
        {
            id: 3,
            name: 'Latte',
            category: 'coffee',
            price: 5.00,
            description: 'Smooth espresso with steamed milk',
            image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?ixlib=rb-4.0.3',
            popular: true
        },
        {
            id: 4,
            name: 'Americano',
            category: 'coffee',
            price: 3.75,
            description: 'Espresso with hot water',
            image: 'https://images.unsplash.com/photo-1532004491497-ba35c367d634?ixlib=rb-4.0.3'
        },
        {
            id: 5,
            name: 'Mocha',
            category: 'coffee',
            price: 5.50,
            description: 'Chocolate espresso with steamed milk',
            image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?ixlib=rb-4.0.3'
        },

        // Tea
        {
            id: 6,
            name: 'Earl Grey',
            category: 'tea',
            price: 3.00,
            description: 'Classic black tea with bergamot',
            image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?ixlib=rb-4.0.3'
        },
        {
            id: 7,
            name: 'Green Tea',
            category: 'tea',
            price: 3.00,
            description: 'Fresh and light Japanese green tea',
            image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3'
        },
        {
            id: 8,
            name: 'Chai Latte',
            category: 'tea',
            price: 4.50,
            description: 'Spiced tea with steamed milk',
            image: 'https://images.unsplash.com/photo-1563639619-b4fa7c6c8c8a?ixlib=rb-4.0.3',
            popular: true
        },

        // Pastries
        {
            id: 9,
            name: 'Croissant',
            category: 'pastries',
            price: 3.50,
            description: 'Buttery French pastry',
            image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3'
        },
        {
            id: 10,
            name: 'Blueberry Muffin',
            category: 'pastries',
            price: 3.75,
            description: 'Fresh blueberries in soft muffin',
            image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?ixlib=rb-4.0.3'
        },
        {
            id: 11,
            name: 'Chocolate Chip Cookie',
            category: 'pastries',
            price: 2.50,
            description: 'Warm cookie with chocolate chips',
            image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3'
        },

        // Sandwiches
        {
            id: 12,
            name: 'Avocado Toast',
            category: 'sandwiches',
            price: 8.50,
            description: 'Fresh avocado on artisan bread',
            image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?ixlib=rb-4.0.3',
            popular: true
        },
        {
            id: 13,
            name: 'Club Sandwich',
            category: 'sandwiches',
            price: 9.50,
            description: 'Triple-decker with turkey and bacon',
            image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?ixlib=rb-4.0.3'
        },
        {
            id: 14,
            name: 'Grilled Cheese',
            category: 'sandwiches',
            price: 7.00,
            description: 'Classic melted cheese sandwich',
            image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?ixlib=rb-4.0.3'
        },

        // Desserts
        {
            id: 15,
            name: 'Chocolate Cake',
            category: 'desserts',
            price: 6.50,
            description: 'Rich chocolate layer cake',
            image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3'
        },
        {
            id: 16,
            name: 'Cheesecake',
            category: 'desserts',
            price: 7.00,
            description: 'New York style cheesecake',
            image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?ixlib=rb-4.0.3'
        },
        {
            id: 17,
            name: 'Tiramisu',
            category: 'desserts',
            price: 7.50,
            description: 'Italian coffee-flavored dessert',
            image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3'
        }
    ];

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAddToCart = (item) => {
        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = '/login';
            return;
        }
        // Add to cart logic here
        console.log('Adding to cart:', item);
    };

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
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {filteredItems.map(item => (
                        <div key={item.id}
                             className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            {item.popular && (
                                <div
                                    className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                                    Popular
                                </div>
                            )}
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-semibold">{item.name}</h3>
                                    <span className="text-xl font-bold text-brown-600">${item.price.toFixed(2)}</span>
                                </div>
                                <p className="text-gray-600 mb-4">{item.description}</p>
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className="w-full px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors"
                                >
                                    {user ? 'Add to Cart' : 'Login to Order'}
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