/**
 * Thin wrapper that returns a Firebase Admin Auth instance.
 * Keeps the order API clean — import just what you need.
 */
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirebaseAdminApp } from "@/lib/firebase/admin";

let _auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseAdminApp());
  }
  return _auth;
}
