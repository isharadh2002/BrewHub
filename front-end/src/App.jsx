// front-end/src/App.jsx
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
import {AuthProvider, useAuth} from './contexts/AuthContext';
import Layout from './components/common/Layout';
import PrivateRoute from './components/common/PrivateRoute';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OAuthSuccess from './components/auth/OAuthSuccess';

// Public Pages
import HomePage from './pages/public/HomePage.jsx';
import MenuPage from './pages/public/MenuPage';
import AboutPage from './pages/public/AboutPage';
import LocationsPage from './pages/public/LocationsPage';
import ContactPage from './pages/public/ContactPage';

// Customer Pages
/*import ProfilePage from './pages/customer/ProfilePage';
import OrdersPage from './pages/customer/OrdersPage';
import CartPage from './pages/customer/CartPage';
import LoyaltyPage from './pages/customer/LoyaltyPage';*/

// Staff Pages
/*import StaffDashboard from './pages/staff/StaffDashboard';
import OrderManagement from './pages/staff/OrderManagement';
import InventoryPage from './pages/staff/InventoryPage';
import CustomerQueue from './pages/staff/CustomerQueue';*/

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
//import MenuManagement from './pages/admin/MenuManagement';
import StaffManagement from './pages/admin/StaffManagement';
/*import Analytics from './pages/admin/Analytics';
import PromotionsPage from './pages/admin/PromotionsPage';*/

import PageNotFound from "./pages/PageNotFound.jsx";

// Role-based Route Protection Component
const RoleRoute = ({children, allowedRoles}) => {
    const {user} = useAuth();

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace/>;
    }

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Auth routes - no layout */}
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/auth/success" element={<OAuthSuccess/>}/>

                    {/* Routes with layout */}
                    <Route element={<Layout/>}>
                        {/* Public routes */}
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/menu" element={<MenuPage/>}/>
                        <Route path="/about" element={<AboutPage/>}/>
                        <Route path="/locations" element={<LocationsPage/>}/>
                        <Route path="/contact" element={<ContactPage/>}/>

                        {/* Customer routes (authenticated) */}
                        {/*<Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <ProfilePage/>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/orders"
                            element={
                                <PrivateRoute>
                                    <OrdersPage/>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/cart"
                            element={
                                <PrivateRoute>
                                    <CartPage/>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/loyalty"
                            element={
                                <PrivateRoute>
                                    <LoyaltyPage/>
                                </PrivateRoute>
                            }
                        /> */}

                        {/* Staff routes */}
                        {/*<Route
                            path="/staff/dashboard"
                            element={
                                <PrivateRoute>
                                    <RoleRoute allowedRoles={['staff', 'manager', 'admin']}>
                                        <StaffDashboard/>
                                    </RoleRoute>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/staff/orders"
                            element={
                                <PrivateRoute>
                                    <RoleRoute allowedRoles={['staff', 'manager', 'admin']}>
                                        <OrderManagement/>
                                    </RoleRoute>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/staff/inventory"
                            element={
                                <PrivateRoute>
                                    <RoleRoute allowedRoles={['staff', 'manager', 'admin']}>
                                        <InventoryPage/>
                                    </RoleRoute>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/staff/queue"
                            element={
                                <PrivateRoute>
                                    <RoleRoute allowedRoles={['staff', 'manager', 'admin']}>
                                        <CustomerQueue/>
                                    </RoleRoute>
                                </PrivateRoute>
                            }
                        />*/}

                        {/* Admin routes */}
                        <Route
                            path="/admin/dashboard"
                            element={
                                <PrivateRoute>
                                    <RoleRoute allowedRoles={['admin']}>
                                        <AdminDashboard/>
                                    </RoleRoute>
                                </PrivateRoute>
                            }
                        />
                        {/* <Route
                            path="/admin/menu"
                            element={
                                <PrivateRoute>
                                    <RoleRoute allowedRoles={['admin', 'manager']}>
                                        <MenuManagement/>
                                    </RoleRoute>
                                </PrivateRoute>
                            }
                        /> */}
                        <Route
                            path="/admin/staff"
                            element={
                                <PrivateRoute>
                                    <RoleRoute allowedRoles={['admin']}>
                                        <StaffManagement/>
                                    </RoleRoute>
                                </PrivateRoute>
                            }
                        />
                        {/* <Route
                            path="/admin/analytics"
                            element={
                                <PrivateRoute>
                                    <RoleRoute allowedRoles={['admin', 'manager']}>
                                        <Analytics/>
                                    </RoleRoute>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin/promotions"
                            element={
                                <PrivateRoute>
                                    <RoleRoute allowedRoles={['admin', 'manager']}>
                                        <PromotionsPage/>
                                    </RoleRoute>
                                </PrivateRoute>
                            }
                        /> */}
                    </Route>

                    {/* Catch all - redirect to home */}
                    <Route path="*" element={<PageNotFound/>}/>
                </Routes>

                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            style: {
                                background: '#4ade80',
                            },
                        },
                        error: {
                            style: {
                                background: '#ef4444',
                            },
                        },
                    }}
                />
            </AuthProvider>
        </Router>
    );
}

export default App;