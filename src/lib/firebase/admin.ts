import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App | null = null;

function getPrivateKey() {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  return privateKey?.replace(/\\n/g, "\n");
}

export function getFirebaseAdminApp() {
  if (adminApp) {
    return adminApp;
  }

  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  // If service account JSON path is provided, prefer that (useful for local dev)
  const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_PATH;
  if (serviceAccountPath) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sa = require(serviceAccountPath);
      adminApp = initializeApp({
        credential: cert(sa),
      });
      return adminApp;
    } catch (err) {
      // fall through and try env vars; log for visibility
      // eslint-disable-next-line no-console
      console.warn(`Failed to load service account from ${serviceAccountPath}: ${err}`);
    }
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin environment values. Add FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY, or set FIREBASE_ADMIN_SDK_PATH to a service account JSON.",
    );
  }

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return adminApp;
}

export async function verifyAdminIdToken(idToken: string) {
  const app = getFirebaseAdminApp();
  const decodedToken = await getAuth(app).verifyIdToken(idToken);
  const profile = await getFirestore(app)
    .collection("users")
    .doc(decodedToken.uid)
    .get();

  if (!profile.exists || profile.data()?.role !== "admin") {
    throw new Error("Admin role required.");
  }

  return decodedToken;
}
