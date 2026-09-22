# Cognitio Libera — Production Deployment Guide (Render & Supabase) 🚀

> **Practice. Understand. Improve.**  
> Step-by-step guide to deploying Cognitio Libera to production using Render's 1-click Infrastructure as Code Blueprint (`render.yaml`) and Supabase Cloud.

---

## 1. Architectural Architecture on Render

Cognitio Libera deploys via a multi-service Render Blueprint:

```
                  ┌─────────────────────────────────────────┐
                  │          GITHUB REPOSITORY              │
                  └────────────────────┬────────────────────┘
                                       │
                      Render Infrastructure as Code (render.yaml)
                                       │
         ┌─────────────────────────────┴─────────────────────────────┐
         ▼                                                           ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│       cognitio-libera-web       │         │       cognitio-libera-api       │
│       (Render Static Site)      │         │      (Render Web Service)       │
├─────────────────────────────────┤         ├─────────────────────────────────┤
│ • React 19 + Vite + TypeScript  │         │ • FastAPI + Uvicorn (Python 3)  │
│ • SPA Routing: /* -> index.html │         │ • Health Check: /health         │
│ • Global CDN Distribution       │         │ • Async connection pooling      │
└────────────────┬────────────────┘         └────────────────┬────────────────┘
                 │                                           │
                 │              REST API Calls               │
                 └───────────────────────────────────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
               ┌─────────────────┐           ┌─────────────────┐
               │    SUPABASE     │           │  GOOGLE GEMINI  │
               │   PostgreSQL    │           │ Code Evaluator, │
               │   + Auth RLS    │           │ Questions, AI   │
               └─────────────────┘           └─────────────────┘
```

---

## 2. Prerequisites & External Accounts

Before deploying, ensure you have credentials for the following services:

1. **GitHub Account**: To host your fork or repository.
2. **Render Account**: ([render.com](https://render.com)) for web hosting and static CDN.
3. **Supabase Project**: ([supabase.com](https://supabase.com))
   - Navigate to the **SQL Editor** and paste & run the entire contents of [`supabase_schema.sql`](file:///Users/gaganpaulv/Developer/python/cognio_libera/supabase_schema.sql).
   - Navigate to **Project Settings** -> **Database** -> **Connection string** (URI).
   - Select **Connection pooling** (Transaction mode, Port `6543`).
   - Navigate to **API Settings** to get your `Project URL`, `anon public` key, and `JWT Secret`.
4. **Google AI Studio**: ([aistudio.google.com](https://aistudio.google.com)) for your `GEMINI_API_KEY`.

---

## 3. Step-by-Step 1-Click Deployment via Blueprint

### Step 1: Initialize Database in Supabase
1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Click **New Query**, paste the full content of `supabase_schema.sql`, and click **Run**.
3. All 13 tables, RLS policies, auth trigger, and initial seed challenges/quizzes are populated instantly.

### Step 2: Push Code to GitHub
Push this codebase to your GitHub repository:
```bash
git add .
git commit -m "feat: complete Cognitio Libera full-stack platform"
git push origin main
```

### Step 3: Create a New Blueprint on Render
1. Log into your **Render Dashboard**.
2. Click **New +** in the top navigation bar and select **Blueprint**.
3. Connect your GitHub account and select your `cognitio_libera` repository.
4. Render will detect `render.yaml` automatically and configure both the Web Service (`cognitio-backend`) and Static Site (`cognitio-frontend`).

### Step 4: Configure Environment Variables

Render will prompt you for the required environment variables defined in `render.yaml`:

#### For `cognitio-backend` (Backend Web Service):
| Variable | Value / Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase PgBouncer Pooler URI (port 6543, transaction mode) | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require` |
| `SUPABASE_URL` | Supabase Project API URL | `https://hrchuunvwsqbgodwjuha.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Anonymous Public API Key | `sb_publishable_oYBnz1fAXzjUbVOH72oRqg_wCnB-fY0` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key | `sb_secret_...` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AQ.Ab8RN...` |
| `GEMINI_MODEL_NAME` | Default Gemini model (set automatically) | `gemini-3.5-flash-lite` |
| `ENVIRONMENT` | Production mode (set automatically) | `production` |

#### For `cognitio-frontend` (Frontend Static Site):
| Variable | Value / Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Auto-configured by Render blueprint | `https://cognitio-backend.onrender.com/api/v1` |
| `VITE_SUPABASE_URL` | Supabase Project URL | `https://hrchuunvwsqbgodwjuha.supabase.co` |
| `VITE_SUPABASE_ANON_KEY`| Supabase Anonymous Public API Key | `sb_publishable_oYBnz1fAXzjUbVOH72oRqg_wCnB-fY0` |

### Step 5: Apply & Deploy
1. Click **Apply**.
2. Render will build and deploy both services in parallel:
   - Backend: Installs Python dependencies, executes database initialization and seed data scripts, and boots Uvicorn on port `10000`.
   - Frontend: Runs `npm install` and `npm run build`, outputting to `frontend/dist`.

---

## 4. Post-Deployment Verification Checklist

1. **Verify Backend Health**:
   ```bash
   curl -I https://cognitio-libera-api.onrender.com/health
   # Expected: HTTP/2 200 OK -> {"status":"healthy"}
   ```

2. **Verify Database Seeding**:
   ```bash
   curl https://cognitio-libera-api.onrender.com/api/v1/problems/ | jq '. | length'
   # Expected: Returns 20 seeded algorithmic problems
   ```

3. **Verify Frontend SPA Navigation**:
   - Open `https://cognitio-libera-web.onrender.com` in your browser.
   - Confirm landing page assets load without 404s.
   - Navigate directly to a deep URL like `/practice` or `/dashboard` to ensure Render's rewrite rule (`/* -> /index.html`) is operating correctly.
   - Run a sample problem in the Monaco editor to confirm Judge0 API connectivity.
