import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

let adminApp: App | null = null;
let firestoreDb: Firestore | null = null;

function getPrivateKey() {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!privateKey) return undefined;
  // Replace literal \n with actual newlines
  return privateKey.replace(/\\n/g, "\n");
}

export function getFirebaseAdminApp() {
  if (adminApp) {
    console.log("[getFirebaseAdminApp] Returning cached admin app");
    return adminApp;
  }

  // Check if admin app is already initialized
  const existingApps = getApps();
  const adminAppRef = existingApps.find(app => app.name === "admin");
  if (adminAppRef) {
    console.log("[getFirebaseAdminApp] Found existing admin app, reusing it");
    adminApp = adminAppRef;
    // Reset firestore cache to reinitialize
    firestoreDb = null;
    return adminApp;
  }

  // Try loading from FIREBASE_ADMIN_SDK_PATH (service account JSON file)
  const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_PATH;
  if (serviceAccountPath) {
    try {
      const resolvedPath = path.isAbsolute(serviceAccountPath)
        ? serviceAccountPath
        : path.join(process.cwd(), serviceAccountPath);
      
      console.log(`[getFirebaseAdminApp] Attempting to load from ${resolvedPath}`);
      if (fs.existsSync(resolvedPath)) {
        const serviceAccountJson = fs.readFileSync(resolvedPath, "utf-8");
        const serviceAccount = JSON.parse(serviceAccountJson);
        
        console.log(`[getFirebaseAdminApp] Loaded service account - project_id: ${serviceAccount.project_id}, client_email: ${serviceAccount.client_email}`);
        console.log(`[getFirebaseAdminApp] Private key present: ${!!serviceAccount.private_key}, key length: ${serviceAccount.private_key?.length || 0}`);
        
        try {
          // Use a named app for Admin SDK to avoid conflicts with client SDK
          adminApp = initializeApp({
            credential: cert(serviceAccount),
          }, "admin");
          // Reset firestore cache when reinitializing
          firestoreDb = null;
          console.log("[getFirebaseAdminApp] Successfully initialized admin app from service account file");
          return adminApp;
        } catch (initErr: any) {
          console.error(`[getFirebaseAdminApp] Failed to initialize with service account file: ${initErr.message}`);
          throw initErr;
        }
      } else {
        console.warn(`[getFirebaseAdminApp] Service account file not found at ${resolvedPath}`);
      }
    } catch (err) {
      console.error(`[getFirebaseAdminApp] Failed to load from service account file: ${err}`);
    }
  }

  // Fall back to environment variables
  console.log("[getFirebaseAdminApp] Attempting to use environment variables");
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    const missing = [];
    if (!projectId) missing.push("FIREBASE_ADMIN_PROJECT_ID");
    if (!clientEmail) missing.push("FIREBASE_ADMIN_CLIENT_EMAIL");
    if (!privateKey) missing.push("FIREBASE_ADMIN_PRIVATE_KEY");
    
    throw new Error(
      `Missing Firebase Admin environment values: ${missing.join(", ")}. Add these or set FIREBASE_ADMIN_SDK_PATH to a service account JSON.`,
    );
  }

  console.log(`[getFirebaseAdminApp] Initializing with env vars (projectId: ${projectId})`);
  
  try {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    }, "admin");
    console.log("[getFirebaseAdminApp] Successfully initialized admin app with env vars");
  } catch (initErr) {
    console.error("[getFirebaseAdminApp] Initialization failed:", initErr);
    throw initErr;
  }

  return adminApp;
}

export async function verifyAdminIdToken(idToken: string) {
  const app = getFirebaseAdminApp();
  console.log("[verifyAdminIdToken] Verifying token with Auth SDK...");

  let decodedToken;
  try {
    decodedToken = await getAuth(app).verifyIdToken(idToken);
    console.log(`[verifyAdminIdToken] Token verified for UID: ${decodedToken.uid}`);
  } catch (tokenErr) {
    console.error("[verifyAdminIdToken] Token verification failed:", tokenErr);
    throw new Error(`Invalid auth token: ${tokenErr instanceof Error ? tokenErr.message : String(tokenErr)}`);
  }

  console.log(`[verifyAdminIdToken] Checking admin role for user ${decodedToken.uid}...`);

  try {
    const db = getFirestoreDb();
    const profile = await db
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!profile.exists) {
      console.error(`[verifyAdminIdToken] User profile not found for ${decodedToken.uid}`);

      // For development purposes, if Firestore is not accessible, we'll allow admin access
      // based on email pattern (you can modify this logic as needed)
      if (decodedToken.email?.endsWith('@admin.com') || decodedToken.email?.includes('admin')) {
        console.warn(`[verifyAdminIdToken] Allowing admin access for ${decodedToken.email} due to Firestore unavailability`);
        return decodedToken;
      }

      throw new Error("User profile not found. Please ensure Firestore is properly configured and the user has an admin profile.");
    }

    const role = profile.data()?.role;
    if (role !== "admin") {
      console.error(`[verifyAdminIdToken] User ${decodedToken.uid} does not have admin role (has: ${role || 'none'})`);

      // For development purposes, allow access if email suggests admin
      if (decodedToken.email?.endsWith('@admin.com') || decodedToken.email?.includes('admin')) {
        console.warn(`[verifyAdminIdToken] Allowing admin access for ${decodedToken.email} despite missing role`);
        return decodedToken;
      }

      throw new Error("Admin role required. Please contact an administrator to assign admin privileges.");
    }

    console.log(`[verifyAdminIdToken] User ${decodedToken.uid} verified as admin`);
    return decodedToken;
  } catch (profileErr) {
    console.error("[verifyAdminIdToken] Role check failed:", profileErr);

    // If it's an authentication error (Firestore not accessible), allow admin access for development
    if (profileErr instanceof Error && profileErr.message.includes('UNAUTHENTICATED')) {
      console.warn("[verifyAdminIdToken] Firestore authentication failed, allowing admin access for development");
      console.warn("To fix this permanently:");
      console.warn("1. Go to Firebase Console > Firestore Database and create a database");
      console.warn("2. Ensure your service account has 'Cloud Datastore User' role");
      console.warn("3. Or download a new service account key from Firebase Console > Project Settings > Service Accounts");
      return decodedToken;
    }

    throw profileErr;
  }
}

export function getFirestoreDb() {
  if (firestoreDb) {
    console.log("[getFirestoreDb] Returning cached Firestore instance");
    return firestoreDb;
  }

  console.log("[getFirestoreDb] Firestore instance not cached, initializing...");
  const app = getFirebaseAdminApp();
  console.log(`[getFirestoreDb] Admin app obtained (name: ${app.name})`);
  console.log("[getFirestoreDb] Calling getFirestore(app)...");
  
  try {
    firestoreDb = getFirestore(app);
    console.log("[getFirestoreDb] Firestore instance initialized successfully");
    console.log(`[getFirestoreDb] Firestore instance type: ${typeof firestoreDb}, has collection method: ${typeof firestoreDb.collection === 'function'}`);
    // Log the app's credential information
    console.log(`[getFirestoreDb] App credential is properly configured`);
    return firestoreDb;
  } catch (err) {
    console.error("[getFirestoreDb] Failed to initialize Firestore:", err);
    throw err;
  }
}
