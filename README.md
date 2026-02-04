# Grammario

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe" alt="Stripe">
</div>

<br>

**Grammario** is a production-ready linguistic analysis platform that helps language learners deeply understand grammar through interactive visualizations and AI-powered explanations.

## 🌟 Features

### Core Analysis
- **Deep Linguistic Analysis** - Stanford NLP (Stanza) for tokenization, lemmatization, POS tagging, and dependency parsing
- **AI Explanations** - LLM-powered pedagogical insights explaining grammar concepts
- **Interactive Visualization** - ReactFlow-based syntax tree and linear views
- **5 Languages** - Italian, Spanish, German, Russian, Turkish

### Gamification (Duolingo-inspired)
- 🔥 **Streaks** - Daily learning habit tracking
- ⚡ **XP & Levels** - Progress through 10+ levels
- 🎯 **Daily Goals** - Customizable targets
- 🏆 **Achievements** - 15+ unlockable badges
- 📊 **Stats Dashboard** - Track your learning journey

### Production Features
- 🔐 **Authentication** - Email/password + Google OAuth via Supabase
- 💳 **Payments** - Stripe subscription for Pro tier
- 📝 **History** - Save and favorite analyses
- 📚 **Vocabulary** - Spaced repetition system (SM-2)
- 🔊 **Text-to-Speech** - Native pronunciation

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 FRONTEND (Next.js 16)                   │
│          React 19 • Tailwind • ReactFlow • Zustand      │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
┌─────────────────────┐         ┌─────────────────────────┐
│  SUPABASE (BaaS)    │         │   BACKEND (FastAPI)     │
│  • Auth (JWT)       │         │   • NLP (Stanza)        │
│  • PostgreSQL       │◄───────►│   • LLM (OpenRouter)    │
│  • Realtime         │         │   • Stripe Webhooks     │
│  • Row-Level Sec.   │         │   • Rate Limiting       │
└─────────────────────┘         └─────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- [Supabase Account](https://supabase.com) (free tier works)
- [Stripe Account](https://stripe.com) (for payments)
- [OpenRouter API Key](https://openrouter.ai) (for LLM)

### 1. Clone & Install

```bash
git clone https://github.com/mserdukoff/grammario.git
cd grammario

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project
2. Go to SQL Editor and run `supabase/schema.sql`
3. Enable Google OAuth in Authentication → Providers
4. Copy your project URL and anon key

### 3. Configure Environment

```bash
# Root .env
cp env.example .env

# Frontend
cd frontend
cp .env.example .env.local
```

Fill in your credentials:
- `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_JWT_SECRET` (Settings → API → JWT Secret)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENROUTER_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`

### 4. Run Development

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

## 🐳 Docker Deployment

```bash
# Build and run
docker-compose up --build

# With environment file
docker-compose --env-file .env up
```

## 📱 Database Schema

```sql
users           -- Profiles, subscription, gamification stats
analyses        -- Sentence analyses with JSONB nodes
vocabulary      -- Saved words with spaced repetition
daily_goals     -- Daily target tracking
achievements    -- Badge definitions
user_achievements  -- Unlocked badges
```

See `supabase/schema.sql` for full schema with RLS policies.

## 💳 Stripe Setup

1. Create a Product in Stripe Dashboard
2. Add a $5/month Price
3. Set up webhook endpoint: `https://yourdomain.com/api/v1/billing/webhook`
4. Listen for events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## 🚄 Deploy to Production

### Railway (Recommended)
1. Push to GitHub
2. Create Railway project → Deploy from GitHub
3. Add two services from same repo:
   - **Backend**: Root Directory = `/backend`
   - **Frontend**: Root Directory = `/frontend`
4. Add environment variables to each service

### Vercel + Railway
- Frontend on Vercel (automatic Next.js optimization)
- Backend on Railway (Python support)

### Other Platforms
Docker support works on: Render, Fly.io, DigitalOcean, AWS ECS

## 📊 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| State | Zustand (persisted), TanStack Query |
| Visualization | ReactFlow, Dagre, Framer Motion |
| Backend | FastAPI, Pydantic, Stanza NLP |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth (JWT) |
| Payments | Stripe Subscriptions |
| LLM | OpenRouter (GPT-4, Claude, Gemini) |
| Deployment | Docker, Railway |

## 🎯 Roadmap

- [ ] More languages (French, Portuguese, Japanese)
- [ ] Mobile app (React Native)
- [ ] Sentence collections / lessons
- [ ] Community features (share analyses)
- [ ] API access for Pro users
- [ ] Browser extension

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

```bash
# Run tests
cd backend && pytest
cd frontend && npm test

# Lint
cd frontend && npm run lint
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---<div align="center">
  Built with ❤️ for language learners
</div>