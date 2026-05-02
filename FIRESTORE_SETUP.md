# Phase 5: Product System - Firestore Setup Guide

## 📋 Overview

This guide provides the seed data for the Bismillah Accessories e-commerce platform. You'll need to add these products to your Firestore database to enable the product listing, filtering, and detail page features.

## 🚀 How to Add Products to Firestore

### Option 1: Firebase Console (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "Bismillah Accessories" project
3. Navigate to **Firestore Database**
4. Click **Create Database** (if you haven't already)
5. Create a new collection called `products`
6. Click **Add Document** and manually enter the product data below

### Option 2: Upload JSON (Using Firebase CLI)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Create a file `products-seed.json` with the data below
4. Run: `firebase firestore:import products-seed.json --project=bismillah-accessories`

## 📦 Seed Product Data

Add the following 12 products to your `products` collection:

```
Product 1:
{
  "name": "MagSafe Clear Case",
  "slug": "magsafe-clear-case",
  "description": "Premium transparent case with MagSafe ring for wireless charging and magnetic accessories. Perfect for showcasing your phone's design while keeping it protected.",
  "category": "Phone Case",
  "price": 1299,
  "stock": 45,
  "imageUrl": "https://images.unsplash.com/photo-1609207825181-8bb4a2b8a1e0?auto=format&fit=crop&w=800&q=80",
  "tags": ["MagSafe", "Clear", "Premium", "iPhone"],
  "status": "active",
  "createdAt": TIMESTAMP,
  "updatedAt": TIMESTAMP
}

Product 2:
{
  "name": "Braided USB-C Cable",
  "slug": "braided-usb-c-cable",
  "description": "Durable 2-meter braided USB-C cable with fast charging support. Works with all USB-C devices including phones, tablets, and laptops.",
  "category": "Charging",
  "price": 499,
  "stock": 120,
  "imageUrl": "https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=80",
  "tags": ["USB-C", "Braided", "Fast Charge", "Durable"],
  "status": "active",
  "createdAt": TIMESTAMP,
  "updatedAt": TIMESTAMP
}

Product 3:
{
  "name": "Matte Camera Lens Guard",
  "slug": "matte-camera-lens-guard",
  "description": "Anti-fingerprint matte finish camera lens protector. Reduces glare and protects your phone's camera from scratches and dust.",
  "category": "Protection",
  "price": 349,
  "stock": 85,
  "imageUrl": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
  "tags": ["Camera", "Matte", "Fingerprint", "Protection"],
  "status": "active",
  "createdAt": TIMESTAMP,
  "updatedAt": TIMESTAMP
}

Product 4:
{
  "name": "Portable Phone Stand",
  "slug": "portable-phone-stand",
  "description": "Lightweight aluminum phone stand with adjustable angles. Perfect for video calls, watching videos, or content creation.",
  "category": "Storage",
  "price": 599,
  "stock": 32,
  "imageUrl": "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80",
  "tags": ["Stand", "Aluminum", "Adjustable", "Portable"],
  "status": "active",
  "createdAt": TIMESTAMP,
  "updatedAt": TIMESTAMP
}

Product 5:
{
  "name": "Wireless Charging Pad",
  "slug": "wireless-charging-pad",
  "description": "Fast 15W wireless charging pad with LED indicator. Compatible with all Qi-enabled devices for convenient cable-free charging.",
  "category": "Charging",
  "price": 1099,
  "stock": 28,
  "imageUrl": "https://images.unsplash.com/photo-1591985026928-be1cdd43d416?auto=format&fit=crop&w=800&q=80",
  "tags": ["Wireless", "Fast Charge", "Qi", "LED"],
  "status": "active",
  "createdAt": TIMESTAMP,
  "updatedAt": TIMESTAMP
}

Product 6:
{
  "name": "Premium Screen Protector",
  "slug": "premium-screen-protector",
  "description": "Tempered glass screen protector with 9H hardness rating. Ultra-clear with fingerprint-resistant coating for maximum protection.",
  "category": "Protection",
  "price": 299,
  "stock": 156,
  "imageUrl": "https://images.unsplash.com/photo-1598033129519-c90900bc9c04?auto=format&fit=crop&w=800&q=80",
  "tags": ["Screen", "Tempered Glass", "9H", "Clear"],
  "status": "active",
  "createdAt": TIMESTAMP,
  "updatedAt": TIMESTAMP
}

Product 7:
{
  "name": "Noise-Cancelling Earbuds",
  "slug": "noise-cancelling-earbuds",
  "description": "True wireless earbuds with active noise cancellation and 8-hour battery life. Crystal clear audio with comfortable fit for all day wear.",
  "category": "Audio",
  "price": 2499,
  "stock": 18,
  "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  "tags": ["Audio", "Wireless", "Noise Cancel", "Premium"],
  "status": "active",
  "createdAt": TIMESTAMP,
  "updatedAt": TIMESTAMP
}

Product 8:
{
  "name": "Compact Phone Charger",
  "slug": "compact-phone-charger",
  "description": "Portable 30W USB-C charger with compact design. Perfect for travel with foldable plug and fast charging capability.",
  "category": "Charging",
  "price": 799,
  "stock": 67,
  "imageUrl": "https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=80",
  "tags": ["Charger", "Portable", "Fast", "USB-C"],
  "status": "active",
  "createdAt": TIMESTAMP,
  "updatedAt": TIMESTAMP
}

Product 9:
{
  "name": "Leather Phone Wallet",
  "slug": "leather-phone-wallet",
  "description": "RFID-blocking leather phone wallet with card slots. Slim design that attaches magnetically to any MagSafe-compatible phone.",
  "category": "Phone Case",
  "price": 1499,
  "stock": 22,
  "imageUrl": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
  "tags": ["Wallet", "Leather", "RFID", "MagSafe"],
  "status": "active",
  "createdAt": TIMESTAMP,
  "updatedAt": TIMESTAMP
}

Product 10:
{
  "name": "Smart Watch Band",
  "slug": "smart-watch-band",
  "description": "Premium silicone watch band compatible with all major smartwatch models. Available in multiple colors with secure magnetic clasp.",
  "category": "Watch",
  "price": 599,
  "stock": 89,
  "imageUrl": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  "tags": ["Watch", "Silicone", "Band", "Magnetic"],
  "status": "active",
  "createdAt": TIMESTAMP,
  "updatedAt": TIMESTAMP
}

Product 11:
{
  "name": "Multi-Port Hub",
  "slug": "multi-port-hub",
  "description": "USB-C hub with 7 ports: HDMI, USB 3.0 (x3), SD card reader, microSD, and USB-C charging. Perfect for productivity on the go.",
  "category": "Storage",
  "price": 1899,
  "stock": 14,
  "imageUrl": "https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=80",
  "tags": ["Hub", "USB-C", "HDMI", "Portable"],
  "status": "active",
  "createdAt": TIMESTAMP,
  "updatedAt": TIMESTAMP
}

Product 12:
{
  "name": "Phone Camera Ring Light",
  "slug": "phone-camera-ring-light",
  "description": "Clip-on LED ring light with adjustable brightness and color temperature. Essential for content creators and video call enthusiasts.",
  "category": "Audio",
  "price": 899,
  "stock": 41,
  "imageUrl": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
  "tags": ["Ring Light", "LED", "Content", "Creator"],
  "status": "active",
  "createdAt": TIMESTAMP,
  "updatedAt": TIMESTAMP
}
```

## 🔑 Important Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Product display name |
| `slug` | String | URL-friendly identifier (lowercase, hyphens) |
| `description` | String | Detailed product description |
| `category` | String | One of: Phone Case, Charging, Protection, Audio, Watch, Storage |
| `price` | Number | Price in BDT (Bangladeshi Taka) |
| `stock` | Number | Available quantity |
| `imageUrl` | String | URL to product image (use provided URLs or upload to Cloudinary) |
| `tags` | Array | Search/filter tags (3-4 recommended) |
| `status` | String | "active" (only active products show) |
| `createdAt` | Timestamp | Server timestamp (auto-generated) |
| `updatedAt` | Timestamp | Server timestamp (auto-generated) |

## 🖼️ Image URLs

All image URLs provided above are from Unsplash (free high-quality images). You can:

1. **Use the Unsplash URLs directly** - Already included above
2. **Upload to Cloudinary** - For production, use your BismillahAccessories preset
3. **Use your own images** - Replace URLs with your own Cloudinary links

## ✅ Verification Steps

After adding the products to Firestore:

1. **Check Products Page**: Navigate to http://localhost:3000/products
   - Should display 12 product cards
   - Filter and search should work
   - Category buttons should show all categories

2. **Check Product Detail**: Click any product
   - Should load product detail page with full information
   - Price, stock, and description should display correctly

3. **Check API Routes**:
   - GET http://localhost:3000/api/products → Should return all active products
   - GET http://localhost:3000/api/products?category=Charging → Should filter by category
   - GET http://localhost:3000/api/products?search=cable → Should search products

## 🐛 Troubleshooting

**Products not showing?**
- Ensure Firestore database is created and products collection exists
- Check that product `status` is set to "active"
- Verify Firebase credentials in `.env.local`

**Images not loading?**
- Check image URLs are valid (try opening in browser)
- Ensure CORS is enabled for image hosting
- Consider uploading images to Cloudinary for production

**Filter/Search not working?**
- Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
- Check browser console for API errors
- Verify API routes are compiled (`/api/products/*`)

## 📝 Next Steps

After adding products:

1. ✅ Phase 5 (Products) - **COMPLETE** with this data
2. Phase 6 - Implement shopping cart with Zustand
3. Phase 7 - Connect checkout flow with order creation
4. Phase 8 - Admin panel for product management
