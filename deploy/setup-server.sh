#!/bin/bash
# Server Setup Script for Grammario
# Run this on a fresh Ubuntu 22.04/24.04 server

set -e

echo "🚀 Setting up Grammario server..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose plugin
apt install -y docker-compose-plugin

# Install useful tools
apt install -y git curl htop ncdu

# Create app directory
echo "📁 Creating application directory..."
mkdir -p /opt/grammario
cd /opt/grammario

# Clone repository (replace with your repo URL)
echo "📥 Clone your repository manually:"
echo "   git clone https://github.com/YOUR_USERNAME/grammario.git ."
echo ""

# Create directories for SSL
mkdir -p certbot/conf certbot/www nginx/ssl

# Create production environment file template
cat > .env.production << 'EOF'
# Grammario Production Environment
# Copy this to .env and fill in your values

# LLM Configuration
OPENROUTER_KEY=your_openrouter_key_here
LLM_MODEL=anthropic/claude-sonnet-4

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your_jwt_secret_here

# Domain Configuration (update nginx/nginx.conf too)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Memory Management (2 for 2GB RAM, 4 for 4GB RAM)
MAX_LOADED_MODELS=2

# Debug
DEBUG=false
EOF

echo ""
echo "✅ Server setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Clone your repository:"
echo "   cd /opt/grammario"
echo "   git clone https://github.com/YOUR_USERNAME/grammario.git ."
echo ""
echo "2. Copy and edit environment file:"
echo "   cp .env.production .env"
echo "   nano .env"
echo ""
echo "3. Update nginx/nginx.conf with your domain"
echo ""
echo "4. Get SSL certificate:"
echo "   docker compose -f docker-compose.prod.yml run --rm certbot certonly --webroot -w /var/www/certbot -d api.yourdomain.com"
echo ""
echo "5. Start the application:"
echo "   docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "6. Check status:"
echo "   docker compose -f docker-compose.prod.yml ps"
echo "   docker compose -f docker-compose.prod.yml logs -f backend"
