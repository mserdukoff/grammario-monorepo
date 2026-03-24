"use client"

import { Navbar } from "@/components/ui/navbar"
import { MermaidDiagram } from "@/components/ui/mermaid-diagram"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ArrowLeft, Zap, Database, Brain, BarChart3, BookOpen, ShieldCheck } from "lucide-react"
import Link from "next/link"

function Md({ children }: { children: string }) {
  return (
    <div className="prose max-w-none prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3 prose-p:text-foreground prose-p:leading-7 prose-p:my-3 prose-li:text-foreground prose-li:my-1 prose-strong:text-foreground prose-strong:font-semibold prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-surface-2 prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:my-4 prose-table:my-6 prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2.5 prose-th:text-left prose-th:text-sm prose-th:font-semibold prose-th:text-foreground prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2 prose-td:text-sm prose-td:text-foreground prose-hr:border-border prose-hr:my-8 prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary prose-ol:my-4 prose-ul:my-4 prose-blockquote:border-primary prose-blockquote:text-muted-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}

// --- Markdown sections (split for diagram insertion) ---

const SECTION_INTRO = `
# Grammario Performance and ML/NLP Feature Upgrade

This document describes every change made to the Grammario codebase during the performance optimization and advanced ML/NLP feature upgrade. It is organized by phase, with exact file paths, code explanations, and architectural rationale.

---

## Table of Contents

1. [Problem Statement and Root Cause Analysis](#1-problem-statement-and-root-cause-analysis)
2. [Phase 1: Performance Fixes](#2-phase-1-performance-fixes)
3. [Phase 2: ML/NLP Feature Additions](#3-phase-2-mlnlp-feature-additions)
4. [Phase 3: Data Engineering -- Spaced Repetition System](#4-phase-3-data-engineering----spaced-repetition-system)
5. [Phase 4: Observability and ML Ops](#5-phase-4-observability-and-ml-ops)
6. [Phase 5: Admin Dashboard](#6-phase-5-admin-dashboard)
7. [Schema and Type Updates](#7-schema-and-type-updates)
8. [Infrastructure Changes](#8-infrastructure-changes)
9. [Complete File Manifest](#9-complete-file-manifest)
`

const SECTION_PROBLEM = `
---

## 1. Problem Statement and Root Cause Analysis

**Symptom**: Each sentence analysis query took 10-15 seconds to return on a 2GB DigitalOcean VM.

**Root cause**: The original \`NLPService.analyze_text()\` ran two expensive operations **sequentially**:

1. **Stanza neural inference** (~3-5s on a small CPU): Loading a full neural NLP pipeline (tokenizer, multi-word token expander, POS tagger, lemmatizer, dependency parser) and running it through PyTorch on a CPU without AVX2 support.
2. **LLM API call** (~3-8s): A synchronous HTTP call to OpenRouter/OpenAI for pedagogical explanations, including JSON parsing and retries.

These two operations are completely independent -- the LLM only needs the raw text, not the parse output -- yet they were chained sequentially, meaning the total wall-clock time was their sum.

Additionally:
- The route handler was declared \`async def\` but called the synchronous \`analyze_text()\`, which blocks the event loop.
- No caching existed. Identical sentences triggered full re-analysis every time.
- Stanza is 10-50x slower than spaCy on CPU for the same tasks.

**Before (sequential)**:
\`\`\`
User request -> Stanza (4s) -> LLM (5s) -> Response = 9s total
\`\`\`

**After (parallel + spaCy + cache)**:
\`\`\`
User request -> Cache check (1ms)
             -> [miss] -> spaCy (0.3s) | LLM (4s) | Embedding (0.1s)  [parallel]
                       -> Post-processing (5ms)
                       -> Cache set
                       -> Response = ~4s total
             -> [hit]  -> Response = 5ms
\`\`\`
`

const SECTION_PHASE1_INTRO = `
---

## 2. Phase 1: Performance Fixes

### 1A. Parallel Inference with asyncio

The \`NLPService\` class was rewritten to expose an \`analyze_text_async()\` method that uses \`asyncio.gather()\` with a \`ThreadPoolExecutor\` to run three independent operations concurrently:

- **NLP Pipeline** (spaCy/Stanza): Tokenization, POS tagging, lemmatization, dependency parsing
- **LLM Call**: Pedagogical data generation (translation, grammar concepts, tips, error detection)
- **Embedding**: Sentence vector encoding for similarity search

\`run_in_executor\` with a thread pool lets both CPU-bound (NLP) and I/O-bound (LLM) tasks run without blocking the FastAPI event loop.
`

const SECTION_PHASE1_REDIS = `
### 1B. Redis Caching Layer

A \`CacheService\` class backed by Redis:

- **Keys**: SHA-256 hashes of \`"{language}:{text.strip().lower()}"\`, prefixed with \`grammario:analysis:\`
- **Values**: JSON-serialized analysis results
- **TTL**: 24 hours (configurable)
- **Graceful degradation**: If Redis is unreachable, caching is silently disabled

Hit-rate tracking is exposed via the \`/health\` endpoint and \`/api/v1/cache/stats\`.
`

const SECTION_PHASE1_REST = `
### 1C. spaCy as a Faster NLP Engine

spaCy is 10-50x faster than Stanza on CPU. A \`SpacyManager\` singleton was added with:

- **Supported languages**: IT, ES, DE, RU (Turkish has no spaCy model with dependency parsing)
- **Models**: \`it_core_news_md\`, \`es_core_news_md\`, \`de_core_news_md\`, \`ru_core_news_md\`
- **Auto-download**: If \`spacy.load()\` fails, the manager calls \`spacy.cli.download()\` and retries
- **Fallback**: If spaCy fails at runtime, falls back to Stanza transparently

### 1D. Truly Async Route Handlers

The \`/analyze\` endpoint was changed from synchronous to properly async, preventing the uvicorn event loop from blocking during analysis.

---

## 3. Phase 2: ML/NLP Feature Additions

### 2A. CEFR Difficulty Scoring

A feature-engineered classification pipeline that rates sentence difficulty on the CEFR scale (A1-C2) using 10 linguistic features:

| Feature | What It Measures |
|---------|-----------------|
| Sentence length | Raw complexity |
| Average word length | Morphological richness |
| Type-token ratio | Lexical diversity |
| Tree depth | Embedding depth of clauses |
| Tree width | Parallel structure complexity |
| Subordinate clause count | Syntactic subordination |
| Morphological complexity | Inflectional richness |
| Unique POS count | Syntactic variety |
| Rare word proportion | Vocabulary difficulty |
| Lexical density | Information density |

Tree depth and subordination get the highest weights (0.20 each) because embedded clauses are the strongest predictor of syntactic difficulty in second language acquisition research.

### 2B. Word Frequency Analysis

Each word is tagged with a frequency band (1-5):

| Band | Rank Range | Label |
|------|-----------|-------|
| 1 | Top 500 | Very Common |
| 2 | 501-2000 | Common |
| 3 | 2001-5000 | Intermediate |
| 4 | 5001-10000 | Uncommon |
| 5 | 10001+ | Rare |

Frequency data is loaded from per-language JSON files generated from corpus frequency data. In the UI, colored dots indicate frequency bands (green to red).

### 2C. Sentence Embeddings and Similarity Search

**Model**: \`paraphrase-multilingual-MiniLM-L12-v2\` from sentence-transformers

- 384-dimensional normalized vectors
- Supports 50+ languages
- ~90MB, runs fast on CPU (~50-100ms per sentence)

Embeddings enable future similarity search: "find sentences I've studied that are similar to this one."

### 2D. Grammar Error Detection

A dual-approach system:

**Rule-based** (from parse tree):
- DET-NOUN gender/number agreement (IT, ES)
- ADJ-NOUN case/gender agreement (DE, RU)
- Vowel harmony violations (TR)
- Subject-verb number/person agreement (all languages)

**LLM-based** (from prompt):
- Spelling, agreement, conjugation, case, word order, preposition, and article errors
- Each error includes the word, type, correction, and explanation
`

const SECTION_PHASE3 = `
---

## 4. Phase 3: Data Engineering -- Spaced Repetition System

### SM-2 Algorithm

A TypeScript implementation of the SuperMemo SM-2 spaced repetition algorithm (the standard used by Anki):

- Quality ratings 0-5
- Adaptive ease factor (minimum 1.3)
- Interval scheduling: 1 day, then 6 days, then interval multiplied by easeFactor
- Mastery score: weighted combination of repetitions, interval length, and ease factor

### Vocabulary Review UI

A full flashcard review interface with:
- Stats bar (Total Words, Due Today, Mastered)
- Flashcard with show/hide answer
- Three-button rating (Wrong/Hard/Good) plus advanced 0-5 ratings
- Progress bar and session summary
`

const SECTION_REMAINING = `
---

## 5. Phase 4: Observability and ML Ops

### Enhanced Health Endpoint

The \`/health\` endpoint reports:
- Service status (LLM, Redis, Embeddings)
- Engine info (spaCy/Stanza loaded models)
- Feature flags
- Memory usage (RSS/VMS in MB)

### Structured Performance Logging

Every service logs execution time in milliseconds:
\`\`\`
NLP pipeline (spacy) completed in 45ms for lang=it
LLM completed in 2300ms: translation=The cat eats..., concepts=3, tips=2, errors=0
Encoded sentence in 52ms (dim=384)
Cache HIT for key=grammario:analysis:a3b2c1d4e5f6
Total analysis completed in 2410ms (parallel)
\`\`\`

---

## 6. Phase 5: Admin Dashboard

A standalone admin console at \`/admin\` with:

- **Overview**: KPI cards, language breakdown, recent activity
- **Users**: Full management table with inline edit, delete, search, pagination
- **Requests & Data**: Every analysis with full raw JSON viewer, copy-to-clipboard
- **Vocabulary**: All saved vocabulary across all users
- **Backend**: Live health monitoring with service status, engine info, memory usage

Admin access is restricted to the hardcoded admin user ID.

---

## 7. Schema and Type Updates

### New Pydantic Models (Backend)
- \`LLMGrammarError\`: Grammar error detected by the LLM
- \`RuleBasedError\`: Grammar error from parse-tree heuristics
- \`DifficultyInfo\`: CEFR assessment with score and linguistic features

### Extended Models
- \`TokenNode\` gained \`frequency_band\`
- \`PedagogicalData\` gained \`errors\`
- \`SentenceAnalysis\` gained \`difficulty\`, \`grammar_errors\`, \`embedding\`

### Database Schema
- pgvector extension for embedding storage
- \`difficulty_level\`, \`difficulty_score\`, \`embedding\` columns on analyses
- IVFFlat index for similarity search
- \`match_analyses()\` PostgreSQL function

---

## 8. Infrastructure Changes

### Docker Compose
- Redis service with \`allkeys-lru\` eviction and persistent volume
- Backend depends on Redis health
- CPU-only PyTorch build for smaller image size

### Production Dockerfile
- Multi-stage build with spaCy, Stanza, and sentence-transformers models pre-downloaded
- Frequency data bundled in image

### New Dependencies
- spacy, sentence-transformers, scikit-learn, joblib, numpy, redis, psutil

---

## 9. Complete File Manifest

**22 new files** and **20 modified files** across backend services, frontend components, API routes, database schema, Docker configuration, and deployment scripts.

### Key New Services
| Service | Purpose |
|---------|---------|
| Redis Cache | Analysis result caching with 24h TTL |
| spaCy Manager | Fast CPU NLP engine (10-50x faster than Stanza) |
| Difficulty Scorer | CEFR level classification via linguistic features |
| Frequency Service | Word frequency band lookups |
| Embedding Service | Sentence vectors for similarity search |
| Error Detector | Rule-based grammar error detection |
| SM-2 Algorithm | Spaced repetition for vocabulary review |
`

// --- Mermaid diagram definitions ---

const DIAGRAM_ARCHITECTURE = `graph TB
    Browser["Browser (User)"] -->|HTTPS| Vercel["Vercel — Next.js Frontend"]
    Vercel -->|"POST /api/v1/analyze"| Nginx["Nginx Reverse Proxy"]
    Nginx -->|"proxy_pass :8000"| Backend["FastAPI Backend"]
    Backend -->|read/write| Redis["Redis Cache"]
    Backend -->|"API call"| OpenRouter["OpenRouter LLM"]
    Vercel -->|read/write| Supabase["Supabase — PostgreSQL"]
    Browser -->|auth + queries| Supabase`

const DIAGRAM_REQUEST_FLOW = `sequenceDiagram
    participant U as User Browser
    participant V as Vercel API Route
    participant N as Nginx
    participant B as FastAPI Backend
    participant R as Redis
    participant LLM as OpenRouter LLM
    U->>V: POST /api/v1/analyze
    V->>N: Proxy to backend
    N->>B: Forward request
    B->>R: Cache lookup
    alt Cache HIT
        R-->>B: Cached result
        B-->>N: Response ~5ms
    else Cache MISS
        R-->>B: null
        par Parallel execution
            B->>B: spaCy NLP ~300ms
            B->>LLM: LLM call ~4s
            B->>B: Embedding ~100ms
        end
        B->>R: Cache SET with 24h TTL
        B-->>N: Response ~4s
    end
    N-->>V: Forward response
    V->>V: Save to Supabase
    V-->>U: Analysis JSON`

const DIAGRAM_PARALLEL = `graph LR
    Request["Incoming Request"] --> CacheCheck{"Redis Cache?"}
    CacheCheck -->|HIT| ReturnCached["Return Cached — 5ms"]
    CacheCheck -->|MISS| Parallel["asyncio.gather"]
    Parallel --> SpaCy["spaCy NLP — ~300ms"]
    Parallel --> LLMCall["LLM API Call — ~4s"]
    Parallel --> Embed["Embedding — ~100ms"]
    SpaCy --> Merge["Merge Results"]
    LLMCall --> Merge
    Embed --> Merge
    Merge --> Enrich["Difficulty + Frequency + Errors"]
    Enrich --> CacheSet["Cache SET — 24h TTL"]
    CacheSet --> ReturnFresh["Return Response"]`

const DIAGRAM_CACHING = `flowchart TD
    Input["text + language"] --> Hash["SHA-256 hash key"]
    Hash --> Lookup{"Redis GET"}
    Lookup -->|HIT| Deserialize["JSON deserialize"]
    Deserialize --> IncrHit["hits += 1"]
    IncrHit --> ReturnCached["Return cached analysis"]
    Lookup -->|MISS| IncrMiss["misses += 1"]
    IncrMiss --> RunAnalysis["Run full analysis pipeline"]
    RunAnalysis --> Serialize["JSON serialize — exclude embedding"]
    Serialize --> CacheSet["Redis SETEX — TTL 24h"]
    CacheSet --> ReturnFresh["Return fresh analysis"]`

const DIAGRAM_SRS = `graph TD
    Review["Review Card"] --> Rate{"Quality Rating 0-5"}
    Rate -->|"3-5 — Correct"| UpdateCorrect["repetitions += 1"]
    UpdateCorrect --> CalcInterval{"Repetition Count"}
    CalcInterval -->|First| Day1["interval = 1 day"]
    CalcInterval -->|Second| Day6["interval = 6 days"]
    CalcInterval -->|"Third+"| Multiply["interval x easeFactor"]
    Day1 --> AdjustEF["Adjust Ease Factor"]
    Day6 --> AdjustEF
    Multiply --> AdjustEF
    Rate -->|"0-2 — Wrong"| ResetCard["Reset: interval=1, reps=0"]
    ResetCard --> AdjustEF
    AdjustEF --> Schedule["Schedule next review date"]
    Schedule --> Review`

// --- Summary highlights ---

const highlights = [
  {
    icon: Zap,
    title: "Faster Analysis",
    description: "Sentence analysis now runs 2-3x faster by processing multiple tasks at the same time instead of one after another.",
  },
  {
    icon: Database,
    title: "Instant Repeats",
    description: "If you analyze a sentence you've seen before, the result comes back instantly from cache instead of being re-computed.",
  },
  {
    icon: BarChart3,
    title: "Difficulty Ratings",
    description: "Every sentence now gets a difficulty rating from A1 (beginner) to C2 (mastery) based on its grammar complexity and vocabulary.",
  },
  {
    icon: Brain,
    title: "Smart Word Insights",
    description: "Each word is color-coded by how common it is in the language, and grammar mistakes are automatically detected and explained.",
  },
  {
    icon: BookOpen,
    title: "Vocabulary Review",
    description: "A built-in flashcard system uses spaced repetition (the same method Anki uses) to help you memorize saved vocabulary over time.",
  },
  {
    icon: ShieldCheck,
    title: "Admin Dashboard",
    description: "A full admin console for monitoring system health, managing users, and viewing all analysis data across the platform.",
  },
]

export default function PatchNotesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* --- Simplified Summary --- */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2">What&apos;s New in Grammario</h1>
          <p className="text-lg text-muted-foreground mb-8">
            A major upgrade to how Grammario analyzes sentences, with new features for learners
            and significant speed improvements under the hood.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-surface-2 p-5 flex gap-4"
              >
                <div className="shrink-0 mt-0.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <item.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-8 mb-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-6">
            Technical Implementation Details
          </p>
        </div>

        {/* --- Section: Intro + TOC --- */}
        <article>
          <Md>{SECTION_INTRO}</Md>

          <MermaidDiagram chart={DIAGRAM_ARCHITECTURE} title="System Architecture" />

          {/* --- Section: Problem Statement --- */}
          <Md>{SECTION_PROBLEM}</Md>

          <MermaidDiagram chart={DIAGRAM_REQUEST_FLOW} title="Analysis Request Flow" />

          {/* --- Section: Phase 1 - Parallel --- */}
          <Md>{SECTION_PHASE1_INTRO}</Md>

          <MermaidDiagram chart={DIAGRAM_PARALLEL} title="Parallel NLP Pipeline" />

          {/* --- Section: Phase 1 - Redis --- */}
          <Md>{SECTION_PHASE1_REDIS}</Md>

          <MermaidDiagram chart={DIAGRAM_CACHING} title="Redis Caching Flow" />

          {/* --- Section: Phase 1 rest + Phase 2 --- */}
          <Md>{SECTION_PHASE1_REST}</Md>

          {/* --- Section: Phase 3 - SRS --- */}
          <Md>{SECTION_PHASE3}</Md>

          <MermaidDiagram chart={DIAGRAM_SRS} title="Spaced Repetition Cycle (SM-2)" />

          {/* --- Remaining sections --- */}
          <Md>{SECTION_REMAINING}</Md>
        </article>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>Grammario &mdash; Visual Grammar for Deep Learners</p>
      </footer>
    </div>
  )
}
