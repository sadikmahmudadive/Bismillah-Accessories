# Firestore Setup Guide - User Data Storage

## 🎯 Overview

This guide will help you set up Firestore so that user information is properly stored when customers sign up for Bismillah Accessories.

## ⚠️ Current Issue

- **Problem**: Firestore database is not created in your Firebase project
- **Error Message**: `Database '(default)' not found` in browser console
- **Impact**: User profiles are not being saved to Firestore (though Firebase Auth still works)

## ✅ Step-by-Step Setup

### Step 1: Create Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "Bismillah Accessories" project
3. In the left sidebar, click **Firestore Database** (under "Build" section)
4. Click **Create Database**
5. Choose region: **`asia-southeast1` (Singapore)** - closest to Bangladesh
6. Select **Start in Production Mode** (we'll add proper security rules)
7. Click **Create**

⏳ Wait 2-3 minutes for the database to be provisioned.

### Step 2: Create Security Rules

After Firestore is created:

1. In Firestore Console, click on **Rules** tab
2. Replace the default rules with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own user profile
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Allow anyone to read active products (for catalog browsing)
    match /products/{product} {
      allow read: if resource.data.status == 'active';
      allow write: if request.auth.uid != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Allow authenticated users to read/write their own orders
    match /orders/{order} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Click **Publish**

### Step 3: Test User Creation

Now test if user signup stores data properly:

1. Open http://localhost:3000/auth in your browser
2. Click **Create account** tab
3. Fill in the form:
   - Name: `Test User`
   - Email: `test-user-123@example.com`
   - Password: `Test123456`
4. Click **Create account**

✅ **Expected Result**: 
- User is created and redirected to `/checkout`
- Console shows: `✅ User profile created in Firestore for [uid]`
- In Firebase Console > Firestore, you should see a new document in `users` collection

### Step 4: Verify Data in Firestore

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select "Bismillah Accessories" project
3. Click **Firestore Database**
4. You should see a `users` collection with documents like:

```json
{
  "id": "auth_uid_here",
  "email": "test-user-123@example.com",
  "displayName": "Test User",
  "role": "customer",
  "createdAt": "2026-05-02T10:15:30.000Z",
  "updatedAt": "2026-05-02T10:15:30.000Z"
}
```

### Step 5: Verify User Profile Loading

1. Sign out from http://localhost:3000/auth (click **Sign out** button)
2. Sign in with the test account:
   - Email: `test-user-123@example.com`
   - Password: `Test123456`
3. Click **Sign in**

✅ **Expected Result**:
- User signs in successfully
- Console shows: `✅ User profile loaded from Firestore for [uid]`
- User profile is displayed with their name and email
- "Your account is connected" message appears

## 🔍 Troubleshooting

### Issue: "Database '(default)' not found"

**Solution**: Create Firestore database (see Step 1)

### Issue: "Permission denied" error in console

**Solution**: Update security rules (see Step 2)

**Why?** The default security rules block all writes. You need to allow authenticated users to write their own profile.

### Issue: "Network error" or "offline"

**Solution**: 
- Check internet connection
- Verify Firebase credentials in `.env.local`:
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID=bismillah-accessories`
  - `NEXT_PUBLIC_FIREBASE_API_KEY=...` (must be valid)
  - All other NEXT_PUBLIC_FIREBASE_* variables must be present

### Issue: User signs up but profile doesn't show

**Solution**:
- Check Firestore security rules (Step 2)
- Verify `users` collection exists in Firestore
- Check browser console for specific error message
- Ensure the authenticated user's UID matches the Firestore document ID

## 📋 Firestore Collections Schema

Once set up, you'll have these collections:

### `users` Collection
```
users/
  {userId}/
    - id: string (Firebase Auth UID)
    - email: string
    - displayName: string
    - role: "customer" | "admin"
    - createdAt: timestamp
    - updatedAt: timestamp
```

### `products` Collection (for Phase 5)
```
products/
  {productId}/
    - name: string
    - slug: string
    - category: string
    - price: number
    - stock: number
    - imageUrl: string
    - tags: array
    - status: "active" | "draft" | "archived"
    - createdAt: timestamp
    - updatedAt: timestamp
```

### `orders` Collection (for Phase 7)
```
orders/
  {orderId}/
    - userId: string
    - items: array
    - totalPrice: number
    - status: "pending" | "confirmed" | "shipped"
    - createdAt: timestamp
    - updatedAt: timestamp
```

## ✨ After Setup Complete

Once Firestore is set up:

1. **User Signup**: User information is stored in Firestore `users` collection ✅
2. **User Login**: Profile is loaded from Firestore and cached locally ✅
3. **Product Listing**: Products from Firestore are displayed (Phase 5) ✅
4. **Order Storage**: Customer orders are saved (Phase 7) ✅

## 🚀 Next Steps

After confirming user data is being stored:

1. ✅ **Phase 5**: Add seed products to Firestore (see [FIRESTORE_SETUP.md](FIRESTORE_SETUP.md))
2. ⏳ **Phase 6**: Build shopping cart with Zustand
3. ⏳ **Phase 7**: Connect checkout and order creation
4. ⏳ **Phase 8**: Set up admin dashboard for product management

## 📞 Support

If you encounter issues:

1. **Check browser console** for specific error messages
2. **Verify Firebase credentials** in `.env.local`
3. **Ensure Firestore database** is created and in "Production Mode"
4. **Check security rules** allow reads/writes for authenticated users
5. **Look for Firebase errors** in browser Network tab (F12 > Network)

---

**Summary**: User information storage requires both Firebase Auth (✅ already working) and Firestore Database (⏳ needs setup). Once Firestore is created with proper security rules, all user data will be automatically stored.
