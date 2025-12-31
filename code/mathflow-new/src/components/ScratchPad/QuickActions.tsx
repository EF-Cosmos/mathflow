import { useState } from 'react';
import {
  MoveHorizontal,
  Combine,
  X,
  Divide,
  Superscript,
  Radical,
  Equal,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { TermAction } from './InteractiveFormula';

interface QuickActionsProps {
  activeAction: TermAction | null;
  onActionChange: (action: TermAction | null) => void;
  onQuickInsert: (latex: string, cursorOffset?: number) => void;
  onApplyBothSides: (operation: 'add' | 'subtract' | 'multiply' | 'divide', value: string) => void;
  disabled?: boolean;
}

const termActions: { action: TermAction; icon: any; label: string; shortcut: string; color: string }[] = [
  { action: 'move', icon: MoveHorizontal, label: '移项', shortcut: 'M', color: 'blue' },
  { action: 'combine', icon: Combine, label: '合并', shortcut: 'C', color: 'green' },
  { action: 'multiply', icon: X, label: '乘法', shortcut: '*', color: 'purple' },
  { action: 'divide', icon: Divide, label: '除法', shortcut: '/', color: 'orange' },
];

const quickSymbols = [
  { label: '+', latex: '+', icon: Plus },
  { label: '−', latex: '-', icon: Minus },
  { label: '=', latex: '=', icon: Equal },
  { label: 'x²', latex: '^{2}', icon: Superscript },
  { label: '√', latex: '\\sqrt{}', cursorOffset: -1, icon: Radical },
];

const colorMap: Record<string, { bg: string; text: string; ring: string; hover: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-400',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-800/40',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    ring: 'ring-green-400',
    hover: 'hover:bg-green-100 dark:hover:bg-green-800/40',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    ring: 'ring-purple-400',
    hover: 'hover:bg-purple-100 dark:hover:bg-purple-800/40',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400',
    ring: 'ring-orange-400',
    hover: 'hover:bg-orange-100 dark:hover:bg-orange-800/40',
  },
};

export default function QuickActions({
  activeAction,
  onActionChange,
  onQuickInsert,
  onApplyBothSides,
  disabled = false,
}: QuickActionsProps) {
  const [showBothSides, setShowBothSides] = useState(false);
  const [bothSidesValue, setBothSidesValue] = useState('');
  const [bothSidesOp, setBothSidesOp] = useState<'add' | 'subtract' | 'multiply' | 'divide'>('add');

  const handleBothSidesApply = () => {
    if (bothSidesValue.trim()) {
      onApplyBothSides(bothSidesOp, bothSidesValue);
      setBothSidesValue('');
      setShowBothSides(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* 项操作 - 核心交互按钮 */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
          项操作 <span className="text-gray-400">(点击公式中的项执行)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {termActions.map(({ action, icon: Icon, label, shortcut, color }) => {
            const isActive = activeAction === action;
            const colors = colorMap[color];
            
            return (
              <button
                key={action}
                onClick={() => onActionChange(isActive ? null : action)}
                disabled={disabled}
                className={`
                  relative flex items-center gap-2 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-all duration-150
                  ${isActive 
                    ? `${colors.bg} ${colors.text} ring-2 ${colors.ring}` 
                    : `bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ${colors.hover} border border-gray-200 dark:border-gray-700`
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <Icon size={18} />
                <span>{label}</span>
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  {shortcut}
                </kbd>
              </button>
            );
          })}
        </div>
      </div>

      {/* 两边同时操作 */}
      <div className="space-y-2">
        <button
          onClick={() => setShowBothSides(!showBothSides)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} />
            <span>两边同时操作</span>
          </div>
          {showBothSides ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showBothSides && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
            <div className="flex gap-2">
              {(['add', 'subtract', 'multiply', 'divide'] as const).map((op) => (
                <button
                  key={op}
                  onClick={() => setBothSidesOp(op)}
                  className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                    bothSidesOp === op
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {{ add: '+', subtract: '−', multiply: '×', divide: '÷' }[op]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={bothSidesValue}
                onChange={(e) => setBothSidesValue(e.target.value)}
                placeholder="输入值..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleBothSidesApply}
                disabled={!bothSidesValue.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                应用
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              将对等式两边同时{
                { add: '加上', subtract: '减去', multiply: '乘以', divide: '除以' }[bothSidesOp]
              }该值
            </div>
          </div>
        )}
      </div>

      {/* 快捷符号 */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
          快捷输入
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickSymbols.map(({ label, latex, cursorOffset }) => (
            <button
              key={label}
              onClick={() => onQuickInsert(latex, cursorOffset)}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => onQuickInsert('\\frac{}{}', -3)}
            className="px-3 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-mono transition-colors"
          >
            a/b
          </button>
          <button
            onClick={() => onQuickInsert('\\left(\\right)', -7)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
          >
            ( )
          </button>
        </div>
        
        {/* 常用变量 */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {['x', 'y', 'z', 'a', 'b', 'n'].map((v) => (
            <button
              key={v}
              onClick={() => onQuickInsert(v)}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm font-mono transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
