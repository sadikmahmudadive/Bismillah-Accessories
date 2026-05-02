import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

// Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function setupAdminUser() {
  console.log("🔧 Setting up admin user...");

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Try to sign in as admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@bismillah.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    console.log(`👤 Attempting to sign in as admin: ${adminEmail}`);
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    console.log(`✅ Signed in as: ${user.email} (${user.uid})`);

    // Try to create/update admin profile
    console.log("📝 Setting up admin profile...");
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      email: user.email,
      displayName: user.displayName || "Admin",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("✅ Admin profile created/updated");
    console.log("🔑 Admin setup complete!");
    console.log(`Admin email: ${adminEmail}`);
    console.log(`Admin UID: ${user.uid}`);

    await signOut(auth);
    console.log("👋 Signed out");

  } catch (error) {
    console.error("❌ Admin setup failed:", error);
    console.log("\n🔍 Troubleshooting:");
    console.log("1. Make sure Firebase Authentication is enabled");
    console.log("2. Create an admin user manually in Firebase Console");
    console.log("3. Or sign up through the app and manually set admin role");
    console.log("4. Check Firebase Console > Firestore Database is created");
    console.log("5. Ensure service account has proper permissions");
  }
}

// Run if this script is executed directly
if (require.main === module) {
  setupAdminUser().then(() => process.exit(0));
}

export { setupAdminUser };