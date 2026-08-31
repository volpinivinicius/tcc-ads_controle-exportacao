/**
 * Establishes the Mongoose connection to MongoDB using the
 * MONGO_URI environment variable. Exits the process if the
 * connection fails, since the application cannot run without it.
 */

const mongoose = require("mongoose");

async function dbConnect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
}
 
module.exports = dbConnect;