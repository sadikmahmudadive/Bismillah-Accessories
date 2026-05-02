import { NextResponse } from "next/server";

import { getCloudinaryClient } from "@/lib/cloudinary";
import { getFirebaseAuth } from "@/lib/firebase/server-auth";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    console.log("[Cloudinary upload] Starting upload request");

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      console.log("[Cloudinary upload] Missing auth token");
      return NextResponse.json(
        { error: "Missing Firebase ID token." },
        { status: 401 },
      );
    }

    // Simplified authentication - just verify the token is valid
    console.log("[Cloudinary upload] Verifying token");
    const auth = getFirebaseAuth();
    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log(`[Cloudinary upload] Token verified for user: ${decodedToken.uid}`);
    } catch (authError) {
      console.log("[Cloudinary upload] Token verification failed:", authError);
      return NextResponse.json(
        { error: "Invalid authentication token." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are supported." },
        { status: 400 },
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image must be smaller than 5MB." },
        { status: 400 },
      );
    }

    console.log(`[Cloudinary upload] Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    const bytes = Buffer.from(await file.arrayBuffer());
    console.log(`[Cloudinary upload] File converted to buffer, size: ${bytes.length} bytes`);

    const uploadResult = await uploadToCloudinary(bytes, file.type);
    console.log(`[Cloudinary upload] Upload successful: ${uploadResult.secure_url}`);

    return NextResponse.json({
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Cloudinary upload failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function uploadToCloudinary(file: Buffer, mimeType: string) {
  console.log("[Cloudinary upload] Getting Cloudinary client");

  try {
    const cloudinary = getCloudinaryClient();
    console.log("[Cloudinary upload] Cloudinary client obtained");

    // Use the simpler upload method with data URI
    console.log("[Cloudinary upload] Starting upload with data URI");

    // Create data URI with correct mime type
    const dataUri = `data:${mimeType};base64,${file.toString('base64')}`;

    return new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        {
          folder: "bismillah-accessories/products",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            console.error("[Cloudinary upload] Upload error:", error);
            reject(error);
            return;
          }

          if (!result) {
            console.error("[Cloudinary upload] No result returned");
            reject(new Error("Cloudinary returned no upload result."));
            return;
          }

          console.log(`[Cloudinary upload] Upload completed: ${result.public_id}`);
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );
    });
  } catch (configError) {
    console.error("[Cloudinary upload] Config error:", configError);
    throw configError;
  }
}
