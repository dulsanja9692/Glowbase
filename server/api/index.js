// Vercel serverless entry point — connects to MongoDB once per cold start
// and exports the Express app as a serverless function.
require("dotenv").config();
const connectDB = require("../src/config/db");
const app = require("../src/app");

// Cache the DB connection across warm invocations
let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};
