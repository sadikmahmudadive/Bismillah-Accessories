#!/usr/bin/env node

/**
 * Usage:
 *   FIREBASE_ADMIN_SDK_PATH=./firebase-adminsdk.json.json node scripts/grant-admin.js siradive137@gmail.com
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const email = process.argv[2];
if (!email) {
  console.error('Please provide an email: node scripts/grant-admin.js user@example.com');
  process.exit(1);
}

const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_PATH || './firebase-adminsdk.json.json';
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Service account file not found at: ${serviceAccountPath}`);
  process.exit(1);
}

const sa = require(path.resolve(serviceAccountPath));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });

async function run() {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('Found user:', userRecord.uid);

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.set({ role: 'admin', email: email, updatedAt: admin.firestore.Timestamp.now() }, { merge: true });
    console.log(`Set role=admin on users/${userRecord.uid}`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

run();
