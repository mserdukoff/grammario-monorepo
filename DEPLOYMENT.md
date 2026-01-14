# Grammario Deployment Guide

## Architecture Overview

```
┌─────────────────┐      ┌──────────────────────┐      ┌─────────────────┐
│     Vercel      │      │    DigitalOcean      │      │    Supabase     │
│    (Frontend)   │─────▶│     (Backend)        │─────▶│   (Database)    │
│                 │      │                      │      │                 │
│  - Next.js      │      │  - FastAPI           │      │  - PostgreSQL   │
│  - Static CDN   │      │  - Stanza NLP        │      │  - Auth         │
│  - $0/month     │      │  - Docker            │      │  - RLS          │
│                 │      │  - $12-18/month      │      │  - $0/month     │
└─────────────────┘      └──────────────────────┘      └─────────────────┘
```

**Total Cost: ~$12-18/month**

---

## 🔒 Security Features Implemented

### Backend Security
- ✅ JWT token verification (Supabase)
- ✅ Rate limiting (per-user and global)
- ✅ Input sanitization (max 1000 chars)
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ CORS restricted to allowed origins
- ✅ Request logging with unique IDs
- ✅ Trusted host validation
- ✅ API docs disabled in production

### Database Security
- ✅ Row Level Security (RLS) on all tables
- ✅ Users can only access their own data
- ✅ Parameterized queries (via Supabase client)

### Frontend Security
- ✅ HttpOnly cookies for sessions
- ✅ Security headers via Vercel
- ✅ Environment variables not exposed to client

---

## Step 1: Prepare Your Code

```bash
# Ensure you're on main branch with all changes
git add .
git commit -m "Production deployment"
git push origin main
```

---

## Step 2: Deploy Backend to DigitalOcean

### 2.1 Create Droplet

1. Go to [DigitalOcean](https://cloud.digitalocean.com/)
2. **Create** → **Droplets**
3. Choose:
   - **Image**: Ubuntu 24.04 LTS
   - **Plan**: Basic → $12/mo (2GB RAM) or $18/mo (2GB + 2vCPU)
   - **Region**: NYC or closest to your users
   - **Authentication**: SSH Key (recommended)

### 2.2 Setup Server

SSH into your droplet:

```bash
ssh root@YOUR_DROPLET_IP
```

Run setup commands:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install -y docker-compose-plugin git

# Create app directory
mkdir -p /opt/grammario
cd /opt/grammario

# Clone repository
git clone https://github.com/YOUR_USERNAME/grammario.git .
```

### 2.3 Configure Environment

```bash
# Create production .env
cat > .env << 'EOF'
# LLM
OPENROUTER_KEY=your_openrouter_key
LLM_MODEL=anthropic/claude-sonnet-4

# Supabase
SUPABASE_URL=https://xyvmibgtadusyhyhxbjs.supabase.co
SUPABASE_JWT_SECRET=your_jwt_secret

# CORS (your Vercel domain)
CORS_ORIGINS=https://grammario.vercel.app,https://yourdomain.com

# Production settings
DEBUG=false
MAX_LOADED_MODELS=2
EOF
```

### 2.4 Deploy

```bash
# Build and start
docker compose -f docker-compose.prod.yml up -d --build

# Check logs
docker compose -f docker-compose.prod.yml logs -f backend

# Verify health
curl http://localhost:8000/health
```

### 2.5 Setup Domain & SSL (Optional but Recommended)

```bash
# Point your domain's DNS to droplet IP first, then:

# Install Certbot
apt install -y certbot

# Copy initial nginx config
cp nginx/nginx.initial.conf nginx/nginx.conf

# Restart nginx
docker compose -f docker-compose.prod.yml restart nginx

# Get SSL certificate
certbot certonly --webroot -w /opt/grammario/certbot/www \
  -d api.yourdomain.com

# Now update nginx.conf with SSL settings
cp nginx/nginx.conf.ssl nginx/nginx.conf  # Use the SSL version
docker compose -f docker-compose.prod.yml restart nginx
```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. **Add New** → **Project**
3. Import your GitHub repository
4. Select the `frontend` directory as root

### 3.2 Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xyvmibgtadusyhyhxbjs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your_key
API_URL=https://api.yourdomain.com  (or http://YOUR_DROPLET_IP:8000)
```

### 3.3 Deploy

Click **Deploy**. Vercel will:
1. Build your Next.js app
2. Deploy to global CDN
3. Give you a URL like `grammario.vercel.app`

---

## Step 4: Update CORS Origins

After you have your Vercel URL, update the backend:

```bash
# On your DigitalOcean droplet
cd /opt/grammario
nano .env  # Update CORS_ORIGINS with your Vercel URL

# Restart backend
docker compose -f docker-compose.prod.yml restart backend
```

---

## Step 5: Configure Supabase for Production

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. **Authentication** → **URL Configuration**
3. Update:
   - **Site URL**: `https://grammario.vercel.app` (your production URL)
   - **Redirect URLs**: Add `https://grammario.vercel.app/auth/callback`

---

## Step 6: Verify Deployment

### Health Checks

```bash
# Backend health
curl https://api.yourdomain.com/health

# Expected response:
# {"status":"healthy","version":"1.0.0","services":{"llm":true,"stripe":false}}
```

### Test Flow

1. Visit your Vercel URL
2. Try signing in with Google
3. Analyze a sentence
4. Verify it saves to history

---

## Monitoring & Maintenance

### View Logs

```bash
# Backend logs
docker compose -f docker-compose.prod.yml logs -f backend

# Nginx logs  
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Update Deployment

```bash
cd /opt/grammario
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

### Backup Database

Supabase provides automatic backups on paid plans. For free tier:

```bash
# Export via Supabase dashboard or pg_dump
```

---

## Troubleshooting

### "CORS error"
- Ensure `CORS_ORIGINS` in backend .env includes your Vercel URL
- Restart backend after changing: `docker compose restart backend`

### "502 Bad Gateway"
- Backend might be starting up (Stanza models take time to load)
- Check logs: `docker compose logs backend`

### "Google Sign-in not working"
- Verify redirect URI in Google Console matches Supabase
- Check Supabase Auth settings

### "Rate limit exceeded"
- Wait 60 seconds (global limit) or 24 hours (user limit)
- Upgrade to Pro for higher limits

---

## Security Checklist

Before going live:

- [ ] Set `DEBUG=false` in backend .env
- [ ] Update `CORS_ORIGINS` to only allow your domains
- [ ] Enable HTTPS (SSL certificate)
- [ ] Verify Google OAuth consent screen is published
- [ ] Test rate limiting works
- [ ] Remove any test accounts/data
- [ ] Set up monitoring (optional: UptimeRobot, Better Uptime)
