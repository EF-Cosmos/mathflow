# Roadmap: MathFlow

## Overview

MathFlow evolves from a cloud-dependent prototype into a reliable, local-first math derivation tool for Chinese high school students. The journey starts by cutting the Supabase cord and making the app fully local, then hardening the operation pipeline so no wrong answer ever reaches the user, then filling in the missing table-stakes operations (equations, fractions, algebra), adding smart simplification for advanced expressions, and finally wrapping it all in a single-command startup experience.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Local-First Storage** - Remove Supabase dependency, persist data in IndexedDB, app runs without network
- [ ] **Phase 2: Operation Reliability** - Add verification, normalization, and test coverage so no wrong answer is ever displayed
- [ ] **Phase 3: Equation Solving** - Solve linear, quadratic, fractional equations, inequalities, systems, with step-by-step display
- [ ] **Phase 4: Fraction and Algebra Operations** - Common denominator, fraction reduction, completing the square, multiplication formulas, substitution
- [ ] **Phase 5: Smart Simplification** - Trigonometric, logarithmic, and radical expression simplification
- [ ] **Phase 6: One-Command Startup** - Single script launches both frontend and backend with health checks

## Phase Details

### Phase 1: Local-First Storage
**Goal**: The app runs entirely on the user's machine with no cloud services, no login, and data persists between sessions
**Depends on**: Nothing (first phase)
**Requirements**: STOR-01, STOR-02, STOR-03
**Success Criteria** (what must be TRUE):
  1. User can open the app, create derivations, close the browser, reopen, and find all data intact
  2. The app loads and works fully when disconnected from the internet (no Supabase, no cloud calls)
  3. User is never shown a login screen -- the app opens directly to the workspace
**Plans**: 2 plans

Plans:
- [x] 01-01: Create IndexedDB storage layer (lib/db.ts) and template seed data
- [x] 01-02: Remove Supabase/auth, migrate pages to IndexedDB, add auto-save

### Phase 2: Operation Reliability
**Goal**: Every math operation result displayed to the user is verified for mathematical correctness; unverified results are clearly flagged with a warning so the user is never misled
**Depends on**: Phase 1
**Requirements**: RELI-01, RELI-02, RELI-03, RELI-04, RELI-05
**Success Criteria** (what must be TRUE):
  1. Every operation result is checked for mathematical equivalence before being added as a step
  2. Unverified results are displayed with an amber warning indicator (border + badge + text), clearly flagged so the user can judge for themselves -- per design decision D-04 (warn-not-reject)
  3. LaTeX input variants (\cdot vs \times, \left( vs (, etc.) all produce correct results after normalization
  4. The test suite passes 100+ high school math expressions covering all supported operations
  5. Local JavaScript math parsing uses proper AST-based parsing, not fragile regex/string matching
**Plans**: TBD

Plans:
- [x] 02-01: TBD
- [x] 02-02: TBD
- [x] 02-03: TBD

### Phase 3: Equation Solving
**Goal**: Users can solve all standard high school equation types with step-by-step transformation display
**Depends on**: Phase 2
**Requirements**: EQNS-01, EQNS-02, EQNS-03, EQNS-04, EQNS-05, EQNS-06, STEP-01, STEP-02
**Success Criteria** (what must be TRUE):
  1. User enters a linear equation and sees the correct solution (e.g., `2x + 3 = 7` yields `x = 2`)
  2. User enters a quadratic equation and sees roots (e.g., `x^2 - 5x + 6 = 0` yields `x = 2, x = 3`)
  3. User can solve inequalities and see solution intervals displayed correctly
  4. User can solve systems of 2 or 3 linear equations and see all variable values
  5. Each solving step shows the transformation applied (e.g., "subtract 3 from both sides"), not just the result
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Fraction and Algebra Operations
**Goal**: Users can perform the essential fraction and algebra manipulations that appear throughout the high school curriculum
**Depends on**: Phase 2
**Requirements**: FRAC-01, FRAC-02, ALGB-01, ALGB-02, ALGB-03
**Success Criteria** (what must be TRUE):
  1. User selects multiple fractions and sees them combined with a common denominator (tong fen)
  2. User simplifies a fraction by canceling common factors (yue fen)
  3. User completes the square on a quadratic expression and sees the canonical form (pei fang)
  4. User expands a multiplication formula pattern (difference of squares, perfect square, sum/difference of cubes)
  5. User applies substitution to an expression and sees the transformed result
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Smart Simplification
**Goal**: Users can simplify trigonometric, logarithmic, and radical expressions using context-aware rules
**Depends on**: Phase 2
**Requirements**: SMPL-01, SMPL-02, SMPL-03
**Success Criteria** (what must be TRUE):
  1. User simplifies a trigonometric expression and sees identities applied correctly (e.g., `sin^2 x + cos^2 x` becomes `1`)
  2. User simplifies a logarithmic expression and sees log rules applied correctly (e.g., `log(ab)` becomes `log(a) + log(b)`)
  3. User simplifies a radical expression and sees roots combined or split correctly
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: One-Command Startup
**Goal**: A single script launches the entire MathFlow stack and confirms it is ready to use
**Depends on**: Phase 1, Phase 3, Phase 4, Phase 5
**Requirements**: STOR-04, STOR-05
**Success Criteria** (what must be TRUE):
  1. Running `./start.sh` (Linux/Mac) or `start.bat` (Windows) launches both frontend and backend with no manual steps
  2. The startup script confirms backend health before opening frontend, and shows a clear error if the backend fails to start
  3. User sees the workspace within seconds of running the startup command
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6
Note: Phases 4 and 5 depend on Phase 2 but are independent of each other and Phase 3. However, sequential execution is recommended.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Local-First Storage | 0/2 | Planning complete | - |
| 2. Operation Reliability | 0/3 | Not started | - |
| 3. Equation Solving | 0/3 | Not started | - |
| 4. Fraction and Algebra Operations | 0/2 | Not started | - |
| 5. Smart Simplification | 0/2 | Not started | - |
| 6. One-Command Startup | 0/1 | Not started | - |
