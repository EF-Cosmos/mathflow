import { useState } from 'react';
import InteractiveFormula, { TermAction, ActionHint } from './InteractiveFormula';
import MathRenderer from '../MathRenderer';
import { ParsedTerm } from '../../lib/equation';
import { 
  ChevronDown, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Copy, 
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export interface DerivationStep {
  id: string;
  stepNumber: number;
  latex: string;
  operation: string;
  annotation?: string;
  timestamp: number;
}

interface StepCardProps {
  step: DerivationStep;
  isLast: boolean;
  isExpanded?: boolean;
  activeAction: TermAction | null;
  onTermAction?: (action: TermAction, side: 'lhs' | 'rhs', termIndex: number, term: ParsedTerm) => void;
  onEdit?: (stepId: string, newLatex: string) => void;
  onDelete?: (stepId: string) => void;
  onUseAsBase?: (stepId: string) => void;
  onToggleExpand?: () => void;
}

const operationLabels: Record<string, { label: string; color: string; icon?: string }> = {
  'Input': { label: '输入', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  'Move Term': { label: '移项', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  'Combine Like Terms': { label: '合并同类项', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  'Multiply': { label: '乘法', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  'Divide': { label: '除法', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  'Both Sides Add': { label: '两边加', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
  'Both Sides Subtract': { label: '两边减', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
  'Both Sides Multiply': { label: '两边乘', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
  'Both Sides Divide': { label: '两边除', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
  'Simplify': { label: '化简', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
};

export default function StepCard({
  step,
  isLast,
  isExpanded = false,
  activeAction,
  onTermAction,
  onEdit,
  onDelete,
  onUseAsBase,
  onToggleExpand,
}: StepCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(step.latex);
  const [copied, setCopied] = useState(false);

  const opInfo = operationLabels[step.operation] || { label: step.operation, color: 'bg-gray-100 text-gray-700' };

  const handleSaveEdit = () => {
    if (editValue.trim() && onEdit) {
      onEdit(step.id, editValue);
    }
    setIsEditing(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(step.latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTermAction = (action: TermAction, side: 'lhs' | 'rhs', termIndex: number, term: ParsedTerm) => {
    if (onTermAction && isLast) {
      onTermAction(action, side, termIndex, term);
    }
  };

  return (
    <div className={`
      relative group
      ${isLast 
        ? 'bg-white dark:bg-[#1a1a1a] border-2 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-500/10' 
        : 'bg-white/80 dark:bg-[#171717]/80 border border-gray-200 dark:border-gray-800'
      }
      rounded-xl transition-all duration-200
      ${!isLast && 'hover:bg-white dark:hover:bg-[#1a1a1a] hover:shadow-md'}
    `}>
      {/* 连接线 */}
      {!isLast && (
        <div className="absolute left-1/2 -bottom-4 w-px h-4 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-700" />
      )}

      {/* 步骤头部 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleExpand}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            {isExpanded ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronRight size={16} className="text-gray-400" />
            )}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">
              #{step.stepNumber}
            </span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${opInfo.color}`}>
              {opInfo.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isLast && onUseAsBase && (
            <button
              onClick={() => onUseAsBase(step.id)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-blue-600"
              title="从这里继续推导"
            >
              <RotateCcw size={14} />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-gray-700"
            title="复制 LaTeX"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
          <button
            onClick={() => {
              setEditValue(step.latex);
              setIsEditing(true);
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-gray-700"
            title="编辑"
          >
            <Edit3 size={14} />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(step.id)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-red-600"
              title="删除"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 公式内容 */}
      <div className="px-4 py-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 font-mono text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1"
              >
                <Check size={14} /> 保存
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 主公式显示 */}
            <div className="overflow-x-auto py-2 flex justify-center">
              {isLast && activeAction ? (
                <InteractiveFormula
                  latex={step.latex}
                  activeAction={activeAction}
                  onTermAction={handleTermAction}
                  size="lg"
                />
              ) : (
                <MathRenderer latex={step.latex} displayMode className="text-xl" />
              )}
            </div>

            {/* 最后一步的操作提示 */}
            {isLast && activeAction && (
              <ActionHint action={activeAction} />
            )}

            {/* 展开时显示的详细信息 */}
            {isExpanded && step.annotation && (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg">
                {step.annotation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 最后一步的高亮指示 */}
      {isLast && (
        <div className="absolute -top-2 -right-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full shadow-lg">
            <Sparkles size={12} />
            当前
          </div>
        </div>
      )}
    </div>
  );
}
