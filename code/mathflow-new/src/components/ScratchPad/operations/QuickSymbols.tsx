import { useState } from 'react';
import { ChevronDown, ChevronUp, Hash, Pi, Keyboard } from 'lucide-react';

interface QuickSymbolsProps {
  onQuickInsert: (latex: string, cursorOffset?: number) => void;
  disabled?: boolean;
}

interface SymbolGroup {
  id: string;
  name: string;
  icon: typeof Hash;
  symbols: { label: string; latex: string; cursorOffset?: number }[];
}

const symbolGroups: SymbolGroup[] = [
  {
    id: 'basic',
    name: '基础符号',
    icon: Hash,
    symbols: [
      { label: '+', latex: '+' },
      { label: '−', latex: '-' },
      { label: '×', latex: '\\times' },
      { label: '÷', latex: '\\div' },
      { label: '=', latex: '=' },
      { label: '≠', latex: '\\neq' },
      { label: '±', latex: '\\pm' },
      { label: '∓', latex: '\\mp' },
    ],
  },
  {
    id: 'comparison',
    name: '比较符号',
    icon: Hash,
    symbols: [
      { label: '<', latex: '<' },
      { label: '>', latex: '>' },
      { label: '≤', latex: '\\leq' },
      { label: '≥', latex: '\\geq' },
      { label: '≪', latex: '\\ll' },
      { label: '≫', latex: '\\gg' },
      { label: '≈', latex: '\\approx' },
      { label: '≡', latex: '\\equiv' },
    ],
  },
  {
    id: 'greek',
    name: '希腊字母',
    icon: Pi,
    symbols: [
      { label: 'α', latex: '\\alpha' },
      { label: 'β', latex: '\\beta' },
      { label: 'γ', latex: '\\gamma' },
      { label: 'δ', latex: '\\delta' },
      { label: 'ε', latex: '\\epsilon' },
      { label: 'θ', latex: '\\theta' },
      { label: 'λ', latex: '\\lambda' },
      { label: 'μ', latex: '\\mu' },
      { label: 'π', latex: '\\pi' },
      { label: 'σ', latex: '\\sigma' },
      { label: 'φ', latex: '\\phi' },
      { label: 'ω', latex: '\\omega' },
      { label: 'Δ', latex: '\\Delta' },
      { label: 'Σ', latex: '\\Sigma' },
      { label: 'Π', latex: '\\Pi' },
      { label: 'Ω', latex: '\\Omega' },
    ],
  },
  {
    id: 'structure',
    name: '结构符号',
    icon: Keyboard,
    symbols: [
      { label: '分数', latex: '\\frac{}{}', cursorOffset: -3 },
      { label: '根号', latex: '\\sqrt{}', cursorOffset: -1 },
      { label: 'n次根', latex: '\\sqrt[n]{}', cursorOffset: -1 },
      { label: '上标', latex: '^{}', cursorOffset: -1 },
      { label: '下标', latex: '_{}', cursorOffset: -1 },
      { label: '括号', latex: '\\left(\\right)', cursorOffset: -7 },
      { label: '方括号', latex: '\\left[\\right]', cursorOffset: -7 },
      { label: '大括号', latex: '\\left\\{\\right\\}', cursorOffset: -8 },
    ],
  },
  {
    id: 'calculus',
    name: '微积分符号',
    icon: Hash,
    symbols: [
      { label: '∂', latex: '\\partial' },
      { label: '∇', latex: '\\nabla' },
      { label: '∞', latex: '\\infty' },
      { label: 'd', latex: 'dx' },
      { label: '∫', latex: '\\int' },
      { label: '∬', latex: '\\iint' },
      { label: '∮', latex: '\\oint' },
      { label: 'lim', latex: '\\lim_{}', cursorOffset: -1 },
    ],
  },
  {
    id: 'sets',
    name: '集合符号',
    icon: Hash,
    symbols: [
      { label: '∈', latex: '\\in' },
      { label: '∉', latex: '\\notin' },
      { label: '⊂', latex: '\\subset' },
      { label: '⊃', latex: '\\supset' },
      { label: '∪', latex: '\\cup' },
      { label: '∩', latex: '\\cap' },
      { label: '∅', latex: '\\emptyset' },
      { label: '∀', latex: '\\forall' },
      { label: '∃', latex: '\\exists' },
      { label: 'ℝ', latex: '\\mathbb{R}' },
      { label: 'ℤ', latex: '\\mathbb{Z}' },
      { label: 'ℕ', latex: '\\mathbb{N}' },
    ],
  },
  {
    id: 'arrows',
    name: '箭头符号',
    icon: Hash,
    symbols: [
      { label: '→', latex: '\\rightarrow' },
      { label: '←', latex: '\\leftarrow' },
      { label: '↔', latex: '\\leftrightarrow' },
      { label: '⇒', latex: '\\Rightarrow' },
      { label: '⇐', latex: '\\Leftarrow' },
      { label: '⇔', latex: '\\Leftrightarrow' },
      { label: '↦', latex: '\\mapsto' },
      { label: '↗', latex: '\\nearrow' },
    ],
  },
];

const commonVariables = ['x', 'y', 'z', 'a', 'b', 'c', 'n', 'm', 'i', 'j', 'k', 't'];

export default function QuickSymbols({
  onQuickInsert,
  disabled = false,
}: QuickSymbolsProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>('basic');

  return (
    <div className="space-y-2">
      {/* 常用变量 */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
          常用变量
        </div>
        <div className="flex flex-wrap gap-1.5">
          {commonVariables.map((v) => (
            <button
              key={v}
              onClick={() => onQuickInsert(v)}
              disabled={disabled}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm font-mono transition-colors disabled:opacity-50"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* 分类符号 */}
      <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
        {symbolGroups.map((group) => {
          const Icon = group.icon;
          const isExpanded = expandedGroup === group.id;

          return (
            <div key={group.id}>
              <button
                onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} />
                  <span>{group.name}</span>
                </div>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {isExpanded && (
                <div className="flex flex-wrap gap-1.5 mt-1 mb-2 pl-2">
                  {group.symbols.map(({ label, latex, cursorOffset }) => (
                    <button
                      key={label}
                      onClick={() => onQuickInsert(latex, cursorOffset)}
                      disabled={disabled}
                      title={latex}
                      className="min-w-[2.5rem] h-9 px-2 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
