# Grammario

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16.0.10-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.2.1-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-0.109+-009688?style=flat-square&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Stanza-NLP-FF6B6B?style=flat-square" alt="Stanza">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind">
</div>

<br>

**Grammario** is a production-ready linguistic analysis platform that helps language learners deeply understand grammar through interactive visualizations and AI-powered explanations. It combines Stanford NLP (Stanza) for linguistic analysis with LLM-powered pedagogical insights to explain *why* grammar works the way it does.

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
- [Deployment](#-deployment)
- [Video Generation System](#-video-generation-system)
- [Environment Variables](#-environment-variables)
- [Development Setup](#-development-setup)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Features

### Core Analysis Engine
- **Deep Linguistic Analysis** — Stanford NLP (Stanza) for tokenization, lemmatization, POS tagging, morphological analysis, and dependency parsing
- **AI-Powered Explanations** — LLM-generated pedagogical insights explaining grammar concepts, rules, and the "why" behind grammatical choices
- **Interactive Visualization** — ReactFlow-based syntax tree and linear views with draggable nodes
- **5 Languages Supported** — Italian, Spanish, German, Russian, Turkish
- **Language-Specific Strategies** — Romance (clitics, MWT), Inflection (cases, aspect), Agglutinative (Turkish morpheme segmentation)

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

### Gamification (Duolingo-inspired)
- 🔥 **Streaks** — Daily learning habit tracking with consecutive day counting
- ⚡ **XP & Levels** — Progress through 10 levels with exponential XP requirements (10 XP per analysis)
- 🎯 **Daily Goals** — Customizable targets (3-20 analyses per day)
- 🏆 **Achievements** — 15 unlockable badges (first analysis, milestones, streaks, vocabulary, levels, polyglot)
- 📊 **Stats Dashboard** — Track level, XP progress, streak, and daily goal completion

### User Features
- 🔐 **Authentication** — Email/password + Google OAuth via Supabase Auth
- 📝 **History** — Save and view recent analyses (last 20)
- ⭐ **Favorites** — Mark analyses as favorites for quick access
- 📚 **Vocabulary** — Spaced repetition system using SM-2 algorithm
- 🔊 **Text-to-Speech** — Browser SpeechSynthesis API with language-specific voices
- ⚙️ **Settings** — Daily goal targets, TTS toggle, translation preferences
- 👤 **Pro Status** — Beta users get unlimited analyses

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Vercel)                                   │
│                        Next.js 16 • React 19 • TypeScript                     │
│                    Tailwind CSS v4 • ReactFlow • Zustand                      │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Landing   │  │    App      │  │  Settings   │  │    Auth     │          │
│  │    Page     │  │  Dashboard  │  │    Page     │  │   Callback  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐         │
│  │                    Next.js API Routes                           │         │
│  │  /api/v1/analyze  │  /api/v1/languages  │  /api/v1/usage        │         │
│  └─────────────────────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────────────┐               ┌──────────────────────────────────┐
│     SUPABASE (BaaS)         │               │    BACKEND (DigitalOcean)        │
│                             │               │    FastAPI • Python 3.11          │
│  ┌───────────────────────┐  │               │                                   │
│  │   Supabase Auth       │  │               │  ┌────────────────────────────┐   │
│  │   • Email/Password    │  │               │  │      NLP Service           │   │
│  │   • Google OAuth      │  │               │  │   • Stanza Pipelines       │   │
│  │   • JWT Tokens        │  │               │  │   • LRU Model Caching      │   │
│  └───────────────────────┘  │               │  │   • 5 Language Models      │   │
│                             │               │  └────────────────────────────┘   │
│  ┌───────────────────────┐  │               │                                   │
│  │   PostgreSQL          │  │               │  ┌────────────────────────────┐   │
│  │   • users             │  │               │  │      LLM Service           │   │
│  │   • analyses          │  │  ◄──────────► │  │   • OpenRouter (Primary)   │   │
│  │   • vocabulary        │  │               │  │   • OpenAI (Fallback)      │   │
│  │   • daily_goals       │  │               │  │   • Response Caching       │   │
│  │   • achievements      │  │               │  └────────────────────────────┘   │
│  │   • user_achievements │  │               │                                   │
│  └───────────────────────┘  │               │  ┌────────────────────────────┐   │
│                             │               │  │   Language Strategies      │   │
│  ┌───────────────────────┐  │               │  │   • RomanceStrategy        │   │
│  │   Row Level Security  │  │               │  │   • InflectionStrategy     │   │
│  │   (User data isolation)│  │               │  │   • AgglutinativeStrategy  │   │
│  └───────────────────────┘  │               │  └────────────────────────────┘   │
└─────────────────────────────┘               └──────────────────────────────────┘
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

1. User enters sentence → clicks "Analyze"
2. Frontend calls `/api/v1/analyze` → validates input, checks rate limits
3. Next.js API proxies to Python NLP backend
4. **Stanza Pipeline**: Text → Tokenization → POS Tagging → Lemmatization → Dependency Parsing
5. **Language Strategy**: Processes Stanza output into TokenNodes (handles language-specific features)
6. **LLM Service**: Generates pedagogical explanations (translation, concepts, tips)
7. Backend returns `SentenceAnalysis` with nodes and pedagogical data
8. Frontend builds ReactFlow graph from nodes/edges
9. If authenticated: saves to Supabase, updates XP, checks daily goal
10. Displays visualization + pedagogical insights panel

---

## 📦 Tech Stack

### Frontend

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | Next.js | 16.0.10 | App Router, SSR, API Routes |
| UI Library | React | 19.2.1 | Component library |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | v4 | Utility-first CSS |
| State (Client) | Zustand | 5.0.9 | Persistent client state |
| State (Server) | TanStack Query | 5.90.17 | Server state & caching |
| Visualization | ReactFlow | 11.11.4 | Interactive node graphs |
| Graph Layout | Dagre | 0.8.5 | Dependency tree layout |
| Animation | Framer Motion | 12.23.26 | Smooth animations |
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
| Framework | FastAPI | ≥0.109.0 | Async API framework |
| Server | Uvicorn | ≥0.27.0 | ASGI server |
| Validation | Pydantic | ≥2.5.0 | Schema validation |
| Settings | Pydantic-settings | ≥2.1.0 | Environment config |
| NLP | Stanza | ≥1.7.0 | Stanford NLP pipelines |
| LLM Client | OpenAI | ≥1.10.0 | OpenRouter/OpenAI API |
| HTTP | httpx | ≥0.26.0 | Async HTTP client |
| Environment | python-dotenv | ≥1.0.0 | .env file loading |

### Database & Auth

| Category | Technology | Purpose |
|----------|------------|---------|
| Database | Supabase PostgreSQL | Managed PostgreSQL with RLS |
| Auth | Supabase Auth | JWT-based authentication |
| Client | @supabase/supabase-js | 2.90.1 | Browser client |
| SSR Client | @supabase/ssr | 0.8.0 | Server-side rendering |

### Infrastructure

| Category | Technology | Purpose |
|----------|------------|---------|
| Container | Docker | Containerization |
| Orchestration | Docker Compose | Multi-container management |
| Reverse Proxy | Nginx | Rate limiting, SSL, caching |
| SSL | Let's Encrypt (Certbot) | Free SSL certificates |
| CI/CD | GitHub Actions | Automated testing & deployment |
| Frontend Hosting | Vercel | Next.js optimized hosting |
| Backend Hosting | DigitalOcean | Docker container hosting |

### Video Generation

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | Remotion | 4.0.232 | React-based video creation |
| UI | React | 18.3.1 | Components |
| Language | TypeScript | 5.6.3 | Type safety |

---

## 📁 Project Structure

```
GrammarioNew/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD pipeline
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py           # API endpoints (/analyze, /languages)
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py           # Pydantic settings configuration
│   │   │   └── security.py         # Input sanitization
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py          # Pydantic models (TokenNode, etc.)
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── nlp.py              # NLP orchestration service
│   │       ├── llm_service.py      # LLM integration (OpenRouter/OpenAI)
│   │       ├── stanza_manager.py   # Stanza pipeline manager (LRU)
│   │       └── strategies/
│   │           ├── __init__.py
│   │           ├── base.py         # Abstract strategy base class
│   │           └── concrete.py     # Language-specific strategies
│   ├── Dockerfile                  # Development Docker image
│   ├── Dockerfile.prod             # Production multi-stage build
│   ├── download_models.py          # Script to pre-download Stanza models
│   ├── requirements.txt            # Python dependencies
│   ├── test_api.py                 # API endpoint tests
│   └── test_llm.py                 # LLM integration tests
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout with providers
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── globals.css         # Global styles & CSS variables
│   │   │   ├── app/
│   │   │   │   ├── page.tsx        # Main dashboard (analysis interface)
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx    # User settings page
│   │   │   ├── auth/
│   │   │   │   ├── callback/
│   │   │   │   │   └── page.tsx    # OAuth callback handler
│   │   │   │   └── error/
│   │   │   │       └── page.tsx    # Auth error page
│   │   │   └── api/v1/
│   │   │       ├── analyze/
│   │   │       │   └── route.ts    # Analyze endpoint (proxies to backend)
│   │   │       ├── languages/
│   │   │       │   └── route.ts    # Supported languages endpoint
│   │   │       └── usage/
│   │   │           └── route.ts    # User usage statistics endpoint
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── auth-modal.tsx  # Login/signup modal
│   │   │   ├── flow/
│   │   │   │   └── WordNode.tsx    # ReactFlow word node component
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
│   │   │   ├── providers.tsx       # QueryClient, AuthProvider, Toaster
│   │   │   ├── LandingDemo.tsx     # Landing page demo component
│   │   │   └── ui/                 # shadcn/ui-style components
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── footer.tsx
│   │   │       ├── navbar.tsx
│   │   │       ├── select.tsx
│   │   │       ├── toggle.tsx
│   │   │       └── toggle-group.tsx
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios API client
│   │   │   ├── auth-context.tsx    # Auth context provider
│   │   │   ├── db.ts               # Database utilities
│   │   │   ├── utils.ts            # Utility functions (cn)
│   │   │   └── supabase/
│   │   │       ├── client.ts       # Browser Supabase client
│   │   │       ├── server.ts       # Server Supabase client (SSR)
│   │   │       ├── middleware.ts   # Session refresh middleware
│   │   │       └── database.types.ts # Generated TypeScript types
│   │   ├── store/
│   │   │   └── useAppStore.ts      # Zustand store with persistence
│   │   └── middleware.ts           # Next.js middleware wrapper
│   ├── public/                     # Static assets
│   ├── Dockerfile                  # Frontend Docker image
│   ├── package.json                # Node dependencies
│   ├── next.config.ts              # Next.js configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── eslint.config.mjs           # ESLint configuration
│   ├── postcss.config.mjs          # PostCSS configuration
│   └── vercel.json                 # Vercel deployment config
├── deploy/
│   ├── aws.md                      # AWS deployment guide
│   ├── digitalocean.md             # DigitalOcean deployment guide
│   └── setup-server.sh             # Server initialization script
├── nginx/
│   ├── nginx.conf                  # Production Nginx configuration
│   └── nginx.initial.conf          # Initial config for SSL setup
├── supabase/
│   └── schema.sql                  # Database schema with RLS
├── video/                          # Remotion video generation
│   ├── src/
│   │   ├── components/             # Video components
│   │   ├── compositions/           # Video compositions
│   │   ├── scenes/                 # Video scenes
│   │   ├── data/                   # Sentence data
│   │   └── styles/                 # Global CSS
│   ├── package.json
│   └── remotion.config.ts
├── docs/
│   └── GOOGLE_OAUTH_SETUP.md       # Google OAuth setup guide
├── docker-compose.yml              # Development Docker Compose
├── docker-compose.prod.yml         # Production Docker Compose
├── DEPLOYMENT.md                   # Main deployment documentation
├── env.example                     # Example environment variables
└── README.md                       # This file
```

---

## 💻 Frontend

### Pages (App Router)

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing page with Hero, Features, Pricing, FAQ sections |
| `/app` | `app/app/page.tsx` | Main dashboard - sentence analysis interface |
| `/app/settings` | `app/app/settings/page.tsx` | User settings (daily goal, TTS, etc.) |
| `/auth/callback` | `app/auth/callback/page.tsx` | OAuth callback handler |
| `/auth/error` | `app/auth/error/page.tsx` | Authentication error page |

### API Routes (Next.js)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/analyze` | POST | Proxies to Python NLP backend, handles rate limiting |
| `/api/v1/languages` | GET | Returns list of supported languages with metadata |
| `/api/v1/usage` | GET | Returns user usage statistics (analyses today, limits) |

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

#### Auth
- **AuthModal** — Login/signup modal with Google OAuth and email/password

#### UI Components (shadcn/ui style)
- **Button** — Variants: default, destructive, outline, secondary, ghost, link
- **Card** — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Select** — Dropdown select with Radix UI primitives
- **Toggle** — Toggle button with variants
- **ToggleGroup** — Toggle group with single/multiple selection
- **Navbar** — Navigation with auth state
- **Footer** — Page footer

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

**Typography**:
- Headings: Space Grotesk
- Monospace: JetBrains Mono

**Design Features**:
- Dark theme by default
- Grid background pattern
- Radial gradients
- Backdrop blur effects
- Custom animations (accordion, shimmer, pulse glow)

---

## 🐍 Backend

### Application Structure

```
app/
├── main.py              # FastAPI app, CORS, lifespan events
├── api/routes.py        # /analyze, /languages endpoints
├── core/
│   ├── config.py        # Pydantic Settings
│   └── security.py      # Input sanitization
├── models/schemas.py    # Pydantic models
└── services/
    ├── nlp.py           # NLP orchestration
    ├── llm_service.py   # LLM integration
    ├── stanza_manager.py # Pipeline management
    └── strategies/      # Language-specific processing
```

### API Endpoints

#### `POST /api/v1/analyze`

Analyzes a sentence using Stanza NLP with language-specific strategies.

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
    // ... more tokens
  ],
  "pedagogical_data": {
    "translation": "The cat eats the fish.",
    "nuance": "Simple present tense indicating habitual action.",
    "concepts": [
      {
        "name": "Definite Articles",
        "description": "Italian uses definite articles (il, la, i, le) based on gender and number.",
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
    ]
  }
}
```

**Validation:**
- Max text length: 1000 characters
- Supported languages: `it`, `es`, `de`, `ru`, `tr`
- Input sanitization (null byte removal, whitespace trimming)

#### `GET /api/v1/languages`

Returns supported languages with metadata.

**Response:**
```json
{
  "languages": [
    {
      "code": "it",
      "name": "Italian",
      "native_name": "Italiano",
      "family": "Romance",
      "sample": "Il gatto mangia il pesce."
    },
    {
      "code": "es",
      "name": "Spanish",
      "native_name": "Español",
      "family": "Romance",
      "sample": "El gato come el pescado."
    },
    {
      "code": "de",
      "name": "German",
      "native_name": "Deutsch",
      "family": "Germanic",
      "sample": "Die Katze frisst den Fisch."
    },
    {
      "code": "ru",
      "name": "Russian",
      "native_name": "Русский",
      "family": "Slavic",
      "sample": "Кошка ест рыбу."
    },
    {
      "code": "tr",
      "name": "Turkish",
      "native_name": "Türkçe",
      "family": "Turkic",
      "sample": "Kedi balığı yiyor."
    }
  ]
}
```

#### `GET /`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "app": "Grammario NLP Engine",
  "version": "1.0.0"
}
```

#### `GET /health`

Detailed health check with service status.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "llm": true
  },
  "models": {
    "loaded": ["it", "de"],
    "max_loaded": 5,
    "supported": ["it", "es", "de", "ru", "tr"]
  }
}
```

#### `POST /warmup/{language}`

Pre-loads a Stanza model for faster first requests.

**Response:**
```json
{
  "status": "ok",
  "language": "it",
  "loaded_models": ["it"]
}
```

### Services

#### NLPService (`nlp.py`)

Main orchestration service that coordinates Stanza processing and LLM explanations.

```python
class NLPService:
    def __init__(self):
        self.stanza_manager = StanzaManager()
        self.llm_service = LLMService()
        self.strategies = {
            'it': RomanceStrategy('it'),
            'es': RomanceStrategy('es'),
            'de': InflectionStrategy(),
            'ru': InflectionStrategy(),
            'tr': AgglutinativeStrategy()
        }
    
    async def analyze_text(self, text: str, lang_code: str) -> SentenceAnalysis:
        # 1. Get Stanza pipeline (LRU cached)
        # 2. Process text with Stanza
        # 3. Apply language-specific strategy
        # 4. Fetch pedagogical data from LLM
        # 5. Construct and return SentenceAnalysis
```

#### StanzaManager (`stanza_manager.py`)

Singleton managing Stanza pipelines with LRU eviction.

**Features:**
- **LRU Eviction**: Keeps max 5 models loaded (configurable via `MAX_LOADED_MODELS`)
- **Lazy Loading**: Downloads models on first use
- **Memory Management**: Garbage collection after eviction
- **Language-specific Processors**:
  - Italian/Spanish/German/Turkish: `tokenize,mwt,pos,lemma,depparse`
  - Russian: `tokenize,pos,lemma,depparse` (no MWT)
  - Turkish: `tokenize_no_ssplit=True` (no sentence splitting)

#### LLMService (`llm_service.py`)

Generates pedagogical explanations using LLMs.

**Features:**
- **Providers**: OpenRouter (primary), OpenAI (fallback)
- **Default Model**: `google/gemini-2.0-flash-exp:free`
- **Caching**: Manual cache (100 entries, evicts oldest 50 when full)
- **JSON Mode**: Tries JSON mode first, falls back to regular completion
- **Language-specific Prompts**: Tailored for each language's grammar features

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
- Manual lemma overrides for known Stanza errors
- Filters punctuation tokens

#### InflectionStrategy (German, Russian)
- Case governance handling
- Separable verb processing (German)
- Aspect tracking (Russian)
- Direct conversion with offset tracking

#### AgglutinativeStrategy (Turkish)
- Complex morpheme segmentation
- Handles:
  - Case suffixes (dative, locative, ablative, accusative, genitive, instrumental)
  - Possessive suffixes (1sg, 2sg, 3sg, 1pl, 2pl, 3pl)
  - Verb tense/aspect (present continuous, aorist, past, future, conditional, necessity)
  - Person suffixes
  - Buffer consonants (`n` between vowels)
  - Consonant softening (k→ğ, p→b, t→d, ç→c)
  - Vowel harmony

### Pydantic Schemas (`schemas.py`)

```python
class TokenNode(BaseModel):
    id: int                           # 1-based index
    text: str                         # Original word form
    lemma: Optional[str]              # Dictionary form
    upos: Optional[str]               # Universal POS tag
    xpos: Optional[str]               # Language-specific POS
    feats: Optional[str]              # Morphological features
    head_id: Optional[int]            # Syntactic head ID (0 = root)
    deprel: Optional[str]             # Dependency relation
    misc: Optional[str]
    segments: Optional[List[str]]     # Morpheme segments (Turkish)

class GrammarConcept(BaseModel):
    name: str
    description: str
    related_words: List[str]

class GrammarTip(BaseModel):
    word: str
    question: str                     # e.g., "Why -a at the end?"
    explanation: str
    rule: Optional[str]
    examples: Optional[List[str]]

class PedagogicalData(BaseModel):
    translation: str
    nuance: Optional[str]
    concepts: List[GrammarConcept]
    tips: Optional[List[GrammarTip]]

class SentenceAnalysis(BaseModel):
    metadata: SentenceMetadata
    nodes: List[TokenNode]
    pedagogical_data: Optional[PedagogicalData]
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

---

## 🗄 Database Schema

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
| `stripe_customer_id` | TEXT | Stripe customer ID |
| `stripe_subscription_id` | TEXT | Stripe subscription ID |
| `subscription_status` | TEXT | active, canceled, past_due |
| `subscription_ends_at` | TIMESTAMPTZ | Subscription expiry |
| `xp` | INTEGER | Experience points (default: 0) |
| `level` | INTEGER | Current level (default: 1) |
| `streak` | INTEGER | Current streak days (default: 0) |
| `longest_streak` | INTEGER | Longest streak ever |
| `last_active_date` | DATE | Last activity date |
| `total_analyses` | INTEGER | Total analyses count |
| `created_at` | TIMESTAMPTZ | Account creation |
| `updated_at` | TIMESTAMPTZ | Last update |

#### `analyses`
Stored sentence analyses.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References `users.id` |
| `text` | TEXT | Analyzed sentence |
| `language` | TEXT | Language code (it/es/de/ru/tr) |
| `translation` | TEXT | English translation |
| `nodes` | JSONB | Full analysis data |
| `pedagogical_data` | JSONB | LLM explanations |
| `is_favorite` | BOOLEAN | Favorited status |
| `notes` | TEXT | User notes |
| `created_at` | TIMESTAMPTZ | Analysis timestamp |

**Indexes:** user+date, user+language, user+favorite

#### `vocabulary`
Spaced repetition vocabulary tracking (SM-2 algorithm).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References `users.id` |
| `word` | TEXT | Surface form |
| `lemma` | TEXT | Dictionary form |
| `translation` | TEXT | English translation |
| `language` | TEXT | Language code |
| `pos` | TEXT | Part of speech |
| `context` | TEXT | Example sentence |
| `mastery` | INTEGER | Mastery level (0-100) |
| `ease_factor` | REAL | SM-2 ease factor (default: 2.5) |
| `interval_days` | INTEGER | Days until next review |
| `next_review` | TIMESTAMPTZ | Next review date |
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
| `created_at` | TIMESTAMPTZ | Record creation |

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
- `streak_3`, `streak_7`, `streak_30` — Streak achievements
- `vocabulary_10`, `vocabulary_50`, `vocabulary_100` — Vocabulary milestones
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

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data:

```sql
-- Example: users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

**Exception:** `achievements` table is readable by all (static data).

### Triggers

- **`handle_new_user()`** — Auto-creates user profile on signup
- **`update_updated_at()`** — Auto-updates `updated_at` timestamp

---

## 🚀 Deployment

### Architecture Overview

| Component | Platform | Cost |
|-----------|----------|------|
| Frontend | Vercel (free tier) | $0 |
| Backend | DigitalOcean Droplet | $12-18/month |
| Database | Supabase (free tier) | $0 |
| **Total** | | **~$12-18/month** |

### Docker Configuration

#### Development (`docker-compose.yml`)

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - OPENROUTER_KEY
      - CORS_ORIGINS=http://localhost:3000
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
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    deploy:
      resources:
        limits:
          memory: 3500M
        reservations:
          memory: 1024M
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
```

### Production Dockerfile (`Dockerfile.prod`)

Multi-stage build for optimized image:

```dockerfile
# Builder stage
FROM python:3.11-slim AS builder
# Install dependencies
# Download Stanza models during build

# Production stage
FROM python:3.11-slim
# Non-root user (appuser)
# Copy site-packages and models
# Health check configured
# Command: uvicorn with production settings
```

### GitHub Actions CI/CD (`.github/workflows/deploy.yml`)

```yaml
jobs:
  test:
    # Run pytest on backend
    
  build:
    # Build Docker image
    # Push to GitHub Container Registry (GHCR)
    
  deploy:
    # SSH to DigitalOcean
    # Pull latest image
    # Restart services
    # Health check verification
```

### Nginx Configuration

**Features:**
- Rate limiting: 10 req/s with 20 burst (API endpoints)
- Connection limit: 10 per IP
- Gzip compression (level 6)
- Keepalive connections (32)
- 120s timeout for LLM calls
- SSL with Let's Encrypt

### Deployment Steps

1. **Prepare Server** (DigitalOcean)
   ```bash
   # Run setup script
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
   # In .env
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

See `DEPLOYMENT.md` for detailed instructions.

---

## 🎬 Video Generation System

The `/video` directory contains a Remotion-based video generation system for creating promotional videos.

### Purpose

Generates demo videos in two formats:
- **Landscape** (16:9, 1920x1080) — YouTube
- **Portrait** (9:16, 1080x1920) — YouTube Shorts, TikTok, Instagram Reels

### Video Structure (45 seconds)

| Scene | Duration | Content |
|-------|----------|---------|
| Hook | 0-3.5s | "What if you could see grammar?" |
| Problem | 3.5-9s | Generic apps only show labels |
| Solution | 9-24s | Grammario demo with Italian sentence |
| Contrast | 24-35s | German accusative case explanation |
| CTA | 35-45s | 5 languages, sign-up call-to-action |

### Tech Stack

- **Remotion** 4.0.232 — React-based video creation
- **React** 18.3.1
- **TypeScript** 5.6.3

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

## ⚙️ Environment Variables

### Frontend (`frontend/.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Backend API
API_URL=http://127.0.0.1:8000   # Development
# API_URL=https://api.yourdomain.com  # Production
```

### Backend (`backend/.env`)

```bash
# LLM Configuration
OPENROUTER_KEY=sk-or-...         # Required (get from openrouter.ai)
OPENAI_API_KEY=sk-...            # Optional fallback
LLM_MODEL=google/gemini-2.0-flash-exp:free  # Default model

# Supabase (for future JWT verification)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret

# App Configuration
DEBUG=false                       # Enable /docs endpoint
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Stanza
STANZA_RESOURCES_DIR=/app/stanza_resources  # Optional custom path
MAX_LOADED_MODELS=5               # Max models in memory
PRELOAD_MODELS=true               # Pre-load models on startup
```

### Production Additional

```bash
# CORS (production)
CORS_ORIGINS=https://grammario.ai,https://www.grammario.ai
```

---

## 🛠 Development Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
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
4. Copy your project URL and anon key

### 3. Configure Environment

```bash
# Create .env files
cp env.example backend/.env
cd frontend && cp .env.example .env.local
```

Fill in your credentials.

### 4. Run Development Servers

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

### 5. Download Stanza Models (Optional)

Models are lazy-loaded on first use. To pre-download:

```bash
cd backend
python download_models.py
```

---

## 🧪 Testing

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

# Test languages endpoint
curl http://localhost:8000/api/v1/languages

# Health check
curl http://localhost:8000/health
```

---

## 🎯 Roadmap

- [ ] More languages (French, Portuguese, Japanese, Chinese)
- [ ] Mobile app (React Native)
- [ ] Sentence collections / lessons
- [ ] Community features (share analyses)
- [ ] API access for Pro users
- [ ] Browser extension
- [ ] Offline mode
- [ ] Voice input

---

## 🤝 Contributing

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

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with ❤️ for language learners</p>
  <p>
    <a href="https://grammario.ai">Website</a> •
    <a href="https://github.com/mserdukoff/grammario/issues">Report Bug</a> •
    <a href="https://github.com/mserdukoff/grammario/issues">Request Feature</a>
  </p>
</div>
