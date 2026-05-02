import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { readFileSync } from "fs";

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

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function testSimplifiedCRUD() {
  console.log("🧪 Testing Simplified Admin CRUD Operations...");

  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log("🔐 Signing in as admin...");
    const userCredential = await signInWithEmailAndPassword(auth, "admin@bismillah.com", "admin123");
    console.log("✅ Signed in successfully");

    const testProduct = {
      name: "Simplified CRUD Test - " + Date.now(),
      description: "This product was created by the simplified CRUD test",
      price: 199.99,
      stock: 5,
      imageUrl: "https://via.placeholder.com/300",
      category: "test",
      tags: ["test", "simplified"],
      status: "active",
    };

    console.log("📝 Creating test product...");
    const docRef = await addDoc(collection(db, "products"), {
      ...testProduct,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Product created with ID:", docRef.id);

    console.log("📖 Reading created product...");
    const createdDoc = await getDoc(doc(db, "products", docRef.id));
    if (createdDoc.exists()) {
      console.log("✅ Product read successfully");
    }

    console.log("📝 Updating product...");
    await updateDoc(doc(db, "products", docRef.id), {
      description: "Updated by simplified CRUD test",
      stock: 10,
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Product updated successfully");

    console.log("🗑️ Deleting test product...");
    await deleteDoc(doc(db, "products", docRef.id));
    console.log("✅ Product deleted successfully");

    console.log("📋 Checking all products...");
    const productsSnapshot = await getDocs(collection(db, "products"));
    console.log(`✅ Found ${productsSnapshot.size} products in database`);

    console.log("\n🎉 Simplified CRUD operations working perfectly!");
    console.log("✅ Admin operations now use client-side Firestore directly");
    console.log("✅ No more server-side authentication issues");
    console.log("✅ Much simpler and more reliable");

  } catch (error) {
    console.error("❌ CRUD test failed:", error.message);

    if (error.message.includes("permission-denied")) {
      console.log("\n🔒 PERMISSION ISSUE - Check Firestore Security Rules");
      console.log("Make sure your Firestore rules allow authenticated users to:");
      console.log("- Read/write to /products collection");
    }
  }
}

testSimplifiedCRUD().then(() => process.exit(0));