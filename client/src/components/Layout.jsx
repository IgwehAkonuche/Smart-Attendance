import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

const Layout = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Check auth state on mount and route changes
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser(null);
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold tracking-tight hover:text-gray-200 transition-colors">
                        Smart<span className="text-yellow-300">Attendance</span>
                    </Link>

                    <nav className="flex items-center space-x-6">
                        {!user ? (
                            <>
                                <Link to="/login" className="px-4 py-2 rounded-full border border-white/30 hover:bg-white/10 transition backdrop-blur-sm">
                                    Login
                                </Link>
                            </>
                        ) : (
                            <>
                                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full hidden md:inline-block">
                                    {user.role === 'admin' ? '🛡️ Admin' : '🎓 Student'}
                                </span>

                                <Link to="/dashboard" className={`hover:text-yellow-300 font-medium transition ${location.pathname === '/dashboard' ? 'text-yellow-300 border-b-2 border-yellow-300' : ''}`}>
                                    Dashboard
                                </Link>

                                {user.role === 'student' && (
                                    <Link to="/history" className="hover:text-yellow-300 font-medium transition opacity-50 cursor-not-allowed" title="Coming soon">
                                        History
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-sm font-bold rounded shadow transition hover:shadow-lg"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-6 max-w-6xl animate-fade-in-up">
                <Outlet />
            </main>

            <footer className="bg-gray-800 text-gray-400 py-6 mt-12 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} Smart Attendance System. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
