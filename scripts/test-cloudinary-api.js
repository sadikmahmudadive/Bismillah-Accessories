// Simple test to check Cloudinary API route
async function testCloudinaryAPI() {
  console.log("🧪 Testing Cloudinary API Route...");

  try {
    console.log("🔐 Testing without auth first...");
    const response = await fetch("http://localhost:3000/api/cloudinary/upload", {
      method: "POST",
    });

    console.log("Response status:", response.status);
    const result = await response.json();
    console.log("Response:", result);

  } catch (error) {
    console.error("❌ API test failed:", error);
  }
}

testCloudinaryAPI().then(() => process.exit(0));