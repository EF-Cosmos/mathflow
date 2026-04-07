# External Integrations

**Analysis Date:** 2026-04-07

## APIs & External Services

**Symbolic Math Computation:**
- SymPy Backend (`code/mathflow-new/backend/`) - Mathematical operations (factor, expand, simplify, calculus)
  - SDK/Client: Custom fetch-based API (`src/lib/factorization.ts`, `src/lib/calculus.ts`)
  - Auth: None (local service)
  - Base URL: `VITE_SYMPY_API_URL` (default: `http://localhost:8001`)
  - Timeout: 5000ms for algebra, 10000ms for calculus
  - Endpoints:
    - `POST /api/factor` - Factorize expressions
    - `POST /api/expand` - Expand expressions
    - `POST /api/simplify` - Simplify expressions
    - `POST /api/calculus/differentiate` - Differentiation
    - `POST /api/calculus/partial` - Partial derivatives
    - `POST /api/calculus/integrate` - Indefinite integrals
    - `POST /api/calculus/definite-integral` - Definite integrals
    - `POST /api/calculus/limit` - Limits
    - `POST /api/calculus/limit-infinity` - Limits at infinity
    - `POST /api/calculus/sum` - Summations
    - `POST /api/calculus/product` - Products
    - `POST /api/calculus/taylor` - Taylor series
    - `POST /api/vector/gradient` - Gradient
    - `POST /api/vector/divergence` - Divergence
    - `POST /api/vector/curl` - Curl
    - `POST /api/vector/laplacian` - Laplacian
    - `POST /api/integral/double` - Double integrals
    - `POST /api/integral/triple` - Triple integrals

**LaTeX Rendering:**
- KaTeX 0.16.9 - Client-side LaTeX rendering
  - SDK/Client: `katex` npm package
  - Used in: `src/components/MathRenderer.tsx`
  - Purpose: Display mathematical expressions in UI

## Data Storage

**Databases:**
- Supabase (PostgreSQL)
  - Connection: `VITE_SUPABASE_URL`
  - Client: `@supabase/supabase-js` v2.45.0
  - Tables (inferred from types):
    - `derivations` - User's mathematical derivations
    - `derivation_steps` - Step-by-step derivation records
    - `math_templates` - Pre-defined mathematical templates
  - Auth: Supabase Auth (anonymous key for client access)
  - Client location: `src/lib/supabase.ts`

**File Storage:**
- Not detected (local-only or Supabase storage if used)

**Caching:**
- None in current implementation
- Note: Redis available in root docker-compose infrastructure but not integrated in frontend

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Implementation: `@supabase/supabase-js` client
  - Types: `User`, `Session` from Supabase
  - Auth utilities: `src/lib/auth.tsx`
  - Usage: Dashboard, Editor, ScratchPad pages
  - Environment variables:
    - `VITE_SUPABASE_URL` - Supabase instance URL
    - `VITE_SUPABASE_ANON_KEY` - Anonymous key for client-side auth

## Monitoring & Observability

**Error Tracking:**
- None (client-side console only)

**Logs:**
- Console logging in frontend (browser dev tools)
- Backend: stdout/stderr (captured by container runtime)
- Log files available in docker volumes (see root Makefile)

## CI/CD & Deployment

**Hosting:**
- Development: Local development with Vite dev server (port 3000)
- Production: Static build via Vite, served via Nginx (root docker-compose)
- Backend: Podman containers with host networking

**CI Pipeline:**
- None detected (manual deployment)

## Environment Configuration

**Required env vars:**

**Frontend (`code/mathflow-new/.env`):**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_SYMPY_API_URL` - SymPy backend URL (default: `http://localhost:8001`)

**Backend (`code/mathflow-new/backend/`):**
- `CORS_ORIGINS` - CORS allowed origins (default: `http://localhost:3000`)
- Port: 8001 (hardcoded in Dockerfile)

**Secrets location:**
- `.env` file (gitignored)
- Root-level `.env` for docker-compose infrastructure

## Webhooks & Callbacks

**Incoming:**
- None (SymPy backend is REST-only, no webhooks)

**Outgoing:**
- None (no external webhooks initiated by application)

## Container Infrastructure

**Container Runtime:**
- Podman (Docker-compatible)
- Network mode: `host` (Fedora SELinux compatibility for port 8001)

**Services (root docker-compose):**
- PostgreSQL - Primary database
- Redis - Caching layer (available but not integrated in frontend)
- Nginx - Reverse proxy and static file serving
- Kong - API gateway (port 8000)

**Port Allocation:**
- 3000 - Frontend (Vite dev server)
- 8000 - Kong/Supabase (external service)
- 8001 - SymPy backend API
- 8080 - Nginx (production)

---

*Integration audit: 2026-04-07*
