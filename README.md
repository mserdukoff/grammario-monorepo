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

### Backend (Render / Railway / Fly.io)

The backend includes a production-ready `Dockerfile` that pre-downloads necessary Stanza models during the build process to ensure fast startup times.

1.  Push code to GitHub.
2.  Connect your repository to your cloud provider.
3.  Set the Root Directory to `backend`.
4.  Add your `OPENROUTER_KEY` environment variable.

### Frontend (Vercel)

1.  Push code to GitHub.
2.  Import the project into Vercel.
3.  Set the Root Directory to `frontend`.
4.  Add the `NEXT_PUBLIC_API_URL` environment variable pointing to your deployed backend URL.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT](LICENSE)

