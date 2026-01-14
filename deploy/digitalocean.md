# Deploy to DigitalOcean

## 1. Create a Droplet

1. Go to [DigitalOcean](https://www.digitalocean.com/)
2. Create Droplet:
   - **Image**: Ubuntu 24.04 LTS
   - **Plan**: Basic → Regular → **$12/mo (2GB RAM)** or **$18/mo (2GB + 2 vCPU)**
   - **Region**: Choose closest to your users
   - **Authentication**: SSH Key (recommended) or Password

## 2. Initial Server Setup

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Create app directory
mkdir -p /opt/grammario
cd /opt/grammario
```

## 3. Clone and Configure

```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/grammario.git .

# Create production .env for backend
cat > backend/.env << 'EOF'
OPENROUTER_KEY=your_openrouter_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your_jwt_secret
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
DEBUG=false
EOF
```

## 4. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - OPENROUTER_KEY=${OPENROUTER_KEY}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_JWT_SECRET=${SUPABASE_JWT_SECRET}
      - CORS_ORIGINS=${CORS_ORIGINS}
    restart: always
    # Limit memory to prevent OOM
    deploy:
      resources:
        limits:
          memory: 1800M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: Nginx reverse proxy with SSL
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - backend
    restart: always
```

## 5. Deploy

```bash
# Build and start
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f backend

# Check status
docker compose -f docker-compose.prod.yml ps
```

## 6. Set Up Domain & SSL (Optional but recommended)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d api.yourdomain.com
```

## 7. Frontend on Vercel

1. Push frontend to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`

## Monitoring

```bash
# Check memory usage
free -h

# Check Docker stats
docker stats

# View backend logs
docker compose -f docker-compose.prod.yml logs -f backend
```

## Cost Breakdown
- DigitalOcean Droplet (2GB): $12/month
- Domain (optional): ~$10/year
- Vercel: Free
- Supabase: Free tier
- **Total: ~$12-15/month**
