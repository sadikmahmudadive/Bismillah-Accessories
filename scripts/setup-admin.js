import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { readFileSync } from "fs";

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

async function setupAdminUser() {
  console.log("🔧 Setting up admin user for Bismillah Accessories...");

  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log("✅ Firebase initialized");

    // Step 1: Create admin user
    const adminEmail = "admin@bismillah.com";
    const adminPassword = "admin123";

    console.log(`👤 Creating admin user: ${adminEmail}`);

    try {
      // Try to create the user
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log(`✅ Admin user created: ${userCredential.user.email} (${userCredential.user.uid})`);
    } catch (createError) {
      if (createError.code === 'auth/email-already-in-use') {
        console.log("ℹ️ Admin user already exists, signing in...");
        // User exists, try to sign in
        const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log(`✅ Signed in as existing admin: ${userCredential.user.email} (${userCredential.user.uid})`);
      } else {
        throw createError;
      }
    }

    // Get current user
    const user = auth.currentUser;
    if (!user) throw new Error("No user signed in");

    // Step 2: Set admin role in Firestore
    console.log("📝 Setting admin role in Firestore...");

    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      email: user.email,
      displayName: "Admin",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("✅ Admin role set in Firestore");

    // Step 3: Test Firestore permissions
    console.log("🧪 Testing Firestore permissions...");

    try {
      // Try to read from products collection
      const { collection, getDocs } = await import("firebase/firestore");
      const productsRef = collection(db, "products");
      const snapshot = await getDocs(productsRef);
      console.log(`✅ Firestore read permissions OK (found ${snapshot.size} products)`);
    } catch (firestoreError) {
      console.log("⚠️ Firestore permissions issue:", firestoreError.message);
      console.log("This might be due to security rules. Check Firebase Console > Firestore > Rules");
    }

    await signOut(auth);
    console.log("👋 Signed out");

    console.log("\n🎉 Admin setup complete!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("\n🔐 You can now sign in to /admin and perform CRUD operations");

  } catch (error) {
    console.error("❌ Admin setup failed:", error);

    if (error.code === 'auth/invalid-api-key') {
      console.log("\n🔑 API Key Issue:");
      console.log("- Check your .env.local file");
      console.log("- Ensure NEXT_PUBLIC_FIREBASE_API_KEY is correct");
      console.log("- Verify project exists in Firebase Console");
    }

    if (error.code === 'permission-denied') {
      console.log("\n🔒 Firestore Permissions Issue:");
      console.log("- Go to Firebase Console > Firestore Database > Rules");
      console.log("- Update rules to allow authenticated users:");
      console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
      `);
    }
  }
}

// Run setup
setupAdminUser().then(() => process.exit(0));