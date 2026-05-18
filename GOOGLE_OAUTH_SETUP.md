# Google OAuth 2.0 Setup Guide

## Overview
HireHub is now configured to support Google OAuth login/sign-up. Follow these steps to enable it:

## Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Name it "HireHub" or similar

## Step 2: Enable Google+ API
1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click it and press **Enable**

## Step 3: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Fill in:
   - **Name**: HireHub
   - **Authorized JavaScript origins**: `http://localhost:3001`
   - **Authorized redirect URIs**: `http://localhost:3001/api/auth/callback/google`

## Step 4: Copy Credentials
1. After creating, you'll see a dialog with:
   - **Client ID** (copy this)
   - **Client Secret** (copy this)

## Step 5: Update .env File
1. Open `.env` in your project root
2. Replace placeholders:
```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
```

Replace `YOUR_GOOGLE_CLIENT_ID_HERE` and `YOUR_GOOGLE_CLIENT_SECRET_HERE` with actual values from Step 4.

## Step 6: Restart Dev Server
Kill the current `npm run dev` and start it again:
```bash
npm run dev
```

## Step 7: Test
1. Go to http://localhost:3001/login
2. Click "Google-ээр нэвтрэх" button
3. You should be redirected to Google login

## For Production
When deploying to production, update the URLs:
```env
NEXTAUTH_URL=https://hire-hub-two-henna.vercel.app
GOOGLE_CLIENT_ID=production-client-id
GOOGLE_CLIENT_SECRET=production-client-secret
```

And add this exact URL to Google OAuth settings:

```text
https://hire-hub-two-henna.vercel.app/api/auth/callback/google
```

## Features
- ✅ Sign up with Google
- ✅ Sign in with Google  
- ✅ Auto-creates user with role "USER"
- ✅ Fallback to email/password login also available
- ✅ Works alongside traditional auth

## Troubleshooting
- **"redirect_uri_mismatch"**: Google Cloud Console дээрх Authorized redirect URI нь `https://hire-hub-two-henna.vercel.app/api/auth/callback/google`-тай яг ижил байх ёстой. `http`, trailing slash, preview deployment URL, өөр Vercel domain зөрвөл энэ алдаа гарна.
- **"invalid_client"**: Verify Client ID/Secret are correct in .env
- **Port mismatch**: If using different port, update both .env and Google OAuth settings
