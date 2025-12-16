import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { API_URL } from '../config';

const Projector = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [qrData, setQrData] = useState(null);
    const [sessionTitle, setSessionTitle] = useState('Loading...');
    const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds

    useEffect(() => {
        // Fetch Session Details
        const fetchSession = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/admin/sessions`);
                const session = res.data.find(s => s._id === sessionId);
                if (session) setSessionTitle(session.title || 'Class Session');
            } catch (err) {
                console.error("Fetch Session Error", err);
            }
        };

        // Fetch QR Code
        const fetchQR = async () => {
            if (timeLeft <= 0) return;
            try {
                const res = await axios.post(`${API_URL}/api/admin/generate-qr`, { sessionId });
                setQrData(JSON.stringify(res.data));
            } catch (err) {
                console.error("QR Gen Error", err);
            }
        };

        fetchSession();
        fetchQR();

        // Intervals
        const qrInterval = setInterval(fetchQR, 10000); // Rotate QR every 10s
        const timerInterval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(qrInterval);
                    clearInterval(timerInterval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(qrInterval);
            clearInterval(timerInterval);
        };
    }, [sessionId, timeLeft]);

    // Format Time MM:SS
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            {timeLeft > 0 ? (
                <>
                    <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center text-indigo-400">
                        {sessionTitle}
                    </h1>

                    <div className="bg-white p-6 rounded-3xl shadow-2xl mb-12">
                        {qrData ? (
                            <QRCode value={qrData} size={400} />
                        ) : (
                            <div className="w-[400px] h-[400px] flex items-center justify-center text-black">
                                Loading QR...
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <p className="text-2xl text-gray-400 mb-2 uppercase tracking-widest">Attendance Closing In</p>
                        <p className="text-8xl font-mono font-bold text-red-500 animate-pulse">
                            {formatTime(timeLeft)}
                        </p>
                    </div>

                    <p className="mt-12 text-xl text-gray-500">Scan via Student Dashboard • Smile required 😊</p>
                </>
            ) : (
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-red-500 mb-4">Attendance Closed</h1>
                    <p className="text-2xl text-gray-400 mb-8">The 20-minute window has expired.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-full text-xl font-bold hover:bg-indigo-700"
                    >
                        Return to Dashboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default Projector;
