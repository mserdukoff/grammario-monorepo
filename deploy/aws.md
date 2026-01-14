# Deploy to AWS

## Option A: EC2 (Simple, Full Control)

### 1. Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Configure:
   - **Name**: grammario-backend
   - **AMI**: Ubuntu 24.04 LTS
   - **Instance type**: 
     - `t3.small` (2GB RAM) - $15/month - Minimum for 2-3 languages
     - `t3.medium` (4GB RAM) - $30/month - Comfortable for all 5 languages
   - **Key pair**: Create or select existing
   - **Security Group**: Allow HTTP (80), HTTPS (443), SSH (22)
   - **Storage**: 20GB gp3

### 2. Connect and Setup

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Re-login for docker group
exit
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Install Docker Compose
sudo apt install docker-compose-plugin -y
```

### 3. Deploy Application

```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/grammario.git
cd grammario

# Create .env
cat > backend/.env << 'EOF'
OPENROUTER_KEY=your_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your_secret
CORS_ORIGINS=https://yourdomain.com
EOF

# Build and run
docker compose up -d --build
```

### 4. Elastic IP (Static IP)

1. EC2 → Elastic IPs → Allocate
2. Associate with your instance
3. Point your domain to this IP

---

## Option B: AWS App Runner (Easier, Auto-scaling)

App Runner is simpler but costs more for always-on workloads.

### 1. Push to ECR

```bash
# Install AWS CLI
# Configure with: aws configure

# Create ECR repository
aws ecr create-repository --repository-name grammario-backend

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push
cd backend
docker build -t grammario-backend .
docker tag grammario-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/grammario-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/grammario-backend:latest
```

### 2. Create App Runner Service

1. AWS Console → App Runner → Create service
2. Source: Container registry → Amazon ECR
3. Configure:
   - **CPU**: 1 vCPU
   - **Memory**: 2 GB (minimum for Stanza)
   - **Port**: 8000
4. Add environment variables
5. Create & deploy

---

## Option C: ECS Fargate (Production-grade)

Best for scaling, but more complex setup.

### `ecs-task-definition.json`:

```json
{
  "family": "grammario-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ECR_IMAGE_URI",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "OPENROUTER_KEY", "value": "your_key"},
        {"name": "SUPABASE_URL", "value": "https://your-project.supabase.co"},
        {"name": "SUPABASE_JWT_SECRET", "value": "your_secret"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/grammario",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

---

## Cost Comparison (AWS)

| Service | Config | Monthly Cost |
|---------|--------|--------------|
| EC2 t3.small | 2GB RAM, always on | ~$15 |
| EC2 t3.medium | 4GB RAM, always on | ~$30 |
| EC2 Spot t3.medium | 4GB RAM, can be interrupted | ~$10 |
| App Runner | 1 vCPU, 2GB, auto-scale | ~$25-50 |
| ECS Fargate | 1 vCPU, 2GB | ~$35-45 |

**Recommendation**: Start with **EC2 t3.small** ($15/month). Upgrade to t3.medium if you need all 5 languages loaded simultaneously.

---

## AWS Free Tier Note

AWS Free Tier includes t2.micro (1GB RAM) for 12 months - **NOT enough for Stanza models**. You'll need a paid instance.
