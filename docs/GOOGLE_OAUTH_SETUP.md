# Setting Up Google OAuth for Grammario

Follow these steps to enable "Sign in with Google" for your Grammario app.

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project or select existing one

3. Navigate to **APIs & Services** → **OAuth consent screen**
   - Choose "External" user type
   - Fill in:
     - App name: `Grammario`
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"
   - Skip scopes (default email/profile is fine)
   - Add test users if in testing mode
   - Submit

4. Navigate to **APIs & Services** → **Credentials**

5. Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Grammario Web Client`
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://yourdomain.com
     ```
   - Authorized redirect URIs:
     ```
     https://xyvmibgtadusyhyhxbjs.supabase.co/auth/v1/callback
     ```
     (Replace with your Supabase project URL)

6. Click **Create** and copy:
   - **Client ID** 
   - **Client Secret**

## Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)

2. Select your project (Grammario)

3. Navigate to **Authentication** → **Providers**

4. Find **Google** and click to expand

5. Toggle **Enable Sign in with Google** ON

6. Enter your credentials:
   - **Client ID**: (paste from Google)
   - **Client Secret**: (paste from Google)

7. Click **Save**

## Step 3: Configure Redirect URLs

In Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**

2. Set **Site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

3. Add **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```

## Step 4: Test

1. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Go to http://localhost:3000

3. Click "Sign In" → "Continue with Google"

4. You should be redirected to Google, then back to your app

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI in Google Console matches exactly:
  `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### "Access blocked: This app's request is invalid"
- Your OAuth consent screen might not be configured
- Or you haven't added your email as a test user (if in testing mode)

### User signs in but profile not created
- Check that the `handle_new_user` trigger exists in your database
- Run the schema.sql again if needed

## Production Checklist

Before going live:

1. [ ] Publish your OAuth consent screen (move out of "Testing" mode)
2. [ ] Update Google OAuth redirect URIs for production domain
3. [ ] Update Supabase Site URL to production domain
4. [ ] Add production redirect URL in Supabase
5. [ ] Test the full flow on production

## Environment Variables

Make sure your frontend `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyvmibgtadusyhyhxbjs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Get these from Supabase Dashboard → **Settings** → **API**
