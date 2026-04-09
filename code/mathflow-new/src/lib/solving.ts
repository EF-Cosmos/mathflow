/**
 * Solving API client -- frontend interface to the backend solve endpoints.
 *
 * All solving is backend-only (SymPy) per D-06. No local fallback.
 * Returns null on failure/timeout, following the existing fallback chain pattern.
 */

const SYMPY_API_URL = import.meta.env.VITE_SYMPY_API_URL || 'http://localhost:8001';
const SOLVE_TIMEOUT = 10000; // Solving may take longer than factor/expand

// ============================================================================
// Types
// ============================================================================

/** A single step in a solve response */
export interface SolveStep {
  description: string;
  latex: string;
}

/** Interval data for inequality solutions (for number line visualization) */
export interface IntervalData {
  lower: number | null;
  upper: number | null;
  lower_strict: boolean;
  upper_strict: boolean;
}

/** Response from POST /api/solve/equation */
export interface SolveEquationResponse {
  result: string;
  steps: SolveStep[];
  verified: boolean;
}

/** Response from POST /api/solve/inequality */
export interface SolveInequalityResponse {
  result: string;
  steps: SolveStep[];
  intervals: IntervalData[];
  verified: boolean;
}

/** Response from POST /api/solve/system */
export interface SolveSystemResponse {
  result: string;
  steps: SolveStep[];
  verified: boolean;
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Solve an equation (linear, quadratic, fractional) via backend SymPy.
 * Returns result + steps array, or null on failure/timeout.
 * @param latex - LaTeX equation string (e.g., "2x + 3 = 7")
 */
export async function solveEquation(latex: string): Promise<SolveEquationResponse | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/solve/equation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex }),
      signal: AbortSignal.timeout(SOLVE_TIMEOUT),
    });
    if (!response.ok) {
      console.warn(`Solve equation API error: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch {
    console.warn('Solve equation API unavailable');
    return null;
  }
}

/**
 * Solve an inequality (linear, quadratic) via backend SymPy.
 * Returns result + steps + intervals for number line visualization.
 * @param latex - LaTeX inequality string (e.g., "2x + 3 > 7")
 */
export async function solveInequality(latex: string): Promise<SolveInequalityResponse | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/solve/inequality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex }),
      signal: AbortSignal.timeout(SOLVE_TIMEOUT),
    });
    if (!response.ok) {
      console.warn(`Solve inequality API error: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch {
    console.warn('Solve inequality API unavailable');
    return null;
  }
}

/**
 * Solve a system of linear equations via backend SymPy.
 * @param equations - Array of LaTeX equation strings
 * @param variables - Array of variable names to solve for
 */
export async function solveSystem(equations: string[], variables: string[]): Promise<SolveSystemResponse | null> {
  try {
    const response = await fetch(`${SYMPY_API_URL}/api/solve/system`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ equations, variables }),
      signal: AbortSignal.timeout(SOLVE_TIMEOUT),
    });
    if (!response.ok) {
      console.warn(`Solve system API error: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch {
    console.warn('Solve system API unavailable');
    return null;
  }
}
