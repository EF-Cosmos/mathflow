# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MathFlow is a mathematical expression manipulation and learning platform built with React + TypeScript + Vite. It provides symbolic computation powered by SymPy via a FastAPI backend.

## Key Architecture

### Frontend (`code/mathflow-new/`)

React application with TypeScript. Key components:

- **ScratchPad** (`src/components/ScratchPad/ScratchPad.tsx`) - Main workspace for mathematical operations. Manages derivation steps, history, term manipulation, and operations (factor/expand/simplify).
- **Factorization** (`src/lib/factorization.ts`) - Mathematical operations with fallback chain:
  1. Local algorithms (quadratic factoring, common factor extraction, difference of powers)
  2. SymPy backend API calls
  3. Returns null if both fail
- **Equation utilities** (`src/lib/equation.ts`) - Term parsing, equation manipulation (move terms, combine like terms)

### Backend (`code/mathflow-new/backend/`)

FastAPI + Python 3.11 + SymPy service running on port **8001** (not 8000, which is occupied by Supabase/Kong).

Structure:
```
backend/
├── app/
│   ├── main.py          # FastAPI app with /api/factor, /api/expand, /api/simplify endpoints
│   ├── models.py        # Pydantic request/response models
│   └── services/
│       └── sympy_service.py  # SymPy expression handling
├── Dockerfile
└── requirements.txt
```

### Container Setup

- **Container runtime**: Podman (Docker-compatible)
- **Network mode**: `host` (to avoid SELinux port forwarding issues on Fedora)
- **Backend port**: 8001 (SymPy API)
- **Frontend port**: 3000 (Vite dev server)
- **Supabase/Kong**: port 8000 (external service)

## Development Commands

### Frontend (from `code/mathflow-new/`)

```bash
# Install dependencies and start dev server
pnpm dev

# Build for production
pnpm build

# Build production with optimizations
pnpm build:prod

# Lint
pnpm lint

# Preview production build
pnpm preview
```

### Backend (SymPy API)

Using Podman Compose (from `code/mathflow-new/`):

```bash
podman-compose up -d backend
```

Using Podman directly:

```bash
cd backend
podman build -t mathflow-sympy:latest .
podman run -d --name mathflow-backend --network host --restart unless-stopped localhost/mathflow-sympy:latest
```

### Root-level Makefile (Docker Compose infrastructure)

The root Makefile manages a separate Docker Compose setup for PostgreSQL, Redis, Nginx, etc.:

```bash
make dev          # Start development environment
make prod         # Start production environment
make build        # Build images
make logs         # View logs
make clean        # Clean Docker environment
```

## Important Configuration

### Environment Variables

Core frontend variables (see `.env.example` for full list):

- `VITE_SUPABASE_URL` - Supabase instance URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_SYMPY_API_URL` - SymPy backend URL (**default: `http://localhost:8001`**)

### Vite Configuration

Path alias: `@` maps to `./src`

## Mathematical Operation Flow

When user clicks "因式分解" (Factor), "展开" (Expand), or "化简" (Simplify):

1. **ScratchPad** captures current LaTeX expression
2. Calls fallback function from `factorization.ts`:
   - `factorWithFallback()` - tries local first, then SymPy
   - `expandWithFallback()` - SymPy priority
   - `simplifyWithFallback()` - SymPy priority
3. If backend unavailable, operation fails gracefully (returns null)
4. Success: new step added to derivation with result
5. AI fallback can be triggered (optional, requires OPENAI_API_KEY)

### SymPy API Endpoints

- `POST /api/factor` - Factorize expression
- `POST /api/expand` - Expand expression
- `POST /api/simplify` - Simplify expression

Request format: `{ "latex": "expression" }`
Response format: `{ "result": "latex result" }`

## Key Implementation Details

### Equation Handling

- Equations (containing `=`) are split by the equals sign
- Each side is processed independently
- Results recombined: `"lhs = rhs"`

### Factorization Guards

- Checks for `\left(` or `\right)` to prevent re-factoring already factored expressions
- Returns null if no changes would occur (prevents duplicate steps)

### LaTeX Parsing

Backend requires `antlr4-python3-runtime` for LaTeX parsing (already in `requirements.txt`)

## Common Issues

### Port Conflicts

- Port 8000 is occupied by Kong (Supabase)
- Backend uses 8001 to avoid conflicts
- Frontend uses 3000

### Podman on Fedora

- Use `--network host` instead of `-p 8001:8001` to avoid SELinux issues
- SELinux may block port forwarding with `-p` flag

### Build Failures

- Clear vite cache: The build script removes `node_modules/.vite-temp`
- TypeScript compilation must succeed before Vite build

## Documentation Maintenance

When updating README and documentation, verify technical details in source code:
- `src/lib/factorization.ts` - Factorization logic with SymPy integration
- `src/lib/equation.ts` - Equation parsing utilities
- `src/components/ScratchPad/ScratchPad.tsx` - Main scratchpad component
- `src/components/ScratchPad/operations/AlgebraOperations.tsx` - Operation buttons
- `backend/` - FastAPI + SymPy backend service
