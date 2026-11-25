const mongoose = require('mongoose');

/**
 * MongoDB Feature Demonstrated: Database Connection & Lifecycle Management
 * Uses mongoose.connect() to establish a connection pool to MongoDB with automatic retry and error handling.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern mongoose options are enabled by default in Mongoose 6+
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error('If local MongoDB is not running, ensure service is started or update MONGO_URI in server/.env with your MongoDB Atlas string.');
    process.exit(1);
  }
};

module.exports = connectDB;
