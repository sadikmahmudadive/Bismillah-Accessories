import { readFileSync } from "fs";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envContent = readFileSync(".env.local", "utf8");
    const envVars = {};

    envContent.split("\n").forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join("=").replace(/^["']|["']$/g, ""); // Remove quotes
        }
      }
    });

    // Set them on process.env
    Object.assign(process.env, envVars);
    console.log("✅ Environment variables loaded");
  } catch (error) {
    console.log("❌ Failed to load .env.local:", error.message);
  }
}

loadEnv();

// Firebase config - using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("🔧 Firebase Config loaded:");
console.log("- Project ID:", firebaseConfig.projectId);
console.log("- API Key present:", !!firebaseConfig.apiKey);

async function testFirestoreCRUD() {
  console.log("🧪 Testing Firestore CRUD operations...");

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log("✅ Firebase initialized");

    // Sign in
    const adminEmail = process.env.ADMIN_EMAIL || "admin@bismillah.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    console.log(`🔐 Signing in as: ${adminEmail}`);
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    console.log(`✅ Signed in as: ${user.email} (${user.uid})`);

    // Test 1: Read products collection
    console.log("📖 Testing READ operations...");
    try {
      const productsRef = collection(db, "products");
      const productsSnapshot = await getDocs(productsRef);
      console.log(`✅ Successfully read ${productsSnapshot.size} products`);
    } catch (readError) {
      console.log("❌ READ failed:", readError.message);
    }

    // Test 2: Create a test product
    console.log("📝 Testing CREATE operations...");
    try {
      const testProduct = {
        name: "Test Product - " + Date.now(),
        description: "This is a test product created by diagnostic script",
        price: 99.99,
        stock: 10,
        imageUrl: "https://via.placeholder.com/300",
        category: "test",
        tags: ["test"],
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "products"), testProduct);
      console.log(`✅ Successfully created product with ID: ${docRef.id}`);

      // Test 3: Read the created product
      console.log("📖 Testing READ single document...");
      const createdDoc = await getDoc(doc(db, "products", docRef.id));
      if (createdDoc.exists()) {
        console.log("✅ Successfully read created product");
      }

      // Test 4: Update the product
      console.log("📝 Testing UPDATE operations...");
      await updateDoc(doc(db, "products", docRef.id), {
        description: "Updated test product description",
        updatedAt: new Date(),
      });
      console.log("✅ Successfully updated product");

      // Test 5: Delete the product
      console.log("🗑️ Testing DELETE operations...");
      await deleteDoc(doc(db, "products", docRef.id));
      console.log("✅ Successfully deleted product");

    } catch (crudError) {
      console.log("❌ CRUD operations failed:", crudError.message);

      if (crudError.message.includes("permission-denied")) {
        console.log("\n🔒 PERMISSION ISSUE DETECTED!");
        console.log("This means your Firestore security rules are blocking operations.");
        console.log("\nTo fix:");
        console.log("1. Go to Firebase Console > Firestore Database > Rules");
        console.log("2. Update rules to allow authenticated users:");
        console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users during development
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
        `);
      }

      if (crudError.message.includes("not-found")) {
        console.log("\n📁 DATABASE NOT FOUND!");
        console.log("Firestore database doesn't exist.");
        console.log("\nTo fix:");
        console.log("1. Go to Firebase Console > Firestore Database");
        console.log("2. Click 'Create database'");
        console.log("3. Choose 'Start in test mode' for development");
      }
    }

    console.log("\n🎯 CRUD Test completed");

  } catch (error) {
    console.error("❌ Test setup failed:", error);
  }
}

// Run the test
testFirestoreCRUD().then(() => process.exit(0));