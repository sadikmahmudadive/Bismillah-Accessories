#!/usr/bin/env node

/**
 * Standalone Node.js script to seed Firestore with products
 * 
 * Prerequisites:
 * 1. Download service account key from Firebase Console
 * 2. Save as `firebase-adminsdk.json` in project root
 * 3. Run: node scripts/seed.js
 * 
 * Or use environment variable:
 * FIREBASE_ADMIN_SDK_PATH=./path/to/serviceAccountKey.json node scripts/seed.js
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const productsData = require("./products-seed.json");

// Get service account path
const serviceAccountPath =
  process.env.FIREBASE_ADMIN_SDK_PATH || "./firebase-adminsdk.json";

async function seedProducts() {
  try {
    console.log("🚀 Starting Firestore products seeding...\n");

    // Check if service account file exists
    if (!fs.existsSync(serviceAccountPath)) {
      console.error(
        `❌ Service account file not found at: ${serviceAccountPath}`
      );
      console.error("\n📝 Setup Instructions:");
      console.error("1. Go to Firebase Console > Project Settings > Service Accounts");
      console.error("2. Click 'Generate New Private Key'");
      console.error("3. Save the JSON file as 'firebase-adminsdk.json' in project root");
      console.error("4. Or set FIREBASE_ADMIN_SDK_PATH environment variable");
      process.exit(1);
    }

    // Initialize Firebase Admin
    const serviceAccount = require(path.resolve(serviceAccountPath));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    const db = admin.firestore();
    const productsCollection = db.collection("products");

    // Check if products already exist
    console.log("📊 Checking existing products...");
    const existingQuery = await productsCollection
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      const totalQuery = await productsCollection.get();
      console.log(
        `\n⚠️  Products already exist in database (${totalQuery.size} total, ${existingQuery.docs.length} active).`
      );
      console.log("💡 Tip: Delete documents manually or use --force flag to override");
      process.exit(0);
    }

    // Seed products
    console.log(`\n📦 Adding ${productsData.length} products to Firestore...\n`);

    const batch = db.batch();
    const addedProducts = [];

    for (const productData of productsData) {
      const docRef = productsCollection.doc();
      const product = {
        ...productData,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        cloudinaryPublicId: "",
      };

      batch.set(docRef, product);
      addedProducts.push({ id: docRef.id, name: productData.name });
      console.log(`✅ ${productData.name}`);
    }

    // Commit batch
    console.log("\n⏳ Writing to Firestore...");
    await batch.commit();

    console.log("\n🎉 Successfully seeded Firestore!");
    console.log(`\n📊 Summary:`);
    console.log(`   Total products added: ${addedProducts.length}`);
    console.log(`   Collection: products`);
    console.log(`   Status: All products set to "active"`);

    console.log("\n✨ Next steps:");
    console.log("   1. Visit http://localhost:3000/products to see products");
    console.log("   2. Test filtering and search");
    console.log("   3. Check Firebase Console > Firestore > products collection");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding products:", error.message);
    if (error.code === "ENOENT") {
      console.error("\n📝 Make sure 'firebase-adminsdk.json' exists in project root");
    }
    process.exit(1);
  }
}

// Run seeding
seedProducts();
