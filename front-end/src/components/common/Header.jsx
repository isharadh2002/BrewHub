// front-end/src/components/common/Header.jsx
import {useState, useRef, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';
import {useCart} from '../../contexts/CartContext';
import {User, ShoppingCart, Gift, Package, LogOut, Settings, ChevronDown} from 'lucide-react';

const Header = () => {
    const {user, logout} = useAuth();
    const {cartCount} = useCart();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileDropdownOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const publicLinks = [
        {name: 'Home', path: '/'},
        {name: 'Menu', path: '/menu'},
        {name: 'About', path: '/about'},
        {name: 'Locations', path: '/locations'},
        {name: 'Contact', path: '/contact'}
    ];

    const profileMenuItems = [
        {name: 'Profile', path: '/profile', icon: User},
        {name: 'Orders', path: '/orders', icon: Package},
        {name: 'Rewards', path: '/loyalty', icon: Gift}
    ];

    const roleBasedLinks = {
        staff: [
            {name: 'Staff Dashboard', path: '/staff/dashboard'}
        ],
        manager: [
            {name: 'Staff Dashboard', path: '/staff/dashboard'}
        ],
        admin: [
            {name: 'Admin Dashboard', path: '/admin/dashboard'}
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

                        {/* Role-based Quick Links */}
                        {user && roleBasedLinks[user.role] && (
                            <>
                                <div className="h-6 w-px bg-gray-300"></div>
                                {roleBasedLinks[user.role].map(link => (
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

                        {/* Auth Section */}
                        <div className="flex items-center space-x-4">
                            {/* Cart Button */}
                            <Link
                                to="/cart"
                                className="relative text-gray-700 hover:text-brown-600 transition-colors p-2"
                            >
                                <ShoppingCart className="w-6 h-6"/>
                                {cartCount > 0 && (
                                    <span
                                        className="absolute -top-1 -right-1 bg-brown-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-brown-600 transition-colors"
                                    >
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full border-2 border-gray-200"
                                            />
                                        ) : (
                                            <div
                                                className="w-8 h-8 rounded-full bg-brown-600 flex items-center justify-center text-white font-semibold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="hidden lg:block">{user.name.split(' ')[0]}</span>
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}/>
                                    </button>

                                    {/* Profile Dropdown Menu */}
                                    {isProfileDropdownOpen && (
                                        <div
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                                            {/* User Info */}
                                            <div className="px-4 py-3 border-b border-gray-200">
                                                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                                <p className="text-xs text-brown-600 mt-1">{user.loyaltyPoints} points</p>
                                            </div>

                                            {/* Menu Items */}
                                            {profileMenuItems.map((item) => (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                    onClick={() => setIsProfileDropdownOpen(false)}
                                                >
                                                    <item.icon className="w-4 h-4 mr-3 text-gray-400"/>
                                                    {item.name}
                                                </Link>
                                            ))}

                                            {/* Logout */}
                                            <div className="border-t border-gray-200 mt-1 pt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4 mr-3 text-gray-400"/>
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
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
                    <div className="md:hidden flex items-center space-x-4">
                        {/* Mobile Cart Button */}
                        <Link
                            to="/cart"
                            className="relative text-gray-700 hover:text-brown-600 transition-colors p-2"
                        >
                            <ShoppingCart className="w-6 h-6"/>
                            {cartCount > 0 && (
                                <span
                                    className="absolute -top-1 -right-1 bg-brown-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-gray-700 hover:text-brown-600 hover:bg-gray-100"
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
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        {/* User Info for Mobile */}
                        {user && (
                            <div className="px-4 py-3 mb-2 bg-gray-50 rounded-md">
                                <div className="flex items-center space-x-3">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div
                                            className="w-10 h-10 rounded-full bg-brown-600 flex items-center justify-center text-white font-semibold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-gray-600">{user.loyaltyPoints} points</p>
                                    </div>
                                </div>
                            </div>
                        )}

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

                        {user && (
                            <>
                                <hr className="my-2"/>
                                {profileMenuItems.map(item => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className="block py-2 text-gray-700 hover:text-brown-600"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}

                                {roleBasedLinks[user.role] && (
                                    <>
                                        <hr className="my-2"/>
                                        {roleBasedLinks[user.role].map(link => (
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
                            </>
                        )}

                        <hr className="my-2"/>
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="w-full text-left py-2 text-gray-700 hover:text-brown-600"
                            >
                                Logout
                            </button>
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