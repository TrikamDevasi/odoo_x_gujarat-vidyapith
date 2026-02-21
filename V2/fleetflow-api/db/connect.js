const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is missing');
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            connectTimeoutMS: 10000,
        });
        console.log('✅ Connected to MongoDB:', mongoose.connection.name);
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        throw err; // Re-throw to be caught by startServer
    }
}

mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));

module.exports = connectDB;
