import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {} as Record<string, any>,
  };

  // Check 1: Firebase Admin environment variables
  try {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const hasPrivateKey = !!process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    
    diagnostics.checks.firebaseEnvVars = {
      projectId: projectId || "NOT SET",
      clientEmail: clientEmail || "NOT SET",
      hasPrivateKey,
      status: projectId && clientEmail && hasPrivateKey ? "✅ CONFIGURED" : "❌ MISSING",
    };
  } catch (error) {
    diagnostics.checks.firebaseEnvVars = { status: "❌ ERROR", error: String(error) };
  }

  // Check 2: Firebase Admin App initialization
  try {
    const { getFirebaseAdminApp } = await import("@/lib/firebase/admin");
    const app = getFirebaseAdminApp();
    diagnostics.checks.adminApp = {
      name: app.name,
      projectId: app.options?.projectId,
      status: "✅ INITIALIZED",
    };
  } catch (error) {
    diagnostics.checks.adminApp = { status: "❌ INITIALIZATION_FAILED", error: String(error) };
  }

  // Check 3: Firestore connection
  try {
    const { getFirestoreDb } = await import("@/lib/firebase/admin");
    const db = getFirestoreDb();
    diagnostics.checks.firestoreDb = {
      type: typeof db,
      status: "✅ INSTANCE_CREATED",
    };
    
    // Try a simple read operation (count documents in a collection)
    try {
      const snapshot = await db.collection("products").limit(1).get();
      diagnostics.checks.firestoreDb.queryStatus = "✅ QUERY_SUCCESSFUL";
      diagnostics.checks.firestoreDb.docCount = snapshot.size;
    } catch (queryError: any) {
      diagnostics.checks.firestoreDb.queryStatus = "❌ QUERY_FAILED";
      diagnostics.checks.firestoreDb.queryError = {
        code: queryError.code,
        message: queryError.message,
        details: queryError.details,
      };
    }
  } catch (error) {
    diagnostics.checks.firestoreDb = { status: "❌ INSTANCE_CREATION_FAILED", error: String(error) };
  }

  // Check 4: Service account scopes and permissions
  try {
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    diagnostics.checks.serviceAccount = {
      email: clientEmail || "NOT SET",
      info: "Service account should have 'Cloud Datastore User' or 'Firebase Admin SDK Administrator' role in GCP Console",
      resolution: "Go to: https://console.cloud.google.com/iam-admin/iam → Find service account → Grant required role",
    };
  } catch (error) {
    diagnostics.checks.serviceAccount = { status: "❌ ERROR", error: String(error) };
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
