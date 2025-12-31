import { useMemo, useState } from 'react';
import katex from 'katex';
import { splitEquation, splitTerms, ParsedTerm, getTermTypeKey, findLikeTerms } from '../../lib/equation';
import { MoveHorizontal, Combine, Divide, X } from 'lucide-react';

export type TermAction = 'move' | 'combine' | 'multiply' | 'divide' | 'factor';

interface InteractiveFormulaProps {
  latex: string;
  onTermAction?: (action: TermAction, side: 'lhs' | 'rhs', termIndex: number, term: ParsedTerm) => void;
  activeAction?: TermAction | null;
  isInteractive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
};

export default function InteractiveFormula({
  latex,
  onTermAction,
  activeAction = null,
  isInteractive = true,
  size = 'md',
}: InteractiveFormulaProps) {
  const [hoveredTerm, setHoveredTerm] = useState<{ side: 'lhs' | 'rhs'; index: number } | null>(null);

  const parsed = useMemo(() => {
    const eq = splitEquation(latex);
    return {
      ...eq,
      lhsTerms: splitTerms(eq.lhs),
      rhsTerms: splitTerms(eq.rhs),
    };
  }, [latex]);

  // 计算当前 hover 时的同类项索引
  const likeTermIndices = useMemo(() => {
    if (!hoveredTerm || activeAction !== 'combine') return { lhs: [], rhs: [] };
    
    const terms = hoveredTerm.side === 'lhs' ? parsed.lhsTerms : parsed.rhsTerms;
    const indices = findLikeTerms(terms, hoveredTerm.index);
    
    return {
      lhs: hoveredTerm.side === 'lhs' ? indices : [],
      rhs: hoveredTerm.side === 'rhs' ? indices : [],
    };
  }, [hoveredTerm, activeAction, parsed.lhsTerms, parsed.rhsTerms]);

  // 检查某项是否有同类项可以合并
  const hasLikeTerms = useMemo(() => {
    if (activeAction !== 'combine') return { lhs: new Set<number>(), rhs: new Set<number>() };
    
    const checkSide = (terms: ParsedTerm[]) => {
      const result = new Set<number>();
      const typeCount = new Map<string, number>();
      
      // 计算每种类型的数量
      terms.forEach(term => {
        const key = getTermTypeKey(term.latex);
        typeCount.set(key, (typeCount.get(key) || 0) + 1);
      });
      
      // 标记有同类项的索引
      terms.forEach((term, idx) => {
        const key = getTermTypeKey(term.latex);
        if ((typeCount.get(key) || 0) > 1) {
          result.add(idx);
        }
      });
      
      return result;
    };
    
    return {
      lhs: checkSide(parsed.lhsTerms),
      rhs: checkSide(parsed.rhsTerms),
    };
  }, [activeAction, parsed.lhsTerms, parsed.rhsTerms]);

  const renderKatex = (tex: string) => {
    try {
      return katex.renderToString(tex, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return tex;
    }
  };

  const handleTermClick = (side: 'lhs' | 'rhs', index: number, term: ParsedTerm) => {
    if (!isInteractive || !activeAction || !onTermAction) return;
    
    // 合并模式下，检查是否有同类项
    if (activeAction === 'combine') {
      const canCombine = side === 'lhs' ? hasLikeTerms.lhs.has(index) : hasLikeTerms.rhs.has(index);
      if (!canCombine) return; // 没有同类项，不执行操作
    }
    
    onTermAction(activeAction, side, index, term);
  };

  const getTermClassName = (side: 'lhs' | 'rhs', index: number, terms: ParsedTerm[]) => {
    const isHovered = hoveredTerm?.side === side && hoveredTerm?.index === index;
    const isLikeTerm = (side === 'lhs' ? likeTermIndices.lhs : likeTermIndices.rhs).includes(index);
    const canCombine = side === 'lhs' ? hasLikeTerms.lhs.has(index) : hasLikeTerms.rhs.has(index);
    
    const baseClass = 'inline-flex items-center transition-all duration-150 rounded-md';
    
    if (!isInteractive || !activeAction) {
      return `${baseClass} ${sizeClasses[size]}`;
    }

    const actionColors: Record<TermAction, string> = {
      move: 'hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300',
      combine: canCombine 
        ? 'hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-700 dark:hover:text-green-300' 
        : 'opacity-50 cursor-not-allowed',
      multiply: 'hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-700 dark:hover:text-purple-300',
      divide: 'hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:text-orange-700 dark:hover:text-orange-300',
      factor: 'hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-700 dark:hover:text-pink-300',
    };

    const activeColors: Record<TermAction, string> = {
      move: 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-400',
      combine: 'bg-green-100 dark:bg-green-900/40 ring-2 ring-green-400',
      multiply: 'bg-purple-100 dark:bg-purple-900/40 ring-2 ring-purple-400',
      divide: 'bg-orange-100 dark:bg-orange-900/40 ring-2 ring-orange-400',
      factor: 'bg-pink-100 dark:bg-pink-900/40 ring-2 ring-pink-400',
    };

    // 合并模式下高亮同类项
    let highlightClass = '';
    if (activeAction === 'combine' && isLikeTerm && !isHovered) {
      highlightClass = 'bg-green-50 dark:bg-green-900/20 ring-1 ring-green-300 dark:ring-green-700';
    }

    const cursorClass = activeAction === 'combine' && !canCombine ? '' : 'cursor-pointer';

    return `${baseClass} ${sizeClasses[size]} ${cursorClass} px-1.5 py-0.5 ${actionColors[activeAction]} ${isHovered ? activeColors[activeAction] : highlightClass}`;
  };

  const renderTerms = (terms: ParsedTerm[], side: 'lhs' | 'rhs') => {
    if (terms.length === 0) {
      return <span className="text-gray-400">0</span>;
    }

    return terms.map((term, index) => (
      <span
        key={`${side}-${index}`}
        className={getTermClassName(side, index, terms)}
        onClick={() => handleTermClick(side, index, term)}
        onMouseEnter={() => setHoveredTerm({ side, index })}
        onMouseLeave={() => setHoveredTerm(null)}
      >
        {index > 0 && (
          <span className="mx-1 text-gray-500">
            {term.sign === '+' ? '+' : '−'}
          </span>
        )}
        {index === 0 && term.sign === '-' && (
          <span className="mr-0.5 text-gray-500">−</span>
        )}
        <span
          dangerouslySetInnerHTML={{ __html: renderKatex(term.latex) }}
        />
      </span>
    ));
  };

  // 如果不是等式，直接渲染
  if (!parsed.hasEquals) {
    return (
      <div className={`inline-flex items-center ${sizeClasses[size]}`}>
        <span dangerouslySetInnerHTML={{ __html: renderKatex(latex) }} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center flex-wrap gap-1 ${sizeClasses[size]}`}>
      <div className="inline-flex items-center flex-wrap">
        {renderTerms(parsed.lhsTerms, 'lhs')}
      </div>
      <span className="mx-2 text-gray-600 dark:text-gray-400 font-medium">=</span>
      <div className="inline-flex items-center flex-wrap">
        {renderTerms(parsed.rhsTerms, 'rhs')}
      </div>
    </div>
  );
}

// 操作提示组件
export function ActionHint({ action }: { action: TermAction | null }) {
  if (!action) return null;

  const hints: Record<TermAction, { icon: any; text: string; color: string }> = {
    move: { icon: MoveHorizontal, text: '点击要移到等号另一边的项', color: 'text-blue-600' },
    combine: { icon: Combine, text: '点击任意一个同类项，将自动合并所有同类项（高亮显示可合并的项）', color: 'text-green-600' },
    multiply: { icon: X, text: '点击要乘以系数的项', color: 'text-purple-600' },
    divide: { icon: Divide, text: '点击要除以系数的项', color: 'text-orange-600' },
    factor: { icon: Combine, text: '点击要提取公因式的项', color: 'text-pink-600' },
  };

  const hint = hints[action];
  const Icon = hint.icon;

  return (
    <div className={`flex items-center gap-2 text-sm ${hint.color} bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg`}>
      <Icon size={16} />
      <span>{hint.text}</span>
    </div>
  );
}
