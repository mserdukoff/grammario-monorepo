# Production Authentication Debugging Guide

## Issue: Auth works on first login but not after page refresh on grammario.ai

This is a session persistence issue specific to production. Follow these steps to diagnose and fix.

---

## Step 1: Verify Supabase Configuration ⚠️ CRITICAL

### A. Site URL Configuration
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication → URL Configuration**
4. **MUST SET:**
   - **Site URL**: `https://grammario.ai` (NOT localhost!)
   - Click **Save**

### B. Redirect URLs
In the same URL Configuration page, add ALL these URLs (comma-separated or one per line):
```
https://grammario.ai/**
https://grammario.ai/auth/callback
http://localhost:3000/**
http://localhost:3000/auth/callback
```

### C. Additional URLs
Scroll down to find **"Additional Redirect URLs"** and ensure the above are listed.

---

## Step 2: Verify Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your **grammario-ai** project
3. Go to **Settings → Environment Variables**
4. Verify these exist FOR ALL ENVIRONMENTS (Production, Preview, Development):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xyvmibgtadusyhyhxbjs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dm1pYmd0YWR1c3loeWh4YmpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTg4OTQsImV4cCI6MjA4Mzk3NDg5NH0.t6SZchK-uNB5Rpk-ucQp1iSn6_3-3C3Z4AP3baEry20
```

5. **After verifying/adding**, trigger a new deployment:
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment
   - Check **"Use existing Build Cache"** = OFF

---

## Step 3: Check Browser Console on Production

1. Go to `https://grammario.ai`
2. Open Browser Console (F12)
3. Clear console
4. Sign in with Google or email
5. After successful login, check for these logs:
   ```
   [Supabase] Client initialized for origin: https://grammario.ai
   [Supabase] localStorage available: true
   [Auth] Session initialized: true
   ```

6. Now **refresh the page** (F5)
7. Check for these logs:
   ```
   [Auth] Initializing session...
   [Auth] Session initialized: true
   ```

### If you see errors:
- `[Supabase] MISSING ENV VARS` → Environment variables not set in Vercel
- `localStorage available: false` → Browser blocking storage
- `Session initialized: false` → Session not restoring from localStorage

---

## Step 4: Check localStorage Directly

1. On `https://grammario.ai` after successful login
2. Open Browser Console (F12)
3. Go to **Application** tab → **Local Storage** → `https://grammario.ai`
4. Look for key: `grammario-auth-token`
5. It should have a value with `access_token`, `refresh_token`, etc.

### If localStorage is empty:
- Check if browser is blocking third-party cookies/storage
- Check if you're in Private/Incognito mode
- Verify Supabase Site URL is set to `https://grammario.ai`

---

## Step 5: Test Session Restoration

Open Browser Console on production and run:

```javascript
// Check if Supabase client exists
const supabase = window.__SUPABASE_CLIENT__ // This won't work, just for demo

// Better test: Check localStorage
const authData = localStorage.getItem('grammario-auth-token')
console.log('Auth data:', authData ? 'EXISTS' : 'MISSING')

// If exists, parse it
if (authData) {
  const parsed = JSON.parse(authData)
  console.log('Access token exists:', !!parsed.access_token)
  console.log('Expires at:', new Date(parsed.expires_at * 1000))
}
```

---

## Step 6: Common Production Issues & Fixes

### Issue A: "Site URL mismatch"
**Symptom:** Login works but session doesn't restore after refresh
**Fix:** Set Site URL in Supabase to `https://grammario.ai`

### Issue B: "CORS errors"
**Symptom:** Console shows CORS errors from Supabase
**Fix:**
1. Check Site URL is correct
2. Verify domain is in Google OAuth authorized domains
3. Clear browser cache completely

### Issue C: "Session expires immediately"
**Symptom:** User logged out right after login
**Fix:**
1. Check Supabase JWT settings (Auth → Settings)
2. Verify JWT expiry is reasonable (default: 3600s = 1 hour)
3. Check if `autoRefreshToken: true` is set (already done in our code)

### Issue D: "localStorage blocked"
**Symptom:** `localStorage available: false` in console
**Fix:**
1. Not in Private/Incognito mode
2. Browser settings allow storage
3. No browser extensions blocking storage

---

## Step 7: Force Reset (Last Resort)

If nothing works:

1. **Clear all site data:**
   - F12 → Application → Clear storage → "Clear site data"

2. **Clear Supabase auth cache:**
   ```javascript
   localStorage.removeItem('grammario-auth-token')
   localStorage.removeItem('sb-auth-token')
   sessionStorage.clear()
   ```

3. **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

4. **Try logging in again**

---

## Deployment Checklist ✅

Before deploying authentication changes:

- [ ] Supabase Site URL = `https://grammario.ai`
- [ ] Supabase Redirect URLs include production URL
- [ ] Vercel environment variables set for all environments
- [ ] Google OAuth authorized domains include `grammario.ai`
- [ ] Google OAuth redirect URIs include production callback
- [ ] New deployment triggered (without cache)
- [ ] Browser cache cleared on production
- [ ] Tested in production after deployment

---

## Still Not Working?

### Debug Script

Add this temporarily to your production app (in `src/app/app/page.tsx`):

```typescript
useEffect(() => {
  if (typeof window !== 'undefined') {
    console.log('=== AUTH DEBUG INFO ===')
    console.log('Origin:', window.location.origin)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('localStorage available:', typeof localStorage !== 'undefined')

    const authData = localStorage.getItem('grammario-auth-token')
    console.log('Auth data exists:', !!authData)

    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        console.log('Has access_token:', !!parsed.access_token)
        console.log('Expires at:', parsed.expires_at ? new Date(parsed.expires_at * 1000) : 'N/A')
      } catch (e) {
        console.error('Failed to parse auth data:', e)
      }
    }
    console.log('======================')
  }
}, [])
```

Deploy this and check the console logs on production. Share the output if you need further help.

---

## Contact Info

If issue persists after following ALL steps above:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Check Supabase logs (Dashboard → Logs)
4. Verify ALL checklist items above
