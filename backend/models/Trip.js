const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    vehicle_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    driver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    cargo_weight: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
        default: 'Draft'
    },
    start_location: {
        type: String,
        required: true
    },
    end_location: {
        type: String,
        required: true
    },
    start_time: {
        type: Date
    },
    end_time: {
        type: Date
    },
    odometer_start: {
        type: Number
    },
    odometer_end: {
        type: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);