// Re-export Firebase Firestore db for backward compatibility
const { db } = require("./firebase");

module.exports = async function connectDB() {
  return db;
};
