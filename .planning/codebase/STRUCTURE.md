# Codebase Structure

**Analysis Date:** 2026-04-07

## Directory Layout

```
mathflow/
├── code/mathflow-new/          # Main frontend application
│   ├── backend/                # FastAPI + SymPy service
│   │   └── app/
│   │       ├── main.py         # FastAPI app with all endpoints
│   │       ├── models.py       # Pydantic request/response models
│   │       └── services/       # SymPy computation modules
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ScratchPad/     # Main workspace component
│   │   │   ├── ui/             # Reusable UI components
│   │   │   └── feedback/       # Loading/error displays
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Business logic libraries
│   │   ├── pages/              # Route components
│   │   ├── providers/          # React context providers
│   │   ├── theme/              # Theme configuration
│   │   └── types/              # TypeScript type definitions
│   ├── public/                 # Static assets
│   ├── supabase/               # Supabase migrations/functions
│   ├── dist/                   # Production build output
│   └── [config files]          # Vite, TypeScript, ESLint configs
├── .planning/                  # Planning and documentation
├── .claude/                    # Claude Code skills and commands
└── [root files]                # Makefile, docker-compose, README
```

## Directory Purposes

**`code/mathflow-new/src/components/ScratchPad/`:**
- Purpose: Core mathematical workspace components
- Contains: Main ScratchPad component, operation buttons, interactive formula display, step cards
- Key files: `ScratchPad.tsx`, `InteractiveFormula.tsx`, `StepCard.tsx`, `operations/` subdirectory

**`code/mathflow-new/src/lib/`:**
- Purpose: Business logic and external service integration
- Contains: Mathematical algorithms, API clients, authentication, Supabase client
- Key files: `factorization.ts`, `equation.ts`, `calculus.ts`, `auth.tsx`, `supabase.ts`

**`code/mathflow-new/src/pages/`:**
- Purpose: Route-level page components
- Contains: Dashboard, ScratchPad page, Login page
- Key files: `Dashboard.tsx`, `ScratchPadPage.tsx`, `Login.tsx`

**`code/mathflow-new/src/providers/`:**
- Purpose: React Context providers for global state
- Contains: Theme management, toast notifications
- Key files: `ThemeProvider.tsx`, `ToastProvider.tsx`

**`code/mathflow-new/backend/app/services/`:**
- Purpose: SymPy computation functions
- Contains: Symbolic math operations, calculus functions
- Key files: `sympy_service.py`, `vector_calculus.py`

**`code/mathflow-new/src/theme/`:**
- Purpose: Theme system configuration
- Contains: CSS custom properties, theme tokens, color definitions
- Key files: `css-vars.ts`, `themes.ts`, `tokens.ts`

## Key File Locations

**Entry Points:**
- `code/mathflow-new/src/main.tsx`: Application bootstrap
- `code/mathflow-new/src/App.tsx`: Route configuration
- `code/mathflow-new/backend/app/main.py`: FastAPI application

**Configuration:**
- `code/mathflow-new/vite.config.ts`: Vite build configuration, path aliases
- `code/mathflow-new/tsconfig.json`: TypeScript compiler configuration
- `code/mathflow-new/tailwind.config.js`: Tailwind CSS configuration
- `code/mathflow-new/.env`: Environment variables (not in git)

**Core Logic:**
- `code/mathflow-new/src/components/ScratchPad/ScratchPad.tsx`: Main workspace state management
- `code/mathflow-new/src/lib/factorization.ts`: Factorization algorithms with fallback
- `code/mathflow-new/src/lib/equation.ts`: Equation parsing and term manipulation
- `code/mathflow-new/src/lib/calculus.ts`: Calculus API client functions

**Testing:**
- No test directory present - testing not yet implemented

**Backend:**
- `code/mathflow-new/backend/app/main.py`: All API endpoints
- `code/mathflow-new/backend/app/services/sympy_service.py`: Core SymPy operations
- `code/mathflow-new/backend/Dockerfile`: Backend container image

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `ScratchPad.tsx`, `StepCard.tsx`)
- Utilities/libraries: camelCase (e.g., `factorization.ts`, `equation.ts`)
- Hooks: kebab-case with `use-` prefix (e.g., `use-theme.tsx`, `use-toast.tsx`)
- Types: `index.ts` or `.d.ts` for type definitions
- Operations: `AlgebraOperations.tsx`, `CalculusOperations.tsx`

**Directories:**
- PascalCase for feature directories (e.g., `ScratchPad/`, `AIChat.tsx`)
- kebab-case for utility directories (e.g., `ui/`, `feedback/`, `hooks/`)

**React Components:**
- Default export for main component
- Named exports for types and utilities
- Barrel files (`index.ts`) for clean imports

**Functions:**
- camelCase for functions (e.g., `factorWithFallback`, `splitEquation`)
- Prefix pattern for operation types (e.g., `compute_`, `apply_`)

## Where to Add New Code

**New Feature (UI Component):**
- Primary code: `code/mathflow-new/src/components/[FeatureName]/`
- Tests: Not yet implemented
- Export from barrel: `code/mathflow-new/src/components/[FeatureName]/index.ts`

**New Mathematical Operation:**
- Implementation: `code/mathflow-new/src/lib/[operation].ts`
- Backend endpoint: `code/mathflow-new/backend/app/main.py` (add new route)
- Backend service: `code/mathflow-new/backend/app/services/[operation].py`
- API client: Add function to `code/mathflow-new/src/lib/calculus.ts` or create new file

**New Page Route:**
- Component: `code/mathflow-new/src/pages/[PageName].tsx`
- Route registration: `code/mathflow-new/src/App.tsx`
- Link in navigation: `code/mathflow-new/src/components/Navigation.tsx` (if exists)

**New UI Component (Reusable):**
- Implementation: `code/mathflow-new/src/components/ui/[Component].tsx`
- Export: Add to `code/mathflow-new/src/components/ui/index.ts`

**New Hook:**
- Implementation: `code/mathflow-new/src/hooks/use-[hookname].tsx`
- Export: Use directly or add to barrel file

**Utilities:**
- Shared helpers: `code/mathflow-new/src/lib/utils.ts`
- Domain-specific utilities: `code/mathflow-new/src/lib/[domain].ts`

## Special Directories

**`code/mathflow-new/dist/`:**
- Purpose: Production build output
- Generated: Yes
- Committed: No (gitignored)

**`code/mathflow-new/node_modules/`:**
- Purpose: npm/pnpm dependencies
- Generated: Yes
- Committed: No (gitignored)

**`code/mathflow-new/public/`:**
- Purpose: Static assets served directly
- Generated: No
- Committed: Yes

**`.planning/`:**
- Purpose: Project planning documents and codebase analysis
- Generated: No
- Committed: Yes

**`.claude/`:**
- Purpose: Claude Code configuration, skills, and commands
- Generated: Partially (skills downloaded)
- Committed: Yes (except downloaded skills)

**`code/mathflow-new/supabase/`:**
- Purpose: Supabase migrations and edge functions
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-04-07*
