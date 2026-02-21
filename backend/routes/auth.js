const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password, // In a production app, we would hash this
            role: role || 'Dispatcher' // Default role
        });

        await user.save();

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                email: user.email
            },
            message: 'Registration successful'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && user.password === password) {
            res.json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    role: user.role,
                    email: user.email
                },
                token: 'demo-token-' + user._id // Simple token for demo
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;