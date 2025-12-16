import express from 'express';
import Session from '../models/Session.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post('/generate-qr', async (req, res) => {
    try {
        const { sessionId } = req.body;
        // Verify session exists
        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Generate signed token with timestamp
        const payload = {
            sessionId: session._id,
            timestamp: Date.now()
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');

        // Return structured data for the QR
        res.status(200).json({
            token,
            sessionId: session._id
        });

    } catch (error) {
        console.error("QR Gen Error", error);
        res.status(500).json({ message: 'Error generating QR' });
    }
});

router.post('/create-session', async (req, res) => {
    try {
        const { latitude, longitude, ...sessionData } = req.body;

        // Construct GeoJSON if lat/long provided
        if (latitude && longitude) {
            sessionData.location = {
                type: 'Point',
                coordinates: [longitude, latitude] // Note: Longitude first
            };
        }

        const newSession = new Session(sessionData);
        await newSession.save();
        res.status(201).json(newSession);
    } catch (error) {
        console.error('Create Session Error:', error);
        res.status(500).json({ message: 'Error creating session', error: error.message });
    }
});

router.post('/create-admin', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 12);

        const newAdmin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            faceDescriptor: []
        });

        res.status(201).json({ message: 'Admin created successfully', admin: { name: newAdmin.name, email: newAdmin.email } });
    } catch (error) {
        console.error("Create Admin Error", error);
        res.status(500).json({ message: 'Error creating admin' });
    }
});

router.get('/sessions', async (req, res) => {
    try {
        const sessions = await Session.find().populate('createdBy', 'name');
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sessions' });
    }
});

export default router;
