import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QrScanner } from '@yudiel/react-qr-scanner';
import FaceCamera from '../components/FaceCamera';
import { API_URL } from '../config';
import QRCode from 'react-qr-code';

const DynamicQR = ({ sessionId }) => {
    const [qrData, setQrData] = useState(null);

    useEffect(() => {
        const fetchQR = async () => {
            try {
                const res = await axios.post(`${API_URL}/api/admin/generate-qr`, { sessionId });
                setQrData(JSON.stringify(res.data)); // { token, sessionId }
            } catch (err) {
                console.error("QR Gen Error", err);
            }
        };

        fetchQR();
        const interval = setInterval(fetchQR, 10000); // 10 seconds refresh
        return () => clearInterval(interval);
    }, [sessionId]);

    if (!qrData) return <p className="text-sm text-gray-500">Generating QR...</p>;

    return (
        <div className="flex flex-col items-center p-2 border rounded bg-white">
            <div className="bg-white p-2">
                <QRCode value={qrData} size={200} />
            </div>
            <p className="text-xs mt-2 text-gray-400">Updates automatically</p>
        </div>
    );
};

const SessionAttendees = ({ sessionId }) => {
    const [attendees, setAttendees] = useState([]);

    useEffect(() => {
        const fetchAttendees = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/admin/session/${sessionId}/attendees`);
                setAttendees(res.data);
            } catch (err) {
                console.error("Error fetching attendees", err);
            }
        };

        fetchAttendees();
        const interval = setInterval(fetchAttendees, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [sessionId]);

    const exportCSV = () => {
        if (attendees.length === 0) return alert("No data to export");

        const headers = ["Student Name", "Email", "Time", "Location", "Verified"];
        const rows = attendees.map(att => [
            att.student?.name || "Unknown",
            att.student?.email || "N/A",
            new Date(att.timestamp).toLocaleString(),
            `${att.location?.coordinates[1]}, ${att.location?.coordinates[0]}`,
            att.verified ? "Yes" : "No"
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(val => `"${val}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `attendance_${sessionId}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">Attendees ({attendees.length})</h4>
                <button onClick={exportCSV} className="text-sm bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">
                    ⬇ Export CSV
                </button>
            </div>
            <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
                {attendees.length === 0 ? (
                    <p className="text-xs text-gray-500">No attendees yet.</p>
                ) : (
                    <ul className="space-y-1">
                        {attendees.map(att => (
                            <li key={att._id} className="text-sm flex justify-between">
                                <span>{att.student?.name || "Unknown Student"}</span>
                                <span className="text-gray-500 text-xs">{new Date(att.timestamp).toLocaleTimeString()}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const StudentStats = ({ studentId }) => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/attendance/stats/${studentId}`);
                setStats(res.data);
            } catch (err) {
                console.error("Stats Error", err);
            }
        };
        fetchStats();
    }, [studentId]);

    if (!stats) return null;

    return (
        <div className="bg-white p-4 rounded shadow mb-4 flex justify-around items-center">
            <div className="text-center">
                <p className="text-sm text-gray-500">Attendance</p>
                <p className="text-2xl font-bold text-blue-600">{stats.percentage}%</p>
            </div>
            <div className="text-center border-l pl-4">
                <p className="text-sm text-gray-500">Classes Attended</p>
                <p className="text-xl font-bold">{stats.attended} / {stats.total}</p>
            </div>
        </div>
    );
};

const StudentHistory = ({ studentId }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/attendance/history/${studentId}`);
                setHistory(res.data);
            } catch (err) {
                console.error("History Error", err);
            }
        };
        fetchHistory();
    }, [studentId]);

    return (
        <div className="bg-white p-4 rounded shadow mt-6">
            <h3 className="text-xl font-bold mb-4">My Attendance History</h3>
            {history.length === 0 ? (
                <p className="text-gray-500">No records found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-2">Date</th>
                                <th className="p-2">Class</th>
                                <th className="p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(record => (
                                <tr key={record._id} className="border-b">
                                    <td className="p-2">{new Date(record.timestamp).toLocaleDateString()} {new Date(record.timestamp).toLocaleTimeString()}</td>
                                    <td className="p-2">{record.session?.title || "Unknown Class"}</td>
                                    <td className="p-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${record.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {record.verified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const AdminInviteForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/admin/create-admin`, { email, password, name });
            alert("Admin Created Successfully!");
            setEmail('');
            setPassword('');
            setName('');
        } catch (error) {
            console.error("Invite Error", error);
            alert("Failed to create admin");
        }
    };

    return (
        <div className="bg-white p-4 rounded shadow mb-4">
            <h3 className="text-xl font-bold mb-4">Invite New Admin</h3>
            <form onSubmit={handleInvite} className="flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-bold text-gray-600">Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="border p-2 rounded text-sm" required placeholder="New Admin Name" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded text-sm" required placeholder="admin@school.com" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600">Initial Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 rounded text-sm" required placeholder="******" />
                </div>
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-purple-700 h-10">Create Admin</button>
            </form>
        </div>
    );
};

const Dashboard = () => {
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [sessions, setSessions] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [location, setLocation] = useState(null);
    const [scannedSessionId, setScannedSessionId] = useState(null);
    const [qrToken, setQrToken] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [activeQrSession, setActiveQrSession] = useState(null);
    const [activeAttendeeSession, setActiveAttendeeSession] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => console.error("Location error", error)
            );
        }

        // Fetch sessions if admin
        if (user?.role === 'admin') {
            fetchSessions();
        }
    }, [user?.role]);

    const fetchSessions = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/sessions`);
            setSessions(res.data);
        } catch (error) {
            console.error("Error fetching sessions", error);
        }
    };

    const handleScan = (result) => {
        if (result) {
            setScanning(false);
            try {
                // Parse Dynamic QR (JSON format)
                const data = JSON.parse(result);
                if (data.sessionId && data.token) {
                    setScannedSessionId(data.sessionId);
                    setQrToken(data.token);
                    setIsVerifying(true);
                } else {
                    alert("Invalid Smart Attendance QR Code");
                }
            } catch (e) {
                console.error("QR Parse Error", e);
                alert("Invalid QR Code format. Please scan a valid dynamic code.");
            }
        }
    };

    const handleFaceDetected = async (descriptor) => {
        if (!scannedSessionId || !location) {
            alert("Missing session or location data");
            return;
        }

        try {
            const payload = {
                studentId: user._id,
                sessionId: scannedSessionId,
                qrToken: qrToken,
                latitude: location.latitude,
                longitude: location.longitude,
                faceDescriptor: Array.from(descriptor)
            };

            await axios.post(`${API_URL}/api/attendance/mark`, payload);
            alert("Attendance Marked Successfully!");
            setIsVerifying(false);
            setScannedSessionId(null);
            setQrToken(null);
        } catch (error) {
            console.error("Attendance Error:", error);
            alert(error.response?.data?.message || error.message || "Failed to mark attendance");
            setIsVerifying(false); // Reset on error to try again or cancel
        }
    };

    const handleCreateSession = async () => {
        if (!location) {
            alert("Location not found yet. Please wait.");
            return;
        }

        const name = prompt("Enter Class Name (e.g., Mathematics 101):");
        if (!name) return;
        const radius = prompt("Enter Radius in meters (default 50):", "50");

        try {
            const payload = {
                createdBy: user._id,
                latitude: location.latitude,
                longitude: location.longitude,
                radius: parseInt(radius) || 50,
                title: name
            };

            await axios.post(`${API_URL}/api/admin/create-session`, payload);
            alert("Session Created Successfully!");
            fetchSessions();
        } catch (error) {
            console.error("Error creating session:", error);
            alert("Failed to create session");
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name}</h2>
            {location && <p className="text-sm text-gray-500 mb-4">Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>}

            {user?.role === 'student' && (
                <div className="space-y-4">
                    <StudentStats studentId={user._id} />

                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="text-xl font-bold mb-2">Mark Attendance</h3>

                        {!scanning && !isVerifying && (
                            <button
                                onClick={() => setScanning(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Scan Class QR
                            </button>
                        )}

                        {scanning && (
                            <div className="max-w-sm">
                                <button onClick={() => setScanning(false)} className="mb-2 text-red-500">Cancel Scan</button>
                                <QrScanner
                                    onDecode={(result) => handleScan(result)}
                                    onError={(error) => console.log(error?.message)}
                                />
                            </div>
                        )}

                        {isVerifying && (
                            <div className="max-w-sm">
                                <h4 className="text-lg font-semibold mb-2">Verify Face</h4>
                                <FaceCamera onFaceDetected={handleFaceDetected} />
                                <button onClick={() => setIsVerifying(false)} className="mt-2 text-red-500">Cancel Verification</button>
                            </div>
                        )}
                    </div>

                    <StudentHistory studentId={user._id} />
                </div>
            )}

            {user?.role === 'admin' && (
                <div>
                    <AdminInviteForm />

                    <button
                        onClick={handleCreateSession}
                        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
                    >
                        Create New Session
                    </button>

                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="text-xl font-bold mb-4">Active Sessions</h3>
                        {sessions.length === 0 ? (
                            <p className="text-gray-500">No active sessions found.</p>
                        ) : (
                            <ul className="space-y-4">
                                {sessions.map(session => (
                                    <li key={session._id} className="border p-4 rounded flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">ID: {session._id}</span>
                                            <span className="text-sm text-gray-500">Radius: {session.radius}m</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-indigo-700">{session.title || "Untitled Session"}</h4>

                                        <div className="flex gap-4 flex-wrap">
                                            <button
                                                onClick={() => navigate(`/project/${session._id}`)}
                                                className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm font-bold border border-purple-200 hover:bg-purple-200"
                                            >
                                                📽️ Project
                                            </button>
                                            <button
                                                onClick={() => setActiveQrSession(activeQrSession === session._id ? null : session._id)}
                                                className="text-blue-600 underline text-sm"
                                            >
                                                {activeQrSession === session._id ? 'Hide QR' : 'Show Class QR'}
                                            </button>
                                            <button
                                                onClick={() => setActiveAttendeeSession(activeAttendeeSession === session._id ? null : session._id)}
                                                className="text-green-600 underline text-sm"
                                            >
                                                {activeAttendeeSession === session._id ? 'Hide Attendees' : 'View Attendees'}
                                            </button>
                                        </div>

                                        {activeQrSession === session._id && (
                                            <div className="mt-2">
                                                <DynamicQR sessionId={session._id} />
                                            </div>
                                        )}

                                        {activeAttendeeSession === session._id && (
                                            <SessionAttendees sessionId={session._id} />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
