# Architecture

**Analysis Date:** 2026-04-07

## Pattern Overview

**Overall:** Client-Service SPA with Provider Pattern and SymPy Backend

**Key Characteristics:**
- React single-page application with TypeScript
- SymPy-powered Python backend for symbolic mathematics
- Context-based state management (Auth, Theme, Toast)
- Local-first mathematical operations with backend fallback
- Supabase for authentication and persistence

## Layers

**Presentation Layer (Components):**
- Purpose: UI rendering and user interaction
- Location: `code/mathflow-new/src/components/`
- Contains: React components for math workspace, UI controls, feedback displays
- Depends on: Custom hooks (`src/hooks/`), utility libraries (`src/lib/`), theme system
- Used by: Page routes (`src/pages/`)

**Business Logic Layer:**
- Purpose: Mathematical operations and data transformations
- Location: `code/mathflow-new/src/lib/`
- Contains: Equation parsing, factorization algorithms, calculus operations, Supabase client
- Depends on: SymPy backend API, KaTeX for rendering, Supabase SDK
- Used by: Components throughout the application

**Service Layer (Backend):**
- Purpose: Symbolic mathematical computation via SymPy
- Location: `code/mathflow-new/backend/app/`
- Contains: FastAPI endpoints, SymPy service functions, Pydantic models
- Depends on: SymPy library, antlr4 for LaTeX parsing
- Used by: Frontend via HTTP calls

**State Management Layer:**
- Purpose: Global application state and side effects
- Location: `code/mathflow-new/src/providers/`, `code/mathflow-new/src/lib/auth.tsx`
- Contains: Theme context, Toast notifications, Authentication state
- Depends on: React Context API, Supabase auth, localStorage
- Used by: All components via custom hooks

## Data Flow

**Mathematical Operation Flow:**

1. User enters LaTeX expression or clicks operation button
2. Component captures expression from `ScratchPad` state
3. Operation routed to appropriate library function:
   - Local algorithms in `factorization.ts` (GCD extraction, quadratic factoring)
   - Direct API call to `calculus.ts` for backend operations
   - Equation manipulation via `equation.ts` for term operations
4. If local algorithm fails, fallback to SymPy backend API
5. Result returned as LaTeX string
6. New derivation step created with result and operation metadata
7. Step added to history, triggers re-render with KaTeX

**Authentication Flow:**

1. User navigates to application
2. `AuthProvider` initializes, checks Supabase session
3. If unauthenticated, redirect to `/login`
4. On login, Supabase auth validates credentials
5. Session stored in context, accessible via `useAuth()` hook
6. Protected routes use `PrivateRoute` wrapper to check auth state

**Persistence Flow:**

1. User saves derivation in ScratchPad
2. `ScratchPadPage` calls Supabase client methods
3. Derivation steps upserted to `derivations` table
4. Individual steps stored in `derivation_steps` table
5. Dashboard loads user's derivations via Supabase queries

**State Management:**

- Theme: Managed by `ThemeProvider`, persisted to localStorage, system preference detection
- Toast: Managed by `ToastProvider`, queue-based notification system
- Auth: Managed by `AuthProvider`, synced with Supabase auth state changes

## Key Abstractions

**DerivationStep:**
- Purpose: Represents a single step in mathematical derivation
- Examples: `src/components/ScratchPad/StepCard.tsx`, `src/lib/supabase.ts`
- Pattern: Immutable record with id, LaTeX, operation type, timestamp

**ParsedTerm:**
- Purpose: Represents a single term in mathematical expression
- Examples: `src/lib/equation.ts`
- Pattern: `{ sign: '+' | '-', latex: string }` with coefficient extraction

**TermAction:**
- Purpose: User-initiated operations on expression terms
- Examples: `src/components/ScratchPad/InteractiveFormula.tsx`
- Pattern: Union type `'move' | 'combine' | 'multiply' | 'divide' | 'factor'`

**Operation Fallback:**
- Purpose: Graceful degradation when backend unavailable
- Examples: `src/lib/factorization.ts`
- Pattern: Try local algorithm → Try backend API → Return null on failure

## Entry Points

**Frontend Main:**
- Location: `code/mathflow-new/src/main.tsx`
- Triggers: Browser loads application
- Responsibilities: React root rendering, ErrorBoundary wrapper, StrictMode

**Application Router:**
- Location: `code/mathflow-new/src/App.tsx`
- Triggers: Route changes
- Responsibilities: Route configuration, auth protection, provider initialization

**Backend API:**
- Location: `code/mathflow-new/backend/app/main.py`
- Triggers: HTTP requests to port 8001
- Responsibilities: CORS handling, request validation, SymPy computation orchestration

**ScratchPad Workspace:**
- Location: `code/mathflow-new/src/components/ScratchPad/ScratchPad.tsx`
- Triggers: User navigates to `/scratch/:id?`
- Responsibilities: Derivation state management, operation handling, history tracking

## Error Handling

**Strategy:** Try-catch with user-friendly fallbacks

**Patterns:**
- API calls wrapped in try-catch returning `null` on failure
- Component-level ErrorBoundary catches React rendering errors
- Backend returns HTTP 400 for parsing errors, 500 for computation failures
- Graceful degradation: Local algorithms before backend calls
- Toast notifications for user-facing errors

## Cross-Cutting Concerns

**Logging:** Console-based for development, no structured logging in place

**Validation:** Pydantic models on backend, TypeScript types on frontend

**Authentication:** Supabase auth with session persistence, route guards via `PrivateRoute`

**Theming:** CSS custom properties with dark/light/system modes, Tailwind CSS dark mode

**Math Rendering:** KaTeX for all LaTeX display, server-side not used

**API Communication:** Fetch API with timeout, JSON request/response bodies

---

*Architecture analysis: 2026-04-07*
