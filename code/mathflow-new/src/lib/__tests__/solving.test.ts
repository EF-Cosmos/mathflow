/**
 * Tests for solving API client functions.
 *
 * These test the API client layer in solving.ts:
 * - solveEquation: solve linear, quadratic, fractional equations
 * - solveInequality: solve linear, quadratic inequalities
 * - solveSystem: solve systems of linear equations
 *
 * Uses mocked fetch to avoid needing the backend running.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { solveEquation, solveInequality, solveSystem } from '../solving';

describe('solveEquation', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns SolveEquationResponse on 200', async () => {
    const mockResponse = {
      result: 'x = 2',
      steps: [{ description: '原方程', latex: '2x + 3 = 7' }],
      verified: false,
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200, headers: { 'Content-Type': 'application/json' } })
    ));
    const result = await solveEquation('2x + 3 = 7');
    expect(result).not.toBeNull();
    expect(result?.result).toBe('x = 2');
    expect(result?.steps).toHaveLength(1);
    expect(result?.steps[0].description).toBe('原方程');
  });

  it('returns null on API error (400)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(null, { status: 400 })
    ));
    const result = await solveEquation('invalid');
    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const result = await solveEquation('2x + 3 = 7');
    expect(result).toBeNull();
  });

  it('calls correct endpoint /api/solve/equation with POST', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: 'x = 2', steps: [], verified: false }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    vi.stubGlobal('fetch', fetchSpy);
    await solveEquation('2x + 3 = 7');
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/solve/equation'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('sends correct request body with latex field', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: 'x = 2', steps: [], verified: false }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    vi.stubGlobal('fetch', fetchSpy);
    await solveEquation('2x + 3 = 7');
    const callArgs = fetchSpy.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body).toEqual({ latex: '2x + 3 = 7' });
  });

  it('returns null on non-OK response (500)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(null, { status: 500 })
    ));
    const result = await solveEquation('2x + 3 = 7');
    expect(result).toBeNull();
  });
});

describe('solveInequality', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns SolveInequalityResponse with intervals on 200', async () => {
    const mockResponse = {
      result: 'x > 2',
      steps: [{ description: '原不等式', latex: '2x + 3 > 7' }],
      intervals: [{ lower: 2.0, upper: null, lower_strict: true, upper_strict: true }],
      verified: false,
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200, headers: { 'Content-Type': 'application/json' } })
    ));
    const result = await solveInequality('2x + 3 > 7');
    expect(result).not.toBeNull();
    expect(result?.result).toBe('x > 2');
    expect(result?.intervals).toHaveLength(1);
    expect(result?.intervals[0].lower).toBe(2.0);
    expect(result?.intervals[0].upper).toBeNull();
  });

  it('returns null on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const result = await solveInequality('2x + 3 > 7');
    expect(result).toBeNull();
  });

  it('calls correct endpoint /api/solve/inequality with POST', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: 'x > 2', steps: [], intervals: [], verified: false }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    vi.stubGlobal('fetch', fetchSpy);
    await solveInequality('2x + 3 > 7');
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/solve/inequality'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('returns null on API error (400)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(null, { status: 400 })
    ));
    const result = await solveInequality('invalid');
    expect(result).toBeNull();
  });
});

describe('solveSystem', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns SolveSystemResponse on 200', async () => {
    const mockResponse = {
      result: 'x = 2, y = 1',
      steps: [{ description: '方程 1', latex: '2x + y = 5' }],
      verified: false,
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200, headers: { 'Content-Type': 'application/json' } })
    ));
    const result = await solveSystem(['2x + y = 5', 'x - y = 1'], ['x', 'y']);
    expect(result).not.toBeNull();
    expect(result?.result).toContain('x = 2');
    expect(result?.steps).toHaveLength(1);
  });

  it('returns null on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const result = await solveSystem(['2x + y = 5'], ['x', 'y']);
    expect(result).toBeNull();
  });

  it('calls correct endpoint /api/solve/system with equations and variables', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: 'x = 2, y = 1', steps: [], verified: false }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    vi.stubGlobal('fetch', fetchSpy);
    await solveSystem(['2x + y = 5', 'x - y = 1'], ['x', 'y']);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/solve/system'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ equations: ['2x + y = 5', 'x - y = 1'], variables: ['x', 'y'] }),
      })
    );
  });

  it('returns null on API error (400)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(null, { status: 400 })
    ));
    const result = await solveSystem(['invalid'], ['x']);
    expect(result).toBeNull();
  });
});
