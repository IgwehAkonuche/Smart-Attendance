import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
            <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Smart Attendance System
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl">
                The future of classroom management. Secure, fast, and reliable attendance tracking using AI Face Verification and Dynamic QR Codes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Student Card */}
                <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100 flex flex-col items-center">
                    <div className="text-6xl mb-4">🎓</div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Student Portal</h2>
                    <p className="text-gray-500 mb-8 text-sm">
                        Mark your attendance, view your history, and track your performance stats.
                    </p>
                    <Link
                        to="/login"
                        state={{ role: 'student' }} // Pass state if needed later, or generic login
                        className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 w-full transition"
                    >
                        Login / Register
                    </Link>
                </div>

                {/* Admin Card */}
                <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100 flex flex-col items-center">
                    <div className="text-6xl mb-4">🛡️</div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Admin Portal</h2>
                    <p className="text-gray-500 mb-8 text-sm">
                        Manage sessions, generate QR codes, and monitor live attendance reports.
                    </p>
                    <Link
                        to="/login"
                        className="bg-gray-800 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-900 w-full transition flex items-center justify-center gap-2"
                    >
                        <span>Admin Login</span>
                    </Link>
                </div>
            </div>

            <div className="mt-16 text-gray-400 text-sm">
                <p>Protected by FaceID & Geo-Fencing Technology</p>
            </div>
        </div>
    );
};

export default Home;
