import { readFileSync } from "fs";
import { initializeApp } from "firebase/app";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

// Load environment variables
function loadEnv() {
  try {
    const envContent = readFileSync(".env.local", "utf8");
    const envVars = {};

    envContent.split("\n").forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
        }
      }
    });

    Object.assign(process.env, envVars);
  } catch (error) {
    console.log("❌ Failed to load .env.local:", error.message);
  }
}

loadEnv();

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function testPublicRead() {
  console.log("🧪 Testing public read access to Firestore (no authentication)...");

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log("✅ Firebase initialized (no auth)");

    // Try to read products without authentication
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("status", "==", "active"), limit(5));

    console.log("📖 Attempting to read active products...");
    const snapshot = await getDocs(q);

    console.log(`✅ Successfully read ${snapshot.size} products without authentication`);

    if (snapshot.size > 0) {
      console.log("📦 Sample product:");
      const firstDoc = snapshot.docs[0];
      console.log(`   ID: ${firstDoc.id}`);
      console.log(`   Name: ${firstDoc.data().name}`);
      console.log(`   Status: ${firstDoc.data().status}`);
    }

  } catch (error) {
    console.error("❌ Public read failed:", error.message);

    if (error.message.includes("permission-denied")) {
      console.log("\n🔒 PERMISSION DENIED!");
      console.log("The Firestore rules are not allowing public reads.");
      console.log("Please double-check that the rules were published correctly:");
      console.log("1. Go to Firebase Console > Firestore Database > Rules");
      console.log("2. Ensure the rules include: allow read: if resource.data.status == 'active';");
      console.log("3. Click 'Publish'");
    }

    if (error.message.includes("unavailable") || error.message.includes("network")) {
      console.log("\n🌐 NETWORK ISSUE!");
      console.log("Check your internet connection and Firebase project status.");
    }
  }
}

testPublicRead().then(() => process.exit(0));