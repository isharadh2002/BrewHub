import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
import {AuthProvider} from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OAuthSuccess from './components/auth/OAuthSuccess';
import Home from './components/Home';
import PrivateRoute from './components/common/PrivateRoute';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/auth/success" element={<OAuthSuccess/>}/>
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Home/>
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/"/>}/>
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