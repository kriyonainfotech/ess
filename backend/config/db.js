const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MongoDB, {
      serverSelectionTimeoutMS: 60000, // 60 seconds
      socketTimeoutMS: 60000, // 60 seconds for idle connections
      connectTimeoutMS: 30000, // 30 seconds for initial connection
      maxPoolSize: 20, // Adjust max connection pool size
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
