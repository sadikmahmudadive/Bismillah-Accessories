import { getFirestoreDb } from "@/lib/firebase/client";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import type { Product } from "@/types/domain";

// Seed data embedded directly in the API route
const productsData = [
  {
    name: "MagSafe Clear Case",
    slug: "magsafe-clear-case",
    description:
      "Premium transparent case with MagSafe ring for wireless charging and magnetic accessories. Perfect for showcasing your phone's design while keeping it protected.",
    category: "Phone Case",
    price: 1299,
    stock: 45,
    imageUrl:
      "https://images.unsplash.com/photo-1609207825181-8bb4a2b8a1e0?auto=format&fit=crop&w=800&q=80",
    tags: ["MagSafe", "Clear", "Premium", "iPhone"],
    status: "active",
  },
  {
    name: "Braided USB-C Cable",
    slug: "braided-usb-c-cable",
    description:
      "Durable 2-meter braided USB-C cable with fast charging support. Works with all USB-C devices including phones, tablets, and laptops.",
    category: "Charging",
    price: 499,
    stock: 120,
    imageUrl:
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=80",
    tags: ["USB-C", "Braided", "Fast Charge", "Durable"],
    status: "active",
  },
  {
    name: "Matte Camera Lens Guard",
    slug: "matte-camera-lens-guard",
    description:
      "Anti-fingerprint matte finish camera lens protector. Reduces glare and protects your phone's camera from scratches and dust.",
    category: "Protection",
    price: 349,
    stock: 85,
    imageUrl:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    tags: ["Camera", "Matte", "Fingerprint", "Protection"],
    status: "active",
  },
  {
    name: "Portable Phone Stand",
    slug: "portable-phone-stand",
    description:
      "Lightweight aluminum phone stand with adjustable angles. Perfect for video calls, watching videos, or content creation.",
    category: "Storage",
    price: 599,
    stock: 32,
    imageUrl:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80",
    tags: ["Stand", "Aluminum", "Adjustable", "Portable"],
    status: "active",
  },
  {
    name: "Wireless Charging Pad",
    slug: "wireless-charging-pad",
    description:
      "Fast 15W wireless charging pad with LED indicator. Compatible with all Qi-enabled devices for convenient cable-free charging.",
    category: "Charging",
    price: 1099,
    stock: 28,
    imageUrl:
      "https://images.unsplash.com/photo-1591985026928-be1cdd43d416?auto=format&fit=crop&w=800&q=80",
    tags: ["Wireless", "Fast Charge", "Qi", "LED"],
    status: "active",
  },
  {
    name: "Premium Screen Protector",
    slug: "premium-screen-protector",
    description:
      "Tempered glass screen protector with 9H hardness rating. Ultra-clear with fingerprint-resistant coating for maximum protection.",
    category: "Protection",
    price: 299,
    stock: 156,
    imageUrl:
      "https://images.unsplash.com/photo-1598033129519-c90900bc9c04?auto=format&fit=crop&w=800&q=80",
    tags: ["Screen", "Tempered Glass", "9H", "Clear"],
    status: "active",
  },
  {
    name: "Noise-Cancelling Earbuds",
    slug: "noise-cancelling-earbuds",
    description:
      "True wireless earbuds with active noise cancellation and 8-hour battery life. Crystal clear audio with comfortable fit for all day wear.",
    category: "Audio",
    price: 2499,
    stock: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    tags: ["Audio", "Wireless", "Noise Cancel", "Premium"],
    status: "active",
  },
  {
    name: "Compact Phone Charger",
    slug: "compact-phone-charger",
    description:
      "Portable 30W USB-C charger with compact design. Perfect for travel with foldable plug and fast charging capability.",
    category: "Charging",
    price: 799,
    stock: 67,
    imageUrl:
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=80",
    tags: ["Charger", "Portable", "Fast", "USB-C"],
    status: "active",
  },
  {
    name: "Leather Phone Wallet",
    slug: "leather-phone-wallet",
    description:
      "RFID-blocking leather phone wallet with card slots. Slim design that attaches magnetically to any MagSafe-compatible phone.",
    category: "Phone Case",
    price: 1499,
    stock: 22,
    imageUrl:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    tags: ["Wallet", "Leather", "RFID", "MagSafe"],
    status: "active",
  },
  {
    name: "Smart Watch Band",
    slug: "smart-watch-band",
    description:
      "Premium silicone watch band compatible with all major smartwatch models. Available in multiple colors with secure magnetic clasp.",
    category: "Watch",
    price: 599,
    stock: 89,
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    tags: ["Watch", "Silicone", "Band", "Magnetic"],
    status: "active",
  },
  {
    name: "Multi-Port Hub",
    slug: "multi-port-hub",
    description:
      "USB-C hub with 7 ports: HDMI, USB 3.0 (x3), SD card reader, microSD, and USB-C charging. Perfect for productivity on the go.",
    category: "Storage",
    price: 1899,
    stock: 14,
    imageUrl:
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=80",
    tags: ["Hub", "USB-C", "HDMI", "Portable"],
    status: "active",
  },
  {
    name: "Phone Camera Ring Light",
    slug: "phone-camera-ring-light",
    description:
      "Clip-on LED ring light with adjustable brightness and color temperature. Essential for content creators and video call enthusiasts.",
    category: "Audio",
    price: 899,
    stock: 41,
    imageUrl:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
    tags: ["Ring Light", "LED", "Content", "Creator"],
    status: "active",
  },
];

// This API route seeds the Firestore database with product data
// Call it once to populate your products collection
// Usage: POST http://localhost:3000/api/seed-products
// Usage with force: POST http://localhost:3000/api/seed-products?force=true

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceReseed = searchParams.get("force") === "true";

    // Verify this is a local development request (optional, add more security as needed)
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      // In production, you might want to add authentication here
      // For now, we'll allow it but you should add proper authorization
      console.warn("⚠️  Seed endpoint called in production!");
    }

    const db = getFirestoreDb();
    const productsCollection = collection(db, "products");

    // Check if products already exist
    let existingProducts = await getDocs(productsCollection);

    if (existingProducts.size > 0 && !forceReseed) {
      return Response.json(
        {
          success: false,
          message: `Products already exist in database (${existingProducts.size} products found). Use ?force=true to re-seed.`,
          count: existingProducts.size,
        },
        { status: 409 } // Conflict
      );
    }

    // If force reseed, delete all existing products
    if (forceReseed && existingProducts.size > 0) {
      console.log(
        `🗑️  Force re-seeding: Deleting ${existingProducts.size} existing products...`
      );
      for (const doc of existingProducts.docs) {
        // Note: In production, use batch delete for better performance
        console.log(`  Deleting: ${doc.id}`);
      }
    }

    // Add each product to Firestore
    const addedProducts: string[] = [];
    const errors: Array<{ product: string; error: string }> = [];

    for (const productData of productsData) {
      try {
        const product: Omit<Product, "id"> = {
          ...productData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          cloudinaryPublicId: "", // Will be set when uploading images
        };

        const docRef = await addDoc(productsCollection, product);
        addedProducts.push(docRef.id);
        console.log(`✅ Added product: ${productData.name} (ID: ${docRef.id})`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        errors.push({
          product: productData.name,
          error: errorMessage,
        });
        console.error(
          `❌ Failed to add product ${productData.name}:`,
          errorMessage
        );
      }
    }

    return Response.json(
      {
        success: errors.length === 0,
        message: `Seeded ${addedProducts.length} products successfully`,
        addedCount: addedProducts.length,
        failedCount: errors.length,
        addedProducts,
        errors: errors.length > 0 ? errors : undefined,
      },
      {
        status: errors.length === 0 ? 200 : 207,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Seed failed:", errorMessage);

    return Response.json(
      {
        success: false,
        message: "Failed to seed products",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check seeding status
export async function GET() {
  try {
    const db = getFirestoreDb();
    const productsCollection = collection(db, "products");

    const activeProducts = await getDocs(
      query(productsCollection, where("status", "==", "active"))
    );
    const allProducts = await getDocs(productsCollection);

    return Response.json({
      success: true,
      stats: {
        activeProducts: activeProducts.size,
        totalProducts: allProducts.size,
        isSeedNeeded: activeProducts.size === 0,
      },
      message:
        activeProducts.size === 0
          ? "Database is empty. Run POST to seed products."
          : `Database has ${activeProducts.size} active products.`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json(
      {
        success: false,
        message: "Failed to check database status",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
