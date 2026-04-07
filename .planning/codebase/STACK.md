# Technology Stack

**Analysis Date:** 2026-04-07

## Languages

**Primary:**
- TypeScript 5.6.2 - Frontend React application (`code/mathflow-new/src/`)
- Python 3.11 - Backend SymPy service (`code/mathflow-new/backend/`)

**Secondary:**
- Shell scripts - DevOps automation (`dev.sh`, `backup.sh`)

## Runtime

**Environment:**
- Node.js (via pnpm) - Frontend runtime
- Python 3.11-slim - Backend runtime (Docker container)

**Package Manager:**
- pnpm - Frontend package manager
- pip - Python package manager
- Lockfile: `pnpm-lock.yaml` present, `requirements.txt` for backend

## Frameworks

**Core:**
- React 18.3.1 - UI framework
- Vite 6.0.1 - Build tool and dev server
- FastAPI 0.115.0 - Backend API framework
- Uvicorn 0.32.0 - ASGI server for FastAPI

**Testing:**
- Not detected

**Build/Dev:**
- TypeScript 5.6.2 - Type checking
- ESLint 9.15.0 - Linting
- Tailwind CSS v3.4.16 - Styling
- PostCSS 8.4.49 - CSS processing
- Autoprefixer 10.4.20 - CSS vendor prefixes

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.45.0 - Database and authentication client
- katex 0.16.9 - LaTeX math rendering
- sympy 1.13.1 - Symbolic mathematics computation
- antlr4-python3-runtime 4.11.1 - LaTeX parsing backend
- react-router-dom 6 - Client-side routing

**Infrastructure:**
- pydantic 2.10.0 - API data validation
- clsx 2.1.1, tailwind-merge 2.6.0 - Class name utilities
- lucide-react 0.364.0 - Icon library
- @radix-ui/react-slot 1.1.1 - UI primitives

**UI Components:**
- class-variance-authority 0.7.1 - Component variant management
- tailwindcss-animate 1.0.7 - Animation utilities

## Configuration

**Environment:**
- Environment variables via Vite (`import.meta.env.VITE_*`)
- `.env` file present (not checked in)
- `.env.example` for reference
- Key configs required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SYMPY_API_URL`

**Build:**
- `vite.config.ts` - Vite configuration with React plugin and path aliases
- `tsconfig.json` - TypeScript configuration with project references
- `eslint.config.js` - ESLint flat config
- `tailwind.config.js` - Tailwind CSS with custom theme
- `postcss.config.js` - PostCSS with Tailwind and Autoprefixer

**Container:**
- `Dockerfile` - Frontend production build (multi-stage)
- `backend/Dockerfile` - Python SymPy service
- `docker-compose.yml` - Full stack orchestration

## Platform Requirements

**Development:**
- Node.js 18+ (for Vite 6)
- pnpm package manager
- Python 3.11+ (for backend)
- Podman or Docker (for containerization)

**Production:**
- Vite static build output
- Podman/Docker container runtime
- Network mode: `host` (Fedora SELinux compatibility)
- Backend port: 8001 (SymPy API)
- Frontend port: 3000 (Vite dev server)

---

*Stack analysis: 2026-04-07*
