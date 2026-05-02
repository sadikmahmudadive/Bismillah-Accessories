#!/usr/bin/env node

/**
 * List documents in the `products` collection and print their IDs and names.
 * Usage:
 *   FIREBASE_ADMIN_SDK_PATH=./firebase-adminsdk.json.json node scripts/list-products.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_PATH || './firebase-adminsdk.json.json';

async function listProducts() {
  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`Service account file not found at: ${serviceAccountPath}`);
    process.exit(1);
  }

  const sa = require(path.resolve(serviceAccountPath));

  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  }

  const db = admin.firestore();
  const products = await db.collection('products').get();

  console.log(`Found ${products.size} documents in 'products' collection:\n`);
  products.forEach(doc => {
    const data = doc.data() || {};
    console.log(`${doc.id}  —  ${data.name || '<no name>'}`);
  });

  process.exit(0);
}

listProducts().catch(err => {
  console.error('Error listing products:', err.message || err);
  process.exit(1);
});
