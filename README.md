# Cognitio Libera ⚡

> **Practice. Understand. Improve.**  
> A high-performance, full-stack AI-powered coding practice, programming quiz, technical interview preparation, and personalized learning platform.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/AI%20%26%20Evaluator-Google%20Gemini-4285F4.svg?style=flat&logo=google)](https://aistudio.google.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg?style=flat&logo=supabase)](https://supabase.com)
[![Render](https://img.shields.io/badge/Deploy-Render%201--Click-46E3B7.svg?style=flat&logo=render)](https://render.com)

---

## 🌟 Executive Summary

**Cognitio Libera** is a production-grade education and coding platform designed to bridge algorithmic problem-solving with conceptual computer science mastery. Built with **real, fully functional systems** — zero static mockups — every component, button, API, database transaction, code run, quiz grading, and AI mentor interaction works out of the box.

Designed from the ground up according to the **"Coding Website - UI Kit"** visual specification, the platform features a curated light/dark design system, responsive mobile navigation, interactive Monaco code editing, ticking stopwatch/countdown timers, and intelligent Socratic tutoring with on-demand AI question generation.

---

## 🚀 Key Features

### 1. 💻 Professional Coding Workspace
- **Monaco Editor Integration**: Native VS Code editing experience with syntax highlighting, line numbers, bracket matching, dynamic theme switching (vs-dark / light), and auto-indentation across multiple languages (Python, JavaScript, C++, Java).
- **Dual Execution Modes (Powered Exclusively by Google Gemini)**:
  - **Interactive Run**: Execute arbitrary code against custom or sample standard input with simulated terminal stdout, stderr, and memory/time profiling.
  - **Graded Submission**: Submit solutions against complete multi-case test suites (including edge cases and hidden test suites) evaluated deterministically by Gemini.
- **Anti-Cheat Test Masking**: Hidden test cases validate boundary correctness without leaking test inputs or outputs to browser DevTools.
- **Live Stopwatch & Countdown Timers**: Real-time ticking timers with pause/resume and low-time visual warnings.
- **Confetti Victory Celebrations**: Dynamic canvas animations triggered upon achieving 100% acceptance.

### 2. 🧠 Google Gemini AI Mentorship & On-Demand Generation
- **Dynamic Question & Quiz Generator**: Generate endless algorithmic coding challenges and multi-choice quizzes on any CS concept with 1 click.
- **3-Tier Progressive Hint Hierarchy**:
  - **Level 1 (The Nudge)**: High-level conceptual direction; invariant patterns without algorithm or data structure spoilers.
  - **Level 2 (The Strategy)**: Algorithmic approach, optimal data structure recommendation, and target Big-O complexity.
  - **Level 3 (The Blueprint)**: Structural pseudocode and critical boundary/edge case verification checklist.
- **Structural Code Reviews**: In-depth analysis of user code across Time Complexity, Space Complexity, Code Quality, and Edge Cases.
- **Interactive Socratic Chat**: Context-aware drawer allowing students to ask clarifying questions about their specific code in progress.
- **Dual-Verification Pipeline**: Automated content generation pipeline with adversarial verification audits for question clarity and test suite soundness.

### 3. 📝 Conceptual Quiz & Assessment Engine
- **Server-Side Authoritative Grading**: Questions are fetched with `is_correct` and `explanation` masked to prevent inspection cheating.
- **60-Minute Active Countdown Timer**: Real-time tracking with color-coded alerts when under 5 minutes.
- **Detailed Explanations**: Submitting answers unlocks comprehensive theoretical rationale and updates topic mastery scores.
- **Topic-Based Organization**: Covers core CS, Data Structures, Algorithms, SQL, and System Design.

### 4. 📊 Dynamic Learner Dashboard & Analytics
- **Real-Time Metrics**: Dynamically computed counts of solved problems by difficulty (Easy, Medium, Hard), total points, and daily practice streaks.
- **3D Interactive Calendar & Contests**: Visual contest countdown cards and activity tracking.
- **Global Leaderboard**: Competitive rankings showcasing points, streaks, and total challenges completed.

---

## 🛠️ Architecture & Tech Stack

```mermaid
flowchart LR
    Client["React 19 + TypeScript SPA\n(Monaco, Tailwind CSS, Lucide)"]
    API["FastAPI REST Backend\n(Pydantic v2, SQLAlchemy 2.0)"]
    DB[("Supabase PostgreSQL\n(13 Tables + RLS Policies)")]
    AI["Google Gemini\n(Evaluator, Question Generator & Mentor)"]

    Client <-->|REST / Bearer JWT| API
    API <-->|Async Pooler| DB
    API <-->|Code Evaluation & Questions| AI
```

| Component | Technology | Highlights |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4 | Clean component architecture, Monaco Editor, responsive layouts |
| **Backend** | Python 3.9+, FastAPI, Uvicorn, Pydantic v2 | High-throughput asynchronous endpoints, OpenAPI documentation |
| **Database** | Supabase PostgreSQL / SQLite | 13 relational tables, connection pooling, zero-config local fallback |
| **Authentication** | Supabase Auth + JWT | Production OAuth/Email auth with offline HMAC dev token fallback |
| **Code Execution** | Google Gemini AI Evaluator | Deterministic test simulation, AST syntax fallback, zero 3rd-party sandbox |
| **AI Intelligence** | Google Gemini (1.5 / 2.5 Flash & Pro) | Dynamic question generator, progressive hints, code review |
| **Deployment** | Render Blueprint (`render.yaml`) | 1-click multi-service deployment (Web Service + Static Site CDN) |

---

## 📂 Repository Structure

```
cognitio-libera/
├── .env.example                  # Environment configuration template
├── render.yaml                   # 1-Click Render Infrastructure Blueprint
├── docs/                         # Detailed engineering documentation
│   ├── ARCHITECTURE.md           # System data flows and component designs
│   ├── DATABASE.md               # Schema definitions, ERD, and RLS policies
│   ├── API.md                    # Complete REST API specification
│   ├── GEMINI_EVALUATOR.md       # AI execution, test simulation, and question generation
│   ├── GEMINI.md                 # AI mentor hierarchy and verifier pipeline
│   └── RENDER_DEPLOYMENT.md      # Render & Supabase production deployment guide
├── supabase_schema.sql           # Complete Supabase PostgreSQL 1-click migration
├── backend/                      # FastAPI Python backend
│   ├── app/
│   │   ├── api/v1/endpoints/     # Modular REST API route handlers
│   │   ├── core/                 # Config, security, and database pooling
│   │   ├── models/entities.py    # 13 SQLAlchemy database entities
│   │   ├── schemas/dto.py        # Pydantic v2 request/response schemas
│   │   ├── repositories/         # Database queries and aggregations
│   │   ├── execution/            # GeminiCodeExecutor & execution service
│   │   ├── ai/                   # Gemini client, mentor, verifier, generator
│   │   ├── db/                   # Bootstrap (init_db) & 85+ seed records
│   │   └── main.py               # FastAPI application entrypoint
│   ├── tests/                    # Pytest automated test suite
│   └── requirements.txt          # Python backend dependencies
└── frontend/                     # React 19 + TypeScript + Vite SPA
    ├── src/
    ├── components/           # TopBar, Sidebar, MentorDrawer, Modals
    │   ├── hooks/                # useAuth, useTheme (Light/Dark mode)
    │   ├── layouts/              # AppLayout with persistent responsive sidebar
    │   ├── pages/                # Landing, Dashboard, Practice, Workspaces, Quiz
    │   ├── services/             # Axios API client & typed endpoints
    │   └── types/                # TypeScript interface definitions
    ├── public/assets/            # UI Kit illustrations and 3D icons
    └── package.json              # Frontend dependencies and Vite configuration
```

---

## ⚡ Quickstart & Local Development

### 1. Prerequisites
- **Python 3.9+**
- **Node.js 18+ & npm**
- *(Recommended)* [Google AI Studio API Key](https://aistudio.google.com) for Gemini AI evaluation and tutoring
- *(Recommended)* [Supabase Account](https://supabase.com) (free) for PostgreSQL backend

### 2. Clone & Configure
```bash
git clone https://github.com/GaganPaul/cognitio-libera.git
cd cognitio-libera

# Copy environment configuration
cp .env.example .env
```

> **Note**: Cognitio Libera operates out of the box with **zero configuration** using the local SQLite database fallback (`sqlite:///./cognitio_libera.db`). To enable Supabase and Gemini AI code evaluation, add your `DATABASE_URL` and `GEMINI_API_KEY` to `.env`.

### 3. Backend Setup
```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Bootstrap database and seed initial problems & quizzes
PYTHONPATH=backend python backend/app/db/init_db.py

# Launch FastAPI server
PYTHONPATH=backend uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*The interactive Swagger UI documentation is available at `http://127.0.0.1:8000/docs`.*

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Open `http://localhost:5173` to explore Cognitio Libera!*

---

## 🧪 Automated Testing

### Backend Test Suite (Pytest)
```bash
.venv/bin/pytest backend/tests/ -v
```
Validates:
- Health check endpoints
- User profile synchronization & session retrieval
- Problem test case masking (verifying hidden tests are omitted)
- Interactive code execution via Google Gemini AI Evaluator
- Graded multi-test submissions & scoring
- Quiz anti-cheat answer masking & attempt grading
- Real-time dashboard analytics aggregation
- Global leaderboard calculations
- Gemini progressive hint generation

### Frontend Build & Typecheck
```bash
cd frontend
npm run build
```
Validates TypeScript compilation and bundles static assets cleanly with zero errors.

---

## 🚀 1-Click Production Deployment

Cognitio Libera includes a native Render Blueprint (`render.yaml`) for 1-click deployment:

1. Push your repository to **GitHub**.
2. Run `supabase_schema.sql` in your **[Supabase](https://supabase.com)** SQL editor.
3. Go to **[Render](https://render.com)** -> **New +** -> **Blueprint**.
4. Select your repository.
5. Provide the environment secrets prompted by Render:
   - `DATABASE_URL`: Supabase Transaction Pooler connection string (`postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`).
   - `SUPABASE_URL` & `SUPABASE_ANON_KEY`: Supabase API credentials.
   - `GEMINI_API_KEY`: Google AI Studio key.
6. Click **Apply** to deploy both the API Web Service and Vite Static Site CDN.

*For complete step-by-step guidance, refer to [docs/RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md).*

---

## 📚 In-Depth Engineering Documentation

- 🏛️ [System Architecture & Data Flows](docs/ARCHITECTURE.md)
- 🗄️ [Database Schema & Supabase RLS Policies](docs/DATABASE.md)
- 📡 [REST API OpenAPI Specification](docs/API.md)
- ⚡ [Google Gemini AI Code Evaluator](docs/GEMINI_EVALUATOR.md)
- 🧠 [Gemini AI Mentor & Content Verifier Pipeline](docs/GEMINI.md)
- 🚀 [Render & Supabase Deployment Guide](docs/RENDER_DEPLOYMENT.md)

---

## 📜 License

Created by **Gagan Paul**.  
Distributed under the MIT License. See `LICENSE` for more information.

*Cognitio Libera — Practice. Understand. Improve.* ✨
