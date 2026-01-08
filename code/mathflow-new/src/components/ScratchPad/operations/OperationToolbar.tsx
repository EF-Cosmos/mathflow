import { useState } from 'react';
import { 
  Calculator, 
  Sigma, 
  Hash, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FunctionSquare,
} from 'lucide-react';
import TermOperations from './TermOperations';
import BothSidesOperation from './BothSidesOperation';
import CalculusOperations from './CalculusOperations';
import AlgebraOperations from './AlgebraOperations';
import QuickSymbols from './QuickSymbols';
import { TermAction } from '../InteractiveFormula';

interface OperationToolbarProps {
  activeAction: TermAction | null;
  onActionChange: (action: TermAction | null) => void;
  onQuickInsert: (latex: string, cursorOffset?: number) => void;
  onApplyBothSides: (operation: 'add' | 'subtract' | 'multiply' | 'divide', value: string) => void;
  onApplyCalculus: (operation: string, transform: (latex: string) => string) => void;
  onCalculateCalculus?: (operation: string) => void;
  disabled?: boolean;
  className?: string;
  aiAssistEnabled?: boolean;
  onAiAssistChange?: (enabled: boolean) => void;
}

type TabType = 'algebra' | 'functions' | 'calculus' | 'symbols';

const tabs: { id: TabType; icon: typeof Calculator; label: string }[] = [
  { id: 'algebra', icon: Calculator, label: '代数' },
  { id: 'functions', icon: FunctionSquare, label: '函数' },
  { id: 'calculus', icon: Sigma, label: '微积分' },
  { id: 'symbols', icon: Hash, label: '符号' },
];

export default function OperationToolbar({
  activeAction,
  onActionChange,
  onQuickInsert,
  onApplyBothSides,
  onApplyCalculus,
  onCalculateCalculus,
  disabled = false,
  className = '',
  aiAssistEnabled = false,
  onAiAssistChange,
}: OperationToolbarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('algebra');
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className={`flex flex-col items-center py-2 ${className}`}>
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="展开工具栏"
        >
          <ChevronRight size={20} className="text-gray-500" />
        </button>
        <div className="mt-4 space-y-2">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setCollapsed(false);
              }}
              title={label}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-1">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          title="折叠工具栏"
        >
          <ChevronLeft size={16} className="text-gray-400" />
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'algebra' && (
          <div className="space-y-4">
            <TermOperations
              activeAction={activeAction}
              onActionChange={onActionChange}
              disabled={disabled}
            />
            <BothSidesOperation
              onApplyBothSides={onApplyBothSides}
              disabled={disabled}
            />
          </div>
        )}

        {activeTab === 'functions' && (
          <AlgebraOperations
            onApplyAlgebra={onApplyCalculus}
            disabled={disabled}
            aiAssistEnabled={aiAssistEnabled}
            onAiAssistChange={onAiAssistChange}
          />
        )}

        {activeTab === 'calculus' && (
          <CalculusOperations
            onApplyCalculus={onApplyCalculus}
            onCalculateCalculus={onCalculateCalculus || (() => {})}
            disabled={disabled}
          />
        )}

        {activeTab === 'symbols' && (
          <QuickSymbols
            onQuickInsert={onQuickInsert}
            disabled={disabled}
          />
        )}
      </div>

      {/* 当前状态提示 */}
      {activeAction && (
        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Sparkles size={14} />
            <span>
              当前模式: <strong>{
                { move: '移项', combine: '合并', multiply: '乘法', divide: '除法' }[activeAction]
              }</strong>
            </span>
            <button
              onClick={() => onActionChange(null)}
              className="ml-auto text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-800/50 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
