import { useState, useRef, useCallback, useEffect } from 'react';
import StepCard, { DerivationStep } from './StepCard';
import { OperationToolbar } from './operations';
import { TermAction } from './InteractiveFormula';
import MathRenderer from '../MathRenderer';
import {
  moveTermInEquation,
  combineLikeTermInEquation,
  multiplyTermInEquation,
  splitEquation,
  splitTerms,
  formatTerms,
  ParsedTerm
} from '../../lib/equation';
import { factorEquation, factorWithFallback, expandWithFallback, simplifyWithFallback } from '../../lib/factorization';
import { 
  Plus, 
  Sparkles, 
  Keyboard, 
  History,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RotateCcw
} from 'lucide-react';

interface ScratchPadProps {
  initialSteps?: DerivationStep[];
  onStepsChange?: (steps: DerivationStep[]) => void;
  onSave?: () => void;
}

interface PendingMultiplyOperation {
  side: 'lhs' | 'rhs';
  termIndex: number;
  term: ParsedTerm;
}

export default function ScratchPad({
  initialSteps = [],
  onStepsChange,
}: ScratchPadProps) {
  const [steps, setSteps] = useState<DerivationStep[]>(initialSteps);
  const [currentInput, setCurrentInput] = useState('');
  const [activeAction, setActiveAction] = useState<TermAction | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<DerivationStep[][]>([initialSteps]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [pendingMultiply, setPendingMultiply] = useState<PendingMultiplyOperation | null>(null);
  const [multiplyValue, setMultiplyValue] = useState('');
  const [aiAssistEnabled, setAiAssistEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 监听 initialSteps 变化，同步外部数据
  useEffect(() => {
    // 只有当外部传入的步骤与当前不一致时才更新，避免循环更新
    // 这里简单判断长度，或者可以做更深层的比较
    if (initialSteps.length > 0 && JSON.stringify(initialSteps) !== JSON.stringify(steps)) {
      setSteps(initialSteps);
      setHistory([initialSteps]);
      setHistoryIndex(0);
    }
  }, [initialSteps]);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps]);

  // 通知父组件
  useEffect(() => {
    onStepsChange?.(steps);
  }, [steps, onStepsChange]);

  // 获取当前公式（最后一步或输入框）
  const getCurrentLatex = useCallback(() => {
    if (currentInput.trim()) return currentInput;
    if (steps.length > 0) return steps[steps.length - 1].latex;
    return '';
  }, [currentInput, steps]);

  // 推入历史
  const pushHistory = useCallback((newSteps: DerivationStep[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newSteps]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // 撤销
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSteps([...history[historyIndex - 1]]);
    }
  }, [historyIndex, history]);

  // 重做
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSteps([...history[historyIndex + 1]]);
    }
  }, [historyIndex, history]);

  // 添加步骤
  const addStep = useCallback((latex: string, operation: string = 'Input') => {
    if (!latex.trim()) return;

    const newStep: DerivationStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      stepNumber: steps.length + 1,
      latex: latex.trim(),
      operation,
      timestamp: Date.now(),
    };

    const newSteps = [...steps, newStep];
    setSteps(newSteps);
    pushHistory(newSteps);
    setCurrentInput('');
    setActiveAction(null);
  }, [steps, pushHistory]);

  // 编辑步骤
  const editStep = useCallback((stepId: string, newLatex: string) => {
    const newSteps = steps.map(s => 
      s.id === stepId ? { ...s, latex: newLatex } : s
    );
    setSteps(newSteps);
    pushHistory(newSteps);
  }, [steps, pushHistory]);

  // 删除步骤
  const deleteStep = useCallback((stepId: string) => {
    const newSteps = steps
      .filter(s => s.id !== stepId)
      .map((s, i) => ({ ...s, stepNumber: i + 1 }));
    setSteps(newSteps);
    pushHistory(newSteps);
  }, [steps, pushHistory]);

  // 从某步继续推导
  const useStepAsBase = useCallback((stepId: string) => {
    const index = steps.findIndex(s => s.id === stepId);
    if (index >= 0) {
      const newSteps = steps.slice(0, index + 1);
      setSteps(newSteps);
      pushHistory(newSteps);
    }
  }, [steps, pushHistory]);

  // 清空所有
  const clearAll = useCallback(() => {
    setSteps([]);
    pushHistory([]);
    setCurrentInput('');
    setActiveAction(null);
  }, [pushHistory]);

  // 处理项操作
  const handleTermAction = useCallback((
    action: TermAction,
    side: 'lhs' | 'rhs',
    termIndex: number,
    term: ParsedTerm
  ) => {
    const baseLatex = getCurrentLatex();
    if (!baseLatex) return;

    let result: { nextEquation: string } | null = null;
    let operationName = '';

    switch (action) {
      case 'move': {
        result = moveTermInEquation(baseLatex, side, termIndex);
        operationName = 'Move Term';
        break;
      }
      case 'combine': {
        result = combineLikeTermInEquation(baseLatex, side, termIndex);
        operationName = 'Combine Like Terms';
        break;
      }
      case 'multiply': {
        // 乘法操作：设置待乘状态，等待用户输入乘数
        setPendingMultiply({ side, termIndex, term });
        setMultiplyValue('');
        setActiveAction(null);
        return; // 直接返回，不执行操作
      }
    }

    if (result) {
      addStep(result.nextEquation, operationName);
    }
  }, [getCurrentLatex, addStep]);

  // 执行乘法操作
  const executeMultiply = useCallback(() => {
    if (!pendingMultiply || !multiplyValue.trim()) return;

    const baseLatex = getCurrentLatex();
    if (!baseLatex) return;

    const result = multiplyTermInEquation(
      baseLatex,
      pendingMultiply.side,
      pendingMultiply.termIndex,
      multiplyValue
    );

    if (result) {
      addStep(result.nextEquation, 'Multiply Term');
    }

    // 重置状态
    setPendingMultiply(null);
    setMultiplyValue('');
  }, [pendingMultiply, multiplyValue, getCurrentLatex, addStep]);

  // 取消乘法操作
  const cancelMultiply = useCallback(() => {
    setPendingMultiply(null);
    setMultiplyValue('');
  }, []);

  // 两边同时操作
  const handleBothSidesOperation = useCallback((
    operation: 'add' | 'subtract' | 'multiply' | 'divide',
    value: string
  ) => {
    const baseLatex = getCurrentLatex();
    if (!baseLatex || !value.trim()) return;

    const eq = splitEquation(baseLatex);
    if (!eq.hasEquals) return;

    let newLhs = '';
    let newRhs = '';
    const opNames = {
      add: 'Both Sides Add',
      subtract: 'Both Sides Subtract',
      multiply: 'Both Sides Multiply',
      divide: 'Both Sides Divide',
    };

    switch (operation) {
      case 'add':
        newLhs = `${eq.lhs} + ${value}`;
        newRhs = `${eq.rhs} + ${value}`;
        break;
      case 'subtract':
        newLhs = `${eq.lhs} - ${value}`;
        newRhs = `${eq.rhs} - ${value}`;
        break;
      case 'multiply':
        newLhs = `\\left(${eq.lhs}\\right) \\cdot ${value}`;
        newRhs = `\\left(${eq.rhs}\\right) \\cdot ${value}`;
        break;
      case 'divide':
        newLhs = `\\frac{${eq.lhs}}{${value}}`;
        newRhs = `\\frac{${eq.rhs}}{${value}}`;
        break;
    }

    addStep(`${newLhs} = ${newRhs}`, opNames[operation]);
  }, [getCurrentLatex, addStep]);

  // 微积分操作
  const handleCalculusOperation = useCallback(async (
    operationName: string,
    transform: (latex: string) => string
  ) => {
    const baseLatex = getCurrentLatex();
    if (!baseLatex) return;

    // 特殊处理因式分解
    if (operationName === '因式分解') {
      // 1. 尝试本地 + SymPy（快速回退）
      const fallbackResult = await factorWithFallback(baseLatex);
      if (fallbackResult) {
        addStep(fallbackResult, operationName);
        return;
      }

      // 2. 本地+SymPy 都失败，尝试 AI 辅助
      if (aiAssistEnabled) {
        const apiKey = localStorage.getItem('ai_api_key');
        const baseUrl = localStorage.getItem('ai_base_url') || 'https://api.deepseek.com';
        const model = localStorage.getItem('ai_model') || 'deepseek-chat';

        if (!apiKey) {
          addStep(baseLatex, '因式分解 (无法处理)');
          return;
        }

        setAiLoading(true);
        try {
          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: model,
              messages: [{
                role: 'system',
                content: '你是一个数学因式分解助手。对用户给出的数学表达式进行因式分解，只返回因式分解后的 LaTeX 表达式，不要其他解释文字。使用标准的 LaTeX 格式。'
              }, {
                role: 'user',
                content: baseLatex
              }],
              stream: false,
              temperature: 0.2,
              max_tokens: 500,
            }),
          });

          if (!response.ok) {
            throw new Error(`AI 请求失败: ${response.status}`);
          }

          const data = await response.json();
          const aiResult = data.choices?.[0]?.message?.content?.trim() || '';

          if (aiResult && aiResult !== baseLatex) {
            addStep(aiResult, 'AI 因式分解');
          } else {
            addStep(baseLatex, '因式分解 (无法处理)');
          }
        } catch (error) {
          console.error('AI factorization error:', error);
          addStep(baseLatex, '因式分解 (AI 失败)');
        } finally {
          setAiLoading(false);
        }
      } else {
        addStep(baseLatex, '因式分解 (无法处理)');
      }
      return;
    }

    // 特殊处理展开（优先使用 SymPy）
    if (operationName === '展开') {
      const expandResult = await expandWithFallback(baseLatex);
      if (expandResult) {
        addStep(expandResult, operationName);
        return;
      }

      // SymPy 失败，尝试 AI 辅助
      if (aiAssistEnabled) {
        const apiKey = localStorage.getItem('ai_api_key');
        const baseUrl = localStorage.getItem('ai_base_url') || 'https://api.deepseek.com';
        const model = localStorage.getItem('ai_model') || 'deepseek-chat';

        if (!apiKey) {
          addStep(baseLatex, '展开 (无法处理)');
          return;
        }

        setAiLoading(true);
        try {
          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: model,
              messages: [{
                role: 'system',
                content: '你是一个数学展开助手。对用户给出的数学表达式进行展开，只返回展开后的 LaTeX 表达式，不要其他解释文字。使用标准的 LaTeX 格式。'
              }, {
                role: 'user',
                content: baseLatex
              }],
              stream: false,
              temperature: 0.2,
              max_tokens: 500,
            }),
          });

          if (!response.ok) {
            throw new Error(`AI 请求失败: ${response.status}`);
          }

          const data = await response.json();
          const aiResult = data.choices?.[0]?.message?.content?.trim() || '';

          if (aiResult && aiResult !== baseLatex) {
            addStep(aiResult, 'AI 展开');
          } else {
            addStep(baseLatex, '展开 (无法处理)');
          }
        } catch (error) {
          console.error('AI expand error:', error);
          addStep(baseLatex, '展开 (AI 失败)');
        } finally {
          setAiLoading(false);
        }
      } else {
        addStep(baseLatex, '展开 (无法处理)');
      }
      return;
    }

    // 特殊处理化简（优先使用 SymPy）
    if (operationName === '化简') {
      const simplifyResult = await simplifyWithFallback(baseLatex);
      if (simplifyResult) {
        addStep(simplifyResult, operationName);
        return;
      }

      // SymPy 失败，尝试 AI 辅助
      if (aiAssistEnabled) {
        const apiKey = localStorage.getItem('ai_api_key');
        const baseUrl = localStorage.getItem('ai_base_url') || 'https://api.deepseek.com';
        const model = localStorage.getItem('ai_model') || 'deepseek-chat';

        if (!apiKey) {
          addStep(baseLatex, '化简 (无法处理)');
          return;
        }

        setAiLoading(true);
        try {
          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: model,
              messages: [{
                role: 'system',
                content: '你是一个数学化简助手。对用户给出的数学表达式进行化简，只返回化简后的 LaTeX 表达式，不要其他解释文字。使用标准的 LaTeX 格式。'
              }, {
                role: 'user',
                content: baseLatex
              }],
              stream: false,
              temperature: 0.2,
              max_tokens: 500,
            }),
          });

          if (!response.ok) {
            throw new Error(`AI 请求失败: ${response.status}`);
          }

          const data = await response.json();
          const aiResult = data.choices?.[0]?.message?.content?.trim() || '';

          if (aiResult && aiResult !== baseLatex) {
            addStep(aiResult, 'AI 化简');
          } else {
            addStep(baseLatex, '化简 (无法处理)');
          }
        } catch (error) {
          console.error('AI simplify error:', error);
          addStep(baseLatex, '化简 (AI 失败)');
        } finally {
          setAiLoading(false);
        }
      } else {
        addStep(baseLatex, '化简 (无法处理)');
      }
      return;
    }

    // 判断是否为等式
    const eq = splitEquation(baseLatex);
    let result: string;

    if (eq.hasEquals) {
      // 对等式两边同时操作
      result = `${transform(eq.lhs)} = ${transform(eq.rhs)}`;
    } else {
      // 对单个表达式操作
      result = transform(baseLatex);
    }

    addStep(result, operationName);
  }, [getCurrentLatex, addStep, aiAssistEnabled]);

  // 插入快捷符号
  const insertAtCursor = useCallback((text: string, cursorOffset: number = 0) => {
    const el = inputRef.current;
    if (!el) {
      setCurrentInput(prev => prev + text);
      return;
    }

    const start = el.selectionStart ?? currentInput.length;
    const end = el.selectionEnd ?? currentInput.length;
    const next = currentInput.slice(0, start) + text + currentInput.slice(end);
    setCurrentInput(next);

    requestAnimationFrame(() => {
      el.focus();
      const pos = Math.max(0, start + text.length + cursorOffset);
      el.setSelectionRange(pos, pos);
    });
  }, [currentInput]);

  // 切换步骤展开
  const toggleStepExpand = useCallback((stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl/Cmd + Shift + Z 重做
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // M 移项模式
      if (e.key === 'm' && !e.ctrlKey && !e.metaKey && document.activeElement !== inputRef.current) {
        setActiveAction(prev => prev === 'move' ? null : 'move');
      }
      // C 合并模式
      if (e.key === 'c' && !e.ctrlKey && !e.metaKey && document.activeElement !== inputRef.current) {
        setActiveAction(prev => prev === 'combine' ? null : 'combine');
      }
      // * 乘法模式
      if (e.key === '*' && !e.ctrlKey && !e.metaKey && document.activeElement !== inputRef.current) {
        setActiveAction(prev => prev === 'multiply' ? null : 'multiply');
      }
      // Escape 取消当前操作
      if (e.key === 'Escape') {
        setActiveAction(null);
        if (pendingMultiply) {
          cancelMultiply();
        }
      }
      // Enter 执行乘法
      if (e.key === 'Enter' && pendingMultiply && !e.shiftKey) {
        e.preventDefault();
        executeMultiply();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, pendingMultiply, cancelMultiply, executeMultiply]);

  return (
    <div className="flex h-full bg-gray-50 dark:bg-[#0a0a0a]">
      {/* 主草稿区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-[#171717] border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30 transition-colors"
              title="撤销 (Ctrl+Z)"
            >
              <RotateCcw size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30 transition-colors"
              title="重做 (Ctrl+Shift+Z)"
            >
              <RotateCcw size={18} className="text-gray-600 dark:text-gray-400 transform scale-x-[-1]" />
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <button
              onClick={clearAll}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
              title="清空草稿"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <History size={16} />
            <span>{steps.length} 步</span>
          </div>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {showSidebar ? (
              <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* 步骤列表 - 草稿纸主体 */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            {steps.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-4">
                  <Sparkles size={28} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  开始你的数学推导
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  在下方输入公式，然后通过点击公式中的项来执行移项、合并等操作
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Keyboard size={14} />
                  <span>按 M 移项 | C 合并 | * 乘法 | Esc 取消</span>
                </div>
              </div>
            ) : (
              steps.map((step, index) => (
                <StepCard
                  key={step.id}
                  step={step}
                  isLast={index === steps.length - 1}
                  isExpanded={expandedSteps.has(step.id)}
                  activeAction={activeAction}
                  onTermAction={handleTermAction}
                  onEdit={editStep}
                  onDelete={deleteStep}
                  onUseAsBase={useStepAsBase}
                  onToggleExpand={() => toggleStepExpand(step.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* 底部输入区 */}
        <div className="sticky bottom-0 bg-white dark:bg-[#171717] border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="max-w-2xl mx-auto">
            {/* 乘法输入提示 */}
            {pendingMultiply && (
              <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 animate-fade-in">
                <div className="text-xs text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-1">
                  <span className="font-medium">乘法操作</span>
                  <span>·</span>
                  <span>
                    选中项: {pendingMultiply.term.sign === '-' ? '-' : ''}{pendingMultiply.term.latex}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={multiplyValue}
                    onChange={(e) => setMultiplyValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        executeMultiply();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelMultiply();
                      }
                    }}
                    placeholder="输入乘数 (如: 2, x, 3y)..."
                    className="flex-1 px-3 py-2 text-sm border border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={executeMultiply}
                    disabled={!multiplyValue.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 dark:disabled:bg-purple-900 text-white text-sm rounded-lg transition-colors"
                  >
                    确定
                  </button>
                  <button
                    onClick={cancelMultiply}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    取消
                  </button>
                </div>
                <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                  Enter 确认 · Esc 取消
                </div>
              </div>
            )}

            {/* 实时预览 */}
            {currentInput && (
              <div className="mb-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <Sparkles size={12} />
                  预览
                </div>
                <div className="overflow-x-auto">
                  <MathRenderer latex={currentInput} displayMode className="inline-block" />
                </div>
              </div>
            )}

            {/* 输入框 */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey)) {
                      e.preventDefault();
                      addStep(currentInput, 'Input');
                    }
                  }}
                  placeholder="输入 LaTeX 公式 (例如: x^2 + 2x + 1 = 0)"
                  className="w-full px-4 py-3 pr-24 font-mono text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows={2}
                />
                <div className="absolute right-2 bottom-2 text-xs text-gray-400">
                  Shift+Enter
                </div>
              </div>
              <button
                onClick={() => addStep(currentInput, 'Input')}
                disabled={!currentInput.trim()}
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-800 text-white rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-500/20 disabled:shadow-none transition-all"
              >
                <Plus size={20} />
                添加
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧工具面板 */}
      {showSidebar && (
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#171717] flex flex-col overflow-hidden">
          <OperationToolbar
            activeAction={activeAction}
            onActionChange={setActiveAction}
            onQuickInsert={insertAtCursor}
            onApplyBothSides={handleBothSidesOperation}
            onApplyCalculus={handleCalculusOperation}
            disabled={steps.length === 0 && !currentInput.trim()}
            aiAssistEnabled={aiAssistEnabled}
            onAiAssistChange={setAiAssistEnabled}
          />
        </div>
      )}
    </div>
  );
}
