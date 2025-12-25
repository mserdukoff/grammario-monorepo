# Grammario

Grammario is a linguistic deconstruction tool that provides deep grammatical analysis of sentences in multiple languages. It breaks down sentences into their constituent parts (tokens), analyzes their dependencies, and uses advanced Large Language Models (LLMs) to provide pedagogical explanations for language learners.

## 🌟 Features

*   **Deep Linguistic Analysis**: Uses [Stanza](https://stanfordnlp.github.io/stanza/) (Stanford NLP) for state-of-the-art tokenization, lemmatization, POS tagging, and dependency parsing.
*   **Pedagogical Explanations**: Integrates with LLMs (OpenAI GPT-4o, Google Gemini, Anthropic Claude) via OpenRouter to explain grammar concepts like a professor.
*   **Interactive UI**: A React-based frontend that visualizes sentence structure using interactive nodes.
*   **Multi-language Support**: Currently supports **Italian (it)**, **Spanish (es)**, **German (de)**, **Russian (ru)**, and **Turkish (tr)**.
*   **Smart Caching**: Caches explanations to ensure instant responses for repeated queries.

## 🏗 Architecture

The project is structured as a monorepo:

*   **`frontend/`**: Next.js 14 application (React, TypeScript, Tailwind CSS, React Flow).
*   **`backend/`**: FastAPI application (Python) handling NLP processing and LLM orchestration.

## 🚀 Getting Started

### Prerequisites

*   **Docker** and **Docker Compose** (Recommended for easiest setup)
*   *Or* Node.js 18+ and Python 3.11+

### Quick Start (Docker)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mserdukoff/grammario-monorepo.git
    cd grammario-monorepo
    ```

2.  **Set up Environment Variables:**
    Create a `.env` file in the `backend` directory:
    ```bash
    # backend/.env
    OPENROUTER_KEY=your_openrouter_key_here
    # Optional: OPENAI_API_KEY=your_openai_key_here (Fallback)
    ```

3.  **Run with Docker Compose:**
    *(Note: The first run will take a few minutes to download the NLP models)*
    ```bash
    docker-compose up --build
    ```

4.  **Access the App:**
    *   Frontend: [http://localhost:3000](http://localhost:3000)
    *   Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Manual Setup (Development)

#### Backend

1.  Navigate to `backend`:
    ```bash
    cd backend
    ```

2.  Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Run the server:
    ```bash
    python -m uvicorn app.main:app --reload
    ```

#### Frontend

1.  Navigate to `frontend`:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

## 🛠 Deployment

### 🚄 Railway (Recommended)

Since this is a monorepo, you need to tell Railway where to find the services.

1.  **Push your code** to GitHub.
2.  **Create a New Project** on Railway -> Deploy from GitHub.
3.  **Add Two Services** from the same repo:
    *   **Service 1 (Backend)**:
        *   Go to Settings -> **Root Directory**: Set to `/backend`
        *   Add Variable: `OPENROUTER_KEY`
    *   **Service 2 (Frontend)**:
        *   Go to Settings -> **Root Directory**: Set to `/frontend`
        *   Add Variable: `API_URL` -> `https://<your-backend-url>.up.railway.app` (You get this URL after the backend deploys)

### 🐳 Docker & Other Providers

This project includes a `docker-compose.yml` for orchestration and optimized `Dockerfile`s for both services.

*   **Backend**: Python 3.11 Slim image. Pre-downloads NLP models during build.
*   **Frontend**: Next.js Standalone build (Alpine Linux). Extremely lightweight.

You can deploy to any provider that supports Docker Compose or individual Dockerfiles (Render, Fly.io, DigitalOcean).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT](LICENSE)

