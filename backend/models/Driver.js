const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    license_number: {
        type: String,
        required: true,
        unique: true
    },
    license_expiry: {
        type: Date,
        required: true
    },
    safety_score: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ['On Duty', 'Off Duty', 'Suspended', 'On Trip'],
        default: 'On Duty'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);