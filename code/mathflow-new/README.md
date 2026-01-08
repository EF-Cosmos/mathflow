# MathFlow

A mathematical expression manipulation and learning platform built with React + TypeScript + Vite, featuring symbolic computation powered by SymPy.

## Features

- **Mathematical ScratchPad**: Interactive workspace for mathematical operations
- **Symbolic Computation**: Factorization, expansion, and simplification of mathematical expressions
- **Equation Support**: Handle both simple expressions and equations (e.g., `3x^2 + 3x = y`)
- **AI-Powered Fallback**: Intelligent fallback when symbolic computation fails
- **Real-time LaTeX Rendering**: Beautiful mathematical notation display

## Documentation Maintenance

> **Note**: When updating this README and other documentation, always verify functional implementations and technical details by referencing the source code. Key implementation files include:
> - `src/lib/factorization.ts` - Factorization logic with SymPy integration
> - `src/lib/equation.ts` - Equation parsing utilities
> - `src/components/ScratchPad/ScratchPad.tsx` - Main scratchpad component
> - `src/components/ScratchPad/operations/AlgebraOperations.tsx` - Operation buttons
> - `backend/` - FastAPI + SymPy backend service

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: FastAPI + Python 3.11 + SymPy
- **Container**: Podman (Docker-compatible)
- **Math Rendering**: LaTeX + KaTeX
- **Styling**: Tailwind CSS + shadcn/ui

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- Podman or Docker
- pnpm

### Backend (SymPy API)

The backend runs on port 8001 to avoid conflicts with Supabase/Kong (port 8000).

Using Podman Compose:

```bash
cd /path/to/mathflow-new
podman-compose up -d backend
```

Manual Podman:

```bash
cd backend
podman build -t mathflow-sympy:latest .
podman run -d --name mathflow-backend --network host --restart unless-stopped localhost/mathflow-sympy:latest
```

### Frontend

```bash
cd /path/to/mathflow-new
pnpm install
pnpm dev
```

The frontend will be available at `http://localhost:3000`

## Environment Variables

See `.env.example` for required environment variables:

- `VITE_SUPABASE_URL` - Supabase instance URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_SYMPY_API_URL` - SymPy backend URL (default: `http://localhost:8001`)

## Key Operations

### Factorization
- Supports both expressions and equations
- Example: `3x^2 + 3x` → `3x(x + 1)`
- Example: `(3x)(x+1) = y` factors each side independently

### Expansion
- Distributes products and powers
- Example: `(3x)(x+1) = y` → `3x^2 + 3x = y`
- Priority: SymPy backend → AI fallback

### Simplification
- Reduces expressions to simplest form
- Handles complex algebraic manipulations

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
