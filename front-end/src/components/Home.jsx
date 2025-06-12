import {useAuth} from '../contexts/AuthContext';

const Home = () => {
    const {user, logout} = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-brown-600" style={{color: '#8B4513'}}>
                                BrewHub
                            </h1>
                        </div>

                        {user && (
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-700">Welcome, {user.name}!</span>
                                <button
                                    onClick={logout}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                User Profile
                            </h2>

                            {user ? (
                                <div className="space-y-3">
                                    {user.avatar && (
                                        <div className="flex items-center">
                                            <img
                                                className="h-20 w-20 rounded-full"
                                                src={user.avatar}
                                                alt={user.name}
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Name</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
                                        </div>

                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                                        </div>

                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Role</dt>
                                            <dd className="mt-1 text-sm text-gray-900 capitalize">{user.role}</dd>
                                        </div>

                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Loyalty Points</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{user.loyaltyPoints} points</dd>
                                        </div>

                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {user.googleId ? 'Google' : user.facebookId ? 'Facebook' : 'Email'}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email Verified</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {user.emailVerified ? (
                                                    <span className="text-green-600">Verified</span>
                                                ) : (
                                                    <span className="text-red-600">Not Verified</span>
                                                )}
                                            </dd>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">Loading user information...</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;