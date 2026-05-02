#!/usr/bin/env node

/**
 * Verify each product document's imageUrl is present and reachable (HTTP 200).
 * Usage:
 *   FIREBASE_ADMIN_SDK_PATH=./firebase-adminsdk.json.json node scripts/verify-product-images.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_PATH || './firebase-adminsdk.json.json';

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: err.message };
  }
}

async function run() {
  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`Service account file not found at: ${serviceAccountPath}`);
    process.exit(1);
  }

  const sa = require(path.resolve(serviceAccountPath));
  if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });

  const db = admin.firestore();
  const snapshot = await db.collection('products').get();
  console.log(`Found ${snapshot.size} products. Verifying image URLs...\n`);

  for (const doc of snapshot.docs) {
    const data = doc.data() || {};
    const name = data.name || '<no name>';
    const url = data.imageUrl || '<no imageUrl>';
    process.stdout.write(`${doc.id} — ${name} — `);
    if (!data.imageUrl) {
      console.log('MISSING imageUrl');
      continue;
    }
    const res = await checkUrl(url);
    console.log(res.ok ? `OK (${res.status})` : `FAIL (${res.status})`);
  }

  process.exit(0);
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
