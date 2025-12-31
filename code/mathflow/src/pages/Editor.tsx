import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase, MathTemplate } from '../lib/supabase';
import MathRenderer from '../components/MathRenderer';
import AIChat from '../components/AIChat';
import OperationPanel from '../components/OperationPanel';
import { 
  ArrowLeft, Save, Undo, Redo, Download, Sun, Moon, MessageSquare, 
  Wrench, Trash2, Edit3, Check, X, Plus
} from 'lucide-react';

interface LocalStep {
  id: string;
  step_number: number;
  input_latex: string;
  output_latex: string;
  operation: string;
  annotation: string;
  is_verified: boolean;
}

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('New Derivation');
  const [steps, setSteps] = useState<LocalStep[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [templates, setTemplates] = useState<MathTemplate[]>([]);
  const [history, setHistory] = useState<LocalStep[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [darkMode, setDarkMode] = useState(false);
  const [rightPanel, setRightPanel] = useState<'operations' | 'ai' | null>('operations');
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [editingLatex, setEditingLatex] = useState('');
  const [saving, setSaving] = useState(false);
  const [derivationId, setDerivationId] = useState<string | null>(id || null);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    loadTemplates();
    if (id) loadDerivation(id);
  }, [id]);

  const loadTemplates = async () => {
    const { data } = await supabase.from('math_templates').select('*');
    if (data) setTemplates(data);
  };

  const loadDerivation = async (derivationId: string) => {
    const [derivationRes, stepsRes] = await Promise.all([
      supabase.from('derivations').select('*').eq('id', derivationId).maybeSingle(),
      supabase.from('derivation_steps').select('*').eq('derivation_id', derivationId).order('step_number')
    ]);

    if (derivationRes.data) {
      setTitle(derivationRes.data.title);
    }

    if (stepsRes.data) {
      const localSteps = stepsRes.data.map(s => ({
        id: s.id,
        step_number: s.step_number,
        input_latex: s.input_latex,
        output_latex: s.output_latex,
        operation: s.operation || '',
        annotation: s.annotation || '',
        is_verified: s.is_verified
      }));
      setSteps(localSteps);
      pushHistory(localSteps);
    }
  };

  const pushHistory = (newSteps: LocalStep[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newSteps]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSteps([...history[historyIndex - 1]]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSteps([...history[historyIndex + 1]]);
    }
  };

  const addStep = (latex: string, operation: string = 'Input') => {
    if (!latex.trim()) return;
    
    const newStep: LocalStep = {
      id: `local-${Date.now()}`,
      step_number: steps.length + 1,
      input_latex: steps.length > 0 ? steps[steps.length - 1].output_latex : '',
      output_latex: latex,
      operation,
      annotation: '',
      is_verified: false
    };

    const newSteps = [...steps, newStep];
    setSteps(newSteps);
    pushHistory(newSteps);
    setCurrentInput('');
    setSelectedOperation(null);
  };

  const updateStep = (stepId: string, latex: string) => {
    const newSteps = steps.map(s => 
      s.id === stepId ? { ...s, output_latex: latex } : s
    );
    setSteps(newSteps);
    pushHistory(newSteps);
    setEditingStep(null);
  };

  const deleteStep = (stepId: string) => {
    const newSteps = steps.filter(s => s.id !== stepId).map((s, i) => ({
      ...s, step_number: i + 1
    }));
    setSteps(newSteps);
    pushHistory(newSteps);
  };

  const applyOperation = (operation: string, transform: (latex: string) => string) => {
    const lastLatex = steps.length > 0 ? steps[steps.length - 1].output_latex : currentInput;
    if (!lastLatex) return;
    
    try {
      const result = transform(lastLatex);
      addStep(result, operation);
    } catch (err) {
      console.error('Operation failed:', err);
    }
  };

  const saveDerivation = async () => {
    if (!user) return;
    setSaving(true);

    try {
      let dId = derivationId;

      if (!dId) {
        const { data } = await supabase
          .from('derivations')
          .insert({ user_id: user.id, title })
          .select()
          .maybeSingle();
        if (data) {
          dId = data.id;
          setDerivationId(dId);
        }
      } else {
        await supabase
          .from('derivations')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', dId);
      }

      if (dId) {
        await supabase.from('derivation_steps').delete().eq('derivation_id', dId);
        
        if (steps.length > 0) {
          const stepsToInsert = steps.map((s, i) => ({
            derivation_id: dId,
            step_number: i + 1,
            input_latex: s.input_latex,
            output_latex: s.output_latex,
            operation: s.operation,
            annotation: s.annotation,
            is_verified: s.is_verified
          }));
          
          await supabase.from('derivation_steps').insert(stepsToInsert);
        }
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const exportDerivation = () => {
    let content = `# ${title}\n\n`;
    steps.forEach((s, i) => {
      content += `## Step ${i + 1}: ${s.operation}\n`;
      content += `$$${s.output_latex}$$\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.md`;
    a.click();
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  const getCurrentFormula = () => steps.length > 0 ? steps[steps.length - 1].output_latex : currentInput;

  const getDerivationHistory = () => steps.map(s => ({ operation: s.operation, latex: s.output_latex }));

  return (
    <div className={`min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Toolbar */}
      <header className="bg-white dark:bg-[#171717] border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 max-w-md px-3 py-1.5 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 text-gray-900 dark:text-white font-medium"
        />

        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30">
            <Undo size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30">
            <Redo size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
          <button onClick={saveDerivation} disabled={saving} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded flex items-center gap-2">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={exportDerivation} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <Download size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button onClick={toggleDarkMode} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            {darkMode ? <Sun size={18} className="text-gray-400" /> : <Moon size={18} className="text-gray-600" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Steps Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {steps.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>Start by entering a mathematical expression below</p>
                </div>
              )}

              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="step-card bg-white dark:bg-[#171717] rounded-lg border border-gray-200 dark:border-gray-800 p-4 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                      Step {index + 1}: {step.operation}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingStep(step.id); setEditingLatex(step.output_latex); }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        <Edit3 size={14} className="text-gray-500" />
                      </button>
                      <button onClick={() => deleteStep(step.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  {editingStep === step.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingLatex}
                        onChange={(e) => setEditingLatex(e.target.value)}
                        className="w-full px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStep(step.id, editingLatex)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded flex items-center gap-1"
                        >
                          <Check size={14} /> Save
                        </button>
                        <button
                          onClick={() => setEditingStep(null)}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded flex items-center gap-1"
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-lg overflow-x-auto py-2">
                      <MathRenderer latex={step.output_latex} displayMode />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white dark:bg-[#171717] border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="max-w-3xl mx-auto">
              {currentInput && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-[#0A0A0A] rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Preview:</div>
                  <MathRenderer latex={currentInput} displayMode />
                </div>
              )}
              
              <div className="flex gap-3">
                <textarea
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.shiftKey) {
                      e.preventDefault();
                      addStep(currentInput, selectedOperation || 'Input');
                    }
                  }}
                  placeholder="Enter LaTeX expression (e.g., x^2 + 2x + 1 = 0)... Press Shift+Enter to add step"
                  className="flex-1 px-4 py-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white resize-none math-input"
                  rows={2}
                />
                <button
                  onClick={() => addStep(currentInput, selectedOperation || 'Input')}
                  disabled={!currentInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Step
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right Panel Toggle */}
        <div className="flex flex-col border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#121212]">
          <button
            onClick={() => setRightPanel(rightPanel === 'operations' ? null : 'operations')}
            className={`p-3 hover:bg-gray-200 dark:hover:bg-gray-800 ${rightPanel === 'operations' ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
          >
            <Wrench size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setRightPanel(rightPanel === 'ai' ? null : 'ai')}
            className={`p-3 hover:bg-gray-200 dark:hover:bg-gray-800 ${rightPanel === 'ai' ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`}
          >
            <MessageSquare size={20} className={rightPanel === 'ai' ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'} />
          </button>
        </div>

        {/* Right Panel Content */}
        {rightPanel && (
          <aside className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#171717] flex flex-col overflow-hidden">
            {rightPanel === 'operations' ? (
              <OperationPanel 
                templates={templates} 
                onApplyOperation={applyOperation}
                onInsertTemplate={(latex) => setCurrentInput(latex)}
              />
            ) : (
              <AIChat
                currentFormula={getCurrentFormula()}
                derivationHistory={getDerivationHistory()}
              />
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
