// front-end/src/components/common/Footer.jsx
import {Link} from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            {name: 'About Us', path: '/about'},
            {name: 'Careers', path: '/careers'},
            {name: 'Press', path: '/press'},
            {name: 'Blog', path: '/blog'}
        ],
        support: [
            {name: 'Contact Us', path: '/contact'},
            {name: 'FAQs', path: '/faqs'},
            {name: 'Store Locator', path: '/locations'},
            {name: 'Delivery Info', path: '/delivery'}
        ],
        legal: [
            {name: 'Privacy Policy', path: '/privacy'},
            {name: 'Terms of Service', path: '/terms'},
            {name: 'Cookie Policy', path: '/cookies'},
            {name: 'Refund Policy', path: '/refunds'}
        ]
    };

    const socialLinks = [
        {
            name: 'Facebook',
            icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
        },
        {
            name: 'Twitter',
            icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z'
        },
        {
            name: 'Instagram',
            icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z'
        },
        {
            name: 'LinkedIn',
            icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
        }
    ];

    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <svg className="w-10 h-10 text-brown-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a8 8 0 018 8c0 2.21-.895 4.21-2.343 5.657l-1.414-1.414A6 6 0 1010 4V2z"/>
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            </svg>
                            <span className="text-3xl font-bold">BrewHub</span>
                        </div>
                        <p className="text-gray-400 mb-4 max-w-md">
                            Your neighborhood coffee destination. Serving premium coffee, fresh pastries,
                            and creating memorable moments since 2024.
                        </p>

                        {/* Newsletter Signup */}
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold mb-2">Subscribe to our newsletter</h4>
                            <form className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brown-500"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Company</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map(link => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-400 hover:text-white transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            {footerLinks.support.map(link => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-400 hover:text-white transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map(link => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-400 hover:text-white transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <hr className="border-gray-800 mb-8"/>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center">
                    {/* Copyright */}
                    <div className="text-gray-400 mb-4 md:mb-0">
                        © {currentYear} BrewHub. All rights reserved.
                    </div>

                    {/* Social Links */}
                    <div className="flex space-x-4">
                        {socialLinks.map(social => (
                            <a
                                key={social.name}
                                href="#"
                                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                                aria-label={social.name}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d={social.icon}/>
                                </svg>
                            </a>
                        ))}
                    </div>
                </div>

                {/* App Download Section */}
                <div className="mt-8 text-center">
                    <p className="text-gray-400 mb-4">Download our mobile app</p>
                    <div className="flex justify-center space-x-4">
                        <a href="#" className="inline-block">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/200px-Download_on_the_App_Store_Badge.svg.png"
                                alt="Download on App Store" className="h-10"/>
                        </a>
                        <a href="#" className="inline-block">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/200px-Google_Play_Store_badge_EN.svg.png"
                                alt="Get it on Google Play" className="h-10"/>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;