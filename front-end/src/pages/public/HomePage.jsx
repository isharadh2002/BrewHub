// front-end/src/pages/public/HomePage.jsx
import {Link} from 'react-router-dom';
import {useState, useEffect} from 'react';

const HomePage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const heroSlides = [
        {
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3',
            title: 'Start Your Day Right',
            subtitle: 'Freshly brewed coffee made with love'
        },
        {
            image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3',
            title: 'Artisan Coffee',
            subtitle: 'Handcrafted beverages for coffee lovers'
        },
        {
            image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?ixlib=rb-4.0.3',
            title: 'Cozy Atmosphere',
            subtitle: 'Your perfect workspace and meeting spot'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const features = [
        {
            icon: '☕',
            title: 'Premium Coffee',
            description: 'Sourced from the finest coffee farms around the world'
        },
        {
            icon: '🥐',
            title: 'Fresh Pastries',
            description: 'Baked fresh daily by our expert bakers'
        },
        {
            icon: '📱',
            title: 'Easy Ordering',
            description: 'Order ahead and skip the line with our mobile app'
        },
        {
            icon: '🎁',
            title: 'Loyalty Rewards',
            description: 'Earn points with every purchase and get free drinks'
        }
    ];

    const popularItems = [
        {
            name: 'Cappuccino',
            price: '$4.50',
            image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-4.0.3',
            description: 'Rich espresso with steamed milk foam'
        },
        {
            name: 'Croissant',
            price: '$3.50',
            image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3',
            description: 'Buttery, flaky French pastry'
        },
        {
            name: 'Latte',
            price: '$5.00',
            image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?ixlib=rb-4.0.3',
            description: 'Smooth espresso with creamy steamed milk'
        },
        {
            name: 'Avocado Toast',
            price: '$8.50',
            image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?ixlib=rb-4.0.3',
            description: 'Fresh avocado on artisan bread'
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section with Slider */}
            <section className="relative h-[600px] overflow-hidden">
                {heroSlides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{backgroundImage: `url(${slide.image})`}}
                        >
                            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                        </div>
                        <div className="relative h-full flex items-center justify-center text-center text-white px-4">
                            <div>
                                <h1 className="text-5xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                                <p className="text-xl md:text-2xl mb-8">{slide.subtitle}</p>
                                <div className="space-x-4">
                                    <Link
                                        to="/menu"
                                        className="inline-block px-8 py-3 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors"
                                    >
                                        Order Now
                                    </Link>
                                    <Link
                                        to="/locations"
                                        className="inline-block px-8 py-3 border-2 border-white text-white rounded-md hover:bg-white hover:text-gray-900 transition-colors"
                                    >
                                        Find a Store
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Slider Indicators */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                            }`}
                        />
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose BrewHub?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center">
                                <div className="text-5xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Items Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Customer Favorites</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {popularItems.map((item, index) => (
                            <div key={index}
                                 className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-brown-600">{item.price}</span>
                                        <Link
                                            to="/menu"
                                            className="text-sm text-brown-600 hover:text-brown-700 font-medium"
                                        >
                                            View Details →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link
                            to="/menu"
                            className="inline-block px-8 py-3 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors"
                        >
                            View Full Menu
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-brown-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Loyalty Program</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Earn points with every purchase and enjoy exclusive rewards,
                        free drinks, and special member-only offers.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block px-8 py-3 bg-white text-brown-600 rounded-md hover:bg-gray-100 transition-colors font-semibold"
                    >
                        Sign Up Now
                    </Link>
                </div>
            </section>

            {/* Store Hours Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8">Visit Us Today</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold mb-4">Store Hours</h3>
                                <div className="space-y-2 text-gray-600">
                                    <p>Monday - Friday: 6:00 AM - 9:00 PM</p>
                                    <p>Saturday: 7:00 AM - 10:00 PM</p>
                                    <p>Sunday: 7:00 AM - 8:00 PM</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold mb-4">Contact Info</h3>
                                <div className="space-y-2 text-gray-600">
                                    <p>📍 Multiple Locations</p>
                                    <p>📞 (555) 123-4567</p>
                                    <p>✉️ hello@brewhub.com</p>
                                </div>
                            </div>
                        </div>
                        <Link
                            to="/locations"
                            className="inline-block px-8 py-3 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors"
                        >
                            Find Your Nearest Store
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;