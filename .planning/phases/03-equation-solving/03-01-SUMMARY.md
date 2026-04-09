---
phase: 03-equation-solving
plan: 01
status: complete
started: 2026-04-09T19:40:00+08:00
completed: 2026-04-09T19:57:00+08:00
requirements:
  - EQNS-01
  - EQNS-02
  - EQNS-03
  - EQNS-04
  - EQNS-05
  - EQNS-06
  - STEP-01
  - STEP-02
---

## What was built

Three FastAPI solving endpoints with step-by-step solution generation using SymPy:
- `POST /api/solve/equation` — linear, quadratic, and fractional equations with extraneous solution filtering
- `POST /api/solve/inequality` — linear and quadratic inequalities with interval notation
- `POST /api/solve/system` — 2-variable and 3-variable systems of linear equations

All responses include a `steps` array with `description` and `latex` per step, enabling the frontend to display intermediate transformations.

## Implementation approach

TDD cycle (RED → GREEN):
1. Wrote failing tests covering all EQNS-* and STEP-* requirements (24 tests)
2. Implemented solve_service.py with step generation on top of SymPy's verified solving APIs
3. All 24 new tests pass, 215/215 total tests pass (zero regressions)

## Key files

### created
- code/mathflow-new/backend/app/services/solve_service.py — Core solving logic (492 lines)
- code/mathflow-new/backend/tests/test_solving.py — Test suite (259 lines, 24 tests)

### modified
- code/mathflow-new/backend/app/models.py — Added SolveStep, SolveEquation/Inequality/System Request/Response models
- code/mathflow-new/backend/app/main.py — Added 3 POST endpoints

## Commits
- 59ed427 test(03-01): add failing tests for equation/inequality/system solving
- 9ea787b feat(03-01): implement equation/inequality/system solving with step generation

## Test results
24/24 new tests pass, 215/215 total tests pass

## Deviations
None — all must_haves verified by automated tests.

## Requirements completed
EQNS-01, EQNS-02, EQNS-03, EQNS-04, EQNS-05, EQNS-06, STEP-01, STEP-02
