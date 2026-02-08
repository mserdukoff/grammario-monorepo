# Supabase Setup Guide for Grammario

Your current Supabase project doesn't exist or has been deleted. Follow these steps to set up a new one.

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `Grammario` (or any name you prefer)
   - **Database Password**: Choose a strong password and **save it somewhere safe**
   - **Region**: Choose the region closest to you or your users
   - **Pricing Plan**: Free tier is fine for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for your project to be provisioned

## Step 2: Get Your API Credentials

1. Once your project is ready, go to **Settings → API** in the left sidebar
2. You'll see two important values:
   - **Project URL** (something like `https://abcdefgh.supabase.co`)
   - **anon public key** (a long JWT token)
3. Keep this page open - you'll need these values in the next step

## Step 3: Update Your Environment Variables

1. Open the `.env` file in your frontend directory
2. Replace the placeholder values with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Open the `schema.sql` file (created in your frontend directory)
4. Copy the entire contents of `schema.sql`
5. Paste it into the SQL Editor
6. Click **"Run"** at the bottom right
7. Wait for it to complete (should say "Success" with details about tables created)

## Step 5: Configure Google OAuth (Optional)

If you want Google sign-in to work:

1. Go to **Authentication → Providers** in your Supabase dashboard
2. Find **Google** in the list and click on it
3. Enable the toggle
4. Follow the instructions to:
   - Create a Google Cloud Project (if you don't have one)
   - Enable Google OAuth credentials
   - Add authorized redirect URIs:
     - `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
5. Copy your Google Client ID and Client Secret
6. Paste them into the Supabase Google provider settings
7. Click **"Save"**

## Step 6: Restart Your Development Server

1. Stop your Next.js development server (Ctrl+C)
2. Clear your browser's localStorage:
   ```javascript
   // Open browser console (F12) and run:
   localStorage.clear()
   ```
3. Start your development server again:
   ```bash
   npm run dev
   ```

## Step 7: Test Authentication

1. Go to `http://localhost:3000`
2. Click **"Sign In"**
3. Try creating an account with email/password
4. If configured, try Google sign-in
5. After logging in, refresh the page - you should stay logged in ✅

## Troubleshooting

### "Failed to fetch" errors
- Make sure your `.env` file has the correct values
- Restart your dev server after changing `.env`

### RLS (Row Level Security) errors
- The schema includes RLS policies
- Make sure you're logged in when trying to access data
- Check the SQL Editor for any policy errors

### Google OAuth not working
- Verify your redirect URIs match exactly
- Make sure Google provider is enabled in Supabase
- Check that your site URL is set correctly in Supabase settings

### Session not persisting
- Clear localStorage and cookies
- Make sure you're using the latest code (with the auth fixes)
- Check browser console for any errors

## Database Tables Created

- ✅ **users** - User profiles, XP, streaks, etc.
- ✅ **analyses** - Saved sentence analyses
- ✅ **vocabulary** - User's vocabulary learning progress
- ✅ **daily_goals** - Daily goal tracking
- ✅ **achievements** - Achievement definitions
- ✅ **user_achievements** - Unlocked achievements per user

## Need Help?

If you run into issues:
1. Check the browser console (F12) for errors
2. Check the Supabase logs in your dashboard
3. Verify all environment variables are set correctly
4. Make sure the schema was applied successfully
