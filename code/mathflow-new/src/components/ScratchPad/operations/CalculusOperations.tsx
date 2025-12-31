import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingUp,
  Sigma,
  Infinity,
  ArrowRight,
} from 'lucide-react';
import MathRenderer from '../../MathRenderer';

interface CalculusOperationsProps {
  onApplyCalculus: (operation: string, transform: (latex: string) => string) => void;
  disabled?: boolean;
}

interface CalculusOperation {
  id: string;
  name: string;
  description: string;
  icon: typeof TrendingUp;
  color: string;
  preview: string;
  transform: (latex: string) => string;
  hasOptions?: boolean;
}

// 微积分操作定义
const calculusOperations: CalculusOperation[] = [
  {
    id: 'differentiate',
    name: '求导',
    description: 'd/dx',
    icon: TrendingUp,
    color: 'text-red-500',
    preview: '\\frac{d}{dx}f(x)',
    transform: (l) => `\\frac{d}{dx}\\left(${l}\\right)`,
  },
  {
    id: 'partial',
    name: '偏导',
    description: '∂/∂x',
    icon: TrendingUp,
    color: 'text-red-400',
    preview: '\\frac{\\partial}{\\partial x}f',
    transform: (l) => `\\frac{\\partial}{\\partial x}\\left(${l}\\right)`,
  },
  {
    id: 'integrate',
    name: '不定积分',
    description: '∫ dx',
    icon: Sigma,
    color: 'text-blue-500',
    preview: '\\int f(x)\\,dx',
    transform: (l) => `\\int ${l} \\, dx`,
  },
  {
    id: 'definite',
    name: '定积分',
    description: '∫ₐᵇ dx',
    icon: Sigma,
    color: 'text-blue-400',
    preview: '\\int_a^b f(x)\\,dx',
    transform: (l) => `\\int_a^b ${l} \\, dx`,
    hasOptions: true,
  },
  {
    id: 'limit',
    name: '极限',
    description: 'lim',
    icon: Infinity,
    color: 'text-purple-500',
    preview: '\\lim_{x \\to a} f(x)',
    transform: (l) => `\\lim_{x \\to a} ${l}`,
    hasOptions: true,
  },
  {
    id: 'limit_inf',
    name: '无穷极限',
    description: 'x→∞',
    icon: Infinity,
    color: 'text-purple-400',
    preview: '\\lim_{x \\to \\infty} f(x)',
    transform: (l) => `\\lim_{x \\to \\infty} ${l}`,
  },
  {
    id: 'sum',
    name: '求和',
    description: 'Σ',
    icon: Sigma,
    color: 'text-green-500',
    preview: '\\sum_{i=1}^{n} a_i',
    transform: (l) => `\\sum_{i=1}^{n} ${l}`,
    hasOptions: true,
  },
  {
    id: 'product',
    name: '求积',
    description: 'Π',
    icon: Sigma,
    color: 'text-green-400',
    preview: '\\prod_{i=1}^{n} a_i',
    transform: (l) => `\\prod_{i=1}^{n} ${l}`,
  },
];

// 高级微积分操作
const advancedCalculusOperations: CalculusOperation[] = [
  {
    id: 'taylor',
    name: 'Taylor展开',
    description: '泰勒级数',
    icon: ArrowRight,
    color: 'text-amber-500',
    preview: '\\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n',
    transform: (l) => `\\sum_{n=0}^{\\infty} \\frac{1}{n!}\\left.\\frac{d^n}{dx^n}\\left(${l}\\right)\\right|_{x=a}(x-a)^n`,
  },
  {
    id: 'gradient',
    name: '梯度',
    description: '∇f',
    icon: ArrowRight,
    color: 'text-cyan-500',
    preview: '\\nabla f',
    transform: (l) => `\\nabla\\left(${l}\\right)`,
  },
  {
    id: 'divergence',
    name: '散度',
    description: '∇·F',
    icon: ArrowRight,
    color: 'text-cyan-400',
    preview: '\\nabla \\cdot \\mathbf{F}',
    transform: (l) => `\\nabla \\cdot \\left(${l}\\right)`,
  },
  {
    id: 'curl',
    name: '旋度',
    description: '∇×F',
    icon: ArrowRight,
    color: 'text-cyan-300',
    preview: '\\nabla \\times \\mathbf{F}',
    transform: (l) => `\\nabla \\times \\left(${l}\\right)`,
  },
  {
    id: 'laplacian',
    name: '拉普拉斯',
    description: '∇²f',
    icon: ArrowRight,
    color: 'text-teal-500',
    preview: '\\nabla^2 f',
    transform: (l) => `\\nabla^2\\left(${l}\\right)`,
  },
  {
    id: 'double_integral',
    name: '二重积分',
    description: '∬ dA',
    icon: Sigma,
    color: 'text-indigo-500',
    preview: '\\iint_D f\\,dA',
    transform: (l) => `\\iint_D ${l} \\, dA`,
  },
  {
    id: 'triple_integral',
    name: '三重积分',
    description: '∭ dV',
    icon: Sigma,
    color: 'text-indigo-400',
    preview: '\\iiint_V f\\,dV',
    transform: (l) => `\\iiint_V ${l} \\, dV`,
  },
  {
    id: 'line_integral',
    name: '线积分',
    description: '∮ ds',
    icon: Sigma,
    color: 'text-pink-500',
    preview: '\\oint_C f\\,ds',
    transform: (l) => `\\oint_C ${l} \\, ds`,
  },
];

const colorBg: Record<string, string> = {
  'text-red-500': 'hover:bg-red-50 dark:hover:bg-red-900/20',
  'text-red-400': 'hover:bg-red-50 dark:hover:bg-red-900/20',
  'text-blue-500': 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
  'text-blue-400': 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
  'text-purple-500': 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
  'text-purple-400': 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
  'text-green-500': 'hover:bg-green-50 dark:hover:bg-green-900/20',
  'text-green-400': 'hover:bg-green-50 dark:hover:bg-green-900/20',
  'text-amber-500': 'hover:bg-amber-50 dark:hover:bg-amber-900/20',
  'text-cyan-500': 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20',
  'text-cyan-400': 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20',
  'text-cyan-300': 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20',
  'text-teal-500': 'hover:bg-teal-50 dark:hover:bg-teal-900/20',
  'text-indigo-500': 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
  'text-indigo-400': 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
  'text-pink-500': 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
};

export default function CalculusOperations({
  onApplyCalculus,
  disabled = false,
}: CalculusOperationsProps) {
  const [expandedSection, setExpandedSection] = useState<'basic' | 'advanced' | null>('basic');
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const renderOperationButton = (op: CalculusOperation) => {
    const Icon = op.icon;
    const bgClass = colorBg[op.color] || 'hover:bg-gray-50 dark:hover:bg-gray-800';
    
    return (
      <button
        key={op.id}
        onClick={() => onApplyCalculus(op.name, op.transform)}
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
        <Icon size={16} className={op.color} />
        <div className="flex-1 text-left">
          <div className="font-medium text-gray-700 dark:text-gray-300">{op.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-500">{op.description}</div>
        </div>
        
        {/* 预览弹出框 */}
        {showPreview === op.id && (
          <div className="absolute left-full ml-2 top-0 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg whitespace-nowrap">
            <div className="text-xs text-gray-500 mb-1">预览:</div>
            <MathRenderer latex={op.preview} displayMode={false} />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-2">
      {/* 基础微积分 */}
      <div>
        <button
          onClick={() => setExpandedSection(expandedSection === 'basic' ? null : 'basic')}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sigma size={16} className="text-blue-500" />
            <span>基础微积分</span>
          </div>
          {expandedSection === 'basic' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expandedSection === 'basic' && (
          <div className="grid grid-cols-2 gap-2 mt-2 pl-2">
            {calculusOperations.map(renderOperationButton)}
          </div>
        )}
      </div>

      {/* 高级微积分 */}
      <div>
        <button
          onClick={() => setExpandedSection(expandedSection === 'advanced' ? null : 'advanced')}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-500" />
            <span>向量微积分 & 高级</span>
          </div>
          {expandedSection === 'advanced' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expandedSection === 'advanced' && (
          <div className="grid grid-cols-2 gap-2 mt-2 pl-2">
            {advancedCalculusOperations.map(renderOperationButton)}
          </div>
        )}
      </div>
    </div>
  );
}
