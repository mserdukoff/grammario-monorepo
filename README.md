# Grammario

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16.0.10-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.2.1-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-0.109+-009688?style=flat-square&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/spaCy-NLP-09A3D5?style=flat-square&logo=spacy" alt="spaCy">
  <img src="https://img.shields.io/badge/Stanza-NLP-FF6B6B?style=flat-square" alt="Stanza">
  <img src="https://img.shields.io/badge/Redis-Cache-DC382D?style=flat-square&logo=redis" alt="Redis">
  <img src="https://img.shields.io/badge/pgvector-Embeddings-336791?style=flat-square&logo=postgresql" alt="pgvector">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind">
</div>

<br>

**Grammario** is a production-ready linguistic analysis platform that helps language learners deeply understand grammar through interactive visualizations and AI-powered explanations. It combines spaCy and Stanford NLP (Stanza) for linguistic analysis with LLM-powered pedagogical insights, sentence embeddings for similarity search, CEFR difficulty scoring, rule-based error detection, and a spaced repetition vocabulary system — all behind a gamified learning experience.

---

## Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Frontend](#-frontend)
- [Backend](#-backend)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Admin Dashboard](#-admin-dashboard)
- [Deployment](#-deployment)
- [Video Generation System](#-video-generation-system)
- [Environment Variables](#-environment-variables)
- [Development Setup](#-development-setup)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## Features

### Core Analysis Engine
- **Dual NLP Backend** — spaCy (preferred, CPU-optimized) with Stanza fallback for robust tokenization, POS tagging, lemmatization, morphological analysis, and dependency parsing
- **AI-Powered Explanations** — LLM-generated pedagogical insights explaining grammar concepts, rules, and the "why" behind grammatical choices
- **CEFR Difficulty Scoring** — Automatic A1–C2 difficulty classification using engineered linguistic features (sentence length, tree depth, subordination, morphological complexity, TTR, lexical density)
- **Rule-Based Error Detection** — Language-specific grammar agreement checking (Romance gender/number, inflection case, Turkish vowel harmony, universal subject-verb agreement)
- **Sentence Embeddings** — 384-dimensional multilingual embeddings via sentence-transformers for similarity search
- **Interactive Visualization** — ReactFlow-based syntax tree and linear views with draggable nodes
- **5 Languages Supported** — Italian, Spanish, German, Russian, Turkish
- **Language-Specific Strategies** — Romance (clitics, MWT), Inflection (cases, aspect), Agglutinative (Turkish morpheme segmentation)
- **Redis Caching** — 24-hour analysis cache with SHA-256 key hashing for instant repeated lookups
- **Parallel Pipeline** — NLP, LLM explanations, and embeddings run concurrently via `asyncio.gather`

### Visualization Modes
- **Linear View** — Words displayed in sentence order with dependency arrows
- **Tree View** — Hierarchical dependency tree using Dagre layout algorithm
- **Draggable Nodes** — Toggle to rearrange word nodes for exploration
- **Word Nodes** — Show text, lemma, POS tag, morphological features, and dependency relations
- **Animated Edges** — SVG arrows showing grammatical relationships

### Pedagogical Data
- **Translation** — English translation of the analyzed sentence
- **Nuance** — Cultural and linguistic notes explaining subtle meanings
- **Grammar Concepts** — Detailed explanations with names, descriptions, and related words
- **"Why" Tips** — Answers to questions like "Why -a at the end?" with rules and examples
- **LLM Grammar Errors** — AI-detected grammar issues with explanations
- **Rule-Based Errors** — Deterministic agreement checks with severity levels and corrections
- **CEFR Level** — Difficulty badge (A1–C2) with raw score and feature breakdown

### Vocabulary & Spaced Repetition
- **SM-2 Algorithm** — SuperMemo-2 spaced repetition with ease factor, interval progression, and mastery scoring
- **Flashcard Review** — Dedicated `/app/review` page with reveal-based flashcards
- **Quality Ratings** — 0–5 quality scale (Wrong, Hard, Good shortcuts) affecting interval scheduling
- **Review Stats** — Total words, due today, mastered count (mastery >= 80%)
- **Session Summary** — Post-review stats with accuracy and restart option

### Gamification (Duolingo-inspired)
- **Streaks** — Daily learning habit tracking with consecutive day counting
- **XP & Levels** — Progress through 10 levels with exponential XP requirements (10 XP per analysis)
- **Daily Goals** — Customizable targets (3–20 analyses per day)
- **Achievements** — 15+ unlockable badges (first analysis, milestones, streaks, vocabulary, levels, polyglot)
- **Stats Dashboard** — Track level, XP progress, streak, and daily goal completion

### User Features
- **Authentication** — Email/password + Google OAuth via Supabase Auth
- **History** — Save and view recent analyses (last 20) with favorites
- **Sentence Feedback** — Star ratings (1–5), category tags, and comments on analysis quality
- **Text-to-Speech** — Browser SpeechSynthesis API with language-specific voices
- **Settings** — Daily goal targets, TTS toggle, translation preferences
- **Account Types** — Regular and test accounts with configurable sentence limits and expiry

### Admin Dashboard
- **Overview** — KPI cards (total users, analyses, vocabulary, feedback), language breakdown, recent activity
- **User Management** — Search, filter by account type, inline edit, create/delete users
- **Request Inspector** — Browse all analyses, deep-link by ID, raw JSON view, delete
- **Vocabulary Browser** — Paginated view of all user vocabulary entries
- **Feedback Manager** — Filter by category/resolved, summary stats, resolve and annotate
- **Backend Health** — Live health check proxy to FastAPI, service status, memory info

### Legal & Information Pages
- **Terms of Service** — 13-section legal document with Canadian governing law
- **Privacy Policy** — Data collection, third-party services, retention, and user rights
- **Patch Notes** — Technical changelog with Mermaid architecture diagrams and markdown rendering

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (Vercel)                                   │
│                     Next.js 16 • React 19 • TypeScript                         │
│                 Tailwind CSS v4 • ReactFlow • Zustand • TanStack Query         │
│                                                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Landing  │ │   App    │ │  Analyze │ │  Review  │ │  Admin   │            │
│  │  Page    │ │   Home   │ │   Page   │ │   Page   │ │  Panel   │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐      │
│  │                      Next.js API Routes                              │      │
│  │  /api/v1/analyze  │  /api/v1/languages  │  /api/v1/usage            │      │
│  │  /api/v1/vocabulary/review  │  /api/v1/admin/*                      │      │
│  └──────────────────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────────────┐               ┌──────────────────────────────────┐
│     SUPABASE (BaaS)         │               │    BACKEND (DigitalOcean)        │
│                             │               │    FastAPI • Python 3.11          │
│  ┌───────────────────────┐  │               │                                   │
│  │   Supabase Auth       │  │               │  ┌────────────────────────────┐   │
│  │   • Email/Password    │  │               │  │    NLP Pipeline            │   │
│  │   • Google OAuth      │  │               │  │   • spaCy (preferred)      │   │
│  │   • JWT Tokens        │  │               │  │   • Stanza (fallback)      │   │
│  └───────────────────────┘  │               │  │   • LRU Model Caching     │   │
│                             │               │  └────────────────────────────┘   │
│  ┌───────────────────────┐  │               │                                   │
│  │   PostgreSQL + pgvec  │  │               │  ┌────────────────────────────┐   │
│  │   • users             │  │               │  │    LLM Service             │   │
│  │   • analyses          │  │  ◄──────────► │  │   • OpenRouter (primary)   │   │
│  │   • vocabulary        │  │               │  │   • OpenAI (fallback)      │   │
│  │   • daily_goals       │  │               │  └────────────────────────────┘   │
│  │   • achievements      │  │               │                                   │
│  │   • user_achievements │  │               │  ┌────────────────────────────┐   │
│  │   • sentence_feedback │  │               │  │    Embedding Service       │   │
│  │   • match_analyses()  │  │               │  │   • sentence-transformers  │   │
│  └───────────────────────┘  │               │  │   • 384-dim vectors        │   │
│                             │               │  └────────────────────────────┘   │
│  ┌───────────────────────┐  │               │                                   │
│  │   Row Level Security  │  │               │  ┌────────────────────────────┐   │
│  │   (User data isolation)│  │               │  │    Analysis Enrichment     │   │
│  └───────────────────────┘  │               │  │   • Difficulty (A1–C2)     │   │
│                             │               │  │   • Error Detection        │   │
└─────────────────────────────┘               │  │   • Frequency Bands        │   │
                                              │  └────────────────────────────┘   │
                                              │                                   │
                                              │  ┌────────────────────────────┐   │
                                              │  │    Redis Cache             │   │
                                              │  │   • 24h TTL               │   │
                                              │  │   • SHA-256 keys          │   │
                                              │  │   • LRU eviction          │   │
                                              │  └────────────────────────────┘   │
                                              │                                   │
                                              │  ┌────────────────────────────┐   │
                                              │  │   Language Strategies      │   │
                                              │  │   • RomanceStrategy        │   │
                                              │  │   • InflectionStrategy     │   │
                                              │  │   • AgglutinativeStrategy  │   │
                                              │  └────────────────────────────┘   │
                                              └──────────────────────────────────┘
                                                              │
                                                              ▼
                                              ┌──────────────────────────────────┐
                                              │           NGINX                   │
                                              │   • Rate Limiting (10 req/s)      │
                                              │   • SSL (Let's Encrypt)           │
                                              │   • Gzip Compression              │
                                              │   • Connection Limits             │
                                              └──────────────────────────────────┘
```

### Data Flow

1. User enters sentence on `/app/analyze` and clicks "Analyze"
2. Frontend calls `/api/v1/analyze` via `authFetch` (Bearer token) — validates input, checks rate limits and account quotas
3. Next.js API route proxies to Python NLP backend
4. **Redis Cache Check**: SHA-256 hash of `language:text` — on hit, returns cached result instantly
5. **Parallel Execution** (`asyncio.gather`):
   - **NLP Pipeline**: spaCy (preferred) or Stanza (fallback) → Tokenization → POS Tagging → Lemmatization → Dependency Parsing
   - **LLM Service**: Generates pedagogical explanations (translation, concepts, tips, errors)
   - **Embedding Service**: Generates 384-dim sentence vector
6. **Language Strategy**: Processes NLP output into TokenNodes (handles language-specific features like clitics, cases, agglutination)
7. **Post-Processing**: Difficulty scoring (CEFR A1–C2), rule-based error detection
8. Backend returns `SentenceAnalysis` with nodes, pedagogical data, difficulty, errors, and embedding
9. **Cache Write**: Stores result in Redis (embedding stripped to save space)
10. Frontend builds ReactFlow graph from nodes/edges
11. If authenticated: saves to Supabase (with pgvector embedding), updates XP, checks daily goal, checks achievements
12. Displays visualization + pedagogical insights panel + difficulty badge + error annotations

---

## Tech Stack

### Frontend

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | Next.js | 16.0.10 | App Router, SSR, API Routes |
| UI Library | React | 19.2.1 | Component library |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | v4 | Utility-first CSS |
| Typography | @tailwindcss/typography | - | Prose styling for markdown content |
| State (Client) | Zustand | 5.0.9 | Persistent client state |
| State (Server) | TanStack Query | 5.90.17 | Server state & caching |
| Visualization | ReactFlow | 11.11.4 | Interactive node graphs |
| Graph Layout | Dagre | 0.8.5 | Dependency tree layout |
| Animation | Framer Motion | 12.23.26 | Smooth animations |
| Diagrams | Mermaid | - | Architecture and flow diagrams |
| Markdown | react-markdown + remark-gfm | - | Rich text rendering (patch notes) |
| Icons | Lucide React | 0.561.0 | Icon library |
| Toasts | Sonner | 2.0.7 | Toast notifications |
| HTTP Client | Axios | 1.13.2 | API calls |
| Date Utils | date-fns | 4.1.0 | Date formatting |
| UI Primitives | Radix UI | Various | Select, Toggle, ToggleGroup, Slot |
| Class Utils | clsx + tailwind-merge | - | Conditional classes |
| Variants | class-variance-authority | - | Component variants |

### Backend

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | FastAPI | >=0.109.0 | Async API framework |
| Server | Uvicorn | >=0.27.0 | ASGI server |
| Validation | Pydantic | >=2.5.0 | Schema validation |
| Settings | Pydantic-settings | >=2.1.0 | Environment config |
| NLP (Primary) | spaCy | >=3.7.0 | CPU-optimized NLP pipelines |
| NLP (Fallback) | Stanza | >=1.7.0 | Stanford NLP pipelines |
| Embeddings | sentence-transformers | >=2.2.0 | Multilingual sentence embeddings |
| ML | scikit-learn + joblib | >=1.4.0 | Future trained difficulty models |
| Numeric | NumPy | >=1.26.0 | Vector operations |
| LLM Client | OpenAI | >=1.10.0 | OpenRouter/OpenAI API |
| HTTP | httpx | >=0.26.0 | Async HTTP client |
| Cache | Redis | >=5.0.0 | Analysis result caching |
| System | psutil | >=5.9.0 | Memory/system monitoring |
| Environment | python-dotenv | >=1.0.0 | .env file loading |

### Database & Auth

| Category | Technology | Purpose |
|----------|------------|---------|
| Database | Supabase PostgreSQL | Managed PostgreSQL with RLS |
| Vector Search | pgvector | 384-dim sentence embeddings with IVFFlat index |
| Auth | Supabase Auth | JWT-based authentication |
| Client | @supabase/supabase-js 2.90.1 | Browser client |
| SSR Client | @supabase/ssr 0.8.0 | Server-side rendering |

### Infrastructure

| Category | Technology | Purpose |
|----------|------------|---------|
| Container | Docker | Containerization |
| Orchestration | Docker Compose | Multi-container management |
| Cache | Redis 7 Alpine | Analysis caching with LRU eviction |
| Reverse Proxy | Nginx | Rate limiting, SSL, caching |
| SSL | Let's Encrypt (Certbot) | Free SSL certificates |
| Auto-Update | Watchtower | Automatic container updates (optional) |
| CI/CD | GitHub Actions | Automated testing & deployment |
| Frontend Hosting | Vercel | Next.js optimized hosting (iad1 region) |
| Backend Hosting | DigitalOcean | Docker container hosting |

### Video Generation

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | Remotion | 4.0.232 | React-based video creation |
| UI | React | 18.3.1 | Components |
| Language | TypeScript | 5.6.3 | Type safety |

---

## Project Structure

```
grammario-monorepo/
├── .github/
│   └── workflows/
│       └── deploy.yml                # CI/CD: test → build → deploy → notify
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app, CORS, lifespan events
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py             # /analyze, /embed, /languages, /cache/*
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py             # Pydantic settings
│   │   │   └── security.py           # Input sanitization
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py            # Pydantic models (TokenNode, DifficultyInfo, etc.)
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── nlp.py                # NLP orchestration (parallel pipeline)
│   │       ├── llm_service.py        # LLM integration (OpenRouter/OpenAI)
│   │       ├── spacy_manager.py      # spaCy pipeline manager (LRU)
│   │       ├── stanza_manager.py     # Stanza pipeline manager (LRU fallback)
│   │       ├── embeddings.py         # Sentence-transformers embedding service
│   │       ├── difficulty_scorer.py  # CEFR A1–C2 difficulty scoring
│   │       ├── error_detector.py     # Rule-based grammar error detection
│   │       ├── frequency.py          # Lemma frequency band service (1–5)
│   │       ├── cache.py              # Redis caching service
│   │       └── strategies/
│   │           ├── __init__.py
│   │           ├── base.py           # Abstract strategy base class
│   │           └── concrete.py       # Language-specific strategies
│   ├── data/
│   │   └── frequency/                # Lemma frequency JSON maps per language
│   ├── Dockerfile                    # Development Docker image
│   ├── Dockerfile.prod               # Production multi-stage build
│   ├── download_models.py            # Pre-download Stanza/spaCy models
│   ├── requirements.txt              # Python dependencies
│   ├── test_api.py                   # API endpoint tests
│   └── test_llm.py                   # LLM integration tests
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout with providers & fonts
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── globals.css           # Global styles & CSS variables
│   │   │   ├── terms/
│   │   │   │   └── page.tsx          # Terms of Service
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx          # Privacy Policy
│   │   │   ├── patch-notes/
│   │   │   │   └── page.tsx          # Changelog with Mermaid diagrams
│   │   │   ├── app/
│   │   │   │   ├── page.tsx          # App home (dashboard hub)
│   │   │   │   ├── analyze/
│   │   │   │   │   └── page.tsx      # Sentence analysis interface
│   │   │   │   ├── review/
│   │   │   │   │   └── page.tsx      # Vocabulary review (flashcards)
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx      # User settings
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx        # Admin shell with sidebar nav
│   │   │   │   ├── page.tsx          # Admin overview (KPIs)
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx      # User management (CRUD)
│   │   │   │   ├── requests/
│   │   │   │   │   └── page.tsx      # Analysis inspector
│   │   │   │   ├── vocabulary/
│   │   │   │   │   └── page.tsx      # Vocabulary browser
│   │   │   │   ├── feedback/
│   │   │   │   │   └── page.tsx      # Feedback manager
│   │   │   │   └── backend/
│   │   │   │       └── page.tsx      # Backend health monitor
│   │   │   ├── auth/
│   │   │   │   ├── callback/
│   │   │   │   │   └── page.tsx      # OAuth callback handler
│   │   │   │   └── error/
│   │   │   │       └── page.tsx      # Auth error page
│   │   │   └── api/v1/
│   │   │       ├── analyze/
│   │   │       │   └── route.ts      # Proxy to Python backend
│   │   │       ├── languages/
│   │   │       │   └── route.ts      # Supported languages
│   │   │       ├── usage/
│   │   │       │   └── route.ts      # User usage statistics
│   │   │       ├── vocabulary/
│   │   │       │   └── review/
│   │   │       │       └── route.ts  # SRS review (GET due words, POST review)
│   │   │       └── admin/
│   │   │           ├── stats/
│   │   │           │   └── route.ts  # Admin KPI aggregation
│   │   │           ├── users/
│   │   │           │   └── route.ts  # Admin user CRUD
│   │   │           ├── analyses/
│   │   │           │   └── route.ts  # Admin analysis browser
│   │   │           ├── vocabulary/
│   │   │           │   └── route.ts  # Admin vocabulary browser
│   │   │           ├── feedback/
│   │   │           │   └── route.ts  # Admin feedback management
│   │   │           └── health/
│   │   │               └── route.ts  # Backend health proxy
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── auth-modal.tsx    # Login/signup modal
│   │   │   ├── feedback/
│   │   │   │   └── feedback-form.tsx # Star rating + category feedback
│   │   │   ├── flow/
│   │   │   │   └── WordNode.tsx      # ReactFlow word node component
│   │   │   ├── gamification/
│   │   │   │   ├── achievement-toast.tsx
│   │   │   │   ├── history-panel.tsx
│   │   │   │   └── stats-panel.tsx
│   │   │   ├── landing/
│   │   │   │   ├── FaqSection.tsx
│   │   │   │   ├── FeaturesSection.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── PricingSection.tsx
│   │   │   │   └── WhyChooseUsSection.tsx
│   │   │   ├── providers.tsx         # QueryClient, AuthProvider, Toaster
│   │   │   ├── LandingDemo.tsx       # Landing page demo
│   │   │   └── ui/
│   │   │       ├── app-navbar.tsx    # App shell navigation
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── footer.tsx
│   │   │       ├── mermaid-diagram.tsx # Mermaid chart renderer
│   │   │       ├── navbar.tsx        # Landing/marketing navigation
│   │   │       ├── select.tsx
│   │   │       ├── toggle.tsx
│   │   │       └── toggle-group.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                # Axios API client
│   │   │   ├── admin.ts              # Admin role check (env-based)
│   │   │   ├── auth-context.tsx      # Auth context provider
│   │   │   ├── auth-fetch.ts         # Authenticated fetch with Bearer token
│   │   │   ├── db.ts                 # Database utilities (save, query, etc.)
│   │   │   ├── sm2.ts                # SM-2 spaced repetition algorithm
│   │   │   ├── utils.ts              # Utility functions (cn)
│   │   │   └── supabase/
│   │   │       ├── client.ts         # Browser Supabase client
│   │   │       ├── server.ts         # Server Supabase client (SSR)
│   │   │       ├── api.ts            # Supabase API helpers
│   │   │       ├── middleware.ts      # Session refresh middleware
│   │   │       └── database.types.ts # Generated TypeScript types
│   │   ├── store/
│   │   │   └── useAppStore.ts        # Zustand store with persistence
│   │   └── middleware.ts             # Next.js middleware wrapper
│   ├── public/                       # Static assets (logo, banner, etc.)
│   ├── Dockerfile                    # Frontend Docker image
│   ├── package.json                  # Node dependencies
│   ├── next.config.ts                # Next.js config (standalone output)
│   ├── tsconfig.json                 # TypeScript config
│   ├── eslint.config.mjs             # ESLint 9 + Next.js
│   ├── postcss.config.mjs            # PostCSS + Tailwind v4
│   └── vercel.json                   # Vercel deployment (region, headers)
├── deploy/
│   ├── aws.md                        # AWS deployment guide
│   ├── digitalocean.md               # DigitalOcean deployment guide
│   └── setup-server.sh               # Server initialization script
├── nginx/
│   ├── nginx.conf                    # Production Nginx configuration
│   └── nginx.initial.conf            # Initial config for SSL setup
├── supabase/
│   └── schema.sql                    # Full database schema with RLS, pgvector, triggers
├── video/                            # Remotion video generation
│   ├── src/
│   │   ├── components/               # Video components
│   │   ├── compositions/             # Video compositions
│   │   ├── scenes/                   # Video scenes
│   │   ├── data/                     # Sentence data
│   │   └── styles/                   # Global CSS
│   ├── package.json
│   └── remotion.config.ts
├── docs/
│   └── GOOGLE_OAUTH_SETUP.md         # Google OAuth setup guide
├── docker-compose.yml                # Dev: Redis + backend + frontend
├── docker-compose.prod.yml           # Prod: Redis + backend + nginx + certbot + watchtower
├── DEPLOYMENT.md                     # Main deployment documentation
├── env.example                       # Example environment variables
└── README.md                         # This file
```

---

## Frontend

### Pages (App Router)

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing page with Hero, Features, Pricing, FAQ sections |
| `/app` | `app/app/page.tsx` | App home — welcome hub with links to Analyze and Review |
| `/app/analyze` | `app/app/analyze/page.tsx` | Main analysis interface — ReactFlow graph, pedagogical panel, difficulty, errors, feedback |
| `/app/review` | `app/app/review/page.tsx` | Vocabulary review — SM-2 flashcards with quality ratings |
| `/app/settings` | `app/app/settings/page.tsx` | User settings (daily goal, TTS, translations, etc.) |
| `/admin` | `app/admin/page.tsx` | Admin overview — KPIs, language breakdown, recent activity |
| `/admin/users` | `app/admin/users/page.tsx` | User management — search, filter, create, edit, delete |
| `/admin/requests` | `app/admin/requests/page.tsx` | Analysis inspector — browse, deep-link, raw JSON, delete |
| `/admin/vocabulary` | `app/admin/vocabulary/page.tsx` | Vocabulary browser — all users, paginated |
| `/admin/feedback` | `app/admin/feedback/page.tsx` | Feedback manager — filter, resolve, annotate |
| `/admin/backend` | `app/admin/backend/page.tsx` | Backend health — service status, memory, raw JSON |
| `/terms` | `app/terms/page.tsx` | Terms of Service |
| `/privacy` | `app/privacy/page.tsx` | Privacy Policy |
| `/patch-notes` | `app/patch-notes/page.tsx` | Changelog with Mermaid diagrams and markdown |
| `/auth/callback` | `app/auth/callback/page.tsx` | OAuth callback handler |
| `/auth/error` | `app/auth/error/page.tsx` | Authentication error page |

### API Routes (Next.js)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/analyze` | POST | Proxies to Python NLP backend, handles auth and rate limiting |
| `/api/v1/languages` | GET | Returns supported languages with metadata |
| `/api/v1/usage` | GET | Returns user usage statistics (analyses today, limits) |
| `/api/v1/vocabulary/review` | GET | Fetches due vocabulary words (limit 20) + review stats |
| `/api/v1/vocabulary/review` | POST | Submits review quality (0–5), updates SM-2 scheduling |
| `/api/v1/admin/stats` | GET | Aggregated KPIs (users, analyses, vocabulary, feedback counts) |
| `/api/v1/admin/users` | GET/POST/PATCH/DELETE | Full user CRUD (admin only) |
| `/api/v1/admin/analyses` | GET/DELETE | Browse and manage analyses (admin only) |
| `/api/v1/admin/vocabulary` | GET | Paginated vocabulary for all users (admin only) |
| `/api/v1/admin/feedback` | GET/PATCH | Browse, resolve, and annotate feedback (admin only) |
| `/api/v1/admin/health` | GET | Proxies backend `/health` endpoint (admin only) |

### Components

#### Landing Page
- **HeroSection** — Hero with animated text and CTA
- **FeaturesSection** — Feature cards with icons
- **WhyChooseUsSection** — Benefits comparison
- **PricingSection** — Free vs Pro tier comparison
- **FaqSection** — Accordion FAQ
- **LandingDemo** — Interactive demo component

#### App Components
- **WordNode** — ReactFlow node displaying word token with POS tag, lemma, features
- **StatsPanel** — XP, level, streak, daily goal progress
- **HistoryPanel** — Recent analyses with favorites functionality
- **AchievementToast** — Achievement unlock notifications
- **FeedbackForm** — Star ratings (1–5), category chips, comments on analysis quality

#### Auth
- **AuthModal** — Login/signup modal with Google OAuth and email/password

#### UI Components (shadcn/ui style)
- **Button** — Variants: default, destructive, outline, secondary, ghost, link
- **Card** — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Select** — Dropdown select with Radix UI primitives
- **Toggle** — Toggle button with variants
- **ToggleGroup** — Toggle group with single/multiple selection
- **Navbar** — Landing/marketing navigation with auth state
- **AppNavbar** — App shell navigation (analyze, review, settings, admin)
- **Footer** — Page footer with legal links
- **MermaidDiagram** — Mermaid chart renderer for patch notes

### State Management

#### Zustand Store (`useAppStore.ts`)

```typescript
interface AppState {
  // UI State
  sidebarOpen: boolean;

  // Current Analysis
  currentAnalysis: AnalysisResponse | null;
  recentAnalyses: AnalysisResponse[];  // In-memory, max 10

  // User Preferences (persisted to localStorage)
  defaultLanguage: string;             // Default: "it"
  dailyGoalTarget: number;             // Default: 5
  showTranslations: boolean;           // Default: true
  enableSounds: boolean;               // Default: true
  enableTTS: boolean;                  // Default: true

  // Onboarding
  hasCompletedOnboarding: boolean;
}
```

**Persistence**: Uses Zustand `persist` middleware, stored in localStorage under key `"grammario-storage"`.

#### Server State (TanStack Query)
- User profile fetching
- Analyses history
- 1-minute stale time
- No refetch on window focus

### Authentication Flow

1. User clicks sign in → `AuthModal` opens
2. Choose method: Email/password or Google OAuth
3. **Google OAuth**: Redirects to `/auth/callback`
4. Callback page handles code exchange (PKCE flow)
5. `AuthProvider` listens to `onAuthStateChange`
6. On success: Creates/updates user profile in `users` table
7. Updates streak based on `last_active_date`
8. Session stored in localStorage (client) and cookies (SSR)

#### Authenticated API Calls (`authFetch`)

All protected API routes use `authFetch`, which retrieves the Supabase session and attaches `Authorization: Bearer <access_token>` to each request. Server-side route handlers call `getAuthenticatedClient` to create a Supabase client scoped to the authenticated user's RLS context.

#### Admin Authorization

Admin access is controlled via the `NEXT_PUBLIC_ADMIN_USER_ID` environment variable. The `isAdmin(userId)` function checks if the current user's ID matches. The admin layout (`/admin/layout.tsx`) redirects non-admin users.

### Styling

**Tailwind CSS v4** with CSS variables:

```css
/* Color Palette (HSL) */
--background: 224 71% 4%;           /* slate-950 */
--foreground: 213 31% 91%;
--primary: 234 89% 73%;             /* indigo */
--secondary: 215 28% 17%;
--accent: 212 34% 14%;
--destructive: 0 84% 60%;           /* red */
--muted: 215 28% 17%;
--border: 217 33% 17%;

/* Semantic Colors */
--success: emerald
--warning: amber
```

**Typography (Google Fonts)**:
- Body: Plus Jakarta Sans (`--font-plus-jakarta`)
- Serif Headings: Instrument Serif (`--font-instrument-serif`)
- Monospace: JetBrains Mono (`--font-mono`)

**Design Features**:
- Dark theme by default
- Grid background pattern
- Radial gradients
- Backdrop blur effects
- Custom animations (accordion, shimmer, pulse glow)
- `@tailwindcss/typography` for prose content in patch notes and legal pages

---

## Backend

### Application Structure

```
app/
├── main.py                # FastAPI app, CORS, lifespan events
├── api/routes.py          # /analyze, /embed, /languages, /cache/*
├── core/
│   ├── config.py          # Pydantic Settings
│   └── security.py        # Input sanitization
├── models/schemas.py      # Pydantic models
└── services/
    ├── nlp.py             # NLP orchestration (parallel async pipeline)
    ├── llm_service.py     # LLM integration
    ├── spacy_manager.py   # spaCy pipeline management (primary)
    ├── stanza_manager.py  # Stanza pipeline management (fallback)
    ├── embeddings.py      # sentence-transformers (384-dim)
    ├── difficulty_scorer.py # CEFR A1–C2 scoring
    ├── error_detector.py  # Rule-based grammar checking
    ├── frequency.py       # Lemma frequency bands (1–5)
    ├── cache.py           # Redis caching
    └── strategies/        # Language-specific processing
```

### API Endpoints

#### `POST /api/v1/analyze`

Analyzes a sentence using spaCy/Stanza with language-specific strategies, LLM explanations, embeddings, difficulty scoring, and error detection.

**Request:**
```json
{
  "text": "Il gatto mangia il pesce.",
  "language": "it"
}
```

**Response:**
```json
{
  "metadata": {
    "text": "Il gatto mangia il pesce.",
    "language": "it"
  },
  "nodes": [
    {
      "id": 1,
      "text": "Il",
      "lemma": "il",
      "upos": "DET",
      "xpos": "RD",
      "feats": "Definite=Def|Gender=Masc|Number=Sing|PronType=Art",
      "head_id": 2,
      "deprel": "det",
      "misc": null,
      "segments": null
    }
  ],
  "pedagogical_data": {
    "translation": "The cat eats the fish.",
    "nuance": "Simple present tense indicating habitual action.",
    "concepts": [
      {
        "name": "Definite Articles",
        "description": "Italian uses definite articles based on gender and number.",
        "related_words": ["il", "la", "i", "le", "lo", "gli"]
      }
    ],
    "tips": [
      {
        "word": "mangia",
        "question": "Why -a at the end?",
        "explanation": "Third person singular present tense conjugation of -are verbs.",
        "rule": "-are verbs: -o, -i, -a, -iamo, -ate, -ano",
        "examples": ["parlo (I speak)", "mangi (you eat)", "lavora (he works)"]
      }
    ],
    "errors": []
  },
  "difficulty": {
    "level": "A2",
    "score": 0.22,
    "features": {
      "sentence_length": 6,
      "avg_word_length": 3.5,
      "tree_depth": 2,
      "subordinate_clause_count": 0,
      "type_token_ratio": 0.83,
      "lexical_density": 0.33
    }
  },
  "grammar_errors": [],
  "embedding": [0.012, -0.034, ...]
}
```

**Validation:**
- Max text length: 1000 characters
- Supported languages: `it`, `es`, `de`, `ru`, `tr`
- Input sanitization (null byte removal, whitespace trimming)

#### `POST /api/v1/embed`

Generates a 384-dimensional sentence embedding.

**Request:**
```json
{
  "text": "Il gatto mangia il pesce.",
  "language": "it"
}
```

**Response:**
```json
{
  "text": "Il gatto mangia il pesce.",
  "embedding": [0.012, -0.034, ...],
  "dimension": 384
}
```

#### `GET /api/v1/languages`

Returns supported languages with metadata.

**Response:**
```json
{
  "languages": [
    { "code": "it", "name": "Italian", "native_name": "Italiano", "family": "Romance", "sample": "Il gatto mangia il pesce." },
    { "code": "es", "name": "Spanish", "native_name": "Español", "family": "Romance", "sample": "El gato come el pescado." },
    { "code": "de", "name": "German", "native_name": "Deutsch", "family": "Germanic", "sample": "Die Katze frisst den Fisch." },
    { "code": "ru", "name": "Russian", "native_name": "Русский", "family": "Slavic", "sample": "Кошка ест рыбу." },
    { "code": "tr", "name": "Turkish", "native_name": "Türkçe", "family": "Turkic", "sample": "Kedi balığı yiyor." }
  ]
}
```

#### `GET /api/v1/cache/stats`

Returns Redis cache statistics.

**Response:**
```json
{
  "hits": 142,
  "misses": 58,
  "hit_rate": 0.71
}
```

#### `POST /api/v1/cache/flush`

Flushes all cached analyses.

**Response:**
```json
{
  "flushed": 200
}
```

#### `GET /`

Health check endpoint.

#### `GET /health`

Detailed health check with service status, loaded models, and supported languages.

#### `POST /warmup/{language}`

Pre-loads an NLP model for faster first requests.

### Services

#### NLPService (`nlp.py`)

Main orchestration service with parallel async execution.

**Pipeline** (`analyze_text_async`):
1. Validates language against registered strategies
2. Checks Redis cache (SHA-256 hash of `language:normalized_text`)
3. Runs three tasks in parallel via `asyncio.gather`:
   - **NLP Pipeline**: spaCy (preferred, `PREFERRED_ENGINE=spacy`) with Stanza fallback
   - **LLM Service**: Generates pedagogical explanations
   - **Embedding Service**: Generates 384-dim sentence vector
4. Post-processes: difficulty scoring, rule-based error detection
5. Caches result in Redis (embedding stripped to save space)

**Engine Selection**: Controlled by `PREFERRED_ENGINE` env var. spaCy is preferred for CPU performance; Stanza is used as fallback or for Turkish (not supported by spaCy models).

#### SpacyManager (`spacy_manager.py`)

Manages spaCy pipelines with LRU eviction.

- **Supported**: Italian, Spanish, German, Russian (`*_core_news_md` models)
- **Max Models**: 5 (configurable via `MAX_LOADED_MODELS`)
- **Auto-Download**: Downloads models on first use via `spacy.cli.download`

#### StanzaManager (`stanza_manager.py`)

Manages Stanza pipelines with LRU eviction (fallback engine).

- **Supported**: Italian, Spanish, German, Russian, Turkish
- **Lazy Loading**: Downloads models on first use
- **Language-specific Processors**:
  - Italian/Spanish/German/Turkish: `tokenize,mwt,pos,lemma,depparse`
  - Russian: `tokenize,pos,lemma,depparse` (no MWT)

#### EmbeddingService (`embeddings.py`)

Multilingual sentence embeddings via sentence-transformers.

- **Model**: `paraphrase-multilingual-MiniLM-L12-v2` (configurable via `EMBEDDING_MODEL`)
- **Dimension**: 384, L2-normalized
- **Methods**: `encode`, `encode_batch`, `cosine_similarity`, `find_similar`

#### DifficultyScorer (`difficulty_scorer.py`)

CEFR A1–C2 difficulty classification from engineered linguistic features.

**Features extracted:**
- Sentence length, average word length
- Type-token ratio (TTR)
- Dependency tree depth and width (BFS traversal)
- Subordinate clause count (UD subordination relations)
- Average morphological complexity (from UD `feats`)
- Unique POS count, lexical density

**Score mapping:**

| Score Range | CEFR Level |
|-------------|------------|
| < 0.15 | A1 |
| < 0.30 | A2 |
| < 0.45 | B1 |
| < 0.60 | B2 |
| < 0.78 | C1 |
| >= 0.78 | C2 |

#### ErrorDetector (`error_detector.py`)

Rule-based grammar error detection by language family.

| Language | Checks |
|----------|--------|
| Italian, Spanish | DET/ADJ → NOUN gender/number agreement |
| German, Russian | ADJ → NOUN case/gender agreement |
| Turkish | Vowel harmony heuristic (lemma vs suffix) |
| All | Subject → verb number/person agreement |

**Output**: `GrammarError` with word, error_type, severity (`info`/`warning`/`error`), message, optional correction and rule.

#### FrequencyService (`frequency.py`)

Lemma frequency bands from JSON maps per language.

| Rank | Band | Label |
|------|------|-------|
| <= 500 | 1 | Very common |
| <= 2000 | 2 | Common |
| <= 5000 | 3 | Moderate |
| <= 10000 | 4 | Uncommon |
| > 10000 | 5 | Rare |

#### CacheService (`cache.py`)

Redis-backed analysis caching.

- **TTL**: 24 hours (86400 seconds)
- **Key Format**: `grammario:analysis:<sha256(language:text)[:16]>`
- **Connection**: `REDIS_URL` env var, 2s timeouts, retry on timeout
- **Operations**: `get`, `set`, `flush`, `stats` (hits, misses, hit rate)

#### LLMService (`llm_service.py`)

Generates pedagogical explanations using LLMs.

- **Providers**: OpenRouter (primary), OpenAI (fallback)
- **Default Model**: `google/gemini-2.0-flash-exp:free`
- **Caching**: Manual cache (100 entries, evicts oldest 50 when full)
- **JSON Mode**: Tries JSON mode first, falls back to regular completion
- **Language-specific Prompts**: Tailored for each language's grammar focus

**Prompt Focus by Language:**

| Language | Grammar Focus |
|----------|---------------|
| Italian | Clitics, auxiliary selection (essere/avere), gender/number agreement, articles |
| Spanish | Object pronouns, ser vs estar, subjunctive, reflexives |
| German | Case governance, verb placement (V2), separable prefixes, gender |
| Russian | Cases, verbal aspect (perfective/imperfective), motion verbs, no articles |
| Turkish | Agglutination, morpheme segmentation, vowel harmony, buffer consonants |

### Language Strategies

Strategy pattern for language-specific processing:

#### RomanceStrategy (Italian, Spanish)
- Handles clitics and MWT (multi-word token) expansion
- Gender/number agreement tracking
- Manual lemma overrides for known errors
- Filters punctuation tokens

#### InflectionStrategy (German, Russian)
- Case governance handling
- Separable verb processing (German)
- Aspect tracking (Russian)
- Direct conversion with offset tracking

#### AgglutinativeStrategy (Turkish)
- Complex morpheme segmentation
- Handles: case suffixes, possessive suffixes, verb tense/aspect, person suffixes, buffer consonants, consonant softening, vowel harmony

### Pydantic Schemas (`schemas.py`)

```python
class TokenNode(BaseModel):
    id: int
    text: str
    lemma: Optional[str]
    upos: Optional[str]
    xpos: Optional[str]
    feats: Optional[str]
    head_id: Optional[int]
    deprel: Optional[str]
    misc: Optional[str]
    segments: Optional[List[str]]       # Morpheme segments (Turkish)

class GrammarConcept(BaseModel):
    name: str
    description: str
    related_words: List[str]

class GrammarTip(BaseModel):
    word: str
    question: str
    explanation: str
    rule: Optional[str]
    examples: Optional[List[str]]

class LLMGrammarError(BaseModel):
    # LLM-detected grammar issues
    ...

class PedagogicalData(BaseModel):
    translation: str
    nuance: Optional[str]
    concepts: List[GrammarConcept]
    tips: Optional[List[GrammarTip]]
    errors: Optional[List[LLMGrammarError]]

class RuleBasedError(BaseModel):
    word: str
    word_id: int
    error_type: str
    severity: str                        # info, warning, error
    message: str
    correction: Optional[str]
    rule: Optional[str]

class DifficultyInfo(BaseModel):
    level: str                           # A1–C2
    score: float                         # 0.0–1.0
    features: Optional[dict]             # Linguistic feature breakdown

class SentenceAnalysis(BaseModel):
    metadata: SentenceMetadata
    nodes: List[TokenNode]
    pedagogical_data: Optional[PedagogicalData]
    difficulty: Optional[DifficultyInfo]
    grammar_errors: Optional[List[RuleBasedError]]
    embedding: Optional[List[float]]     # 384-dim vector

class AnalysisRequest(BaseModel):
    text: str
    language: str                        # Regex: ^(it|es|de|ru|tr)$
```

### Configuration (`config.py`)

```python
class Settings(BaseSettings):
    APP_NAME: str = "Grammario NLP Engine"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # LLM
    OPENROUTER_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    LLM_MODEL: str = "google/gemini-2.0-flash-exp:free"

    # Stanza
    STANZA_RESOURCES_DIR: Optional[str] = None
```

Additional env vars used by individual services (not in `Settings`):
- `PREFERRED_ENGINE` — `spacy` (default) or `stanza`
- `REDIS_URL` — Redis connection string (default `redis://localhost:6379/0`)
- `EMBEDDING_MODEL` — sentence-transformers model name
- `MAX_LOADED_MODELS` — Max NLP models in memory (default 5)

---

## Database Schema

### Extensions

- **uuid-ossp** — UUID generation
- **vector** (pgvector) — 384-dimensional embedding storage and similarity search

### Tables

#### `users`
User profiles linked to Supabase Auth.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references `auth.users` |
| `email` | TEXT | User email (unique) |
| `display_name` | TEXT | Display name |
| `avatar_url` | TEXT | Profile picture URL |
| `is_pro` | BOOLEAN | Pro subscription status |
| `account_type` | TEXT | `regular` or `test` (default: `regular`) |
| `daily_sentence_limit` | INTEGER | Max analyses per day (default: 50) |
| `account_expires_at` | TIMESTAMPTZ | Account expiry (nullable, for test accounts) |
| `admin_notes` | TEXT | Internal admin notes |
| `stripe_customer_id` | TEXT | Stripe customer ID |
| `stripe_subscription_id` | TEXT | Stripe subscription ID |
| `subscription_status` | TEXT | active, canceled, past_due, trialing |
| `subscription_ends_at` | TIMESTAMPTZ | Subscription expiry |
| `xp` | INTEGER | Experience points (default: 0) |
| `level` | INTEGER | Current level (default: 1) |
| `streak` | INTEGER | Current streak days (default: 0) |
| `longest_streak` | INTEGER | Longest streak ever |
| `last_active_date` | DATE | Last activity date |
| `total_analyses` | INTEGER | Total analyses count |
| `created_at` | TIMESTAMPTZ | Account creation |
| `updated_at` | TIMESTAMPTZ | Last update (auto-trigger) |

**Indexes:** `account_type`, partial index on `account_expires_at IS NOT NULL`

#### `analyses`
Stored sentence analyses with vector embeddings.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References `users.id` |
| `text` | TEXT | Analyzed sentence |
| `language` | TEXT | Language code (it/es/de/ru/tr) |
| `translation` | TEXT | English translation |
| `nodes` | JSONB | Full analysis token data |
| `pedagogical_data` | JSONB | LLM explanations |
| `difficulty_level` | TEXT | CEFR level (A1–C2) |
| `difficulty_score` | REAL | Raw difficulty score (0–1) |
| `embedding` | vector(384) | Sentence embedding for similarity search |
| `is_favorite` | BOOLEAN | Favorited status |
| `notes` | TEXT | User notes |
| `created_at` | TIMESTAMPTZ | Analysis timestamp |

**Indexes:** user+date, user+language, user+favorite, `difficulty_level`, IVFFlat on `embedding` (cosine, 100 lists)

#### `vocabulary`
Spaced repetition vocabulary tracking (SM-2 algorithm).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References `users.id` |
| `analysis_id` | UUID | References `analyses.id` (nullable) |
| `word` | TEXT | Surface form |
| `lemma` | TEXT | Dictionary form |
| `translation` | TEXT | English translation |
| `language` | TEXT | Language code |
| `part_of_speech` | TEXT | Part of speech |
| `context` | TEXT | Example sentence |
| `mastery` | INTEGER | Mastery level (0–100) |
| `ease_factor` | REAL | SM-2 ease factor (default: 2.5) |
| `interval_days` | INTEGER | Days until next review |
| `next_review` | DATE | Next review date |
| `review_count` | INTEGER | Total reviews |
| `created_at` | TIMESTAMPTZ | Word added |

**Indexes:** user+language, next_review, mastery

#### `daily_goals`
Daily learning targets.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References `users.id` |
| `date` | DATE | Goal date |
| `target` | INTEGER | Target analyses |
| `completed` | INTEGER | Completed analyses |
| `is_achieved` | BOOLEAN | Goal met |

**Constraint:** Unique (user_id, date)

#### `achievements`
Static achievement definitions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary key (e.g., "first_analysis") |
| `name` | TEXT | Display name |
| `description` | TEXT | Achievement description |
| `icon` | TEXT | Icon identifier |
| `xp_reward` | INTEGER | XP granted on unlock |
| `requirement_type` | TEXT | analyses, streak, vocabulary, level, languages |
| `requirement_value` | INTEGER | Value required |

**Seeded Achievements:**
- `first_analysis` — First Steps (1 analysis)
- `analyses_10`, `analyses_50`, `analyses_100`, `analyses_500` — Milestones
- `streak_3`, `streak_7`, `streak_30`, `streak_100` — Streak achievements
- `vocab_25`, `vocab_100` — Vocabulary milestones
- `level_5`, `level_10` — Level achievements
- `polyglot_2`, `polyglot_5` — Multi-language achievements

#### `user_achievements`
Junction table for unlocked achievements.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | References `users.id` |
| `achievement_id` | TEXT | References `achievements.id` |
| `unlocked_at` | TIMESTAMPTZ | Unlock timestamp |

**Primary Key:** (user_id, achievement_id)

#### `sentence_feedback`
User feedback on analysis quality.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References `users.id` |
| `analysis_id` | UUID | References `analyses.id` |
| `sentence_text` | TEXT | The analyzed sentence |
| `language` | TEXT | Language code |
| `rating` | INTEGER | Star rating (1–5) |
| `category` | TEXT | Feedback category |
| `comment` | TEXT | Optional comment |
| `is_resolved` | BOOLEAN | Admin resolution status |
| `admin_notes` | TEXT | Admin notes |
| `created_at` | TIMESTAMPTZ | Feedback timestamp |
| `updated_at` | TIMESTAMPTZ | Last update (auto-trigger) |

**Indexes:** user, analysis, category, unresolved partial index

### SQL Functions

#### `match_analyses(query_embedding, match_user_id, ...)`
Cosine similarity search over analysis embeddings. Used for finding similar sentences a user has previously analyzed.

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data:

```sql
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

- **`achievements`** — Readable by all (static data)
- **`sentence_feedback`** — Full CRUD for own feedback only

### Triggers

- **`handle_new_user()`** — Auto-creates user profile on signup (triggered by `auth.users` insert)
- **`update_updated_at()`** — Auto-updates `updated_at` timestamp on `users` and `sentence_feedback`

---

## Admin Dashboard

The admin panel is accessible at `/admin` and restricted to the user ID specified in `NEXT_PUBLIC_ADMIN_USER_ID`.

### Features

| Page | Description |
|------|-------------|
| **Overview** | KPI cards (total users, analyses, vocabulary, feedback), language breakdown chart, recent analyses, recent sign-ups |
| **Users** | Paginated user list with search, account type filter, inline editing (display name, account type, limits, notes), create new users, delete users |
| **Requests & Data** | Browse all analyses with language/user filters, deep-link by analysis ID, expandable sections, raw JSON viewer, delete analyses |
| **Vocabulary** | Paginated view of all vocabulary entries across all users |
| **Feedback** | Filter by category and resolution status, summary statistics, resolve feedback, add admin notes |
| **Backend** | Live health check to FastAPI `/health` endpoint, service status cards (NLP, LLM, embeddings, Redis), memory usage, raw JSON toggle |

### Admin API Architecture

Admin API routes are Next.js route handlers that:
1. Verify the caller's Supabase auth token
2. Check `user.id === ADMIN_USER_ID`
3. Use `getAdminClient()` (service role) for cross-user operations
4. Return 403 for non-admin users

---

## Deployment

### Architecture Overview

| Component | Platform | Cost |
|-----------|----------|------|
| Frontend | Vercel (free tier) | $0 |
| Backend | DigitalOcean Droplet | $12–18/month |
| Database | Supabase (free tier) | $0 |
| **Total** | | **~$12–18/month** |

### Docker Configuration

#### Development (`docker-compose.yml`)

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://redis:6379/0
      - PREFERRED_ENGINE=spacy
      - OPENROUTER_KEY
      - CORS_ORIGINS=http://localhost:3000
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
```

#### Production (`docker-compose.prod.yml`)

```yaml
services:
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    deploy:
      resources:
        limits:
          memory: 6144M
        reservations:
          memory: 2048M
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      start_period: 300s  # 5 minutes for model loading

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt

  certbot:
    image: certbot/certbot
    # Auto-renewal every 12 hours

  watchtower:        # Optional auto-update profile
    image: containrrr/watchtower
    profiles: [autoupdate]
```

### Vercel Configuration (`vercel.json`)

- **Framework**: Next.js
- **Region**: `iad1` (US East)
- **Security Headers**:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`: geolocation, microphone, camera disabled

### Production Dockerfile (`Dockerfile.prod`)

Multi-stage build for optimized image:

```dockerfile
# Builder stage
FROM python:3.11-slim AS builder
# Install dependencies
# Download spaCy/Stanza models during build

# Production stage
FROM python:3.11-slim
# Non-root user (appuser)
# Copy site-packages and models
# Health check configured
# Command: uvicorn with production settings
```

### GitHub Actions CI/CD (`.github/workflows/deploy.yml`)

**Triggers**: Push to `main`, manual `workflow_dispatch`

```yaml
jobs:
  test:
    # Install pytest, pytest-asyncio, httpx
    # Run pytest on backend (non-blocking: || true)

  build:
    # Build Docker image with Dockerfile.prod
    # Push to GitHub Container Registry (GHCR)
    # Uses GHA layer caching

  deploy:
    # SSH to DigitalOcean (appleboy/ssh-action)
    # git pull, docker login to GHCR
    # docker pull latest backend image
    # docker compose up -d --force-recreate backend (backend only)
    # Prune old images
    # Health check verification via curl

  notify:
    # Runs on failure (placeholder for Slack/Discord)
```

### Nginx Configuration

- Rate limiting: 10 req/s with 20 burst (API endpoints)
- Connection limit: 10 per IP
- Gzip compression (level 6)
- Keepalive connections (32)
- 120s timeout for LLM calls
- SSL with Let's Encrypt

### Deployment Steps

1. **Prepare Server** (DigitalOcean)
   ```bash
   curl -sSL https://raw.githubusercontent.com/.../setup-server.sh | bash
   ```

2. **Configure Environment**
   ```bash
   cp env.example .env
   # Edit with production values
   ```

3. **Deploy Backend**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

4. **Deploy Frontend** (Vercel)
   - Connect GitHub repo
   - Set root directory: `frontend`
   - Configure environment variables
   - Deploy

5. **Setup SSL**
   ```bash
   docker compose -f docker-compose.prod.yml run --rm certbot \
     certonly --webroot -w /var/www/certbot \
     -d yourdomain.com
   ```

6. **Update CORS Origins**
   ```bash
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

See `DEPLOYMENT.md` for detailed instructions.

---

## Video Generation System

The `/video` directory contains a Remotion-based video generation system for creating promotional videos.

### Purpose

Generates demo videos in two formats:
- **Landscape** (16:9, 1920x1080) — YouTube
- **Portrait** (9:16, 1080x1920) — YouTube Shorts, TikTok, Instagram Reels

### Video Structure (45 seconds)

| Scene | Duration | Content |
|-------|----------|---------|
| Hook | 0–3.5s | "What if you could see grammar?" |
| Problem | 3.5–9s | Generic apps only show labels |
| Solution | 9–24s | Grammario demo with Italian sentence |
| Contrast | 24–35s | German accusative case explanation |
| CTA | 35–45s | 5 languages, sign-up call-to-action |

### Components

- **AnimatedText** — Text animations (fade, typewriter, spring)
- **WordNode** — Animated word token cards
- **SentenceFlow** — Sentence visualization with dependency arrows
- **TeacherNotes** — Pedagogical explanation panel
- **AppMockup** — Browser/app mockup wrapper

### Scenes

- **HookScene** — Opening hook with gradient text
- **ProblemScene** — Problem statement with example cards
- **SolutionScene** — Main demo (3 phases)
- **ContrastScene** — German sentence contrast
- **CTAScene** — Call-to-action with language flags

### Usage

```bash
cd video
npm install

# Preview in browser
npm start

# Render videos
npm run build           # Landscape (YouTube)
npm run build:portrait  # Portrait (Shorts/TikTok)
npm run build:all       # Both formats
```

**Output:** `video/out/grammario-youtube.mp4`, `video/out/grammario-shorts.mp4`

---

## Environment Variables

### Frontend (`frontend/.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # Admin operations (user CRUD)

# Admin
NEXT_PUBLIC_ADMIN_USER_ID=your-uuid    # Admin dashboard access

# Backend API
API_URL=http://127.0.0.1:8000          # Development
# API_URL=https://api.yourdomain.com   # Production
```

### Backend (`backend/.env`)

```bash
# LLM Configuration
OPENROUTER_KEY=sk-or-...               # Required (get from openrouter.ai)
OPENAI_API_KEY=sk-...                  # Optional fallback
LLM_MODEL=google/gemini-2.0-flash-exp:free  # Default model

# NLP Engine
PREFERRED_ENGINE=spacy                  # spacy (default) or stanza
MAX_LOADED_MODELS=5                     # Max models in memory

# Embeddings
EMBEDDING_MODEL=paraphrase-multilingual-MiniLM-L12-v2  # Default

# Redis
REDIS_URL=redis://localhost:6379/0      # Set automatically in Docker

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret

# App Configuration
DEBUG=false                             # Enable /docs endpoint
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Stanza
STANZA_RESOURCES_DIR=/app/stanza_resources  # Optional custom path
PRELOAD_MODELS=true                     # Pre-load models on startup
```

### Production Additional

```bash
CORS_ORIGINS=https://grammario.ai,https://www.grammario.ai
```

---

## Development Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
- Redis (or Docker for containerized Redis)
- [Supabase Account](https://supabase.com) (free tier)
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
3. Enable Google OAuth in Authentication → Providers (see `docs/GOOGLE_OAUTH_SETUP.md`)
4. Copy your project URL, anon key, and service role key

### 3. Configure Environment

```bash
# Create .env files
cp env.example backend/.env
cd frontend && cp .env.example .env.local
```

Fill in your credentials (Supabase URL, keys, OpenRouter key, admin user ID).

### 4. Start Redis

```bash
# Option A: Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Option B: Use docker-compose (starts all services)
docker compose up redis -d
```

### 5. Run Development Servers

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
- Backend API: http://localhost:8000
- API Docs (DEBUG=true): http://localhost:8000/docs

### 6. Download NLP Models (Optional)

Models are lazy-loaded on first use. To pre-download:

```bash
cd backend
python download_models.py
```

---

## Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate

# Run all tests
pytest -v

# Run specific test file
pytest test_api.py -v

# Run with coverage
pytest --cov=app
```

**Test Files:**
- `test_api.py` — API endpoint tests (mocks Stanza)
- `test_llm.py` — LLM integration tests (requires API keys)

### Frontend Tests

```bash
cd frontend

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

### Manual Testing

```bash
# Test analyze endpoint
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Il gatto mangia.", "language": "it"}'

# Test embedding endpoint
curl -X POST http://localhost:8000/api/v1/embed \
  -H "Content-Type: application/json" \
  -d '{"text": "Il gatto mangia.", "language": "it"}'

# Test languages endpoint
curl http://localhost:8000/api/v1/languages

# Cache stats
curl http://localhost:8000/api/v1/cache/stats

# Health check
curl http://localhost:8000/health
```

---

## Roadmap

- [ ] More languages (French, Portuguese, Japanese, Chinese)
- [ ] Mobile app (React Native)
- [ ] Sentence collections / lessons
- [ ] Community features (share analyses)
- [ ] API access for Pro users
- [ ] Browser extension
- [ ] Offline mode
- [ ] Voice input
- [ ] Trained ML difficulty model (scikit-learn, replacing heuristic scorer)
- [ ] Stripe checkout integration for Pro subscriptions

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Python**: PEP 8, type hints
- **TypeScript**: ESLint configuration, strict mode
- **Commits**: Conventional commits recommended

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with care for language learners</p>
  <p>
    <a href="https://grammario.ai">Website</a> •
    <a href="https://github.com/mserdukoff/grammario/issues">Report Bug</a> •
    <a href="https://github.com/mserdukoff/grammario/issues">Request Feature</a>
  </p>
</div>
