import express from 'express';
import Attendance from '../models/Attendance.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify token would go here (simplified for now)

// Helper to calculate distance in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

const euclideanDistance = (desc1, desc2) => {
    if (!desc1 || !desc2 || desc1.length !== desc2.length) return 1.0;
    return Math.sqrt(
        desc1
            .map((val, i) => val - desc2[i])
            .reduce((sum, diff) => sum + diff * diff, 0)
    );
};

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

router.post('/mark', async (req, res) => {
    try {
        const { studentId, sessionId, latitude, longitude, faceDescriptor, qrToken } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Location (latitude and longitude) is required' });
        }

        // 1. Verify Session is active
        const session = await Session.findById(sessionId);
        if (!session || !session.isActive) {
            return res.status(400).json({ message: 'Invalid or inactive session' });
        }

        // 1.5 Verify QR Token (Dynamic)
        if (qrToken) {
            try {
                const decoded = jwt.verify(qrToken, process.env.JWT_SECRET || 'secret');
                if (decoded.sessionId !== sessionId) {
                    return res.status(400).json({ message: 'Invalid QR Code for this session' });
                }
                // Check if token is too old (e.g., generated > 1 minute ago)
                const now = Date.now();
                const tokenTime = decoded.timestamp;
                if (now - tokenTime > 60000) { // 60 seconds validity window for fresh scan
                    return res.status(400).json({ message: 'QR Code expired. Refresh and scan again.' });
                }
            } catch (err) {
                return res.status(400).json({ message: 'Invalid QR Token' });
            }
        }

        // 2. Verify Session Location exists
        if (!session.location || !session.location.coordinates) {
            return res.status(400).json({ message: 'Session does not have a valid location' });
        }

        // 3. Verify Location (Geofencing)
        // MongoDB stores [longitude, latitude]
        const sessionLon = session.location.coordinates[0];
        const sessionLat = session.location.coordinates[1];

        const distance = getDistanceFromLatLonInKm(
            latitude, longitude,
            sessionLat, sessionLon
        );

        // session.radius is in meters, distance is in km
        if (distance > (session.radius / 1000)) {
            return res.status(400).json({
                message: 'You are not validly within the class location',
                distance: `${(distance * 1000).toFixed(2)}m`,
                allowedRadius: `${session.radius}m`
            });
        }

        // 4. Verify Face (Server-Side)
        const user = await User.findById(studentId);
        if (!user || !user.faceDescriptor) {
            return res.status(404).json({ message: 'User face profile not found' });
        }

        // Parse descriptors if stored as JSON strings, or assuming arrays
        // Note: MongoDB might return generic array, Ensure it matches format
        const storedDescriptor = user.faceDescriptor;
        // faceDescriptor from body might be object/array
        const inputDescriptor = Object.values(faceDescriptor);

        const faceDistance = euclideanDistance(storedDescriptor, inputDescriptor);
        const FACE_MATCH_THRESHOLD = 0.65; // Relaxed threshold for 128D

        if (faceDistance > FACE_MATCH_THRESHOLD) {
            return res.status(400).json({ message: 'Face verification failed: Identity mismatch' });
        }

        // 5. Mark Attendance
        const newAttendance = new Attendance({
            student: studentId,
            session: sessionId,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude] // Store as [lon, lat]
            },
            verified: true // Now strictly verified on server
        });

        await newAttendance.save();
        res.status(201).json(newAttendance);
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ message: 'Error marking attendance', error: error.message });
    }
});

// Get Student Attendance History
router.get('/history/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const history = await Attendance.find({ student: studentId })
            .populate('session', 'name') // Assuming Session has a 'name' field
            .sort({ timestamp: -1 });
        res.status(200).json(history);
    } catch (error) {
        console.error("History Error", error);
        res.status(500).json({ message: 'Error fetching history' });
    }
});

// Get Student Attendance Stats
router.get('/stats/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const attendedCount = await Attendance.countDocuments({ student: studentId, verified: true });
        // For percentage, ideally need 'total possible sessions' student is enrolled in
        // Simplified: Count total active sessions created (Global count for now)
        const totalSessions = await Session.countDocuments({});

        const percentage = totalSessions > 0 ? (attendedCount / totalSessions) * 100 : 0;

        res.status(200).json({
            attended: attendedCount,
            total: totalSessions,
            percentage: percentage.toFixed(1)
        });
    } catch (error) {
        console.error("Stats Error", error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

export default router;
