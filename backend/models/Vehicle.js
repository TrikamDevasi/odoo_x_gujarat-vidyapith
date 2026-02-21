const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    license_plate: {
        type: String,
        required: true,
        unique: true  
    },
    max_load: {
        type: Number,
        required: true
    },
    odometer: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Available', 'On Trip', 'In Shop', 'Out of Service'],
        default: 'Available'
    }
}, {
    timestamps: true  
});

module.exports = mongoose.model('Vehicle', vehicleSchema);