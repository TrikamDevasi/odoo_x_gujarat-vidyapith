const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
    vehicle_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    liters: {
        type: Number,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    odometer: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FuelLog', fuelLogSchema);
