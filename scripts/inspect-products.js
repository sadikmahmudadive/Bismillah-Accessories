import { readFileSync } from "fs";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
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

async function inspectProducts() {
  console.log("🔍 Inspecting products in Firestore...");

  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Sign in
    const adminEmail = process.env.ADMIN_EMAIL || "admin@bismillah.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log(`✅ Signed in as: ${userCredential.user.email}`);

    // Get products
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    console.log(`📊 Found ${snapshot.size} products:`);
    console.log("═".repeat(50));

    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ID: ${doc.id}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Status: ${data.status || 'undefined'}`);
      console.log(`   Category: ${data.category || 'undefined'}`);
      console.log(`   Price: ${data.price || 'undefined'}`);
      console.log("   ─".repeat(30));
    });

  } catch (error) {
    console.error("❌ Error inspecting products:", error);
  }
}

inspectProducts().then(() => process.exit(0));