// front-end/src/pages/admin/StaffManagement.jsx
import {useState, useEffect} from 'react';
import {useAuth} from '../../contexts/AuthContext';
import userService from '../../services/userService';
import toast from 'react-hot-toast';
import {Search, Edit2, Trash2, ChevronLeft, ChevronRight, Users, UserCheck, Shield, User} from 'lucide-react';

const StaffManagement = () => {
    const {user: currentUser} = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('name');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const itemsPerPage = 10;

    const roleIcons = {
        customer: User,
        staff: UserCheck,
        manager: Users,
        admin: Shield
    };

    const roleColors = {
        customer: 'bg-gray-100 text-gray-800',
        staff: 'bg-blue-100 text-blue-800',
        manager: 'bg-purple-100 text-purple-800',
        admin: 'bg-red-100 text-red-800'
    };

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [currentPage, searchTerm, searchBy]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.getAllUsers({
                search: searchTerm,
                searchBy,
                page: currentPage,
                limit: itemsPerPage
            });
            setUsers(response.data);
            setTotalPages(response.pagination.pages);
        } catch (error) {
            toast.error('Failed to fetch users');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await userService.getUserStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await userService.updateUserRole(userId, newRole);
            toast.success('User role updated successfully');
            fetchUsers();
            fetchStats();
            setEditingUser(null);
        } catch (error) {
            toast.error('Failed to update user role');
            console.error(error);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await userService.deleteUser(userId);
            toast.success('User deleted successfully');
            fetchUsers();
            fetchStats();
            setDeleteConfirm(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
            console.error(error);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchUsers();
    };

    const getRoleStat = (role) => {
        const stat = stats?.byRole.find(s => s._id === role);
        return stat?.count || 0;
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-gray-600 mt-2">Manage user roles and permissions</p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <Users className="w-8 h-8 text-gray-400"/>
                            </div>
                        </div>

                        {['customer', 'staff', 'manager', 'admin'].map(role => {
                            const Icon = roleIcons[role];
                            return (
                                <div key={role} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 capitalize">{role}s</p>
                                            <p className="text-2xl font-bold text-gray-900">{getRoleStat(role)}</p>
                                        </div>
                                        <Icon className="w-8 h-8 text-gray-400"/>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder={`Search by ${searchBy}...`}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <select
                            value={searchBy}
                            onChange={(e) => setSearchBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                        >
                            <option value="name">Search by Name</option>
                            <option value="email">Search by Email</option>
                        </select>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No users found</p>
                        </div>
                    ) : (
                        <>
                            {/* Scrollable Table with Fixed Header */}
                            <div className="overflow-x-auto">
                                <div className="max-h-96 overflow-y-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                                Joined
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {user.avatar ? (
                                                            <img
                                                                className="h-10 w-10 rounded-full"
                                                                src={user.avatar}
                                                                alt={user.name}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="h-10 w-10 rounded-full bg-brown-600 flex items-center justify-center text-white font-semibold">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {user.loyaltyPoints} points
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{user.email}</div>
                                                    {user.emailVerified && (
                                                        <span className="text-xs text-green-600">Verified</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingUser === user._id ? (
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                            onBlur={() => setEditingUser(null)}
                                                            className="text-sm rounded-md border-gray-300 focus:ring-brown-500 focus:border-brown-500"
                                                            autoFocus
                                                        >
                                                            <option value="customer">Customer</option>
                                                            <option value="staff">Staff</option>
                                                            <option value="manager">Manager</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    ) : (
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                                                                {user.role}
                                                            </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => setEditingUser(user._id)}
                                                            disabled={user._id === currentUser?._id}
                                                            className="text-brown-600 hover:text-brown-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title={user._id === currentUser?._id ? "You can't edit your own role" : "Edit role"}
                                                        >
                                                            <Edit2 className="w-4 h-4"/>
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(user._id)}
                                                            disabled={user._id === currentUser?._id}
                                                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title={user._id === currentUser?._id ? "You can't delete yourself" : "Delete user"}
                                                        >
                                                            <Trash2 className="w-4 h-4"/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div
                                    className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Page <span className="font-medium">{currentPage}</span> of{' '}
                                                <span className="font-medium">{totalPages}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                                 aria-label="Pagination">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    <ChevronLeft className="h-5 w-5"/>
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    <ChevronRight className="h-5 w-5"/>
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete User</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Are you sure you want to delete this user? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(deleteConfirm)}
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

export default StaffManagement;