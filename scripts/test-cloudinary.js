import { readFileSync } from "fs";
import { getCloudinaryClient } from "../src/lib/cloudinary";

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

async function testCloudinaryConfig() {
  console.log("🧪 Testing Cloudinary Configuration...");

  try {
    console.log("🔧 Getting Cloudinary client...");
    const cloudinary = getCloudinaryClient();
    console.log("✅ Cloudinary client initialized");

    console.log("📊 Cloudinary config:");
    console.log("- Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("- API key present:", !!process.env.CLOUDINARY_API_KEY);
    console.log("- API secret present:", !!process.env.CLOUDINARY_API_SECRET);
    console.log("- Upload preset:", process.env.CLOUDINARY_UPLOAD_PRESET);

    // Test basic Cloudinary API call
    console.log("📡 Testing Cloudinary ping...");
    const pingResult = await cloudinary.api.ping();
    console.log("✅ Cloudinary API ping successful:", pingResult);

    console.log("\n🎉 Cloudinary configuration is working!");
    console.log("✅ Ready for image uploads");

  } catch (error) {
    console.error("❌ Cloudinary test failed:", error.message);

    if (error.message.includes("Invalid credentials")) {
      console.log("\n🔑 CREDENTIALS ISSUE:");
      console.log("- Check CLOUDINARY_CLOUD_NAME");
      console.log("- Check CLOUDINARY_API_KEY");
      console.log("- Check CLOUDINARY_API_SECRET");
      console.log("- Verify credentials in Cloudinary Dashboard");
    }

    if (error.message.includes("network")) {
      console.log("\n🌐 NETWORK ISSUE:");
      console.log("- Check internet connection");
      console.log("- Verify Cloudinary service status");
    }
  }
}

testCloudinaryConfig().then(() => process.exit(0));