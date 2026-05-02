# Seed Products - Setup Guide

## 🎯 Overview

This guide explains how to add the 12 seed products to your Firestore database. You have **three options**:

1. **Firebase Console** (Manual) - Fastest & Most Reliable
2. **API Route** (HTTP) - Automated but requires Firestore connectivity
3. **Node.js Script** (CLI) - Advanced, uses Firebase Admin SDK

---

## ✅ RECOMMENDED: Option 1 - Firebase Console (Manual)

### Why This Works Best

- No dependency on Firestore connection from your app
- Full control over each product entry
- Can verify data immediately in console
- No special setup required

### Steps

**1. Open Firebase Console**

Go to: https://console.firebase.google.com
- Select "Bismillah Accessories" project
- Click **Firestore Database** in left sidebar

**2. Create Products Collection**

- Click **+ Start collection**
- Collection ID: `products`
- Click **Next**
- Skip document creation (we'll add them manually)

**3. Add First Product**

- In `products` collection, click **+ Add document**
- Auto ID or use slug as ID: `magsafe-clear-case`
- Add these fields:

| Field | Value | Type |
|-------|-------|------|
| `name` | MagSafe Clear Case | String |
| `slug` | magsafe-clear-case | String |
| `description` | Premium transparent case with MagSafe ring... | String |
| `category` | Phone Case | String |
| `price` | 1299 | Number |
| `stock` | 45 | Number |
| `imageUrl` | https://images.unsplash.com/photo-1609207825181-8bb4a2b8a1e0?auto=format&fit=crop&w=800&q=80 | String |
| `tags` | ["MagSafe", "Clear", "Premium", "iPhone"] | Array |
| `status` | active | String |
| `cloudinaryPublicId` |  | String (empty) |
| `createdAt` | (auto-timestamp) | Timestamp |
| `updatedAt` | (auto-timestamp) | Timestamp |

4. Click **Save**

**4. Repeat for All 12 Products**

Use the data below to add remaining 11 products...

### Product Data (All 12)

Copy-paste ready for Firebase Console:

```
1. MagSafe Clear Case | 1299 BDT | 45 stock
   Slug: magsafe-clear-case
   Category: Phone Case
   Desc: Premium transparent case with MagSafe ring for wireless charging and magnetic accessories. Perfect for showcasing your phone's design while keeping it protected.
   Tags: MagSafe, Clear, Premium, iPhone
   Image: https://images.unsplash.com/photo-1609207825181-8bb4a2b8a1e0?auto=format&fit=crop&w=800&q=80

2. Braided USB-C Cable | 499 BDT | 120 stock
   Slug: braided-usb-c-cable
   Category: Charging
   Desc: Durable 2-meter braided USB-C cable with fast charging support. Works with all USB-C devices including phones, tablets, and laptops.
   Tags: USB-C, Braided, Fast Charge, Durable
   Image: https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=80

3. Matte Camera Lens Guard | 349 BDT | 85 stock
   Slug: matte-camera-lens-guard
   Category: Protection
   Desc: Anti-fingerprint matte finish camera lens protector. Reduces glare and protects your phone's camera from scratches and dust.
   Tags: Camera, Matte, Fingerprint, Protection
   Image: https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80

4. Portable Phone Stand | 599 BDT | 32 stock
   Slug: portable-phone-stand
   Category: Storage
   Desc: Lightweight aluminum phone stand with adjustable angles. Perfect for video calls, watching videos, or content creation.
   Tags: Stand, Aluminum, Adjustable, Portable
   Image: https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80

5. Wireless Charging Pad | 1099 BDT | 28 stock
   Slug: wireless-charging-pad
   Category: Charging
   Desc: Fast 15W wireless charging pad with LED indicator. Compatible with all Qi-enabled devices for convenient cable-free charging.
   Tags: Wireless, Fast Charge, Qi, LED
   Image: https://images.unsplash.com/photo-1591985026928-be1cdd43d416?auto=format&fit=crop&w=800&q=80

6. Premium Screen Protector | 299 BDT | 156 stock
   Slug: premium-screen-protector
   Category: Protection
   Desc: Tempered glass screen protector with 9H hardness rating. Ultra-clear with fingerprint-resistant coating for maximum protection.
   Tags: Screen, Tempered Glass, 9H, Clear
   Image: https://images.unsplash.com/photo-1598033129519-c90900bc9c04?auto=format&fit=crop&w=800&q=80

7. Noise-Cancelling Earbuds | 2499 BDT | 18 stock
   Slug: noise-cancelling-earbuds
   Category: Audio
   Desc: True wireless earbuds with active noise cancellation and 8-hour battery life. Crystal clear audio with comfortable fit for all day wear.
   Tags: Audio, Wireless, Noise Cancel, Premium
   Image: https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80

8. Compact Phone Charger | 799 BDT | 67 stock
   Slug: compact-phone-charger
   Category: Charging
   Desc: Portable 30W USB-C charger with compact design. Perfect for travel with foldable plug and fast charging capability.
   Tags: Charger, Portable, Fast, USB-C
   Image: https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=80

9. Leather Phone Wallet | 1499 BDT | 22 stock
   Slug: leather-phone-wallet
   Category: Phone Case
   Desc: RFID-blocking leather phone wallet with card slots. Slim design that attaches magnetically to any MagSafe-compatible phone.
   Tags: Wallet, Leather, RFID, MagSafe
   Image: https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80

10. Smart Watch Band | 599 BDT | 89 stock
    Slug: smart-watch-band
    Category: Watch
    Desc: Premium silicone watch band compatible with all major smartwatch models. Available in multiple colors with secure magnetic clasp.
    Tags: Watch, Silicone, Band, Magnetic
    Image: https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80

11. Multi-Port Hub | 1899 BDT | 14 stock
    Slug: multi-port-hub
    Category: Storage
    Desc: USB-C hub with 7 ports: HDMI, USB 3.0 (x3), SD card reader, microSD, and USB-C charging. Perfect for productivity on the go.
    Tags: Hub, USB-C, HDMI, Portable
    Image: https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=80

12. Phone Camera Ring Light | 899 BDT | 41 stock
    Slug: phone-camera-ring-light
    Category: Audio
    Desc: Clip-on LED ring light with adjustable brightness and color temperature. Essential for content creators and video call enthusiasts.
    Tags: Ring Light, LED, Content, Creator
    Image: https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80
```

**5. Verify All Products Added**

- In Firestore console, you should see 12 documents in `products` collection
- Each document has `status: "active"`

**6. Test in App**

Open http://localhost:3000/products - Should display all 12 products!

---

## ⚙️ Option 2: API Route (Automated)

### Prerequisites

✅ Firestore database created (see [FIRESTORE_USER_STORAGE.md](./FIRESTORE_USER_STORAGE.md))
✅ Dev server running: `npm run dev`
✅ No connection issues with Firestore backend

### How To Use

**Check Status:**
```
http://localhost:3000/api/seed-products
```

**Seed Products (First Time):**
```
http://localhost:3000/api/seed-products -X POST
```

**Force Re-Seed:**
```
http://localhost:3000/api/seed-products?force=true -X POST
```

### Using Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Paste:
```javascript
fetch('http://localhost:3000/api/seed-products', {
  method: 'POST'
}).then(r => r.json()).then(data => {
  console.log('Seed Result:', data);
  if(data.success) alert('✅ ' + data.addedCount + ' products added!');
  else alert('❌ ' + data.message);
});
```

4. Press Enter and wait for response

### Troubleshooting API Seeding

**Issue: "Could not reach Cloud Firestore backend"**
- Your internet connection to Firebase is unstable
- Firestore backend temporarily unavailable
- Solution: Use Firebase Console manual method above

**Issue: POST request times out**
- Firestore connection too slow
- Solution: Use Firebase Console or CLI script

---

## 🔧 Option 3: Node.js Script (Advanced)

### Prerequisites

1. **Download Service Account Key**
   - Firebase Console > Settings > Service Accounts
   - Generate New Private Key
   - Save as `firebase-adminsdk.json` in project root

2. **Install Admin SDK**
   ```bash
   npm install firebase-admin
   ```

### Run Script

```bash
node scripts/seed.js
```

### Expected Output

```
🚀 Starting Firestore products seeding...
📊 Checking existing products...
📦 Adding 12 products to Firestore...
✅ MagSafe Clear Case
✅ Braided USB-C Cable
...
🎉 Successfully seeded Firestore!
```

### Force Re-Seed

Currently, the script checks for existing products. To re-seed:

1. Delete documents in Firebase Console
2. Then run: `node scripts/seed.js`

---

## ✨ After Seeding (All Methods)

### Verify Products Added

**In Firebase Console:**
- Firestore Database > `products` collection
- Should show 12 documents
- Each with `status: "active"`

**In Your App:**
- http://localhost:3000/products
- Should display 12 product cards
- Filter/search should work
- Can add items to cart ✅

### Test Full Flow

1. **Browse Products** → `/products` page loads
2. **Add to Cart** → Click "Add to Cart" button
3. **View Cart** → Click cart icon → See items
4. **Modify Cart** → +/- quantities, remove items
5. **Checkout** → "Proceed to Checkout" button works

---

## 📊 Database Status Check

To check how many products are currently in your database:

```bash
curl http://localhost:3000/api/seed-products
```

Response shows:
- `activeProducts`: Number of active products
- `totalProducts`: All products
- `isSeedNeeded`: Whether you need to seed

---

## 🎯 Next Steps After Seeding

1. ✅ **Phase 5 Complete** - Products browsable and filterable
2. ✅ **Phase 6 Complete** - Shopping cart works with seed data
3. ⏳ **Phase 7** - Checkout and order creation
4. ⏳ **Phase 8** - Admin dashboard for product management

---

## ⚠️ Important Notes

### Development Only
- Seeding endpoint designed for development
- In production, use Firebase Console or Admin SDK only
- Add authentication to seed endpoint before production

### One-Time Operation
- API checks if products exist before seeding
- Use `?force=true` to clear and re-seed
- CLI script similar safety check

### Data Persistence
- Products stay in Firestore permanently
- Delete via Firebase Console to clear
- Safe to call seeding multiple times

---

## 🆘 Support

**Products not showing after seeding?**
- Refresh page (Ctrl+Shift+R or Cmd+Shift+R)
- Check Firestore console for documents
- Verify `status: "active"` on all products

**Images not loading?**
- Check image URLs are valid
- Verify CORS enabled for Unsplash
- Consider uploading to Cloudinary for production

**Firestore connection errors?**
- Check internet connection
- Try Firebase Console manual method
- Wait 5-10 minutes for backend to become available

---

## 📁 Files Created

- `src/app/api/seed-products/route.ts` - API seeding endpoint (GET/POST)
- `scripts/seed.js` - Node.js CLI seeding script
- `scripts/products-seed.json` - Product data for CLI script

---

**🎉 Phase 6 Shopping Cart is COMPLETE and ready to test with seed products!**

**Recommended Action:**
1. Use **Option 1 (Firebase Console)** to add products (most reliable)
2. Then test the full cart flow at http://localhost:3000/products


