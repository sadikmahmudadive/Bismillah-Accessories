import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCcnOpjh4E0eIUz0VJzGYTHKz87on8CLOs",
  authDomain: "bismillah-accessories.firebaseapp.com",
  projectId: "bismillah-accessories",
  storageBucket: "bismillah-accessories.firebasestorage.app",
  messagingSenderId: "475973759005",
  appId: "1:475973759005:web:d532fe87626a75a71c56f4",
};

async function testImageUpload() {
  console.log("🧪 Testing Image Upload to Cloudinary...");

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // Sign in
    console.log("🔐 Signing in as admin...");
    await signInWithEmailAndPassword(auth, "admin@bismillah.com", "admin123");
    console.log("✅ Signed in");

    // Get auth token
    const user = auth.currentUser;
    if (!user) throw new Error("No user");

    const token = await user.getIdToken();
    console.log("✅ Got auth token");

    // Create a simple test image (1x1 pixel PNG in base64)
    const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');

    console.log("📸 Preparing test image upload...");

    // Create form data
    const formData = new FormData();
    const blob = new Blob([testImageBuffer], { type: 'image/png' });
    formData.append('file', blob, 'test-image.png');

    // Upload to Cloudinary API
    console.log("☁️ Uploading to Cloudinary...");
    const response = await fetch("http://localhost:3000/api/cloudinary/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log("📡 Response status:", response.status);

    const result = await response.json();
    console.log("📡 Response:", result);

    if (response.ok && result.imageUrl) {
      console.log("🎉 Cloudinary upload successful!");
      console.log("🖼️ Image URL:", result.imageUrl);
      console.log("🆔 Public ID:", result.publicId);
    } else {
      console.log("❌ Cloudinary upload failed");
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testImageUpload().then(() => process.exit(0));