import { NextResponse } from "next/server";

import { getCloudinaryClient } from "@/lib/cloudinary";
import { verifyAdminIdToken } from "@/lib/firebase/admin";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      return NextResponse.json(
        { error: "Missing Firebase ID token." },
        { status: 401 },
      );
    }

    await verifyAdminIdToken(token);

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

    const bytes = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadToCloudinary(bytes);

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

function uploadToCloudinary(file: Buffer) {
  const cloudinary = getCloudinaryClient();

  return new Promise<{
    secure_url: string;
    public_id: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "bismillah-accessories/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary returned no upload result."));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    stream.end(file);
  });
}
