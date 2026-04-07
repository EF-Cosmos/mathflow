# Coding Conventions

**Analysis Date:** 2025-01-09

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension (e.g., `ScratchPad.tsx`, `MathRenderer.tsx`)
- Utilities/libraries: camelCase with `.ts` extension (e.g., `factorization.ts`, `equation.ts`)
- Hooks: kebab-case with `.tsx` extension (e.g., `use-theme.tsx`, `use-toast.tsx`)
- Test files: Not present in codebase (no testing framework configured)

**Functions:**
- camelCase for all functions (e.g., `factorExpression`, `parseQuadratic`, `splitTerms`)
- Async functions prefixed with verb (e.g., `factorWithSympy`, `expandWithFallback`)
- Hook functions prefixed with `use` (e.g., `useTheme`, `useToast`)

**Variables:**
- camelCase for local variables (e.g., `baseLatex`, `currentInput`, `activeAction`)
- UPPER_SNAKE_CASE for constants (e.g., `THEME_STORAGE_KEY`, `API_TIMEOUT`)
- PascalCase for React components (e.g., `ScratchPad`, `StepCard`)

**Types:**
- PascalCase for interfaces and types (e.g., `ParsedTerm`, `DerivationStep`, `EquationSide`)
- Descriptive names with context (e.g., `FactorizationRequest`, `CalculusResponse`)

## Code Style

**Formatting:**
- Tool: ESLint with TypeScript support
- Config: `eslint.config.js` with TypeScript ESLint recommended rules
- Key settings:
  - `@typescript-eslint/no-unused-vars`: off
  - `@typescript-eslint/no-explicit-any`: off
  - `react-refresh/only-export-components`: warn
  - React Hooks rules enforced
- No Prettier config detected (using ESLint only)

**Linting:**
- ESLint 9.15.0 with typescript-eslint 8.15.0
- React plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Run command: `pnpm lint`
- Config extends: `js.configs.recommended`, `tseslint.configs.recommended`

## Import Organization

**Order:**
1. React imports (first)
2. Third-party library imports (lucide-react, clsx, etc.)
3. Internal imports (using @ alias)
4. Type imports (if separate)

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Example: `import { cn } from '../../lib/utils'`
- Relative imports used when path is close (e.g., `../MathRenderer`)

**Example from ScratchPad.tsx:**
```typescript
import { useState, useRef, useCallback, useEffect } from 'react';
import StepCard, { DerivationStep } from './StepCard';
import { OperationToolbar } from './operations';
import { TermAction } from './InteractiveFormula';
import MathRenderer from '../MathRenderer';
import {
  moveTermInEquation,
  combineLikeTermInEquation,
  // ...
} from '../../lib/equation';
```

## Error Handling

**Patterns:**
- Try-catch for async operations with null return on failure
- Console warnings for API failures (not console.error)
- Graceful degradation: fallback to local algorithms when backend unavailable
- Example from `factorization.ts`:
```typescript
export async function factorWithSympy(latex: string): Promise<string | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/factor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex }),
      signal: AbortSignal.timeout(API_TIMEOUT),
    });

    if (!response.ok) {
      console.warn(`SymPy API error: ${response.status}`);
      return null;
    }

    const data: FactorizeResponse = await response.json();
    return data.result;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('SymPy API timeout');
    } else {
      console.warn('SymPy API unavailable:', error);
    }
    return null;
  }
}
```

**Validation:**
- Input validation at function entry (e.g., `if (!latex || latex.trim().length === 0) return null`)
- Type guards for parsing (e.g., `isNumeric`, `parseQuadratic` returning null on failure)
- Early returns for invalid states

## Logging

**Framework:** Console API (no logging library)

**Patterns:**
- `console.warn()` for expected failures (API unavailable, timeout)
- `console.error()` for unexpected errors (AI fallback failures)
- No logging in production builds
- Silent failures with null returns preferred over thrown exceptions

**Example:**
```typescript
// Expected failure
console.warn('SymPy API timeout');

// Unexpected error
console.error('AI factorization error:', error);
```

## Comments

**When to Comment:**
- JSDoc for public/exported functions with parameters and return types
- Inline comments for complex mathematical algorithms
- Section headers in large files (e.g., `// ==================== 基础微积分 ====================`)
- Chinese comments used for user-facing text and some explanations

**JSDoc/TSDoc:**
- Used for exported functions with description and params
- Example format:
```typescript
/**
 * 计算两个数的最大公约数
 */
function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

/**
 * 因式分解表达式
 * @param latex - LaTeX 表达式
 * @returns 因式分解后的表达式，如果没有公因子返回 null
 */
export function extractCommonFactor(latex: string): string | null {
  // ...
}
```

## Function Design

**Size:**
- No strict size limit observed
- Large functions common (e.g., `handleCalculusOperation` in ScratchPad.tsx: ~200 lines)
- Helper functions extracted for reusable logic

**Parameters:**
- Object parameters for multiple related values (e.g., `CalculusRequest`, `FactorizationRequest`)
- Primitive parameters for simple operations
- Destructuring used for props in components

**Return Values:**
- `null` used for failure states (not exceptions)
- Objects with metadata for complex operations (e.g., `{ nextEquation, moved }`)
- Union types for optional values (e.g., `string | null`)

## Module Design

**Exports:**
- Named exports preferred (e.g., `export function factorExpression`)
- Default exports for React components (e.g., `export default function ScratchPad`)
- Type exports co-located with functions (e.g., `export interface ParsedTerm`)

**Barrel Files:**
- Operations barrel: `src/components/ScratchPad/operations/index.ts`
- Theme exports through provider: `export { useTheme, ThemeProvider } from '../providers/ThemeProvider'`

**File Organization:**
- Feature-based grouping (e.g., `ScratchPad/` contains related components)
- Shared utilities in `lib/`
- UI components in `components/ui/`
- Pages in `pages/`
- Hooks in `hooks/`
- Providers in `providers/`
- Theme configuration in `theme/`

## Special Conventions

**Chinese Language:**
- User-facing text in Chinese (e.g., "因式分解", "展开", "化简")
- Some comments in Chinese for domain-specific explanations
- Variable names and function signatures in English

**Mathematical Operations:**
- LaTeX format for mathematical expressions
- Fallback chain pattern: local → SymPy → AI → null
- Timeout protection for API calls (5-10 seconds)
- Idempotent operations (guards against re-processing)

**State Management:**
- React hooks for local state (useState, useCallback, useEffect)
- No global state management library
- localStorage for persistence (theme, API keys)
- Parent-child communication via props and callbacks

---

*Convention analysis: 2025-01-09*
