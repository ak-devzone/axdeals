const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
try {
  let serviceAccount;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Option 1: Use an Environment Variable (for Render / Production)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Option 2: Use a local file (for local development)
    serviceAccount = require('./serviceAccountKey.json');
  }

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log('✅ Firebase Admin connected successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  process.exit(1); // Stop server if database can't connect
}

const db = admin.firestore();

// Optional: Enable ignoreUndefinedProperties to prevent errors when saving undefined values
db.settings({ ignoreUndefinedProperties: true });

module.exports = db;
