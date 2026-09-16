const mongoose = require("mongoose");
const dns = require("node:dns");

// Node.js 22+ on Windows has a known bug where it fails to resolve DNS
// SRV records (used by mongodb+srv:// URIs) via the system resolver,
// throwing "querySrv ECONNREFUSED". Forcing public DNS servers here
// works around it and is harmless on other platforms/Node versions.
// See: https://github.com/nodejs/node/issues (Windows SRV resolution)
dns.setServers(["1.1.1.1", "8.8.8.8"]);

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Copy .env.example to .env and configure it.");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected:", mongoose.connection.host);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
