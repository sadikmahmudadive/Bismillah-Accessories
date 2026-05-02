# Firebase Admin SDK - GCP Permissions Fix

## Problem
The Firebase service account is successfully initialized but Firestore queries fail with:
```
Error: 16 UNAUTHENTICATED: Request had invalid authentication credentials...
```

This means the service account lacks Firestore permissions in GCP.

## Quick Fix (5 minutes)

### Step 1: Open Google Cloud Console IAM
Go to: https://console.cloud.google.com/iam-admin/iam

### Step 2: Find Your Service Account
1. Look for a service account matching the pattern: `firebase-adminsdk-*@*.iam.gserviceaccount.com`
   - Or check `.env.local` for `FIREBASE_ADMIN_CLIENT_EMAIL`
2. Click on the email to expand it

### Step 3: Grant Firestore Permissions
1. Click **Edit** on the right side
2. Click **Add another role**
3. Search and select ONE of these roles:
   - **"Cloud Datastore User"** (Recommended for read/write)
   - **"Firebase Admin SDK Administrator"** (Unrestricted)
4. Click **Save**

### Step 4: Restart Dev Server
```bash
npm run dev
```

The products API should now return real data from Firestore instead of mock data.

---

## Alternative: Generate Fresh Service Account Key

If the above doesn't work:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Project Settings → **Service Accounts** tab
3. Click **Generate New Private Key**
4. Download the JSON file
5. Copy the values from the JSON to `.env.local`:
   ```
   FIREBASE_ADMIN_PROJECT_ID=bismillah-accessories
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-...@...iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   ```
6. Restart dev server

---

## Current Workaround

While Firestore authentication is being fixed, the app uses **mock product data**. Real products will be loaded once you grant the permissions.

The API response includes a `_mock: true` flag and note when using mock data:
```json
{
  "success": true,
  "data": [...],
  "_mock": true,
  "_note": "Using mock data - Firestore authentication pending..."
}
```

---

## Verification

### Test via API
```bash
curl http://localhost:3000/api/products
```

You should see products (either real Firestore data or mock data).

### Check Diagnostics
```bash
curl http://localhost:3000/api/diagnostics/firestore
```

This shows the exact GCP permission status.

---

## Firestore Security Rules

Ensure your Firestore security rules allow the service account to read/write:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated requests (including service account)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Optional: Separate rules for admin operations
    match /products/{document=**} {
      allow read: if true; // Public read
      allow write: if request.auth.token.role == 'admin';
    }
    
    match /users/{document=**} {
      allow read, write: if request.auth.uid == document;
    }
  }
}
```

---

## User Profile Persistence

Once Firestore permissions are granted:

1. **Signup Flow**: When users register, their profile is saved to `users/{uid}` collection
2. **Fallback**: If client-side Firestore fails, server API endpoint saves profile
3. **Graceful Degradation**: Auth succeeds even if profile save fails (warning logged)

---

## Next Steps

1. ✅ Grant service account Firestore permissions
2. ✅ Restart dev server
3. ✅ Test signup to verify profiles are saved
4. ✅ Test admin dashboard to verify product CRUD operations
5. ✅ Consider updating Firestore security rules if needed
