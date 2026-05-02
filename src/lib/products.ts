import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { getFirestoreDb } from "@/lib/firebase/client";
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
  const database = getFirestoreDb();
  const snapshot = await getDocs(
    query(
      collection(database, PRODUCTS_COLLECTION),
      where("status", "==", "active"),
    ),
  );

  return snapshot.docs
    .map(mapProductDoc)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAdminProducts() {
  const database = getFirestoreDb();
  const snapshot = await getDocs(collection(database, PRODUCTS_COLLECTION));

  return snapshot.docs
    .map(mapProductDoc)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProductBySlug(slug: string) {
  const database = getFirestoreDb();
  const snapshot = await getDocs(
    query(collection(database, PRODUCTS_COLLECTION), where("slug", "==", slug)),
  );

  const product = snapshot.docs.at(0);
  return product ? mapProductDoc(product) : null;
}

export async function getProductById(id: string) {
  const database = getFirestoreDb();
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

  await updateDoc(doc(database, PRODUCTS_COLLECTION, id), {
    ...input,
    slug,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string) {
  const database = getFirestoreDb();
  await deleteDoc(doc(database, PRODUCTS_COLLECTION, id));
}
