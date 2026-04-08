---
phase: 02-operation-reliability
plan: 02
subsystem: frontend-parsing
tags: [tokenizer, vitest, parsing, tdd]
dependency_graph:
  requires: []
  provides: [tokenizeLatex, token-based parseTermCoefficient]
  affects: [factorization.ts, ScratchPad.tsx]
tech_stack:
  added: [vitest@4.1.3, jsdom@29.0.2]
  patterns: [token-based-parsing, TDD]
key_files:
  created:
    - code/mathflow-new/vitest.config.ts
    - code/mathflow-new/src/test/setup.ts
    - code/mathflow-new/src/lib/__tests__/equation.test.ts
  modified:
    - code/mathflow-new/src/lib/equation.ts
    - code/mathflow-new/package.json
    - code/mathflow-new/pnpm-lock.yaml
decisions:
  - Tokenizer uses index-based iteration with explicit increment (T-02-04 mitigation)
  - Function names (sin, cos, tan, log, ln) recognized as single variable tokens
  - \cdot and \times stripped during coefficient reconstruction, not during tokenization
  - parseTermCoefficient strips leading minus since sign is tracked by ParsedTerm wrapper
metrics:
  duration: 6min
  completed: "2026-04-08"
  tasks: 1
  files: 6
  tests_added: 24
---

# Phase 02 Plan 02: Rewrite local JS parsing with tokenizer-based approach Summary

Token-based LaTeX parsing replaces fragile regex in equation.ts, with 24 vitest tests proving correctness for polynomial expressions with coefficients, braces, and LaTeX commands.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rewrite parseTermCoefficient with tokenizer and set up vitest | d85425c | equation.ts, vitest.config.ts, setup.ts, equation.test.ts, package.json, pnpm-lock.yaml |

## What Was Done

### Tokenizer Implementation
Added `tokenizeLatex()` to `equation.ts` -- a character-by-character scanner that produces typed Token objects (number, variable, operator, delimiter, latex_command). Key behaviors:
- Numbers: consecutive digits and dots
- Variables: single ASCII letters, with special recognition for multi-letter function names (sin, cos, tan, log, ln, sec, csc, cot, arcsin, arccos, arctan)
- Operators: `+`, `-`, `*`, `/`, `=`, `^`
- Delimiters: `(`, `)`, `{`, `}`, `[`, `]`
- LaTeX commands: `\` followed by letters (e.g., `\cdot`, `\times`, `\frac`)
- Whitespace skipped
- Index-based iteration with explicit increment prevents infinite loops (T-02-04)

### parseTermCoefficient Rewrite
Replaced the regex-based implementation with token-based parsing:
1. Tokenize the (unsigned) input
2. If single number token: pure constant
3. If first token is a number: that is the coefficient, rest is variable
4. Otherwise: coefficient is 1, entire input is variable
5. Leading minus stripped (sign tracked by ParsedTerm wrapper)
6. `\cdot` and `\times` filtered out during variable reconstruction

### Vitest Infrastructure
- Installed `vitest@4.1.3` and `jsdom@29.0.2` as dev dependencies
- Created `vitest.config.ts` with jsdom environment, globals, path alias
- Created `src/test/setup.ts` placeholder
- Added `test` and `test:watch` scripts to package.json

### Test Coverage (24 tests)
- **Tokenization** (6 tests): simple polynomial, `\cdot`, `^`, function names, braces, `\times`
- **parseTermCoefficient** (7 tests): `3x^2`, `x`, `-2y`, `7`, `3x^{2}`, `2\cdot x`, `x^{2}y`
- **splitTerms** (4 tests): basic, `\cdot` terms, leading negative, braced exponents
- **moveTermInEquation** (3 tests): lhs-to-rhs, rhs-to-lhs, no-equals
- **combineLikeTermInEquation** (4 tests): like terms, constants, no-like-terms, no-equals

## Verification

- All 24 vitest tests pass
- All original exports from equation.ts preserved with identical signatures
- factorization.ts and ScratchPad.tsx imports verified -- no changes needed
- Pre-existing TypeScript errors (Toast, ThemeProvider, css-vars) are out of scope

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed moveTermInEquation test case**
- **Found during:** TDD RED phase
- **Issue:** Test "should move term from rhs to lhs" moved index 0 (term "7") instead of index 1 (term "3"), producing wrong expected result
- **Fix:** Changed test to move term at index 1 from rhs, which correctly produces "2x + 3 = 7"
- **Files modified:** equation.test.ts
- **Commit:** d85425c

## Self-Check: PASSED

- [x] code/mathflow-new/vitest.config.ts exists
- [x] code/mathflow-new/src/test/setup.ts exists
- [x] code/mathflow-new/src/lib/__tests__/equation.test.ts exists
- [x] code/mathflow-new/src/lib/equation.ts modified with tokenizeLatex
- [x] Commit d85425c exists in git log
