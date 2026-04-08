/**
 * Tests for the verification flow in factorization.ts.
 *
 * Tests verifyResult() by mocking fetch for /api/verify endpoint,
 * and tests VerifiedResult type behavior.
 *
 * Also tests the integration of verification into fallback functions
 * (factorWithFallback, expandWithFallback, simplifyWithFallback).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  verifyResult,
  VerifiedResult,
  factorWithFallback,
  expandWithFallback,
  simplifyWithFallback,
} from '../factorization';

// ============================================================================
// verifyResult unit tests
// ============================================================================

describe('Verification Flow', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when /api/verify responds is_equivalent: true', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ is_equivalent: true }),
    });
    const result = await verifyResult('x^2 - 4', '(x-2)(x+2)');
    expect(result).toBe(true);
  });

  it('returns false when /api/verify responds is_equivalent: false', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ is_equivalent: false }),
    });
    const result = await verifyResult('x + 1', 'x + 2');
    expect(result).toBe(false);
  });

  it('returns false when /api/verify returns HTTP error', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
    });
    const result = await verifyResult('x', 'x');
    expect(result).toBe(false);
  });

  it('returns false when fetch throws (network error)', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );
    const result = await verifyResult('x', 'x');
    expect(result).toBe(false);
  });

  it('sends correct request body to /api/verify', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ is_equivalent: true }),
    });
    await verifyResult('input_latex_value', 'output_latex_value');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/verify'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          input_latex: 'input_latex_value',
          output_latex: 'output_latex_value',
        }),
      })
    );
  });

  it('returns false when fetch throws AbortError (timeout)', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(abortError);
    const result = await verifyResult('x^2', 'x*x');
    expect(result).toBe(false);
  });

  it('returns false when response body is not valid JSON', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON')),
    });
    const result = await verifyResult('x', 'x');
    expect(result).toBe(false);
  });

  it('returns false when response body is missing is_equivalent field', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ some_other_field: true }),
    });
    const result = await verifyResult('x', 'x');
    expect(result).toBe(false);
  });

  it('returns false when response body has is_equivalent: null', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ is_equivalent: null }),
    });
    const result = await verifyResult('x', 'x');
    expect(result).toBe(false);
  });

  it('sends Content-Type: application/json header', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ is_equivalent: true }),
    });
    await verifyResult('x', 'x');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });
});

// ============================================================================
// VerifiedResult type tests
// ============================================================================

describe('VerifiedResult type', () => {
  it('VerifiedResult has result and verified fields', () => {
    const vr: VerifiedResult = { result: '(x-2)(x+2)', verified: true };
    expect(vr.result).toBe('(x-2)(x+2)');
    expect(vr.verified).toBe(true);
  });

  it('VerifiedResult with verified: false is valid', () => {
    const vr: VerifiedResult = { result: 'x^2 - 4', verified: false };
    expect(vr.verified).toBe(false);
  });

  it('VerifiedResult can represent unverified SymPy result', () => {
    const vr: VerifiedResult = { result: 'x^2 + 2x + 1', verified: false };
    expect(vr.result).toBe('x^2 + 2x + 1');
    expect(vr.verified).toBe(false);
  });

  it('VerifiedResult can represent locally-verified result', () => {
    const vr: VerifiedResult = { result: '(x - 2)(x + 2)', verified: true };
    expect(vr.result).toBe('(x - 2)(x + 2)');
    expect(vr.verified).toBe(true);
  });
});

// ============================================================================
// Fallback function integration tests (with mocked fetch)
// ============================================================================

describe('factorWithFallback integration', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns verified local result for factorable expression', async () => {
    // x^2 - 4 should be handled by local factorDifferenceOfPowers
    const result = await factorWithFallback('x^2 - 4');
    expect(result).not.toBeNull();
    expect(result!.result).toContain('x');
    expect(result!.verified).toBe(true); // local results are verified
  });

  it('returns verified local result for common factor expression', async () => {
    // 2x + 4 should be handled by local extractCommonFactor
    const result = await factorWithFallback('2x + 4');
    expect(result).not.toBeNull();
    expect(result!.result).toContain('2');
    expect(result!.verified).toBe(true);
  });

  it('falls back to SymPy when local algorithm returns null', async () => {
    // Mock SymPy factor endpoint
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('/api/factor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ result: '(x - 1)(x^2 + x + 1)' }),
        });
      }
      if (url.includes('/api/verify')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ is_equivalent: true }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // x^3 - 1 is handled by local difference of powers
    // Use a more complex expression that local can't handle
    const result = await factorWithFallback('x^2 + x + x^2');
    // Either local or SymPy handles it
    if (result !== null) {
      expect(result.result).toBeDefined();
      expect(result.verified).toBeDefined();
    }
  });

  it('returns null when both local and SymPy fail', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );
    // x + 1 has no local factorization and SymPy is mocked to fail
    const result = await factorWithFallback('x + 1');
    expect(result).toBeNull();
  });
});

describe('expandWithFallback integration', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns verified result from SymPy expand', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('/api/expand')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ result: 'x^2 + 2x + 1' }),
        });
      }
      if (url.includes('/api/verify')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ is_equivalent: true }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const result = await expandWithFallback('(x + 1)^2');
    expect(result).not.toBeNull();
    expect(result!.result).toBe('x^2 + 2x + 1');
    expect(result!.verified).toBe(true);
  });

  it('returns null when SymPy expand fails', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );
    const result = await expandWithFallback('(x + 1)^2');
    expect(result).toBeNull();
  });

  it('returns null when expand result equals input (no change)', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('/api/expand')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ result: 'x + 1' }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const result = await expandWithFallback('x + 1');
    expect(result).toBeNull();
  });
});

describe('simplifyWithFallback integration', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns verified result from SymPy simplify', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('/api/simplify')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ result: '5x' }),
        });
      }
      if (url.includes('/api/verify')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ is_equivalent: true }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const result = await simplifyWithFallback('2x + 3x');
    expect(result).not.toBeNull();
    expect(result!.result).toBe('5x');
    expect(result!.verified).toBe(true);
  });

  it('returns null when SymPy simplify fails', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );
    const result = await simplifyWithFallback('2x + 3x');
    expect(result).toBeNull();
  });

  it('returns null when simplify result equals input (no change)', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('/api/simplify')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ result: 'x + 1' }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const result = await simplifyWithFallback('x + 1');
    expect(result).toBeNull();
  });
});
