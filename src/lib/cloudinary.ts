import { v2 as cloudinary, type ConfigOptions } from "cloudinary";

let configured = false;

function getCloudinaryConfig(): ConfigOptions {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  const missingKeys = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`Missing Cloudinary environment values: ${missingKeys.join(", ")}`);
  }

  return config;
}

export function getCloudinaryClient() {
  if (!configured) {
    cloudinary.config(getCloudinaryConfig());
    configured = true;
  }

  return cloudinary;
}
