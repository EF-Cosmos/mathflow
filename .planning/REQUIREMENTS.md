# Requirements: MathFlow

**Defined:** 2026-04-08
**Core Value:** 点击式逐步数学推导 — 操作必须可靠，不能返回错误结果

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Storage & Deployment

- [x] **STOR-01**: User data (derivations, steps) persists locally via IndexedDB without external services
- [x] **STOR-02**: App starts and runs without Supabase credentials or network access
- [x] **STOR-03**: Existing Supabase auth code removed — app opens directly to workspace with no login
- [ ] **STOR-04**: Single command (`./start.sh` or `start.bat`) launches both frontend and backend
- [ ] **STOR-05**: Startup script checks backend health before opening frontend

### Operation Reliability

- [ ] **RELI-01**: Backend provides `/api/verify` endpoint that checks mathematical equivalence between input and output
- [ ] **RELI-02**: Every math operation result is verified before being added as a derivation step
- [ ] **RELI-03**: LaTeX input is normalized before being sent to SymPy (handle `\cdot`, `\times`, `\left/\right` variants)
- [ ] **RELI-04**: Test suite covers 100+ typical high school math expressions with expected results
- [ ] **RELI-05**: Local JavaScript algorithms use proper parsing instead of fragile regex/string matching

### Equation Solving

- [ ] **EQNS-01**: User can solve linear equations in one variable (e.g., `2x + 3 = 7`)
- [ ] **EQNS-02**: User can solve quadratic equations (e.g., `x^2 - 5x + 6 = 0`)
- [ ] **EQNS-03**: User can solve fractional equations (e.g., `1/x + 1/(x-1) = 1`)
- [ ] **EQNS-04**: User can solve linear inequalities in one variable
- [ ] **EQNS-05**: User can solve quadratic inequalities
- [ ] **EQNS-06**: User can solve systems of linear equations (2-variable, 3-variable)

### Fraction Operations

- [ ] **FRAC-01**: User can find common denominator for multiple fractions (通分)
- [ ] **FRAC-02**: User can simplify fractions by dividing common factors (约分)

### Algebra Operations

- [ ] **ALGB-01**: User can complete the square for quadratic expressions (配方)
- [ ] **ALGB-02**: User can expand multiplication formulas (平方差, 完全平方, 立方和/差)
- [ ] **ALGB-03**: User can apply substitution method to solve expressions (换元法)

### Smart Simplification

- [ ] **SMPL-01**: User can simplify trigonometric expressions (e.g., `sin^2 x + cos^2 x = 1`)
- [ ] **SMPL-02**: User can simplify logarithmic expressions (e.g., `log(ab) = log(a) + log(b)`)
- [ ] **SMPL-03**: User can simplify radical expressions (e.g., `sqrt(ab) = sqrt(a) * sqrt(b)`)

### Step Display

- [ ] **STEP-01**: Each operation shows the transformation applied, not just the result
- [ ] **STEP-02**: User can see intermediate steps for multi-step operations (e.g., equation solving)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Extended Features

- **EQNS-07**: User can solve equations with parameters and analyze solution cases (参数讨论)
- **STEP-03**: User can annotate steps with handwritten notes
- **PERF-01**: Operation results cached for repeated identical expressions
- **DIST-01**: Cross-platform installer/package (AppImage, .exe, .dmg)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-user collaboration | Personal tool, no real-time collaboration needed |
| Mobile native app | Web-first, responsive enough for tablet use |
| Social/sharing features | Not relevant for personal homework tool |
| AI-assisted problem solving | Focus on reliable symbolic computation first |
| Problem bank / exercise system | Different product category |
| Vector calculus operations (grad, curl, div) | University-level, outside target audience |
| Photo/scan input | High complexity, defer to v2+ |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STOR-01 | Phase 1 | Complete |
| STOR-02 | Phase 1 | Complete |
| STOR-03 | Phase 1 | Complete |
| STOR-04 | Phase 6 | Pending |
| STOR-05 | Phase 6 | Pending |
| RELI-01 | Phase 2 | Pending |
| RELI-02 | Phase 2 | Pending |
| RELI-03 | Phase 2 | Pending |
| RELI-04 | Phase 2 | Pending |
| RELI-05 | Phase 2 | Pending |
| EQNS-01 | Phase 3 | Pending |
| EQNS-02 | Phase 3 | Pending |
| EQNS-03 | Phase 3 | Pending |
| EQNS-04 | Phase 3 | Pending |
| EQNS-05 | Phase 3 | Pending |
| EQNS-06 | Phase 3 | Pending |
| FRAC-01 | Phase 4 | Pending |
| FRAC-02 | Phase 4 | Pending |
| ALGB-01 | Phase 4 | Pending |
| ALGB-02 | Phase 4 | Pending |
| ALGB-03 | Phase 4 | Pending |
| SMPL-01 | Phase 5 | Pending |
| SMPL-02 | Phase 5 | Pending |
| SMPL-03 | Phase 5 | Pending |
| STEP-01 | Phase 3 | Pending |
| STEP-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0

---
*Requirements defined: 2026-04-08*
*Last updated: 2026-04-08 after roadmap creation*
