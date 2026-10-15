const { initializeApp, getApps, getApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");
const fs = require("fs");

/**
 * Initializes the Firebase Admin SDK.
 * Supports multiple credential sources (in order of priority):
 * 1. FIREBASE_SERVICE_ACCOUNT (full JSON string)
 * 2. FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (individual env vars)
 * 3. FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS (file path)
 * 4. Automatic discovery of serviceAccountKey.json in server root or current working directory
 */
function initFirebase() {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  // Option 1: Entire JSON in an environment variable (best for Vercel/Render)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      const app = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialised from FIREBASE_SERVICE_ACCOUNT JSON.");
      return app;
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", err.message);
    }
  }

  // Option 2: Individual env vars
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log("Firebase Admin SDK initialised from individual FIREBASE_* env variables.");
    return app;
  }

  // Option 3: Explicit file path
  const explicitPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (explicitPath && fs.existsSync(explicitPath)) {
    const fileContent = JSON.parse(fs.readFileSync(explicitPath, "utf8"));
    const app = initializeApp({
      credential: cert(fileContent),
    });
    console.log(`Firebase Admin SDK initialised from file: ${explicitPath}`);
    return app;
  }

  // Option 4: Auto-detect serviceAccountKey.json in project root
  const candidates = [
    path.join(__dirname, "..", "..", "serviceAccountKey.json"),
    path.join(process.cwd(), "serviceAccountKey.json"),
    path.join(process.cwd(), "server", "serviceAccountKey.json"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const fileContent = JSON.parse(fs.readFileSync(candidate, "utf8"));
      const app = initializeApp({
        credential: cert(fileContent),
      });
      console.log(`Firebase Admin SDK initialised from auto-discovered file: ${candidate}`);
      return app;
    }
  }

  // Fallback: Default application credentials
  try {
    const app = initializeApp();
    console.log("Firebase Admin SDK initialised with application default credentials.");
    return app;
  } catch (err) {
    console.warn("Firebase Admin SDK could not find credentials. Please configure your service account.");
    return null;
  }
}

const app = initFirebase();
const db = getFirestore(app);

module.exports = { app, db };
