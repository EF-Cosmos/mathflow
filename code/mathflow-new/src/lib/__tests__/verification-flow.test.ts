import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyResult, VerifiedResult } from '../factorization';

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
});

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
});
