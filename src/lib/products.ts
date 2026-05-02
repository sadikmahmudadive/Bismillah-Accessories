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
  // Use Admin SDK on the server to avoid importing client Firestore during SSR
  if (typeof window === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getFirestoreDb } = require("@/lib/firebase/admin");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { collection, query, where, getDocs } = require("firebase-admin/firestore");
    const db = getFirestoreDb();
    const snap = await getDocs(query(collection(db, PRODUCTS_COLLECTION), where("status", "==", "active")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name));
  }

  const database = getFirestoreDb();
  // Lazy import client functions to keep client bundles small
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { collection, getDocs, query, where } = require("firebase/firestore");
  const snapshot = await getDocs(query(collection(database, PRODUCTS_COLLECTION), where("status", "==", "active")));

  return snapshot.docs.map(mapProductDoc).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAdminProducts() {
  if (typeof window === "undefined") {
    const { getFirestoreDb } = require("@/lib/firebase/admin");
    const { collection, getDocs } = require("firebase-admin/firestore");
    const db = getFirestoreDb();
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name));
  }

  const database = getFirestoreDb();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { collection, getDocs } = require("firebase/firestore");
  const snapshot = await getDocs(collection(database, PRODUCTS_COLLECTION));

  return snapshot.docs.map(mapProductDoc).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProductBySlug(slug: string) {
  if (typeof window === "undefined") {
    const { getFirestoreDb } = require("@/lib/firebase/admin");
    const { collection, query, where, getDocs } = require("firebase-admin/firestore");
    const db = getFirestoreDb();
    const snap = await getDocs(query(collection(db, PRODUCTS_COLLECTION), where("slug", "==", slug)));
    const doc = snap.docs[0];
    return doc ? { id: doc.id, ...doc.data() } : null;
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
    ...snapshot.data(),
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
