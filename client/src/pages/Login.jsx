import React, { useState } from 'react';
import FaceCamera from '../components/FaceCamera';
import ErrorBoundary from '../components/ErrorBoundary';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', name: '', adminSecret: '' });
    const [faceDescriptor, setFaceDescriptor] = useState(null);
    const [isAdminRegistration, setIsAdminRegistration] = useState(false);
    const navigate = useNavigate();

    const handleFaceDetected = (descriptor) => {
        // Only capture once for registration flow
        if (!faceDescriptor) {
            console.log("Face captured!", descriptor);
            setFaceDescriptor(Array.from(descriptor)); // Convert Float32Array to standard array
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
        const payload = isRegistering ? { ...formData, faceDescriptor } : formData;
        if (isRegistering && isAdminRegistration) {
            delete payload.faceDescriptor; // Admin doesn't strictly need face for this flow
        }

        try {
            const res = await axios.post(`${API_URL}${endpoint}`, payload);
            console.log('Success:', res.data);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.result));
            navigate('/dashboard');
        } catch (error) {
            console.error('Error:', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Error occurred');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
            <h2 className="text-2xl font-bold mb-4">{isRegistering ? 'Register' : 'Login'}</h2>

            {isRegistering && (
                <div className="mb-4">
                    <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                        <input
                            type="checkbox"
                            checked={isAdminRegistration}
                            onChange={(e) => setIsAdminRegistration(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span>Register as Admin</span>
                    </label>

                    {!isAdminRegistration ? (
                        <div>
                            <label className="block text-sm font-medium mb-1">Face Verification</label>
                            <div className="border p-2 rounded relative">
                                <ErrorBoundary>
                                    <FaceCamera onFaceDetected={handleFaceDetected} />
                                </ErrorBoundary>
                                {faceDescriptor && <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded">Face Captured</div>}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-bold text-red-600">Admin Secret Key</label>
                            <input
                                type="password"
                                className="w-full border p-2 rounded border-red-300 focus:border-red-500"
                                value={formData.adminSecret}
                                onChange={e => setFormData({ ...formData, adminSecret: e.target.value })}
                                placeholder="Enter system secret..."
                                required
                            />
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                    <div>
                        <label className="block text-sm font-bold">Name</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-bold">Email</label>
                    <input
                        type="email"
                        className="w-full border p-2 rounded"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold">Password</label>
                    <input
                        type="password"
                        className="w-full border p-2 rounded"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded font-bold hover:bg-indigo-700">
                    {isRegistering ? 'Register' : 'Login'}
                </button>
            </form>

            <div className="mt-4 text-center">
                <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-indigo-600 underline"
                >
                    {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                </button>
            </div>
        </div>
    );
};

export default Login;
