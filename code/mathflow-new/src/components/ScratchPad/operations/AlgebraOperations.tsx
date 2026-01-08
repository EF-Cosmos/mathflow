import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Layers,
  SquareEqual,
  Replace,
  Sparkles,
} from 'lucide-react';
import MathRenderer from '../../MathRenderer';

interface AlgebraOperationsProps {
  onApplyAlgebra: (operation: string, transform: (latex: string) => string) => void;
  disabled?: boolean;
  aiAssistEnabled?: boolean;
  onAiAssistChange?: (enabled: boolean) => void;
}

interface AlgebraOperation {
  id: string;
  name: string;
  description: string;
  icon: typeof Maximize2;
  color: string;
  preview: string;
  transform: (latex: string) => string;
  isRealOperation?: boolean; // 是否为需要真实计算的操作（因式分解、展开、化简）
}

// 代数操作定义
const algebraOperations: AlgebraOperation[] = [
  {
    id: 'factor',
    name: '因式分解',
    description: '提取公因子',
    icon: Minimize2,
    color: 'text-emerald-500',
    preview: 'ab + ac = a(b+c)',
    transform: (l) => `\\text{factor}\\left(${l}\\right)`,
    isRealOperation: true,
  },
  {
    id: 'expand',
    name: '展开',
    description: '展开括号',
    icon: Maximize2,
    color: 'text-blue-500',
    preview: '(a+b)^2 = a^2+2ab+b^2',
    transform: (l) => `\\text{expand}\\left(${l}\\right)`,
    isRealOperation: true,
  },
  {
    id: 'simplify',
    name: '化简',
    description: '简化表达式',
    icon: Layers,
    color: 'text-purple-500',
    preview: '\\frac{2x}{4} = \\frac{x}{2}',
    transform: (l) => `\\text{simplify}\\left(${l}\\right)`,
    isRealOperation: true,
  },
  {
    id: 'substitute',
    name: '代入',
    description: '变量替换',
    icon: Replace,
    color: 'text-orange-500',
    preview: 'f(x)|_{x=a}',
    transform: (l) => `\\left.${l}\\right|_{x=a}`,
  },
];

// 指数与对数操作
const expLogOperations: AlgebraOperation[] = [
  {
    id: 'exp',
    name: '指数',
    description: 'e^x',
    icon: SquareEqual,
    color: 'text-rose-500',
    preview: 'e^{f(x)}',
    transform: (l) => `e^{${l}}`,
  },
  {
    id: 'ln',
    name: '自然对数',
    description: 'ln(x)',
    icon: SquareEqual,
    color: 'text-rose-400',
    preview: '\\ln(f(x))',
    transform: (l) => `\\ln\\left(${l}\\right)`,
  },
  {
    id: 'log',
    name: '常用对数',
    description: 'log₁₀(x)',
    icon: SquareEqual,
    color: 'text-rose-300',
    preview: '\\log_{10}(f(x))',
    transform: (l) => `\\log_{10}\\left(${l}\\right)`,
  },
  {
    id: 'log_base',
    name: '对数换底',
    description: 'logₐ(x)',
    icon: SquareEqual,
    color: 'text-rose-200',
    preview: '\\log_a(f(x))',
    transform: (l) => `\\log_a\\left(${l}\\right)`,
  },
];

// 三角函数
const trigOperations: AlgebraOperation[] = [
  {
    id: 'sin',
    name: 'sin',
    description: '正弦',
    icon: SquareEqual,
    color: 'text-sky-500',
    preview: '\\sin(x)',
    transform: (l) => `\\sin\\left(${l}\\right)`,
  },
  {
    id: 'cos',
    name: 'cos',
    description: '余弦',
    icon: SquareEqual,
    color: 'text-sky-400',
    preview: '\\cos(x)',
    transform: (l) => `\\cos\\left(${l}\\right)`,
  },
  {
    id: 'tan',
    name: 'tan',
    description: '正切',
    icon: SquareEqual,
    color: 'text-sky-300',
    preview: '\\tan(x)',
    transform: (l) => `\\tan\\left(${l}\\right)`,
  },
  {
    id: 'arcsin',
    name: 'arcsin',
    description: '反正弦',
    icon: SquareEqual,
    color: 'text-violet-500',
    preview: '\\arcsin(x)',
    transform: (l) => `\\arcsin\\left(${l}\\right)`,
  },
  {
    id: 'arccos',
    name: 'arccos',
    description: '反余弦',
    icon: SquareEqual,
    color: 'text-violet-400',
    preview: '\\arccos(x)',
    transform: (l) => `\\arccos\\left(${l}\\right)`,
  },
  {
    id: 'arctan',
    name: 'arctan',
    description: '反正切',
    icon: SquareEqual,
    color: 'text-violet-300',
    preview: '\\arctan(x)',
    transform: (l) => `\\arctan\\left(${l}\\right)`,
  },
];

// 幂与根
const powerOperations: AlgebraOperation[] = [
  {
    id: 'square',
    name: '平方',
    description: 'x²',
    icon: SquareEqual,
    color: 'text-amber-500',
    preview: '(f(x))^2',
    transform: (l) => `\\left(${l}\\right)^2`,
  },
  {
    id: 'cube',
    name: '立方',
    description: 'x³',
    icon: SquareEqual,
    color: 'text-amber-400',
    preview: '(f(x))^3',
    transform: (l) => `\\left(${l}\\right)^3`,
  },
  {
    id: 'sqrt',
    name: '平方根',
    description: '√x',
    icon: SquareEqual,
    color: 'text-lime-500',
    preview: '\\sqrt{f(x)}',
    transform: (l) => `\\sqrt{${l}}`,
  },
  {
    id: 'cbrt',
    name: '立方根',
    description: '∛x',
    icon: SquareEqual,
    color: 'text-lime-400',
    preview: '\\sqrt[3]{f(x)}',
    transform: (l) => `\\sqrt[3]{${l}}`,
  },
  {
    id: 'reciprocal',
    name: '取倒数',
    description: '1/x',
    icon: SquareEqual,
    color: 'text-teal-500',
    preview: '\\frac{1}{f(x)}',
    transform: (l) => `\\frac{1}{${l}}`,
  },
  {
    id: 'abs',
    name: '绝对值',
    description: '|x|',
    icon: SquareEqual,
    color: 'text-teal-400',
    preview: '|f(x)|',
    transform: (l) => `\\left|${l}\\right|`,
  },
];

const colorBg: Record<string, string> = {
  'text-emerald-500': 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
  'text-blue-500': 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
  'text-purple-500': 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
  'text-orange-500': 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
  'text-rose-500': 'hover:bg-rose-50 dark:hover:bg-rose-900/20',
  'text-rose-400': 'hover:bg-rose-50 dark:hover:bg-rose-900/20',
  'text-rose-300': 'hover:bg-rose-50 dark:hover:bg-rose-900/20',
  'text-rose-200': 'hover:bg-rose-50 dark:hover:bg-rose-900/20',
  'text-sky-500': 'hover:bg-sky-50 dark:hover:bg-sky-900/20',
  'text-sky-400': 'hover:bg-sky-50 dark:hover:bg-sky-900/20',
  'text-sky-300': 'hover:bg-sky-50 dark:hover:bg-sky-900/20',
  'text-violet-500': 'hover:bg-violet-50 dark:hover:bg-violet-900/20',
  'text-violet-400': 'hover:bg-violet-50 dark:hover:bg-violet-900/20',
  'text-violet-300': 'hover:bg-violet-50 dark:hover:bg-violet-900/20',
  'text-amber-500': 'hover:bg-amber-50 dark:hover:bg-amber-900/20',
  'text-amber-400': 'hover:bg-amber-50 dark:hover:bg-amber-900/20',
  'text-lime-500': 'hover:bg-lime-50 dark:hover:bg-lime-900/20',
  'text-lime-400': 'hover:bg-lime-50 dark:hover:bg-lime-900/20',
  'text-teal-500': 'hover:bg-teal-50 dark:hover:bg-teal-900/20',
  'text-teal-400': 'hover:bg-teal-50 dark:hover:bg-teal-900/20',
};

const operationGroups = [
  { id: 'algebra', name: '代数变换', icon: Layers, operations: algebraOperations },
  { id: 'power', name: '幂与根', icon: SquareEqual, operations: powerOperations },
  { id: 'trig', name: '三角函数', icon: SquareEqual, operations: trigOperations },
  { id: 'explog', name: '指数对数', icon: SquareEqual, operations: expLogOperations },
];

export default function AlgebraOperations({
  onApplyAlgebra,
  disabled = false,
  aiAssistEnabled = false,
  onAiAssistChange,
}: AlgebraOperationsProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>('algebra');
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const renderOperationButton = (op: AlgebraOperation) => {
    const bgClass = colorBg[op.color] || 'hover:bg-gray-50 dark:hover:bg-gray-800';
    
    return (
      <button
        key={op.id}
        onClick={() => onApplyAlgebra(op.name, op.transform)}
        onMouseEnter={() => setShowPreview(op.id)}
        onMouseLeave={() => setShowPreview(null)}
        disabled={disabled}
        className={`
          relative flex items-center gap-2 px-3 py-2 rounded-lg
          text-sm transition-all duration-150
          bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          ${bgClass}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <div className="flex-1 text-left">
          <div className={`font-medium ${op.color}`}>{op.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">{op.description}</div>
        </div>
        
        {/* 预览弹出框 */}
        {showPreview === op.id && (
          <div className="absolute left-full ml-2 top-0 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg whitespace-nowrap">
            <div className="text-xs text-gray-500 mb-1">示例:</div>
            <MathRenderer latex={op.preview} displayMode={false} />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-2">
      {/* AI 辅助开关 */}
      <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-2">
          <Sparkles size={16} className="text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              AI 辅助因式分解
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              本地算法失败时使用 AI 处理复杂因式分解
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aiAssistEnabled}
                onChange={(e) => onAiAssistChange?.(e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {aiAssistEnabled ? '已开启' : '已关闭'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {operationGroups.map((group) => {
        const Icon = group.icon;
        const isExpanded = expandedGroup === group.id;

        return (
          <div key={group.id}>
            <button
              onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-gray-500" />
                <span>{group.name}</span>
              </div>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isExpanded && (
              <div className="grid grid-cols-2 gap-2 mt-2 pl-2">
                {group.operations.map(renderOperationButton)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
