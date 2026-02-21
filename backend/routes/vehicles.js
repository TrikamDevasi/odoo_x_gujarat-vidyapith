const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

// GET all vehicles
router.get('/', async (req, res) => {
    try {
        const vehicles = await Vehicle.find().sort({ createdAt: -1 });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new vehicle
router.post('/', async (req, res) => {
    try {
        const vehicle = new Vehicle(req.body);  // Create new Vehicle document
        await vehicle.save();                    // Save to MongoDB
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update vehicle status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );
        res.json(vehicle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE vehicle
router.delete('/:id', async (req, res) => {
    try {
        await Vehicle.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update vehicle
router.put('/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
        res.json(vehicle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update vehicle status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );
        res.json(vehicle);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
