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

    const type = formData.get("type") as string || "products";
    const folder = `bismillah-accessories/${type}`;

    console.log(`[Cloudinary upload] Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}, target: ${folder}`);

    const bytes = Buffer.from(await file.arrayBuffer());
    console.log(`[Cloudinary upload] File converted to buffer, size: ${bytes.length} bytes`);

    const uploadResult = await uploadToCloudinary(bytes, file.type, folder);
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

function uploadToCloudinary(file: Buffer, mimeType: string, folder: string) {
  const cloudinary = getCloudinaryClient();
  const timestamp = Math.floor(Date.now() / 1000);
  
  console.log(`[Cloudinary upload] Starting stream upload. Folder: ${folder}, TS: ${timestamp}`);

  return new Promise<{
    secure_url: string;
    public_id: string;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "image",
        timestamp: timestamp,
      },
      (error, result) => {
        if (error) {
          console.error("[Cloudinary upload] SDK Error Object:", JSON.stringify(error, null, 2));
          reject(new Error(error.message || "Cloudinary upload failed"));
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary returned no result."));
          return;
        }

        console.log(`[Cloudinary upload] Success: ${result.public_id}`);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(file);
  });
}
