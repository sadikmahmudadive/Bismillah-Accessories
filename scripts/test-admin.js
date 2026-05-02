import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
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

async function testAdminSetup() {
  console.log("🔍 Testing admin setup...");

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    // Test 1: Check Firebase connection
    console.log("📡 Testing Firebase connection...");
    const testCollection = collection(db, "test");
    await getDocs(testCollection);
    console.log("✅ Firebase connection successful");

    // Test 2: Try to sign in as admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "password123";

    console.log(`👤 Attempting to sign in as admin: ${adminEmail}`);
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    console.log(`✅ Signed in as: ${user.email} (${user.uid})`);

    // Test 3: Check user profile
    console.log("📋 Checking user profile...");
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const profile = userDoc.data();
      console.log("📄 User profile exists:", profile);

      if (profile.role === "admin") {
        console.log("✅ User has admin role");
      } else {
        console.log("❌ User does not have admin role, setting it...");
        await setDoc(doc(db, "users", user.uid), {
          ...profile,
          role: "admin",
          updatedAt: new Date()
        });
        console.log("✅ Admin role set");
      }
    } else {
      console.log("📝 User profile does not exist, creating admin profile...");
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0] || "Admin",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("✅ Admin profile created");
    }

    // Test 4: Test admin API
    console.log("🔧 Testing admin API...");
    const idToken = await user.getIdToken();

    const response = await fetch("http://localhost:3000/api/test-admin", {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });

    const result = await response.json();
    console.log("API test result:", result);

    if (result.success) {
      console.log("✅ Admin API working correctly");
    } else {
      console.log("❌ Admin API failed:", result.error);
    }

    // Test 5: Test products collection access
    console.log("📦 Testing products collection access...");
    const productsCollection = collection(db, "products");
    const productsSnapshot = await getDocs(productsCollection);
    console.log(`✅ Products collection accessible, found ${productsSnapshot.size} products`);

    await signOut(auth);
    console.log("🔚 Test completed");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testAdminSetup().then(() => process.exit(0));