# Grammario

Grammario is an AI-powered language learning application that helps users master grammar through interactive visualizations. It deconstructs sentences into their grammatical components, providing deep linguistic analysis for Italian, Spanish, German, Russian, and Turkish.

## Key Features

- **Visual Grammar Analysis**: Sentences are parsed and visualized as interactive node trees, showing relationships between words.
- **AI-Powered Pedagogical Insights**: Get detailed explanations, teacher's notes, and grammar rules for every analysis.
- **Gamified Learning**: Earn XP, level up, maintain streaks, and unlock achievements as you learn.
- **Multi-Language Support**: Master Italian, Spanish, German, Russian, and Turkish.
- **History & Favorites**: Save your analyses and build a personal library of grammatical examples.

## Technical Architecture

The application is built with a modern stack:
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Visualization**: React Flow for interactive grammar trees
- **Backend/Database**: Supabase (PostgreSQL) for authentication and data persistence
- **AI Integration**: Custom NLP pipeline for sentence analysis

### Authentication & Data Flow

Authentication is handled securely via Supabase Auth.
- **Provider**: Google OAuth (and email/password)
- **Flow**: PKCE (Proof Key for Code Exchange) for secure, robust session management.
- **Persistence**: Sessions are persisted client-side and automatically refreshed.

When a user logs in:
1.  **Immediate Access**: The application immediately authenticates the session to allow instant access to the dashboard.
2.  **Background Loading**: User profile data (XP, level, streaks) is fetched asynchronously in the background. This ensures the UI never freezes, even if the database connection is slow.
3.  **Resilient State**: If the profile load fails, the app gracefully degrades to a default state, ensuring the user can always continue learning.

## Recent Fixes (Feb 2026)

### Authentication Deployment Fix
**Issue**: The application was hanging indefinitely on the loading screen after a page refresh in production environments.
**Cause**:
1.  **Blocking UI Logic**: The initialization process was waiting (`await`) for the user profile query to complete before rendering the dashboard. Network latency or timeouts caused the entire app to freeze.
2.  **Fragile OAuth Flow**: The app was using the older "Implicit" OAuth flow, which is less reliable for maintaining sessions across reloads in modern deployments.
**Resolution**:
- Switched OAuth flow to **PKCE** (Proof Key for Code Exchange) for reliable session recovery.
- Refactored `AuthContext` to be **non-blocking**. The app now sets `loading: false` immediately after session verification, allowing the UI to render while profile data fetches in the background.
- Implemented robust `AbortController` timeouts for database queries to prevent indefinite hanging.

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/grammario.git
    cd grammario
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file with your Supabase credentials:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
