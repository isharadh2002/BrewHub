// front-end/src/pages/public/AboutPage.jsx
import {Link} from 'react-router-dom';

const AboutPage = () => {
    const teamMembers = [
        {
            name: 'Sarah Johnson',
            role: 'Founder & CEO',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3',
            bio: 'Coffee enthusiast with 15 years of experience in the industry'
        },
        {
            name: 'Michael Chen',
            role: 'Head Barista',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3',
            bio: 'Award-winning barista passionate about the perfect brew'
        },
        {
            name: 'Emily Rodriguez',
            role: 'Head of Operations',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3',
            bio: 'Ensuring smooth operations and exceptional customer experience'
        },
        {
            name: 'David Kim',
            role: 'Head Chef',
            image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3',
            bio: 'Creating delicious pastries and food that complement our coffee'
        }
    ];

    const values = [
        {
            icon: '🌱',
            title: 'Sustainability',
            description: 'We source our coffee beans from sustainable farms and use eco-friendly packaging'
        },
        {
            icon: '🤝',
            title: 'Community',
            description: 'Building connections and creating a welcoming space for everyone'
        },
        {
            icon: '✨',
            title: 'Quality',
            description: 'Never compromising on the quality of our ingredients and service'
        },
        {
            icon: '❤️',
            title: 'Passion',
            description: 'Driven by our love for coffee and dedication to our craft'
        }
    ];

    const milestones = [
        {year: '2020', event: 'BrewHub was founded with our first location'},
        {year: '2021', event: 'Expanded to 5 locations across the city'},
        {year: '2022', event: 'Launched our mobile app and loyalty program'},
        {year: '2023', event: 'Reached 10,000 loyal customers'},
        {year: '2024', event: 'Opening 10 new locations nationwide'}
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[400px] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{backgroundImage: 'url(https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3)'}}
                >
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                </div>
                <div className="relative h-full flex items-center justify-center text-center text-white px-4">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">Our Story</h1>
                        <p className="text-xl md:text-2xl max-w-3xl mx-auto">
                            From a small coffee shop to your neighborhood favorite
                        </p>
                    </div>
                </div>
            </section>

            {/* About Content */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="prose prose-lg mx-auto text-gray-700">
                            <p className="text-xl leading-relaxed mb-6">
                                BrewHub was born from a simple idea: create a coffee shop where quality meets comfort.
                                Founded in 2020, we set out to serve not just coffee, but to create experiences and
                                build
                                a community around our shared love for exceptional brews.
                            </p>
                            <p className="text-lg leading-relaxed mb-6">
                                Every cup we serve is a testament to our commitment to excellence. We source our beans
                                from the finest coffee-growing regions around the world, working directly with farmers
                                who share our passion for sustainable and ethical practices.
                            </p>
                            <p className="text-lg leading-relaxed">
                                But BrewHub is more than just coffee. It's a place where friends meet, ideas are born,
                                and memories are made. Whether you're grabbing your morning espresso, settling in for
                                an afternoon of work, or catching up with friends over pastries, we're here to make
                                every moment special.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="text-center">
                                <div className="text-5xl mb-4">{value.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Journey</h2>
                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-brown-300"></div>

                            {/* Timeline items */}
                            {milestones.map((milestone, index) => (
                                <div key={index} className="relative flex items-center mb-8">
                                    <div
                                        className="absolute left-8 w-4 h-4 bg-brown-600 rounded-full -translate-x-1/2"></div>
                                    <div className="ml-20">
                                        <h3 className="text-xl font-bold text-brown-600 mb-1">{milestone.year}</h3>
                                        <p className="text-gray-700">{milestone.event}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Meet Our Team</h2>
                    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                        Passionate individuals dedicated to bringing you the best coffee experience
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="h-64 overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                                    <p className="text-brown-600 font-medium mb-2">{member.role}</p>
                                    <p className="text-gray-600 text-sm">{member.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-brown-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Story</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Be part of the BrewHub family and enjoy exclusive benefits
                    </p>
                    <div className="space-x-4">
                        <Link
                            to="/register"
                            className="inline-block px-8 py-3 bg-white text-brown-600 rounded-md hover:bg-gray-100 transition-colors font-semibold"
                        >
                            Become a Member
                        </Link>
                        <Link
                            to="/locations"
                            className="inline-block px-8 py-3 border-2 border-white text-white rounded-md hover:bg-white hover:text-brown-600 transition-colors font-semibold"
                        >
                            Visit Us Today
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;