# Grammario Performance and ML/NLP Feature Upgrade -- Implementation Details

This document describes every change made to the Grammario codebase during the performance optimization and advanced ML/NLP feature upgrade. It is organized by phase, with exact file paths, code explanations, and architectural rationale.

---

## Table of Contents

1. [Problem Statement and Root Cause Analysis](#1-problem-statement-and-root-cause-analysis)
2. [Phase 1: Performance Fixes](#2-phase-1-performance-fixes)
   - [1A. Parallel Inference with asyncio](#1a-parallel-inference-with-asyncio)
   - [1B. Redis Caching Layer](#1b-redis-caching-layer)
   - [1C. spaCy as a Faster NLP Engine](#1c-spacy-as-a-faster-nlp-engine)
   - [1D. Truly Async Route Handlers](#1d-truly-async-route-handlers)
3. [Phase 2: ML/NLP Feature Additions](#3-phase-2-mlnlp-feature-additions)
   - [2A. CEFR Difficulty Scoring](#2a-cefr-difficulty-scoring)
   - [2B. Word Frequency Analysis](#2b-word-frequency-analysis)
   - [2C. Sentence Embeddings and Similarity Search](#2c-sentence-embeddings-and-similarity-search)
   - [2D. Grammar Error Detection](#2d-grammar-error-detection)
4. [Phase 3: Data Engineering -- Spaced Repetition System](#4-phase-3-data-engineering----spaced-repetition-system)
   - [3A. SM-2 Algorithm](#3a-sm-2-algorithm)
   - [3B. Vocabulary Review API Routes](#3b-vocabulary-review-api-routes)
   - [3C. Vocabulary Review UI](#3c-vocabulary-review-ui)
5. [Phase 4: Observability and ML Ops](#5-phase-4-observability-and-ml-ops)
6. [Phase 5: Admin Dashboard](#6-phase-5-admin-dashboard)
   - [5A. Admin Auth Guard](#5a-admin-auth-guard)
   - [5B. Admin API Routes](#5b-admin-api-routes)
   - [5C. Admin Dashboard Page](#5c-admin-dashboard-page)
   - [5D. Navbar Integration](#5d-navbar-integration)
7. [Schema and Type Updates](#7-schema-and-type-updates)
8. [Infrastructure Changes](#8-infrastructure-changes)
9. [Complete File Manifest](#9-complete-file-manifest)

---

## 1. Problem Statement and Root Cause Analysis

**Symptom**: Each sentence analysis query took 10-15 seconds to return on a 2GB DigitalOcean VM.

**Root cause**: The original `NLPService.analyze_text()` in `backend/app/services/nlp.py` ran two expensive operations **sequentially**:

1. **Stanza neural inference** (~3-5s on a small CPU): Loading a full neural NLP pipeline (tokenizer, multi-word token expander, POS tagger, lemmatizer, dependency parser) and running it through PyTorch on a CPU without AVX2 support.
2. **LLM API call** (~3-8s): A synchronous HTTP call to OpenRouter/OpenAI for pedagogical explanations, including JSON parsing and retries.

These two operations are completely independent -- the LLM only needs the raw text, not the parse output -- yet they were chained sequentially, meaning the total wall-clock time was their sum.

Additionally:
- The route handler was declared `async def` but called the synchronous `analyze_text()`, which blocks the event loop.
- No caching existed. Identical sentences triggered full re-analysis every time.
- Stanza is 10-50x slower than spaCy on CPU for the same tasks.

**Before (sequential)**:
```
User request -> Stanza (4s) -> LLM (5s) -> Response = 9s total
```

**After (parallel + spaCy + cache)**:
```
User request -> Cache check (1ms)
             -> [miss] -> spaCy (0.3s) | LLM (4s) | Embedding (0.1s)  [parallel]
                       -> Post-processing (5ms)
                       -> Cache set
                       -> Response = ~4s total
             -> [hit]  -> Response = 5ms
```

---

## 2. Phase 1: Performance Fixes

### 1A. Parallel Inference with asyncio

**File modified**: `backend/app/services/nlp.py`

The `NLPService` class was rewritten to expose an `analyze_text_async()` method that uses `asyncio.gather()` with a `ThreadPoolExecutor` to run three independent operations concurrently:

```python
_executor = ThreadPoolExecutor(max_workers=4)

class NLPService:
    async def analyze_text_async(self, text, lang_code):
        loop = asyncio.get_event_loop()

        # Phase 1: Three independent tasks run in parallel
        nlp_future = loop.run_in_executor(_executor, self._run_nlp_pipeline, text, lang_code)
        llm_future = loop.run_in_executor(_executor, self._run_llm, text, lang_code)
        emb_future = loop.run_in_executor(_executor, self._run_embedding, text)

        results = await asyncio.gather(nlp_future, llm_future, emb_future, return_exceptions=True)
```

**Why `run_in_executor`?** Stanza/spaCy are CPU-bound (they hold the GIL during tensor operations), and the LLM call is I/O-bound. `run_in_executor` with a thread pool lets both run without blocking the FastAPI event loop. The 4-worker pool allows up to 4 concurrent analyses.

**Error handling**: `return_exceptions=True` means if the LLM fails, we still return the NLP parse. Only the NLP pipeline failure is considered fatal (re-raised).

Each sub-method logs its execution time:

```python
def _run_nlp_pipeline(self, text, lang_code):
    t0 = time.perf_counter()
    # ... run spaCy or Stanza ...
    elapsed = (time.perf_counter() - t0) * 1000
    logger.info(f"NLP pipeline ({engine_used}) completed in {elapsed:.0f}ms for lang={lang_code}")
```

The synchronous `analyze_text()` method is retained as a fallback for non-async contexts.

---

### 1B. Redis Caching Layer

**New file**: `backend/app/services/cache.py`

A `CacheService` class backed by Redis that:

- **Keys** are SHA-256 hashes of `"{language}:{text.strip().lower()}"`, prefixed with `grammario:analysis:`. This normalizes whitespace and case to maximize hit rates.
- **Values** are JSON-serialized `SentenceAnalysis` dicts.
- **TTL** is 24 hours (configurable via `DEFAULT_TTL`).
- **Graceful degradation**: If the `redis` package is not installed or the server is unreachable, caching is silently disabled. The service never throws.

```python
class CacheService:
    def get(self, text, language) -> Optional[dict]:
        key = self._cache_key(text, language)
        raw = self._client.get(key)
        if raw:
            self._hits += 1
            return json.loads(raw)
        self._misses += 1
        return None

    def set(self, text, language, data, ttl=86400):
        key = self._cache_key(text, language)
        self._client.setex(key, ttl, json.dumps(data))
```

**Hit-rate tracking**: The service tracks `_hits` and `_misses` in memory, exposed via a `.stats` property used by the `/health` endpoint.

**Integration into NLPService**: The cache is checked at the top of `analyze_text_async()`. On a miss, the result is cached after assembly. Embeddings are excluded from cache storage to save Redis memory (they are re-computed on cache hits if needed):

```python
cache_data = analysis.model_dump()
cache_data.pop("embedding", None)
cache_service.set(text, lang_code, cache_data)
```

**Infrastructure**:
- `docker-compose.yml` and `docker-compose.prod.yml` both gained a `redis` service using `redis:7-alpine` with `--maxmemory 256mb --maxmemory-policy allkeys-lru`.
- The backend gains a `REDIS_URL` environment variable (`redis://redis:6379/0`).
- A named volume `redis_data` persists cache across restarts in production.
- The backend `depends_on` redis with `condition: service_healthy`.

**New API endpoints** in `backend/app/api/routes.py`:
- `GET /api/v1/cache/stats` -- returns hit/miss counts and hit rate.
- `POST /api/v1/cache/flush` -- deletes all `grammario:*` keys.

---

### 1C. spaCy as a Faster NLP Engine

**New file**: `backend/app/services/spacy_manager.py`

spaCy is 10-50x faster than Stanza on CPU for tokenization, POS tagging, lemmatization, and dependency parsing. A `SpacyManager` singleton mirrors the existing `StanzaManager` pattern:

- **Singleton** via `__new__` override.
- **LRU eviction** with `OrderedDict` when `MAX_LOADED_MODELS` is reached.
- **Supported languages**: IT, ES, DE, RU (Turkish has no spaCy model with dependency parsing).
- **Model mapping**: `it_core_news_md`, `es_core_news_md`, `de_core_news_md`, `ru_core_news_md`.
- **Auto-download**: If `spacy.load()` fails with `OSError`, the manager calls `spacy.cli.download()` and retries.

**Engine selection** in `NLPService._run_nlp_pipeline()`:

```python
PREFERRED_ENGINE = os.getenv("PREFERRED_ENGINE", "spacy")

use_spacy = (
    PREFERRED_ENGINE == "spacy"
    and spacy_manager.available
    and lang_code in spacy_manager.SUPPORTED_LANGUAGES
)
```

If spaCy fails at runtime, it falls back to Stanza transparently.

**Strategy pattern update**: `backend/app/services/strategies/base.py` gained:

1. `_convert_spacy_token_to_node()` -- converts a spaCy `Token` to the shared `TokenNode` schema, mapping `token.pos_` to UPOS, `token.morph` to feats, and computing `head_id` relative to the sentence.
2. `process_spacy()` -- default spaCy processing that iterates over `doc.sents`, filtering PUNCT and SPACE tokens. Subclasses can override for language-specific logic.

**Dockerfile changes** (`backend/Dockerfile.prod`):
```dockerfile
RUN python -m spacy download it_core_news_md && \
    python -m spacy download es_core_news_md && \
    python -m spacy download de_core_news_md && \
    python -m spacy download ru_core_news_md
```

These are downloaded in the builder stage and carried into the production image via the site-packages copy.

---

### 1D. Truly Async Route Handlers

**File modified**: `backend/app/api/routes.py`

The `/analyze` endpoint was changed from:
```python
analysis = nlp_service.analyze_text(text, request.language)
```
to:
```python
analysis = await nlp_service.analyze_text_async(text, request.language)
```

This is critical because declaring a handler `async def` but calling blocking code inside it blocks the entire uvicorn event loop, preventing it from serving other requests during the 10+ seconds of analysis.

---

## 3. Phase 2: ML/NLP Feature Additions

### 2A. CEFR Difficulty Scoring

**New file**: `backend/app/services/difficulty_scorer.py`

This is a feature-engineered NLP classification pipeline that rates sentence difficulty on the CEFR scale (A1-C2). It demonstrates proper ML/NLP feature engineering without needing a trained model.

**Feature extraction** from the parse tree (`LinguisticFeatures` dataclass):

| Feature | Source | What It Measures |
|---------|--------|-----------------|
| `sentence_length` | Token count | Raw complexity |
| `avg_word_length` | Character count / token count | Morphological richness |
| `type_token_ratio` | Unique lemmas / total lemmas | Lexical diversity |
| `tree_depth` | BFS on dependency tree | Embedding depth of clauses |
| `tree_width` | Max nodes at any depth level | Parallel structure complexity |
| `subordinate_clause_count` | Tokens with deprel in `{acl, advcl, csubj, ccomp, xcomp, ...}` | Syntactic subordination |
| `avg_morphological_complexity` | Average `feats.split('|')` count per token | Inflectional richness |
| `unique_pos_count` | Distinct UPOS tags | Syntactic variety |
| `rare_word_proportion` | Tokens with frequency band >= 4 / total | Vocabulary difficulty |
| `lexical_density` | Content words (NOUN, VERB, ADJ, ADV) / total | Information density |

**Scoring**: A weighted heuristic combines these features into a 0.0-1.0 score:

```python
components = [
    ("length",        min(sentence_length / 25.0, 1.0),            0.15),
    ("word_length",   clamp((avg_word_length - 2) / 8.0),          0.10),
    ("tree_depth",    clamp((tree_depth - 1) / 6.0),               0.20),
    ("subordination", min(sub_clause_count / 3.0, 1.0),            0.20),
    ("morphology",    min(avg_morph_complexity / 5.0, 1.0),        0.10),
    ("ttr",           type_token_ratio,                              0.10),
    ("rare_words",    min(rare_word_proportion / 0.5, 1.0),        0.10),
    ("lexical_density", lexical_density,                             0.05),
]
```

**CEFR mapping**:
```
0.00-0.15 -> A1  |  0.15-0.30 -> A2  |  0.30-0.45 -> B1
0.45-0.60 -> B2  |  0.60-0.78 -> C1  |  0.78-1.00 -> C2
```

The weights are calibrated against CEFR proficiency descriptors. Tree depth and subordination get the highest weights (0.20 each) because embedded clauses are the strongest predictor of syntactic difficulty in second language acquisition research.

**Design note**: The docstring explicitly mentions this can be swapped for a trained `scikit-learn` model loaded from a `.joblib` file, and `scikit-learn` + `joblib` are included in `requirements.txt` for this purpose.

---

### 2B. Word Frequency Analysis

**New file**: `backend/app/services/frequency.py`
**New directory**: `backend/data/frequency/` (with `it.json`, `es.json`, `de.json`, `ru.json`, `tr.json`)

**Concept**: Each word in a sentence is tagged with a "frequency band" (1-5) indicating how common it is in the target language:

| Band | Rank Range | Label |
|------|-----------|-------|
| 1 | Top 500 | Very Common |
| 2 | 501-2000 | Common |
| 3 | 2001-5000 | Intermediate |
| 4 | 5001-10000 | Uncommon |
| 5 | 10001+ or not found | Rare |

**Data source**: JSON files mapping lowercased lemmas to their corpus frequency rank (1-based). Generated by `backend/generate_frequency_lists.py` from curated word lists derived from OpenSubtitles/Wikipedia frequency data. Each file contains 200-400 entries of core vocabulary.

**FrequencyService**: Loads all JSON files at startup, provides `get_band(lemma, language)` and `annotate_nodes(nodes, language)` which returns a `Dict[node_id, band]`.

**Integration**: In `NLPService._enrich_nodes()`, frequency bands are looked up and set on each `TokenNode.frequency_band` field. This dict is also passed to the difficulty scorer for the `rare_word_proportion` feature.

**Frontend rendering**: In `WordNode.tsx`, each frequency band maps to a color:
```typescript
const FREQUENCY_DOT_COLORS = {
  1: "bg-emerald-400",  // Very Common
  2: "bg-green-400",    // Common
  3: "bg-yellow-400",   // Intermediate
  4: "bg-orange-400",   // Uncommon
  5: "bg-red-400",      // Rare
}
```

A small colored dot appears in the top-right corner of each word card, and a label appears below the UPOS tag.

---

### 2C. Sentence Embeddings and Similarity Search

**New file**: `backend/app/services/embeddings.py`

**Model**: `paraphrase-multilingual-MiniLM-L12-v2` from `sentence-transformers`. This model:
- Produces 384-dimensional normalized vectors.
- Supports 50+ languages including all 5 Grammario target languages.
- Is ~90MB and runs fast on CPU (~50-100ms per sentence).
- Is pre-downloaded in the Docker build stage.

**EmbeddingService** provides:
- `encode(text) -> List[float]`: Encode a single sentence.
- `encode_batch(texts) -> List[List[float]]`: Batch encoding with `batch_size=32`.
- `cosine_similarity(a, b) -> float`: Dot product of normalized vectors.
- `find_similar(query_embedding, candidates, top_k) -> List[dict]`: In-memory similarity search.

**Lazy loading**: The model is loaded on first call to `encode()`, not at import time. This avoids a 500ms+ startup penalty if embeddings are never used.

**Database support**: The Supabase schema was updated:
```sql
CREATE EXTENSION IF NOT EXISTS "vector";

ALTER TABLE analyses ADD COLUMN embedding vector(384);
CREATE INDEX idx_analyses_embedding ON analyses
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

A `match_analyses()` PostgreSQL function enables server-side similarity search:
```sql
CREATE FUNCTION match_analyses(
    query_embedding vector(384),
    match_user_id UUID,
    match_language TEXT DEFAULT NULL,
    match_count INT DEFAULT 5,
    match_threshold FLOAT DEFAULT 0.5
) RETURNS TABLE (id, text, language, translation, difficulty_level, similarity, created_at)
```

**New API endpoint**: `POST /api/v1/embed` accepts a text string and returns the embedding vector + dimension.

**Integration**: Embedding runs in parallel with NLP and LLM in `analyze_text_async()`. The embedding vector is included in the `SentenceAnalysis` response but excluded from Redis cache storage to save memory.

---

### 2D. Grammar Error Detection

**New file**: `backend/app/services/error_detector.py`

A dual-approach error detection system:

#### Rule-based detection (from parse tree)

The `ErrorDetector` class analyzes the dependency parse output to find structural grammatical errors:

**Romance languages (IT, ES)**:
- DET-NOUN gender agreement: If a DET/ADJ modifying a NOUN has a different `Gender` feature, flag it.
- DET-NOUN number agreement: Same for `Number` feature.

**Inflected languages (DE, RU)**:
- ADJ-NOUN case agreement: Adjectives with `amod`/`nmod` deprel whose `Case` differs from their head noun.
- ADJ-NOUN gender agreement: Same for `Gender`.

**Turkish**:
- Vowel harmony: If a word's stem ends with a front vowel but the suffix starts with a back vowel (or vice versa), flag a potential violation.

**Universal (all languages)**:
- Subject-verb number agreement: If a token with `nsubj` deprel has a different `Number` than its verb head.
- Subject-verb person agreement: Same for `Person`.

Each error is a `GrammarError` dataclass with `word`, `word_id`, `error_type`, `severity` (info/warning/error), `message`, optional `correction`, and optional `rule`.

#### LLM-based detection (from prompt enhancement)

The LLM prompt in `backend/app/services/llm_service.py` was extended to include an `errors` array in its JSON output:

```json
"errors": [
    {
      "word": "the word containing the error",
      "error_type": "spelling|agreement|conjugation|case|word_order|preposition|article",
      "correction": "the corrected form",
      "explanation": "Brief explanation of why this is wrong"
    }
]
```

The instruction says: "If the sentence has NO errors, return an empty errors array []."

An `LLMGrammarError` Pydantic model was added to `schemas.py` and the `PedagogicalData` model gained `errors: Optional[List[LLMGrammarError]]`.

**Frontend rendering**: Rule-based errors appear in a "Grammar Issues Detected" panel with red-bordered cards. LLM errors appear in an "AI-Detected Corrections" section with strikethrough on the original word and the correction shown with a green highlight. In the ReactFlow graph, tokens with errors have a red border and strikethrough text.

---

## 4. Phase 3: Data Engineering -- Spaced Repetition System

### 3A. SM-2 Algorithm

**New file**: `frontend/src/lib/sm2.ts`

A TypeScript implementation of the SuperMemo SM-2 spaced repetition algorithm, the standard algorithm used by Anki, Mnemosyne, and most SRS systems.

**Input**: `{ quality, easeFactor, interval, repetitions }`
- `quality`: 0-5 rating of recall quality (0 = blackout, 5 = perfect)
- `easeFactor`: Current ease factor (minimum 1.3, default 2.5)
- `interval`: Current interval in days
- `repetitions`: Count of consecutive correct reviews

**Algorithm**:
```
If quality >= 3 (correct):
  If repetitions == 0: interval = 1 day
  If repetitions == 1: interval = 6 days
  Else: interval = round(interval * easeFactor)
  repetitions += 1
Else (incorrect):
  repetitions = 0
  interval = 1

easeFactor += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
easeFactor = max(1.3, easeFactor)
```

**Mastery calculation**: A 0-100 score computed from:
- 40% from repetition count (caps at 8 reps)
- 30% from interval length (caps at 60 days)
- 30% from ease factor (normalized against the 1.3-3.0 range)

**Helper exports**: `qualityLabel(q)` and `qualityColor(q)` for UI rendering.

---

### 3B. Vocabulary Review API Routes

**New file**: `frontend/src/app/api/v1/vocabulary/review/route.ts`

Since vocabulary data lives in Supabase (accessed from the frontend), the review endpoints are Next.js API routes:

**`GET /api/v1/vocabulary/review`**:
1. Authenticates via Supabase session.
2. Queries `vocabulary` table for words where `next_review <= today`.
3. Returns up to 20 due words plus aggregate stats: `{ total, due, mastered }`.

**`POST /api/v1/vocabulary/review`**:
1. Accepts `{ vocab_id, quality }` (quality 0-5).
2. Fetches the vocabulary record by ID + user_id.
3. Applies the SM-2 algorithm from `sm2.ts`.
4. Updates the record with new `ease_factor`, `interval_days`, `next_review`, `review_count`, and `mastery`.
5. Returns the computed result.

---

### 3C. Vocabulary Review UI

**New file**: `frontend/src/app/app/review/page.tsx`

A full flashcard review interface:

- **Stats bar**: Shows Total Words, Due Today, and Mastered counts in color-coded cards.
- **Flashcard**: Shows the word, lemma, language flag, POS, mastery percentage, and context sentence. A "Show Answer" button reveals the translation.
- **Rating UI**: Three main buttons (Wrong/Hard/Good) plus an advanced 0-5 rating row for power users.
- **Progress bar**: Visual progress through the current review session.
- **Session summary**: After all cards reviewed, shows correct count, total, and accuracy percentage.
- **Empty state**: "All Caught Up!" screen when no words are due.

**Navbar addition**: A "Review" link with a `BookOpen` icon was added to the navigation bar in `frontend/src/components/ui/navbar.tsx`.

---

## 5. Phase 4: Observability and ML Ops

### Enhanced Health Endpoint

**File modified**: `backend/app/main.py`

The `/health` endpoint was expanded from a simple status check to a comprehensive system dashboard:

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "services": {
            "llm": bool(settings.OPENROUTER_KEY or settings.OPENAI_API_KEY),
            "cache": cache_service.stats,        # hits, misses, hit_rate
            "embeddings": embedding_service.available,
        },
        "engines": {
            "preferred": os.getenv("PREFERRED_ENGINE", "spacy"),
            "spacy": { "available", "loaded", "supported" },
            "stanza": { "loaded", "max_loaded", "supported" },
        },
        "features": {
            "difficulty_scoring": True,
            "frequency_analysis": frequency_service.supported_languages,
            "error_detection": True,
            "sentence_embeddings": embedding_service.available,
        },
        "memory": {
            "rss_mb": round(mem_info.rss / 1024 / 1024, 1),
            "vms_mb": round(mem_info.vms / 1024 / 1024, 1),
        },
    }
```

Uses `psutil` (added to requirements) for real-time memory reporting.

### Structured Performance Logging

Every service logs its execution time in milliseconds:

```
INFO  NLP pipeline (spacy) completed in 45ms for lang=it
INFO  LLM completed in 2300ms: translation=The cat eats the fis..., concepts=3, tips=2, errors=0
INFO  Encoded sentence in 52ms (dim=384)
INFO  Difficulty: B1 (score=0.38), len=5, depth=2, sub_clauses=0
INFO  Cache SET key=grammario:analysis:a3b2c1d4e5f6 ttl=86400s
INFO  Total analysis completed in 2410ms (parallel)
```

Cache interactions are logged with HIT/MISS/SET:
```
INFO  Cache HIT for key=grammario:analysis:a3b2c1d4e5f6
```

### Smart Model Preloading

The startup lifespan handler in `main.py` was updated to:
1. Preload spaCy models for IT, ES, DE, RU when `PREFERRED_ENGINE=spacy`.
2. Preload only the Turkish Stanza model (since spaCy doesn't support Turkish).
3. Warm up the embedding model with a dummy encode call.
4. Fall back to full Stanza preloading when `PREFERRED_ENGINE=stanza`.

---

## 6. Phase 5: Admin Console

A fully standalone admin console at `/admin` (completely separate from the `/app` route tree), accessible only to the hardcoded admin user (`m.serdukoff@gmail.com`, user ID `3f5a9d50-d8fb-4e05-a7c7-52b79d1aeee5`). It provides full visibility into all database records, raw request/response JSON, user management, and backend system health.

### 5A. Admin RLS Bypass Policies

**Database migration**: Applied via Supabase MCP

Because Supabase enforces Row Level Security (RLS) on all tables -- each user can only see their own data -- the admin dashboard could not read other users' records. This was solved by adding `FOR ALL` RLS policies that match the admin user's UUID:

```sql
CREATE POLICY "Admin full access users" ON public.users
  FOR ALL USING (auth.uid() = '3f5a9d50-...'::uuid)
  WITH CHECK (auth.uid() = '3f5a9d50-...'::uuid);

-- Same policy applied to: analyses, vocabulary, daily_goals, user_achievements
```

These are PERMISSIVE policies, so they OR with existing per-user policies. Normal users still only see their own data; the admin sees everything.

### 5B. Admin Auth Guard

**File**: `frontend/src/lib/admin.ts`

```typescript
export const ADMIN_USER_ID = "3f5a9d50-d8fb-4e05-a7c7-52b79d1aeee5"
export const ADMIN_EMAIL = "m.serdukoff@gmail.com"
export function isAdmin(userId: string | undefined | null): boolean {
  return userId === ADMIN_USER_ID
}
```

Imported by both client-side (layout, navbar) and server-side (API routes). Every admin API route checks `user.id !== ADMIN_USER_ID` and returns HTTP 403 for non-admin callers.

### 5C. Standalone Admin Layout

**File**: `frontend/src/app/admin/layout.tsx`

The admin console has its own layout, completely separate from the app's Navbar. It features:

- **Collapsible sidebar** with navigation links: Overview, Users, Requests & Data, Vocabulary, Backend
- **Auth guard**: On mount, redirects non-admin users to `/`
- **Footer links**: "Back to App" (returns to `/app`) and "Sign Out"
- **Full-height layout**: `h-screen` with `overflow-hidden` on root, `overflow-y-auto` on main content

### 5D. Admin API Routes

Five server-side Next.js API routes, all enforcing the admin ID check:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/admin/stats` | GET | Aggregate platform stats: user counts, analysis counts (today/week/total), language breakdown, vocabulary stats, recent activity feed |
| `/api/v1/admin/users` | GET | Paginated user list with all profile fields |
| `/api/v1/admin/users` | PATCH | Update user fields (display_name, is_pro, xp, level, streak, total_analyses) |
| `/api/v1/admin/users` | DELETE | Delete a non-admin user (cascades to analyses, vocabulary, etc.) |
| `/api/v1/admin/analyses` | GET | Paginated analysis list with full `nodes` JSONB and `pedagogical_data` JSONB. Supports `?language=`, `?user_id=`, `?id=` (single record with full raw data) |
| `/api/v1/admin/analyses` | DELETE | Delete a specific analysis |
| `/api/v1/admin/vocabulary` | GET | Paginated vocabulary list across all users |
| `/api/v1/admin/health` | GET | Proxies to Python backend `/health` endpoint |

### 5E. Admin Pages

#### Overview (`/admin`)

KPI cards (Total Users, Active This Week, Total Analyses, Analyses Today, This Week, Pro Users, Vocabulary). Language breakdown bar chart. Recent analyses feed with links to raw detail view. Recent sign-ups list.

#### Users (`/admin/users`)

Full user management table with columns: User (avatar + name + email), ID (truncated UUID), Level/XP, Streak (current + best), Analyses count, Status (Pro/Free), Last Active, Joined, Actions.

- **Inline editing**: Click pencil to edit display name, level, XP, and toggle Pro status in-place
- **Delete with confirmation**: Two-step delete (click trash, then confirm/cancel)
- **Search**: Client-side filter by name, email, or user ID
- **Pagination**: Server-side with page controls
- **Admin protection**: Cannot delete the admin user

#### Requests & Data (`/admin/requests`)

Every analysis record with full raw data access:

- **List view**: Each row shows sentence text, user, language flag, timestamp, translation. Inline toggle buttons to expand `nodes` JSON, `pedagogical_data` JSON, or full raw record. Copy-to-clipboard on any section. Delete with confirmation.
- **Detail view**: Click any row to see the full record with collapsible sections for the complete raw record, parse tree nodes, and LLM pedagogical response -- all as formatted JSON with copy buttons.
- **Language filter**: Pill buttons to filter by language
- **Deep-link**: URL parameter `?id=<uuid>` links directly to a specific analysis

#### Vocabulary (`/admin/vocabulary`)

Table of all saved vocabulary across all users: word, lemma, translation, language, POS, mastery progress bar, review count, next review date, context sentence, created date.

#### Backend (`/admin/backend`)

Live backend health monitoring:

- **Status banner**: Green/red/yellow health indicator with version
- **Services**: Status dots for LLM, Redis Cache, Embeddings. Cache hit/miss/rate stats when Redis is active
- **NLP Engines**: spaCy and Stanza with per-language model badges (green = loaded, gray = unloaded). Shows preferred engine
- **Features**: All feature flags with check/X icons
- **Memory**: RSS/VMS in MB with progress bar against 3500 MB container limit
- **Raw JSON**: Expandable raw health response

### 5F. Navbar Integration

**File modified**: `frontend/src/components/ui/navbar.tsx`

A red "Admin" link with `Shield` icon appears in three places (desktop nav, user dropdown, mobile menu), all gated on `isAdmin(user.id)`, pointing to `/admin`.

---

## 7. Schema and Type Updates

### Backend Pydantic Schemas (`backend/app/models/schemas.py`)

**New models added**:

| Model | Purpose |
|-------|---------|
| `LLMGrammarError` | Grammar error detected by the LLM (word, error_type, correction, explanation) |
| `RuleBasedError` | Grammar error from parse-tree heuristics (word, word_id, error_type, severity, message, correction, rule) |
| `DifficultyInfo` | CEFR assessment (level: A1-C2, score: 0.0-1.0, features: dict of linguistic metrics) |

**Modified models**:

| Model | New Field | Type |
|-------|-----------|------|
| `TokenNode` | `frequency_band` | `Optional[int]` (1-5) |
| `PedagogicalData` | `errors` | `Optional[List[LLMGrammarError]]` |
| `SentenceAnalysis` | `difficulty` | `Optional[DifficultyInfo]` |
| `SentenceAnalysis` | `grammar_errors` | `Optional[List[RuleBasedError]]` |
| `SentenceAnalysis` | `embedding` | `Optional[List[float]]` |

### Frontend TypeScript Types (`frontend/src/lib/api.ts`)

Matching interfaces added:
- `LLMGrammarError` (word, error_type, correction, explanation)
- `DifficultyInfo` (level, score, features)
- `RuleBasedError` (word, word_id, error_type, severity, message, correction, rule)
- `TokenNode` gained `frequency_band?: number`
- `PedagogicalData` gained `errors?: LLMGrammarError[]`
- `AnalysisResponse` gained `difficulty?`, `grammar_errors?`, `embedding?`

### Supabase Database Types (`frontend/src/lib/supabase/database.types.ts`)

The `analyses` table Row/Insert/Update types gained:
- `difficulty_level: string | null`
- `difficulty_score: number | null`
- `embedding: number[] | null`

### Supabase SQL Schema (`supabase/schema.sql`)

```sql
-- New extension
CREATE EXTENSION IF NOT EXISTS "vector";

-- New columns on analyses table
difficulty_level TEXT CHECK (difficulty_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
difficulty_score REAL,
embedding vector(384),

-- New indexes
CREATE INDEX idx_analyses_embedding ON analyses USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_analyses_difficulty ON analyses(user_id, difficulty_level);

-- New similarity search function
CREATE FUNCTION match_analyses(query_embedding vector(384), match_user_id UUID, ...) RETURNS TABLE (...)
```

---

## 8. Infrastructure Changes

### Docker Compose (dev) -- `docker-compose.yml`

Added Redis service:
```yaml
redis:
  image: redis:7-alpine
  ports: ["6379:6379"]
  command: redis-server --maxmemory 128mb --maxmemory-policy allkeys-lru
```

Backend gained `depends_on: [redis]` and environment variables:
```yaml
- REDIS_URL=redis://redis:6379/0
- PREFERRED_ENGINE=${PREFERRED_ENGINE:-spacy}
```

### Docker Compose (prod) -- `docker-compose.prod.yml`

Added Redis service with persistent volume:
```yaml
redis:
  image: redis:7-alpine
  container_name: grammario-redis
  restart: always
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
  volumes: [redis_data:/data]
  healthcheck: redis-cli ping
```

Backend depends on Redis health and passes `REDIS_URL=redis://redis:6379/0`.

### Production Dockerfile -- `backend/Dockerfile.prod`

New build steps in the builder stage:
```dockerfile
# spaCy models
RUN python -m spacy download it_core_news_md && \
    python -m spacy download es_core_news_md && \
    python -m spacy download de_core_news_md && \
    python -m spacy download ru_core_news_md

# Sentence-transformers model
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')"

# Frequency data
COPY data/ /app/data/
```

New layers in the production stage:
```dockerfile
COPY --from=builder /root/.cache/torch /home/appuser/.cache/torch
COPY --from=builder /root/.cache/huggingface /home/appuser/.cache/huggingface

ENV TRANSFORMERS_CACHE=/home/appuser/.cache/huggingface \
    TORCH_HOME=/home/appuser/.cache/torch
```

### Python Dependencies -- `backend/requirements.txt`

New packages:
```
spacy>=3.7.0                    # Faster CPU NLP engine
sentence-transformers>=2.2.0    # Sentence embeddings
scikit-learn>=1.4.0             # ML framework (for future trained difficulty model)
joblib>=1.3.0                   # Model serialization
numpy>=1.26.0                   # Numerical computing
redis>=5.0.0                    # Caching layer
psutil>=5.9.0                   # Process memory monitoring
```

### Bug Fix

`backend/app/api/__init__.py` had a broken import for a non-existent `billing` module. This was cleaned up to only export `router`.

---

## 9. Complete File Manifest

### New Files Created (22)

| File | Lines | Purpose |
|------|-------|---------|
| `backend/app/services/cache.py` | 111 | Redis caching service with TTL, hit-rate tracking, and graceful degradation |
| `backend/app/services/spacy_manager.py` | 91 | spaCy model manager (singleton, LRU eviction, auto-download) |
| `backend/app/services/difficulty_scorer.py` | 240 | CEFR difficulty scoring via 10 engineered linguistic features |
| `backend/app/services/frequency.py` | 97 | Word frequency band lookups from per-language corpus data |
| `backend/app/services/embeddings.py` | 119 | Sentence embedding service using sentence-transformers |
| `backend/app/services/error_detector.py` | 238 | Rule-based grammar error detection from dependency parse trees |
| `backend/generate_frequency_lists.py` | ~300 | Script to generate frequency list JSON files |
| `frontend/src/lib/sm2.ts` | 113 | SuperMemo SM-2 spaced repetition algorithm |
| `frontend/src/app/api/v1/vocabulary/review/route.ts` | 134 | Next.js API routes for vocabulary review (GET due words, POST review result) |
| `frontend/src/app/app/review/page.tsx` | ~280 | Vocabulary review flashcard page |
| `frontend/src/lib/admin.ts` | 6 | Admin user ID constant and `isAdmin()` guard function |
| `frontend/src/app/admin/layout.tsx` | 115 | Standalone admin layout with collapsible sidebar, auth guard, nav |
| `frontend/src/app/admin/page.tsx` | 135 | Overview dashboard: KPIs, language chart, recent activity |
| `frontend/src/app/admin/users/page.tsx` | 210 | User management: table, inline edit, delete, search, pagination |
| `frontend/src/app/admin/requests/page.tsx` | 215 | Requests & data: raw JSON viewer, expand/copy nodes/ped/full, detail view |
| `frontend/src/app/admin/vocabulary/page.tsx` | 110 | Vocabulary viewer across all users with mastery bars |
| `frontend/src/app/admin/backend/page.tsx` | 175 | Backend health: services, engines, features, memory, raw JSON |
| `frontend/src/app/api/v1/admin/stats/route.ts` | 65 | Aggregate platform statistics with parallel queries |
| `frontend/src/app/api/v1/admin/users/route.ts` | 90 | GET paginated users, PATCH edit user, DELETE user |
| `frontend/src/app/api/v1/admin/analyses/route.ts` | 100 | GET paginated analyses with raw JSONB, GET single by ID, DELETE |
| `frontend/src/app/api/v1/admin/vocabulary/route.ts` | 32 | GET paginated vocabulary across all users |
| `frontend/src/app/api/v1/admin/health/route.ts` | 40 | Proxy to backend /health endpoint with timeout handling |

### Data Files Created (5)

| File | Entries | Language |
|------|---------|----------|
| `backend/data/frequency/it.json` | 386 | Italian |
| `backend/data/frequency/es.json` | 295 | Spanish |
| `backend/data/frequency/de.json` | 297 | German |
| `backend/data/frequency/ru.json` | 239 | Russian |
| `backend/data/frequency/tr.json` | 205 | Turkish |

### Existing Files Modified (20)

| File | Nature of Changes |
|------|-------------------|
| `backend/app/services/nlp.py` | Rewritten with async parallel execution, spaCy integration, cache, difficulty, frequency, errors, embeddings |
| `backend/app/models/schemas.py` | Added LLMGrammarError, RuleBasedError, DifficultyInfo; extended TokenNode, PedagogicalData, SentenceAnalysis |
| `backend/app/api/routes.py` | Async analyze handler; new /embed, /cache/stats, /cache/flush endpoints |
| `backend/app/main.py` | Smart model preloading (spaCy + Stanza + embedding); enhanced /health with memory, cache stats, engine info |
| `backend/app/services/strategies/base.py` | Added `_convert_spacy_token_to_node()` and `process_spacy()` methods |
| `backend/app/services/llm_service.py` | Extended prompt to return grammar errors; added LLMGrammarError parsing |
| `backend/app/api/__init__.py` | Removed broken billing import |
| `backend/requirements.txt` | Added spacy, sentence-transformers, scikit-learn, joblib, numpy, redis, psutil |
| `backend/Dockerfile.prod` | Added spaCy model downloads, sentence-transformers cache, frequency data copy |
| `docker-compose.yml` | Added Redis service, REDIS_URL and PREFERRED_ENGINE env vars |
| `docker-compose.prod.yml` | Added Redis service with persistent volume, backend depends_on redis |
| `frontend/src/lib/api.ts` | Added DifficultyInfo, RuleBasedError, LLMGrammarError types; extended TokenNode, PedagogicalData, AnalysisResponse |
| `frontend/src/lib/db.ts` | Added difficulty_level and difficulty_score to analysis save |
| `frontend/src/lib/supabase/database.types.ts` | Added difficulty_level, difficulty_score, embedding to analyses types |
| `frontend/src/components/flow/WordNode.tsx` | Frequency band coloring (dot + label), error highlighting (red border + strikethrough) |
| `frontend/src/components/ui/navbar.tsx` | Added "Review" nav link; admin-only "Admin" link (Shield icon) in desktop nav, dropdown, and mobile menu pointing to `/admin` |
| `frontend/src/app/app/page.tsx` | CEFR difficulty badge, grammar error panels, LLM error corrections, frequency data in nodes |
| `frontend/src/app/api/v1/analyze/route.ts` | Added difficulty_level and difficulty_score to Supabase insert |
| `supabase/schema.sql` | pgvector extension, embedding column, IVFFlat index, match_analyses() function, difficulty columns |
