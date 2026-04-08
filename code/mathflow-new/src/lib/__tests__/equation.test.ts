import { describe, it, expect } from 'vitest';
import {
  tokenizeLatex,
  splitTerms,
  parseTermCoefficient,
  moveTermInEquation,
  combineLikeTermInEquation,
} from '../equation';

// ============================================================================
// Tokenization
// ============================================================================

describe('Tokenization', () => {
  it('should tokenize simple polynomial "2x + 3y - 4" into correct tokens', () => {
    const tokens = tokenizeLatex('2x + 3y - 4');
    // Expected: [2, x, +, 3, y, -, 4]
    expect(tokens).toHaveLength(7);
    expect(tokens[0]).toEqual({ type: 'number', value: '2', position: 0 });
    expect(tokens[1]).toEqual({ type: 'variable', value: 'x', position: 1 });
    expect(tokens[2]).toEqual({ type: 'operator', value: '+', position: 3 });
    expect(tokens[3]).toEqual({ type: 'number', value: '3', position: 5 });
    expect(tokens[4]).toEqual({ type: 'variable', value: 'y', position: 6 });
    expect(tokens[5]).toEqual({ type: 'operator', value: '-', position: 8 });
    expect(tokens[6]).toEqual({ type: 'number', value: '4', position: 10 });
  });

  it('should handle \\cdot as latex_command token', () => {
    const tokens = tokenizeLatex('2\\cdot x');
    // Expected: [2, \cdot, x]
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toEqual({ type: 'number', value: '2', position: 0 });
    expect(tokens[1]).toEqual({ type: 'latex_command', value: '\\cdot', position: 1 });
    expect(tokens[2]).toEqual({ type: 'variable', value: 'x', position: 7 });
  });

  it('should handle "^" as operator token in "x^2 + 2x + 1"', () => {
    const tokens = tokenizeLatex('x^2 + 2x + 1');
    // x, ^, 2, +, 2, x, +, 1
    expect(tokens).toHaveLength(8);
    expect(tokens[0]).toEqual({ type: 'variable', value: 'x', position: 0 });
    expect(tokens[1]).toEqual({ type: 'operator', value: '^', position: 1 });
    expect(tokens[2]).toEqual({ type: 'number', value: '2', position: 2 });
    expect(tokens[3]).toEqual({ type: 'operator', value: '+', position: 4 });
    expect(tokens[4]).toEqual({ type: 'number', value: '2', position: 6 });
    expect(tokens[5]).toEqual({ type: 'variable', value: 'x', position: 7 });
    expect(tokens[6]).toEqual({ type: 'operator', value: '+', position: 9 });
    expect(tokens[7]).toEqual({ type: 'number', value: '1', position: 11 });
  });

  it('should recognize function names sin, cos, tan, log, ln as single variable tokens', () => {
    const tokens = tokenizeLatex('sin + cos');
    expect(tokens[0]).toEqual({ type: 'variable', value: 'sin', position: 0 });
    expect(tokens[1]).toEqual({ type: 'operator', value: '+', position: 4 });
    expect(tokens[2]).toEqual({ type: 'variable', value: 'cos', position: 6 });
  });

  it('should handle braces as delimiter tokens', () => {
    const tokens = tokenizeLatex('x^{2}');
    // x, ^, {, 2, }
    expect(tokens).toHaveLength(5);
    expect(tokens[0]).toEqual({ type: 'variable', value: 'x', position: 0 });
    expect(tokens[1]).toEqual({ type: 'operator', value: '^', position: 1 });
    expect(tokens[2]).toEqual({ type: 'delimiter', value: '{', position: 2 });
    expect(tokens[3]).toEqual({ type: 'number', value: '2', position: 3 });
    expect(tokens[4]).toEqual({ type: 'delimiter', value: '}', position: 4 });
  });

  it('should handle \\times as latex_command token', () => {
    const tokens = tokenizeLatex('3\\times y');
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toEqual({ type: 'number', value: '3', position: 0 });
    expect(tokens[1]).toEqual({ type: 'latex_command', value: '\\times', position: 1 });
    expect(tokens[2]).toEqual({ type: 'variable', value: 'y', position: 8 });
  });
});

// ============================================================================
// parseTermCoefficient
// ============================================================================

describe('parseTermCoefficient', () => {
  it('should parse "3x^2" as coefficient 3 and variable "x^2"', () => {
    const result = parseTermCoefficient('3x^2');
    expect(result.coefficient).toBe(3);
    expect(result.variable).toBe('x^2');
  });

  it('should parse "x" as coefficient 1 and variable "x"', () => {
    const result = parseTermCoefficient('x');
    expect(result.coefficient).toBe(1);
    expect(result.variable).toBe('x');
  });

  it('should parse "-2y" as coefficient 2 and variable "y" (sign handled by ParsedTerm)', () => {
    const result = parseTermCoefficient('-2y');
    expect(result.coefficient).toBe(2);
    expect(result.variable).toBe('y');
  });

  it('should parse "7" as coefficient 7 and empty variable', () => {
    const result = parseTermCoefficient('7');
    expect(result.coefficient).toBe(7);
    expect(result.variable).toBe('');
  });

  it('should parse "3x^{2}" with braced exponent as coefficient 3 and variable "x^{2}"', () => {
    const result = parseTermCoefficient('3x^{2}');
    expect(result.coefficient).toBe(3);
    expect(result.variable).toBe('x^{2}');
  });

  it('should parse "2\\cdot x" via tokenizer as coefficient 2 and variable "x"', () => {
    const result = parseTermCoefficient('2\\cdot x');
    expect(result.coefficient).toBe(2);
    expect(result.variable).toBe('x');
  });

  it('should parse "x^{2}y" as coefficient 1 and variable "x^{2}y"', () => {
    const result = parseTermCoefficient('x^{2}y');
    expect(result.coefficient).toBe(1);
    expect(result.variable).toBe('x^{2}y');
  });
});

// ============================================================================
// splitTerms
// ============================================================================

describe('splitTerms', () => {
  it('should split "2x + 3y - 4" into 3 terms with correct signs and latex', () => {
    const terms = splitTerms('2x + 3y - 4');
    expect(terms).toHaveLength(3);
    expect(terms[0]).toEqual({ sign: '+', latex: '2x' });
    expect(terms[1]).toEqual({ sign: '+', latex: '3y' });
    expect(terms[2]).toEqual({ sign: '-', latex: '4' });
  });

  it('should split "2\\cdot x + 3 \\cdot y" into 2 terms', () => {
    const terms = splitTerms('2\\cdot x + 3 \\cdot y');
    expect(terms).toHaveLength(2);
    expect(terms[0]).toEqual({ sign: '+', latex: '2\\cdot x' });
    expect(terms[1]).toEqual({ sign: '+', latex: '3 \\cdot y' });
  });

  it('should handle leading negative term "-x + 3"', () => {
    const terms = splitTerms('-x + 3');
    expect(terms).toHaveLength(2);
    expect(terms[0]).toEqual({ sign: '-', latex: 'x' });
    expect(terms[1]).toEqual({ sign: '+', latex: '3' });
  });

  it('should handle expression with braces "x^{2} + 2x + 1"', () => {
    const terms = splitTerms('x^{2} + 2x + 1');
    expect(terms).toHaveLength(3);
    expect(terms[0]).toEqual({ sign: '+', latex: 'x^{2}' });
    expect(terms[1]).toEqual({ sign: '+', latex: '2x' });
    expect(terms[2]).toEqual({ sign: '+', latex: '1' });
  });
});

// ============================================================================
// moveTermInEquation
// ============================================================================

describe('moveTermInEquation', () => {
  it('should move "2x" from lhs to rhs in "2x + 3 = 7" producing "3 = 7 - 2x"', () => {
    const result = moveTermInEquation('2x + 3 = 7', 'lhs', 0);
    expect(result).not.toBeNull();
    expect(result!.nextEquation).toBe('3 = 7 - 2x');
  });

  it('should move term from rhs to lhs, flipping sign', () => {
    // Move "3" (index 1, sign '-') from rhs to lhs: 2x - 3 = 7
    const result = moveTermInEquation('2x = 7 - 3', 'rhs', 1);
    expect(result).not.toBeNull();
    expect(result!.nextEquation).toBe('2x + 3 = 7');
  });

  it('should return null for expression without equals sign', () => {
    const result = moveTermInEquation('2x + 3', 'lhs', 0);
    expect(result).toBeNull();
  });
});

// ============================================================================
// combineLikeTermInEquation
// ============================================================================

describe('combineLikeTermInEquation', () => {
  it('should combine "2x + 3x = 10" into "5x = 10"', () => {
    const result = combineLikeTermInEquation('2x + 3x = 10', 'lhs', 0);
    expect(result).not.toBeNull();
    expect(result!.nextEquation).toBe('5x = 10');
  });

  it('should combine constants "5 + 3 = x" into "8 = x"', () => {
    const result = combineLikeTermInEquation('5 + 3 = x', 'lhs', 0);
    expect(result).not.toBeNull();
    expect(result!.nextEquation).toBe('8 = x');
  });

  it('should return null when no like terms to combine', () => {
    const result = combineLikeTermInEquation('2x + 3y = 10', 'lhs', 0);
    expect(result).toBeNull();
  });

  it('should return null for expression without equals sign', () => {
    const result = combineLikeTermInEquation('2x + 3x', 'lhs', 0);
    expect(result).toBeNull();
  });
});
