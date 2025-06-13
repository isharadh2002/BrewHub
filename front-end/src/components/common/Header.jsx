// front-end/src/components/common/Header.jsx
import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';

const Header = () => {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const publicLinks = [
        {name: 'Home', path: '/'},
        {name: 'Menu', path: '/menu'},
        {name: 'About', path: '/about'},
        {name: 'Locations', path: '/locations'},
        {name: 'Contact', path: '/contact'}
    ];

    const userLinks = {
        customer: [
            {name: 'Profile', path: '/profile'},
            {name: 'Orders', path: '/orders'},
            {name: 'Cart', path: '/cart'},
            {name: 'Rewards', path: '/loyalty'}
        ],
        staff: [
            {name: 'Dashboard', path: '/staff/dashboard'},
            {name: 'Orders', path: '/staff/orders'},
            {name: 'Inventory', path: '/staff/inventory'},
            {name: 'Queue', path: '/staff/queue'}
        ],
        admin: [
            {name: 'Dashboard', path: '/admin/dashboard'},
            {name: 'Menu', path: '/admin/menu'},
            {name: 'Staff', path: '/admin/staff'},
            {name: 'Analytics', path: '/admin/analytics'},
            {name: 'Promotions', path: '/admin/promotions'}
        ]
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <svg className="w-8 h-8 text-brown-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a8 8 0 018 8c0 2.21-.895 4.21-2.343 5.657l-1.414-1.414A6 6 0 1010 4V2z"/>
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        </svg>
                        <span className="text-2xl font-bold text-brown-600">BrewHub</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* Public Links */}
                        {publicLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="text-gray-700 hover:text-brown-600 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* User-specific Links */}
                        {user && userLinks[user.role] && (
                            <>
                                <div className="h-6 w-px bg-gray-300"></div>
                                {userLinks[user.role].map(link => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className="text-gray-700 hover:text-brown-600 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </>
                        )}

                        {/* Auth Buttons */}
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">
                                        Hi, {user.name.split(' ')[0]}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-sm font-medium text-white bg-brown-600 rounded-md hover:bg-brown-700 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-gray-700 hover:text-brown-600 transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 text-sm font-medium text-white bg-brown-600 rounded-md hover:bg-brown-700 transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-md text-gray-700 hover:text-brown-600 hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M4 6h16M4 12h16M4 18h16"/>
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        {publicLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="block py-2 text-gray-700 hover:text-brown-600"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {user && userLinks[user.role] && (
                            <>
                                <hr className="my-2"/>
                                {userLinks[user.role].map(link => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className="block py-2 text-gray-700 hover:text-brown-600"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </>
                        )}

                        <hr className="my-2"/>
                        {user ? (
                            <>
                                <div className="py-2 text-sm text-gray-600">
                                    Logged in as {user.name}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left py-2 text-gray-700 hover:text-brown-600"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block py-2 text-gray-700 hover:text-brown-600"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="block py-2 text-gray-700 hover:text-brown-600"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;