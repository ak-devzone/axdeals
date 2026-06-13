const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
try {
  // Option 1: Use a serviceAccountKey.json file downloaded from Firebase Console
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  
  console.log('✅ Firebase Admin connected successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
}

const db = admin.firestore();

// Optional: Enable ignoreUndefinedProperties to prevent errors when saving undefined values
db.settings({ ignoreUndefinedProperties: true });

module.exports = db;
