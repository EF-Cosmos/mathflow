/**
 * SystemSolveDialog Component
 *
 * Modal dialog for entering 2-3 equations for system solving.
 * Follows the Sheet.tsx pattern for modal overlay behavior (backdrop, escape, scroll lock).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import MathRenderer from '../MathRenderer';

interface SystemSolveDialogProps {
  open: boolean;
  onClose: () => void;
  onSolve: (equations: string[], variables: string[]) => void;
  loading?: boolean;
}

const MAX_EQUATIONS = 3;
const MAX_INPUT_LENGTH = 200;

export default function SystemSolveDialog({
  open,
  onClose,
  onSolve,
  loading = false,
}: SystemSolveDialogProps) {
  const [equations, setEquations] = useState<string[]>(['', '']);
  const [variables, setVariables] = useState('');

  // Auto-detect variables from equation inputs
  const detectVariables = useCallback((eqs: string[]): string => {
    const varSet = new Set<string>();
    for (const eq of eqs) {
      const matches = eq.match(/([a-zA-Z])/g);
      if (matches) {
        for (const m of matches) {
          // Skip common function names
          if (!['l', 'n', 's', 'i', 'e'].includes(m.toLowerCase()) || true) {
            varSet.add(m);
          }
        }
      }
    }
    // Filter out common function/constant names
    const excluded = new Set(['s', 'i', 'n', 'c', 'o', 's', 't', 'a', 'e', 'l', 'p', 'g']);
    const filtered = [...varSet].filter(v => !excluded.has(v.toLowerCase()));
    return filtered.join(', ');
  }, []);

  // Update variables when equations change
  useEffect(() => {
    setVariables(detectVariables(equations));
  }, [equations, detectVariables]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setEquations(['', '']);
      setVariables('');
    }
  }, [open]);

  // Escape key handler
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  const handleEquationChange = (index: number, value: string) => {
    // Enforce max length
    if (value.length > MAX_INPUT_LENGTH) return;

    const newEquations = [...equations];
    newEquations[index] = value;
    setEquations(newEquations);
  };

  const handleAddEquation = () => {
    if (equations.length < MAX_EQUATIONS) {
      setEquations([...equations, '']);
    }
  };

  const handleRemoveEquation = (index: number) => {
    if (equations.length <= 2) return;
    setEquations(equations.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Filter out empty equations
    const validEquations = equations.filter(e => e.trim().length > 0);
    if (validEquations.length < 2) return;

    // Parse variables: split by comma, trim whitespace
    const vars = variables
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);

    if (vars.length < 2) return;

    onSolve(validEquations, vars);
  };

  const allRowsFilled = equations.every(e => e.trim().length > 0);
  const canSubmit = allRowsFilled && variables.split(',').map(v => v.trim()).filter(v => v.length > 0).length >= 2 && !loading;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog panel */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-[560px] w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            方程组求解
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="关闭"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            输入方程组 (每行一个方程)
          </p>

          {/* Equation rows */}
          <div className="space-y-3">
            {equations.map((eq, index) => (
              <div key={index} className="flex items-center gap-3">
                {/* Row number */}
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500 w-6 text-right shrink-0">
                  {index + 1}.
                </span>

                {/* Equation input */}
                <input
                  type="text"
                  value={eq}
                  onChange={(e) => handleEquationChange(index, e.target.value)}
                  placeholder="输入方程 (如 2x + y = 5)"
                  disabled={loading}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 transition-colors"
                />

                {/* KaTeX preview */}
                {eq.trim() && (
                  <div className="flex-1 px-3 py-2 min-h-[38px] flex items-center overflow-x-auto">
                    <MathRenderer latex={eq} className="text-sm" />
                  </div>
                )}

                {/* Remove button (only for 3rd equation) */}
                {equations.length > 2 && (
                  <button
                    onClick={() => handleRemoveEquation(index)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="删除方程"
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {/* Add equation button */}
            {equations.length < MAX_EQUATIONS && (
              <button
                onClick={handleAddEquation}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 disabled:opacity-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加方程
              </button>
            )}
          </div>

          {/* Variables field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              变量 (自动检测, 可编辑)
            </label>
            <input
              type="text"
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              placeholder="x, y"
              disabled={loading}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 rounded-lg flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                求解中...
              </>
            ) : (
              '求解'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
