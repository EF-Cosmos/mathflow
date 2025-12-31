import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface BothSidesOperationProps {
  onApplyBothSides: (operation: 'add' | 'subtract' | 'multiply' | 'divide', value: string) => void;
  disabled?: boolean;
}

const operations = [
  { key: 'add' as const, symbol: '+', label: '加上' },
  { key: 'subtract' as const, symbol: '−', label: '减去' },
  { key: 'multiply' as const, symbol: '×', label: '乘以' },
  { key: 'divide' as const, symbol: '÷', label: '除以' },
];

export default function BothSidesOperation({
  onApplyBothSides,
  disabled = false,
}: BothSidesOperationProps) {
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

  const currentOpLabel = operations.find(op => op.key === bothSidesOp)?.label || '加上';

  return (
    <div className="space-y-2">
      <button
        onClick={() => setShowBothSides(!showBothSides)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
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
            {operations.map((op) => (
              <button
                key={op.key}
                onClick={() => setBothSidesOp(op.key)}
                className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                  bothSidesOp === op.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {op.symbol}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={bothSidesValue}
              onChange={(e) => setBothSidesValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBothSidesApply()}
              placeholder="输入值 (如: 2, x, 3y)..."
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
            将对等式两边同时{currentOpLabel}该值
          </div>
        </div>
      )}
    </div>
  );
}
