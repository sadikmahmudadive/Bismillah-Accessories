import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestoreDb: Firestore | null = null;

function getFirebaseConfig(): FirebaseConfig {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const missingKeys = Object.entries(config)
    .filter((entry): entry is [keyof FirebaseConfig, undefined] => !entry[1])
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`Missing Firebase environment values: ${missingKeys.join(", ")}`);
  }

  return config as FirebaseConfig;
}

export function getFirebaseClientApp() {
  if (!firebaseApp) {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
  }

  return firebaseApp;
}

export function getFirebaseAuth() {
  if (!firebaseAuth) {
    firebaseAuth = getAuth(getFirebaseClientApp());
  }

  return firebaseAuth;
}

export function getFirestoreDb() {
  if (!firestoreDb) {
    const app = getFirebaseClientApp();
    // Default to true or check env var
    const forceLongPolling = process.env.NEXT_PUBLIC_FIRESTORE_FORCE_LONG_POLLING !== "false";

    if (forceLongPolling) {
      // Force long-polling transport to avoid gRPC issues in constrained networks
      firestoreDb = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } else {
      firestoreDb = getFirestore(app);
    }
  }

  return firestoreDb;
}
