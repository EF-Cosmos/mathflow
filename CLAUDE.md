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

<!-- GSD:project-start source:PROJECT.md -->
## Project

**MathFlow**

MathFlow 是一个面向高中生的数学表达式推导和操作平台。用户可以在 ScratchPad 工作区中输入数学表达式，通过点击操作按钮（因式分解、展开、化简等）或直接点击表达式中的项（移项、合并同类项）进行逐步推导。目标是成为能完整完成高中数学作业的工具。

**Core Value:** **点击式逐步数学推导** — 用户每一步操作都能看到明确的变换结果，像手写解题一样可追溯、可回退。操作必须可靠，不能返回错误结果。

### Constraints

- **技术栈**: 保持 React + TypeScript + Vite + FastAPI + SymPy 架构不变
- **平台**: 需在 Fedora Linux (Podman) 上运行，也需兼容 Windows
- **后端端口**: 8001（避免与 Supabase/Kong 的 8000 端口冲突）
- **容器**: 使用 Podman，host 网络模式避免 SELinux 问题
- **数学范围**: 高中数学（代数、三角函数、基本微积分），不涉及高等数学
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.6.2 - Frontend React application (`code/mathflow-new/src/`)
- Python 3.11 - Backend SymPy service (`code/mathflow-new/backend/`)
- Shell scripts - DevOps automation (`dev.sh`, `backup.sh`)
## Runtime
- Node.js (via pnpm) - Frontend runtime
- Python 3.11-slim - Backend runtime (Docker container)
- pnpm - Frontend package manager
- pip - Python package manager
- Lockfile: `pnpm-lock.yaml` present, `requirements.txt` for backend
## Frameworks
- React 18.3.1 - UI framework
- Vite 6.0.1 - Build tool and dev server
- FastAPI 0.115.0 - Backend API framework
- Uvicorn 0.32.0 - ASGI server for FastAPI
- Not detected
- TypeScript 5.6.2 - Type checking
- ESLint 9.15.0 - Linting
- Tailwind CSS v3.4.16 - Styling
- PostCSS 8.4.49 - CSS processing
- Autoprefixer 10.4.20 - CSS vendor prefixes
## Key Dependencies
- @supabase/supabase-js 2.45.0 - Database and authentication client
- katex 0.16.9 - LaTeX math rendering
- sympy 1.13.1 - Symbolic mathematics computation
- antlr4-python3-runtime 4.11.1 - LaTeX parsing backend
- react-router-dom 6 - Client-side routing
- pydantic 2.10.0 - API data validation
- clsx 2.1.1, tailwind-merge 2.6.0 - Class name utilities
- lucide-react 0.364.0 - Icon library
- @radix-ui/react-slot 1.1.1 - UI primitives
- class-variance-authority 0.7.1 - Component variant management
- tailwindcss-animate 1.0.7 - Animation utilities
## Configuration
- Environment variables via Vite (`import.meta.env.VITE_*`)
- `.env` file present (not checked in)
- `.env.example` for reference
- Key configs required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SYMPY_API_URL`
- `vite.config.ts` - Vite configuration with React plugin and path aliases
- `tsconfig.json` - TypeScript configuration with project references
- `eslint.config.js` - ESLint flat config
- `tailwind.config.js` - Tailwind CSS with custom theme
- `postcss.config.js` - PostCSS with Tailwind and Autoprefixer
- `Dockerfile` - Frontend production build (multi-stage)
- `backend/Dockerfile` - Python SymPy service
- `docker-compose.yml` - Full stack orchestration
## Platform Requirements
- Node.js 18+ (for Vite 6)
- pnpm package manager
- Python 3.11+ (for backend)
- Podman or Docker (for containerization)
- Vite static build output
- Podman/Docker container runtime
- Network mode: `host` (Fedora SELinux compatibility)
- Backend port: 8001 (SymPy API)
- Frontend port: 3000 (Vite dev server)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Components: PascalCase with `.tsx` extension (e.g., `ScratchPad.tsx`, `MathRenderer.tsx`)
- Utilities/libraries: camelCase with `.ts` extension (e.g., `factorization.ts`, `equation.ts`)
- Hooks: kebab-case with `.tsx` extension (e.g., `use-theme.tsx`, `use-toast.tsx`)
- Test files: Not present in codebase (no testing framework configured)
- camelCase for all functions (e.g., `factorExpression`, `parseQuadratic`, `splitTerms`)
- Async functions prefixed with verb (e.g., `factorWithSympy`, `expandWithFallback`)
- Hook functions prefixed with `use` (e.g., `useTheme`, `useToast`)
- camelCase for local variables (e.g., `baseLatex`, `currentInput`, `activeAction`)
- UPPER_SNAKE_CASE for constants (e.g., `THEME_STORAGE_KEY`, `API_TIMEOUT`)
- PascalCase for React components (e.g., `ScratchPad`, `StepCard`)
- PascalCase for interfaces and types (e.g., `ParsedTerm`, `DerivationStep`, `EquationSide`)
- Descriptive names with context (e.g., `FactorizationRequest`, `CalculusResponse`)
## Code Style
- Tool: ESLint with TypeScript support
- Config: `eslint.config.js` with TypeScript ESLint recommended rules
- Key settings:
- No Prettier config detected (using ESLint only)
- ESLint 9.15.0 with typescript-eslint 8.15.0
- React plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Run command: `pnpm lint`
- Config extends: `js.configs.recommended`, `tseslint.configs.recommended`
## Import Organization
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Example: `import { cn } from '../../lib/utils'`
- Relative imports used when path is close (e.g., `../MathRenderer`)
## Error Handling
- Try-catch for async operations with null return on failure
- Console warnings for API failures (not console.error)
- Graceful degradation: fallback to local algorithms when backend unavailable
- Example from `factorization.ts`:
- Input validation at function entry (e.g., `if (!latex || latex.trim().length === 0) return null`)
- Type guards for parsing (e.g., `isNumeric`, `parseQuadratic` returning null on failure)
- Early returns for invalid states
## Logging
- `console.warn()` for expected failures (API unavailable, timeout)
- `console.error()` for unexpected errors (AI fallback failures)
- No logging in production builds
- Silent failures with null returns preferred over thrown exceptions
## Comments
- JSDoc for public/exported functions with parameters and return types
- Inline comments for complex mathematical algorithms
- Section headers in large files (e.g., `// ==================== 基础微积分 ====================`)
- Chinese comments used for user-facing text and some explanations
- Used for exported functions with description and params
- Example format:
## Function Design
- No strict size limit observed
- Large functions common (e.g., `handleCalculusOperation` in ScratchPad.tsx: ~200 lines)
- Helper functions extracted for reusable logic
- Object parameters for multiple related values (e.g., `CalculusRequest`, `FactorizationRequest`)
- Primitive parameters for simple operations
- Destructuring used for props in components
- `null` used for failure states (not exceptions)
- Objects with metadata for complex operations (e.g., `{ nextEquation, moved }`)
- Union types for optional values (e.g., `string | null`)
## Module Design
- Named exports preferred (e.g., `export function factorExpression`)
- Default exports for React components (e.g., `export default function ScratchPad`)
- Type exports co-located with functions (e.g., `export interface ParsedTerm`)
- Operations barrel: `src/components/ScratchPad/operations/index.ts`
- Theme exports through provider: `export { useTheme, ThemeProvider } from '../providers/ThemeProvider'`
- Feature-based grouping (e.g., `ScratchPad/` contains related components)
- Shared utilities in `lib/`
- UI components in `components/ui/`
- Pages in `pages/`
- Hooks in `hooks/`
- Providers in `providers/`
- Theme configuration in `theme/`
## Special Conventions
- User-facing text in Chinese (e.g., "因式分解", "展开", "化简")
- Some comments in Chinese for domain-specific explanations
- Variable names and function signatures in English
- LaTeX format for mathematical expressions
- Fallback chain pattern: local → SymPy → AI → null
- Timeout protection for API calls (5-10 seconds)
- Idempotent operations (guards against re-processing)
- React hooks for local state (useState, useCallback, useEffect)
- No global state management library
- localStorage for persistence (theme, API keys)
- Parent-child communication via props and callbacks
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- React single-page application with TypeScript
- SymPy-powered Python backend for symbolic mathematics
- Context-based state management (Auth, Theme, Toast)
- Local-first mathematical operations with backend fallback
- Supabase for authentication and persistence
## Layers
- Purpose: UI rendering and user interaction
- Location: `code/mathflow-new/src/components/`
- Contains: React components for math workspace, UI controls, feedback displays
- Depends on: Custom hooks (`src/hooks/`), utility libraries (`src/lib/`), theme system
- Used by: Page routes (`src/pages/`)
- Purpose: Mathematical operations and data transformations
- Location: `code/mathflow-new/src/lib/`
- Contains: Equation parsing, factorization algorithms, calculus operations, Supabase client
- Depends on: SymPy backend API, KaTeX for rendering, Supabase SDK
- Used by: Components throughout the application
- Purpose: Symbolic mathematical computation via SymPy
- Location: `code/mathflow-new/backend/app/`
- Contains: FastAPI endpoints, SymPy service functions, Pydantic models
- Depends on: SymPy library, antlr4 for LaTeX parsing
- Used by: Frontend via HTTP calls
- Purpose: Global application state and side effects
- Location: `code/mathflow-new/src/providers/`, `code/mathflow-new/src/lib/auth.tsx`
- Contains: Theme context, Toast notifications, Authentication state
- Depends on: React Context API, Supabase auth, localStorage
- Used by: All components via custom hooks
## Data Flow
- Theme: Managed by `ThemeProvider`, persisted to localStorage, system preference detection
- Toast: Managed by `ToastProvider`, queue-based notification system
- Auth: Managed by `AuthProvider`, synced with Supabase auth state changes
## Key Abstractions
- Purpose: Represents a single step in mathematical derivation
- Examples: `src/components/ScratchPad/StepCard.tsx`, `src/lib/supabase.ts`
- Pattern: Immutable record with id, LaTeX, operation type, timestamp
- Purpose: Represents a single term in mathematical expression
- Examples: `src/lib/equation.ts`
- Pattern: `{ sign: '+' | '-', latex: string }` with coefficient extraction
- Purpose: User-initiated operations on expression terms
- Examples: `src/components/ScratchPad/InteractiveFormula.tsx`
- Pattern: Union type `'move' | 'combine' | 'multiply' | 'divide' | 'factor'`
- Purpose: Graceful degradation when backend unavailable
- Examples: `src/lib/factorization.ts`
- Pattern: Try local algorithm → Try backend API → Return null on failure
## Entry Points
- Location: `code/mathflow-new/src/main.tsx`
- Triggers: Browser loads application
- Responsibilities: React root rendering, ErrorBoundary wrapper, StrictMode
- Location: `code/mathflow-new/src/App.tsx`
- Triggers: Route changes
- Responsibilities: Route configuration, auth protection, provider initialization
- Location: `code/mathflow-new/backend/app/main.py`
- Triggers: HTTP requests to port 8001
- Responsibilities: CORS handling, request validation, SymPy computation orchestration
- Location: `code/mathflow-new/src/components/ScratchPad/ScratchPad.tsx`
- Triggers: User navigates to `/scratch/:id?`
- Responsibilities: Derivation state management, operation handling, history tracking
## Error Handling
- API calls wrapped in try-catch returning `null` on failure
- Component-level ErrorBoundary catches React rendering errors
- Backend returns HTTP 400 for parsing errors, 500 for computation failures
- Graceful degradation: Local algorithms before backend calls
- Toast notifications for user-facing errors
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| react |  | `.claude/skills/react/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
