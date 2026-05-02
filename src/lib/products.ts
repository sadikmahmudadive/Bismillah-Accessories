import { getFirestoreDb } from "@/lib/firebase/client";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import type { Product, ProductInput } from "@/types/domain";

const PRODUCTS_COLLECTION = "products";

export const productCategories = [
  "Phone Case",
  "Charging",
  "Protection",
  "Audio",
  "Watch",
  "Storage",
] as const;

export function createProductSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function mapProductDoc(snapshot: QueryDocumentSnapshot<DocumentData>) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Product;
}

export async function getActiveProducts() {
  // Use the API route for consistency and to avoid admin SDK issues
  if (typeof window === "undefined") {
    try {
      console.log("🏭 Server-side: Fetching products via API");
      // On server side, we can use fetch to call our own API
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/products?status=active&limit=100`, {
        headers: {
          // For server-side calls, we might need to handle auth differently
          // For now, let's try without auth and see if it works
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.warn(`Server-side API call failed: ${response.status}`);
        return []; // Return empty array instead of failing
      }

      const data = await response.json();
      if (data.success && data.data) {
        return data.data.sort((a: any, b: any) => a.name.localeCompare(b.name));
      }

      return [];
    } catch (error) {
      console.warn("Server-side product fetch failed, returning empty array:", error);
      return []; // Return empty array to prevent SSR crashes
    }
  }

  // Client-side: use the API route
  console.log("🖥️ Client-side: Fetching products via API");
  const response = await fetch('/api/products?status=active&limit=100');

  if (!response.ok) {
    console.warn(`Client-side API call failed: ${response.status}`);
    return [];
  }

  const data = await response.json();
  if (data.success && data.data) {
    return data.data.sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  return [];
}

export async function getAdminProducts() {
  if (typeof window === "undefined") {
    const { getFirestoreDb } = require("@/lib/firebase/admin");
    const { collection, getDocs } = require("firebase-admin/firestore");
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    return snap.docs.map((d: any) => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  const database = getFirestoreDb();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { collection, getDocs } = require("firebase/firestore");
  const snapshot = await getDocs(collection(database, PRODUCTS_COLLECTION));

  return snapshot.docs.map(mapProductDoc).sort((a: any, b: any) => a.name.localeCompare(b.name));
}

export async function getProductBySlug(slug: string) {
  if (typeof window === "undefined") {
    const { getFirestoreDb } = require("@/lib/firebase/admin");
    const { collection, query, where, getDocs } = require("firebase-admin/firestore");
    const db = getFirestoreDb();
    const snap = await getDocs(query(collection(db, PRODUCTS_COLLECTION), where("slug", "==", slug)));
    const doc = snap.docs[0];
    return doc ? { id: doc.id, ...(doc.data() as any) } : null;
  }

  const database = getFirestoreDb();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { collection, query, where, getDocs } = require("firebase/firestore");
  const snapshot = await getDocs(query(collection(database, PRODUCTS_COLLECTION), where("slug", "==", slug)));

  const product = snapshot.docs.at(0);
  return product ? mapProductDoc(product) : null;
}

export async function getProductById(id: string) {
  if (typeof window === "undefined") {
    const { getFirestoreDb } = require("@/lib/firebase/admin");
    const { doc, getDoc } = require("firebase-admin/firestore");
    const db = getFirestoreDb();
    const snapshot = await getDoc(doc(db, PRODUCTS_COLLECTION, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Product;
  }

  const database = getFirestoreDb();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { doc, getDoc } = require("firebase/firestore");
    const snapshot = await getDoc(doc(database, PRODUCTS_COLLECTION, id));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as any),
  } as Product;
}

export async function createProduct(input: ProductInput) {
  const database = getFirestoreDb();
  const slug = createProductSlug(input.name);

  // Lazy import client Firestore helpers to avoid bundling on server
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { addDoc, collection, serverTimestamp } = require("firebase/firestore");
  await addDoc(collection(database, PRODUCTS_COLLECTION), {
    ...input,
    slug,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateProduct(id: string, input: ProductInput) {
  const database = getFirestoreDb();
  const slug = createProductSlug(input.name);

  // Lazy import client Firestore helpers
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { updateDoc, doc, serverTimestamp } = require("firebase/firestore");
  await updateDoc(doc(database, PRODUCTS_COLLECTION, id), {
    ...input,
    slug,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string) {
  const database = getFirestoreDb();
  // Lazy import client Firestore helpers
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { deleteDoc, doc } = require("firebase/firestore");
  await deleteDoc(doc(database, PRODUCTS_COLLECTION, id));
}
