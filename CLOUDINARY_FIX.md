# Cloudinary API Secret Issue

The Cloudinary API secret in your `.env.local` file appears to be a placeholder or corrupted value. Here's how to fix it:

## Steps to Get the Correct API Secret:

1. **Go to Cloudinary Dashboard:**
   - Visit: https://cloudinary.com/console
   - Sign in to your account

2. **Navigate to API Keys:**
   - Click on your account name (top right)
   - Go to "Account Settings"
   - Click on the "Access Keys" tab

3. **Copy the API Secret:**
   - Find the "API Secret" field
   - Copy the full secret (it should be a long string)

4. **Update .env.local:**
   Replace this line in your `.env.local` file:
   ```
   CLOUDINARY_API_SECRET=your-actual-api-secret-here
   ```

## Current Configuration:
- ✅ Cloud Name: `dhm0edatk`
- ✅ API Key: `879315316647413`
- ❌ API Secret: Currently invalid/corrupted

Once you update the API secret with the real value from Cloudinary, the image upload should work correctly.