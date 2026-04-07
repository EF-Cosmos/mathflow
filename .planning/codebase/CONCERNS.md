# Codebase Concerns

**Analysis Date:** 2025-01-09

## Tech Debt

**Monolithic ScratchPad component:**
- Issue: `ScratchPad.tsx` is 916 lines - handles state management, UI rendering, term manipulation, history, AI fallback, keyboard shortcuts, and multiply operations
- Files: `code/mathflow-new/src/components/ScratchPad/ScratchPad.tsx`
- Impact: Difficult to maintain, test, and extend; high cognitive load; any change risks breaking unrelated functionality
- Fix approach: Extract into smaller components - use custom hooks for state (`useScratchPadState`, `useScratchPadHistory`), separate operation handlers, create dedicated components for toolbar, step list, and input areas

**Silent API failures throughout calculus operations:**
- Issue: All calculus API calls return `null` on error with no error reporting or user feedback; 30+ instances of silent failure
- Files: `code/mathflow-new/src/lib/calculus.ts` (lines 80, 84, 102, 106, 124, 128, etc.)
- Impact: Users see no result and no explanation; impossible to debug why operations fail; network issues, backend downtime, or invalid input all look the same
- Fix approach: Add error tracking service, log specific failure reasons, surface user-friendly error messages via toast notifications, implement retry logic with exponential backoff

**Hardcoded LaTeX parsing assumptions:**
- Issue: Equation parsing (`equation.ts`) assumes specific LaTeX patterns; fragile parsing that breaks with nested braces, complex expressions, or alternate LaTeX formats
- Files: `code/mathflow-new/src/lib/equation.ts`
- Impact: Fails silently or returns `null` for valid but differently-formatted LaTeX; limits functionality to simple expressions only
- Fix approach: Replace custom parser with proper LaTeX parsing library (e.g., mathjax-node), add comprehensive test suite with edge cases, implement graceful degradation with specific error messages

**Duplicate operation logic across AlgebraOperations and CalculusOperations:**
- Issue: Similar patterns for applying operations, managing state, and handling UI interactions duplicated across files
- Files: `code/mathflow-new/src/components/ScratchPad/operations/AlgebraOperations.tsx`, `code/mathflow-new/src/components/ScratchPad/operations/CalculusOperations.tsx`
- Impact: Changes require updating multiple files; inconsistent behavior possible; maintenance burden
- Fix approach: Extract shared logic into composable hooks or utility functions, create generic operation handler that both can use

## Known Bugs

**Theme system inconsistency:**
- Symptoms: Some components use direct color classes (gray-50, gray-200) instead of CSS variables; breaks in dark mode or custom themes
- Files: `code/mathflow-new/src/components/ScratchPad/ScratchPad.tsx` (lines 710, 714, 732, 742, 767-780), `code/mathflow-new/src/theme/css-vars.ts`
- Trigger: Using dark mode or non-standard themes
- Workaround: None - affects all users in dark mode
- Impact: Visual inconsistencies; some areas don't respond to theme changes; poor UX

**Empty return handling in equation operations:**
- Symptoms: Operations like `combineLikeTermInEquation` and `moveTermInEquation` return `null` without user feedback when they can't process an expression
- Files: `code/mathflow-new/src/lib/equation.ts` (lines 158, 167, 214, 220, 226, 268, 276, 316, 322)
- Trigger: Complex expressions, equations without `=`, or edge cases in term parsing
- Workaround: Users must manually edit expressions
- Impact: Silent failures; users don't know why operations don't work; frustrating UX

**Factorization guards prevent valid operations:**
- Symptoms: Checks for `\left(` and `\right)` prevent re-factoring already factored expressions, but also prevent factoring expressions that legitimately contain these patterns
- Files: `code/mathflow-new/src/lib/factorization.ts`
- Trigger: Expressions with nested parentheses or already partially factored
- Workaround: Manually edit LaTeX to remove guard patterns
- Impact: Can't perform legitimate factorizations; reduces functionality

## Security Considerations

**OpenAI API key client-side exposure:**
- Risk: `OPENAI_API_KEY` read directly from `localStorage` in `ScratchPad.tsx`; API key accessible to any script or browser extension
- Files: `code/mathflow-new/src/components/ScratchPad/ScratchPad.tsx` (around line 300)
- Current mitigation: None - key stored in plaintext in browser
- Recommendations: Move AI calls through backend proxy; never store API keys in localStorage; use backend-to-backend authentication; implement rate limiting and cost controls

**Supabase anon key in client bundle:**
- Risk: `VITE_SUPABASE_ANON_KEY` embedded in client JavaScript; can be extracted by anyone; allows unauthorized database access if RLS policies fail
- Files: `code/mathflow-new/src/lib/supabase.ts`
- Current mitigation: Relies on Row Level Security (RLS) policies in Supabase
- Recommendations: Verify RLS policies are comprehensive and tested; implement service-side checks for sensitive operations; use Supabase Auth with proper session validation; monitor for anomalous usage patterns

**CORS wide-open on backend:**
- Risk: Backend configured with `allow_origins=["*"]`; any domain can make requests to the SymPy API
- Files: `code/mathflow-new/backend/app/main.py` (line 69)
- Current mitigation: None documented
- Recommendations: Restrict to specific frontend domains; implement API authentication; add rate limiting; use CORS only for development, configure properly for production

**No input sanitization on LaTeX expressions:**
- Risk: LaTeX expressions passed directly to SymPy backend without validation; potential for injection attacks or DoS via maliciously complex expressions
- Files: `code/mathflow-new/src/lib/factorization.ts`, `code/mathflow-new/src/lib/calculus.ts`, `code/mathflow-new/backend/app/services/sympy_service.py`
- Current mitigation: SymPy's `parse_latex()` may reject some malformed input
- Recommendations: Add client-side validation for expression complexity; implement backend rate limiting per user; add timeout limits for SymPy operations; sanitize or reject suspicious patterns

## Performance Bottlenecks

**SymPy API calls with 10-second timeout:**
- Problem: Every calculus operation waits up to 10 seconds before timing out; no early feedback; blocks UI
- Files: `code/mathflow-new/src/lib/calculus.ts` (line 78: `signal: AbortSignal.timeout(10000)`)
- Cause: Network latency, backend processing time, or unresponsive backend
- Improvement path: Reduce timeout to 5 seconds; implement optimistic UI updates; show loading indicators immediately; add retry with shorter timeouts; consider web workers for non-blocking operations

**Re-render cascade in ScratchPad:**
- Problem: Every step change triggers multiple useEffect hooks that update history, scroll position, and parent component; 916-line component re-renders entire tree
- Files: `code/mathflow-new/src/components/ScratchPad/ScratchPad.tsx` (lines 59-80)
- Cause: Unoptimized dependency arrays in useEffect, large component state, no React.memo usage
- Improvement path: Split into smaller components with React.memo; use useCallback for all handlers; implement virtual scrolling for step lists; debounce scroll effects

**No debouncing on search input:**
- Problem: Search in Dashboard filters derivations on every keystroke; could lag with many derivations
- Files: `code/mathflow-new/src/pages/Dashboard.tsx` (lines 81-83)
- Cause: Direct state update on onChange without debouncing
- Improvement path: Add 300ms debounce to search input; implement virtualized list for large datasets; add search indexing or backend search for scalability

**Theme state causes full document updates:**
- Problem: Every theme change updates all CSS custom properties and DOM elements; no transition optimizations
- Files: `code/mathflow-new/src/providers/ThemeProvider.tsx` (lines 54-69)
- Cause: Direct DOM manipulation on every theme change
- Improvement path: Use CSS transitions for smooth theme switching; consider CSS containment for isolated theme sections; implement theme caching

## Fragile Areas

**Equation parsing and manipulation:**
- Files: `code/mathflow-new/src/lib/equation.ts` (394 lines)
- Why fragile: Custom LaTeX parser with many edge cases; relies on string manipulation and regex; no comprehensive test coverage
- Safe modification: Add extensive tests before any changes; use test-driven development; consider alternative parsing approach
- Test coverage: No test files exist; critical gap for such core functionality

**Factorization fallback chain:**
- Files: `code/mathflow-new/src/lib/factorization.ts` (635 lines)
- Why fragile: Complex multi-step logic with local algorithms, SymPy API, and AI fallback; multiple failure modes; stateful AI interactions
- Safe modification: Test each fallback path independently; mock API responses; add integration tests for full chain
- Test coverage: No test files exist; high-risk area given complexity

**Toast confirm dialog implementation:**
- Files: `code/mathflow-new/src/providers/ToastProvider.tsx` (lines 79-125)
- Why fragile: Uses two separate toasts with delayed rendering; relies on timing (setTimeout 50ms); manual state cleanup
- Safe modification: Replace with proper modal dialog component; use React Portal for confirm dialogs; implement proper focus management
- Test coverage: No tests for timing-dependent logic; race conditions possible

**ScratchPad history management:**
- Files: `code/mathflow-new/src/components/ScratchPad/ScratchPad.tsx` (lines 89-105)
- Why fragile: Manual history array slicing and index management; potential for desync; undo/redo can lose state
- Safe modification: Use proven history library (e.g., redux-undo, use-undo); add comprehensive state validation; test edge cases
- Test coverage: No tests; history bugs can cause data loss

## Scaling Limits

**Current capacity:**
- Derivations stored in Supabase PostgreSQL; no pagination implemented; all derivations loaded on Dashboard mount
- Templates: all loaded at once; currently ~10-20 templates

**Limit:**
- Dashboard will become slow with 100+ derivations (full table scan + client-side filtering)
- No pagination, infinite scroll, or virtualization
- Browser memory limits with large history in ScratchPad

**Scaling path:**
- Implement pagination for derivations (cursor-based or offset-based)
- Add server-side search and filtering
- Implement virtual scrolling for derivation lists
- Add database indexes on user_id and updated_at columns
- Consider archiving old derivations
- Add lazy loading for templates

## Dependencies at Risk

**antlr4-python3-runtime:**
- Risk: Required for LaTeX parsing in SymPy backend; if upstream changes parsing behavior, application breaks
- Impact: All calculus operations fail; core functionality lost
- Migration plan: Pin to specific version; add integration tests for LaTeX parsing; monitor for deprecation notices; consider alternative LaTeX parsers

**@supabase/supabase-js v2.45.0:**
- Risk: Breaking changes in future major versions; auth flow changes could break login
- Impact: Users cannot authenticate; application unusable
- Migration plan: Lock to v2.x until major upgrade planned; test auth flow thoroughly before version bump; implement compatibility checks

**katex v0.16.9:**
- Risk: Older version; newer versions may have different rendering behavior
- Impact: LaTeX formulas render incorrectly; display inconsistencies
- Migration plan: Test all formula types with new version; add visual regression tests; version pinning in package.json

## Missing Critical Features

**No offline functionality:**
- Problem: Application completely unusable without network; even basic operations require API calls
- Blocks: Working during connectivity issues; poor user experience on unstable connections
- Impact: Users lose work if network drops during operations

**No persistent draft state:**
- Problem: ScratchPad work lost if page refreshes or browser closes; no auto-save
- Blocks: Recovering from accidental page close; continuing work later
- Impact: User frustration; data loss; reduced trust in application

**No export/import functionality:**
- Problem: Cannot save derivations locally; cannot share derivations with others; locked into Supabase storage
- Blocks: Backup; offline work; collaboration; academic use cases
- Impact: Limited utility for students and researchers

**No operation reversal at step level:**
- Problem: Cannot undo individual operations within a derivation; only global undo/redo
- Blocks: Correcting mistakes without losing subsequent work
- Impact: Fear of experimentation; reduced willingness to try operations

## Test Coverage Gaps

**No test files exist in codebase:**
- What's not tested: All functionality; 100% of code is untested
- Files: All `*.ts`, `*.tsx` files in `code/mathflow-new/src/`
- Risk: Regressions undetected; refactoring dangerous; deployments risky
- Priority: Critical - start with core utilities (`equation.ts`, `factorization.ts`), then components

**Specific high-risk untested areas:**
- LaTeX parsing (`equation.ts`): Complex string manipulation; many edge cases
- Factorization logic (`factorization.ts`): Multi-step fallback chain; algorithmic complexity
- Calculus API integration (`calculus.ts`): Network errors; timeout handling; response parsing
- State management in ScratchPad: History operations; undo/redo; step manipulation
- Theme switching: CSS variable updates; persistence; system theme detection

**Authentication flow untested:**
- What's not tested: Login, logout, session management, token refresh, error handling
- Files: `code/mathflow-new/src/lib/auth.tsx`
- Risk: Users locked out; security vulnerabilities; poor error messages
- Priority: High - authentication is critical path

**Database operations untested:**
- What's not tested: CRUD operations on derivations, templates; error handling; loading states
- Files: `code/mathflow-new/src/lib/supabase.ts`, `code/mathflow-new/src/pages/Dashboard.tsx`
- Risk: Data loss; corruption; silent failures
- Priority: High - user data at stake

---

*Concerns audit: 2025-01-09*
