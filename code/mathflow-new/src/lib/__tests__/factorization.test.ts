/**
 * Tests for local JavaScript factorization algorithms.
 *
 * These test the LOCAL algorithms in factorization.ts:
 * - factorQuadratic: quadratic polynomial factorization
 * - factorDifferenceOfPowers: difference/sum of squares/cubes
 * - extractCommonFactor: common factor extraction
 * - factorExpression: integration test that tries all methods
 *
 * These do NOT test the SymPy backend -- those are covered by backend pytest tests.
 */

import { describe, it, expect } from 'vitest';
import {
  factorExpression,
  factorQuadratic,
  factorDifferenceOfPowers,
  extractCommonFactor,
} from '../factorization';

// ============================================================================
// factorQuadratic
// ============================================================================

describe('factorQuadratic', () => {
  it('factors x^2 + 2x + 1 (perfect square)', () => {
    const result = factorQuadratic('x^2 + 2x + 1');
    expect(result).not.toBeNull();
    expect(result).toContain('(x');
    expect(result).toContain('1)');
  });

  it('factors x^2 - 4 (difference of squares via quadratic)', () => {
    // x^2 - 4 = x^2 + 0x - 4, roots are 2 and -2
    const result = factorQuadratic('x^2 - 4');
    expect(result).not.toBeNull();
    // Should contain (x - 2) and (x + 2) factors
    expect(result).toContain('x');
  });

  it('factors x^2 - 5x + 6 (integer roots 2 and 3)', () => {
    const result = factorQuadratic('x^2 - 5x + 6');
    expect(result).not.toBeNull();
    expect(result).toContain('x');
    // Roots are x=2 and x=3: (x - 2)(x - 3)
    expect(result).toContain('2');
    expect(result).toContain('3');
  });

  it('factors x^2 + x - 2 (roots 1 and -2)', () => {
    const result = factorQuadratic('x^2 + x - 2');
    expect(result).not.toBeNull();
    expect(result).toContain('x');
  });

  it('factors x^2 + 3x + 2 (roots -1 and -2)', () => {
    const result = factorQuadratic('x^2 + 3x + 2');
    expect(result).not.toBeNull();
    expect(result).toContain('x');
  });

  it('returns null for x^2 + 1 (no real roots)', () => {
    const result = factorQuadratic('x^2 + 1');
    expect(result).toBeNull();
  });

  it('returns null for x^2 + x + 1 (discriminant < 0)', () => {
    const result = factorQuadratic('x^2 + x + 1');
    expect(result).toBeNull();
  });

  it('returns null for non-quadratic expression (linear)', () => {
    const result = factorQuadratic('2x + 3');
    expect(result).toBeNull();
  });

  it('returns null for non-quadratic expression (single term)', () => {
    const result = factorQuadratic('x^3');
    expect(result).toBeNull();
  });

  it('returns null for empty string', () => {
    const result = factorQuadratic('');
    expect(result).toBeNull();
  });
});

// ============================================================================
// factorDifferenceOfPowers
// ============================================================================

describe('factorDifferenceOfPowers', () => {
  it('factors x^2 - 4 (difference of squares with coefficient)', () => {
    const result = factorDifferenceOfPowers('x^2 - 4');
    expect(result).not.toBeNull();
    // Should produce (x - 2)(x + 2) form
    expect(result).toContain('x');
    expect(result).toContain('2');
  });

  it('factors x^2 - 9 (difference of squares)', () => {
    const result = factorDifferenceOfPowers('x^2 - 9');
    expect(result).not.toBeNull();
    expect(result).toContain('x');
    expect(result).toContain('3');
  });

  it('factors 4x^2 - 9 (non-1 coefficient difference of squares)', () => {
    const result = factorDifferenceOfPowers('4x^2 - 9');
    expect(result).not.toBeNull();
    // Should involve 2x and 3
    expect(result).toContain('2');
    expect(result).toContain('3');
  });

  it('factors x^3 - 8 (difference of cubes)', () => {
    const result = factorDifferenceOfPowers('x^3 - 8');
    expect(result).not.toBeNull();
    expect(result).toContain('x');
    expect(result).toContain('2');
  });

  it('factors x^3 + 27 (sum of cubes)', () => {
    const result = factorDifferenceOfPowers('x^3 + 27');
    expect(result).not.toBeNull();
    expect(result).toContain('x');
    expect(result).toContain('3');
  });

  it('returns null for same-sign terms (both positive)', () => {
    const result = factorDifferenceOfPowers('x^2 + 4');
    // Both terms positive -- not difference of powers pattern
    // The function requires one positive and one negative term
    expect(result).toBeNull();
  });

  it('returns null for single term', () => {
    const result = factorDifferenceOfPowers('x^2');
    expect(result).toBeNull();
  });

  it('returns null for three terms', () => {
    const result = factorDifferenceOfPowers('x^2 - 4 + 1');
    expect(result).toBeNull();
  });

  it('returns null for empty string', () => {
    const result = factorDifferenceOfPowers('');
    expect(result).toBeNull();
  });
});

// ============================================================================
// extractCommonFactor
// ============================================================================

describe('extractCommonFactor', () => {
  it('extracts common factor from 2x + 4', () => {
    const result = extractCommonFactor('2x + 4');
    expect(result).not.toBeNull();
    expect(result).toContain('2');
    expect(result).toContain('\\left(');
    expect(result).toContain('\\right)');
  });

  it('extracts common factor from 3x + 6', () => {
    const result = extractCommonFactor('3x + 6');
    expect(result).not.toBeNull();
    expect(result).toContain('3');
    expect(result).toContain('\\left(');
    expect(result).toContain('\\right)');
  });

  it('extracts common factor from 5x + 10', () => {
    const result = extractCommonFactor('5x + 10');
    expect(result).not.toBeNull();
    expect(result).toContain('5');
  });

  it('extracts common factor from 4x + 8', () => {
    const result = extractCommonFactor('4x + 8');
    expect(result).not.toBeNull();
    expect(result).toContain('4');
  });

  it('extracts common factor from 6x + 12', () => {
    const result = extractCommonFactor('6x + 12');
    expect(result).not.toBeNull();
    expect(result).toContain('6');
  });

  it('returns null for single term', () => {
    const result = extractCommonFactor('x');
    expect(result).toBeNull();
  });

  it('returns null for coprime coefficients', () => {
    const result = extractCommonFactor('x + y');
    expect(result).toBeNull();
  });

  it('returns null for empty string', () => {
    const result = extractCommonFactor('');
    expect(result).toBeNull();
  });

  it('handles terms with negative coefficients', () => {
    const result = extractCommonFactor('2x - 4');
    expect(result).not.toBeNull();
    expect(result).toContain('2');
  });
});

// ============================================================================
// factorExpression (integration test)
// ============================================================================

describe('factorExpression', () => {
  it('returns null for empty string', () => {
    expect(factorExpression('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(factorExpression('   ')).toBeNull();
  });

  it('returns null for already-factored expression with \\left(', () => {
    // Expressions with \left( are treated as already factored
    const result = factorExpression('\\left(x + 1\\right)\\left(x - 1\\right)');
    expect(result).toBeNull();
  });

  it('factors x^2 - 4 (difference of squares)', () => {
    const result = factorExpression('x^2 - 4');
    expect(result).not.toBeNull();
    expect(result).toContain('x');
  });

  it('factors x^2 + 2x + 1 (perfect square trinomial)', () => {
    const result = factorExpression('x^2 + 2x + 1');
    expect(result).not.toBeNull();
    expect(result).toContain('x');
  });

  it('factors 2x + 4 (common factor)', () => {
    const result = factorExpression('2x + 4');
    expect(result).not.toBeNull();
    expect(result).toContain('2');
  });

  it('factors x^2 - 5x + 6 (integer roots)', () => {
    const result = factorExpression('x^2 - 5x + 6');
    expect(result).not.toBeNull();
    expect(result).toContain('x');
  });

  it('factors x^3 - 8 (difference of cubes)', () => {
    const result = factorExpression('x^3 - 8');
    expect(result).not.toBeNull();
    expect(result).toContain('x');
  });

  it('returns null for non-factorable expression x + 1', () => {
    // x + 1 has no common factor, no quadratic pattern, no power pattern
    const result = factorExpression('x + 1');
    expect(result).toBeNull();
  });

  it('returns null for single variable x', () => {
    const result = factorExpression('x');
    expect(result).toBeNull();
  });

  it('returns null for single number 5', () => {
    const result = factorExpression('5');
    expect(result).toBeNull();
  });
});

// ============================================================================
// Edge cases: already-factored detection
// ============================================================================

describe('Already-factored detection', () => {
  it('returns null for (x + 1)(x - 1) with LaTeX delimiters', () => {
    const result = factorExpression('\\left(x + 1\\right) \\left(x - 1\\right)');
    expect(result).toBeNull();
  });

  it('returns null for 2(x + 2) common factor form', () => {
    // The function checks for \left( which indicates already-factored
    const result = factorExpression('2\\left(x + 2\\right)');
    expect(result).toBeNull();
  });
});
