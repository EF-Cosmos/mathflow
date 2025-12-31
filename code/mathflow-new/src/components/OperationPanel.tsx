import { useState } from 'react';
import { MathTemplate } from '../lib/supabase';
import MathRenderer from './MathRenderer';
import { ChevronDown, ChevronRight, Calculator, Sigma, Grid3X3, Percent, BookOpen } from 'lucide-react';

interface OperationPanelProps {
  templates: MathTemplate[];
  onApplyOperation: (operation: string, transform: (latex: string) => string) => void;
  onInsertTemplate: (latex: string) => void;
  interactionMode?: 'none' | 'move' | 'combine';
  onChangeInteractionMode?: (mode: 'none' | 'move' | 'combine') => void;
  interactionLog?: Array<{ id: string; label: string; nextEquation?: string }>;
}

interface Operation {
  name: string;
  description: string;
  transform: (latex: string) => string;
}

const operations: Record<string, Operation[]> = {
  'Basic Algebra': [
    { name: 'Move Term', description: 'Move term to other side', transform: (l) => l.replace(/\+\s*(\w+)\s*=/, '= -$1 +').replace(/-\s*(\w+)\s*=/, '= +$1 -') },
    { name: 'Combine Like Terms', description: 'Combine similar terms', transform: (l) => l },
    { name: 'Factor', description: 'Factor expression', transform: (l) => l },
    { name: 'Expand', description: 'Expand expression', transform: (l) => l },
    { name: 'Simplify', description: 'Simplify expression', transform: (l) => l },
  ],
  'Calculus': [
    { name: 'Differentiate', description: 'd/dx', transform: (l) => `\\frac{d}{dx}\\left(${l}\\right)` },
    { name: 'Integrate', description: 'Indefinite integral', transform: (l) => `\\int ${l} \\, dx` },
    { name: 'Definite Integral', description: 'Definite integral', transform: (l) => `\\int_a^b ${l} \\, dx` },
    { name: 'Limit', description: 'Take limit', transform: (l) => `\\lim_{x \\to a} ${l}` },
    { name: 'Partial Derivative', description: 'Partial derivative', transform: (l) => `\\frac{\\partial}{\\partial x}\\left(${l}\\right)` },
  ],
  'Linear Algebra': [
    { name: 'Transpose', description: 'Matrix transpose', transform: (l) => `\\left(${l}\\right)^T` },
    { name: 'Inverse', description: 'Matrix inverse', transform: (l) => `\\left(${l}\\right)^{-1}` },
    { name: 'Determinant', description: 'Calculate determinant', transform: (l) => `\\det\\left(${l}\\right)` },
    { name: 'Trace', description: 'Matrix trace', transform: (l) => `\\text{tr}\\left(${l}\\right)` },
  ],
  'Trigonometry': [
    { name: 'Sin', description: 'Apply sine', transform: (l) => `\\sin\\left(${l}\\right)` },
    { name: 'Cos', description: 'Apply cosine', transform: (l) => `\\cos\\left(${l}\\right)` },
    { name: 'Tan', description: 'Apply tangent', transform: (l) => `\\tan\\left(${l}\\right)` },
  ],
};

const categoryIcons: Record<string, any> = {
  'Basic Algebra': Calculator,
  'Calculus': Sigma,
  'Linear Algebra': Grid3X3,
  'Trigonometry': Percent,
};

export default function OperationPanel({ templates, onApplyOperation, onInsertTemplate, interactionMode = 'none', onChangeInteractionMode, interactionLog = [] }: OperationPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Basic Algebra');
  const [activeTab, setActiveTab] = useState<'operations' | 'templates'>('operations');

  const groupedTemplates = templates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, MathTemplate[]>);

  const categoryNames: Record<string, string> = {
    calculus: 'Calculus',
    linear_algebra: 'Linear Algebra',
    probability: 'Probability',
    algebra: 'Algebra'
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('operations')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium ${
            activeTab === 'operations'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Operations
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium ${
            activeTab === 'templates'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Templates
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'operations' ? (
          <div className="p-2">
            <div className="mb-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#171717]">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">交互模式</div>
              <div className="flex gap-2">
                <button
                  onClick={() => onChangeInteractionMode?.('move')}
                  className={`flex-1 px-3 py-2 text-xs rounded ${interactionMode === 'move' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                >
                  移项
                </button>
                <button
                  onClick={() => onChangeInteractionMode?.('combine')}
                  className={`flex-1 px-3 py-2 text-xs rounded ${interactionMode === 'combine' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                >
                  合并
                </button>
                <button
                  onClick={() => onChangeInteractionMode?.('none')}
                  className={`px-3 py-2 text-xs rounded ${interactionMode === 'none' ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                  title="关闭交互"
                >
                  关
                </button>
              </div>
              <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                选择模式后，点击草稿纸等式中的“项”即可执行。
              </div>

              {interactionLog.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">最近记录</div>
                  <div className="space-y-2">
                    {interactionLog.slice(0, 6).map((item) => (
                      <div key={item.id} className="text-[11px] text-gray-600 dark:text-gray-300">
                        <div>{item.label}</div>
                        {item.nextEquation && (
                          <div className="overflow-x-auto whitespace-nowrap text-gray-500 dark:text-gray-400">
                            <MathRenderer latex={item.nextEquation} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {Object.entries(operations).map(([category, ops]) => {
              const Icon = categoryIcons[category] || Calculator;
              const isExpanded = expandedCategory === category;

              return (
                <div key={category} className="mb-1">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <Icon size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</span>
                  </button>

                  {isExpanded && (
                    <div className="ml-6 space-y-1 mt-1">
                      {ops.map((op) => (
                        <button
                          key={op.name}
                          onClick={() => onApplyOperation(op.name, op.transform)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded group"
                        >
                          <div className="text-sm text-gray-800 dark:text-gray-200">{op.name}</div>
                          <div className="text-xs text-gray-500">{op.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groupedTemplates).map(([category, temps]) => (
              <div key={category} className="mb-4">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                  <BookOpen size={14} />
                  {categoryNames[category] || category}
                </div>
                <div className="space-y-1">
                  {temps.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onInsertTemplate(t.latex_template)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      <div className="text-sm text-gray-800 dark:text-gray-200 mb-1">{t.name}</div>
                      <div className="bg-gray-50 dark:bg-[#0A0A0A] p-2 rounded text-xs overflow-x-auto">
                        <MathRenderer latex={t.latex_template} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
