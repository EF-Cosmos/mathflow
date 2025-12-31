import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { ScratchPad, DerivationStep } from '../components/ScratchPad';
import AIChat from '../components/AIChat';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Sun, 
  Moon, 
  MessageSquare,
  PanelRightClose,
  Home,
  FileText,
  GripVertical
} from 'lucide-react';

export default function ScratchPadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('新推导');
  const [steps, setSteps] = useState<DerivationStep[]>([]);
  const [derivationId, setDerivationId] = useState<string | null>(id || null);
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiPanelWidth, setAiPanelWidth] = useState(() => {
    const saved = localStorage.getItem('ai_panel_width');
    return saved ? parseInt(saved) : 360;
  });
  const [isResizing, setIsResizing] = useState(false);
  
  const resizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    if (id) loadDerivation(id);
  }, [id]);

  // 处理拖拽调整宽度
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.min(Math.max(newWidth, 280), 600);
      setAiPanelWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        localStorage.setItem('ai_panel_width', aiPanelWidth.toString());
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, aiPanelWidth]);

  const loadDerivation = async (derivationId: string) => {
    const [derivationRes, stepsRes] = await Promise.all([
      supabase.from('derivations').select('*').eq('id', derivationId).maybeSingle(),
      supabase.from('derivation_steps').select('*').eq('derivation_id', derivationId).order('step_number')
    ]);

    if (derivationRes.data) {
      setTitle(derivationRes.data.title);
    }

    if (stepsRes.data) {
      const localSteps: DerivationStep[] = stepsRes.data.map(s => ({
        id: s.id,
        stepNumber: s.step_number,
        latex: s.output_latex,
        operation: s.operation || 'Input',
        annotation: s.annotation || '',
        timestamp: new Date(s.created_at).getTime(),
      }));
      setSteps(localSteps);
    }
  };

  const saveDerivation = async () => {
    if (!user) return;
    setSaving(true);

    try {
      let dId = derivationId;

      if (!dId) {
        const { data, error } = await supabase
          .from('derivations')
          .insert({ user_id: user.id, title })
          .select()
          .maybeSingle();
        
        if (error) {
          console.error('Failed to create derivation:', error);
          throw error;
        }

        if (data) {
          dId = data.id;
          setDerivationId(dId);
        }
      } else {
        const { error } = await supabase
          .from('derivations')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', dId);
        
        if (error) {
          console.error('Failed to update derivation:', error);
          throw error;
        }
      }

      if (dId) {
        const { error: deleteError } = await supabase.from('derivation_steps').delete().eq('derivation_id', dId);
        if (deleteError) {
          console.error('Failed to delete old steps:', deleteError);
          throw deleteError;
        }
        
        if (steps.length > 0) {
          const stepsToInsert = steps.map((s, i) => ({
            derivation_id: dId!,
            step_number: i + 1,
            input_latex: i > 0 ? steps[i - 1].latex : '',
            output_latex: s.latex,
            operation: s.operation,
            annotation: s.annotation || '',
            is_verified: false
          }));
          
          const { error: insertError } = await supabase.from('derivation_steps').insert(stepsToInsert);
          if (insertError) {
            console.error('Failed to insert new steps:', insertError);
            throw insertError;
          }
        }
      }
      alert('保存成功！');
    } catch (err: any) {
      console.error('Save failed:', err);
      alert(`保存失败: ${err.message || '未知错误'}`);
    } finally {
      setSaving(false);
    }
  };

  const exportDerivation = () => {
    let content = `# ${title}\n\n`;
    steps.forEach((s, i) => {
      content += `## 第 ${i + 1} 步: ${s.operation}\n`;
      content += `$$${s.latex}$$\n\n`;
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

  const getCurrentFormula = () => steps.length > 0 ? steps[steps.length - 1].latex : '';
  const getDerivationHistory = () => steps.map(s => ({ operation: s.operation, latex: s.latex }));

  return (
    <div className={`h-screen flex bg-gray-50 dark:bg-[#0a0a0a] ${darkMode ? 'dark' : ''}`}>
      {/* 左侧工具栏 */}
      <aside className="w-14 bg-white dark:bg-[#171717] border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-3 gap-1">
        <button 
          onClick={() => navigate('/')} 
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors mb-2"
          title="返回首页"
        >
          <Home size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        
        <div className="w-8 h-px bg-gray-200 dark:bg-gray-700 my-2" />
        
        <button 
          onClick={saveDerivation} 
          disabled={saving}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
          title={saving ? '保存中...' : '保存'}
        >
          <Save size={20} className={saving ? 'text-gray-400 animate-pulse' : 'text-blue-600'} />
        </button>
        
        <button 
          onClick={exportDerivation}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          title="导出为 Markdown"
        >
          <Download size={20} className="text-gray-600 dark:text-gray-400" />
        </button>

        <div className="flex-1" />
        
        <button 
          onClick={toggleDarkMode}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          title={darkMode ? '浅色模式' : '深色模式'}
        >
          {darkMode ? (
            <Sun size={20} className="text-yellow-500" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>

        <button 
          onClick={() => setShowAI(!showAI)}
          className={`p-3 rounded-xl transition-colors ${
            showAI 
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
          title="AI 助手"
        >
          <MessageSquare size={20} />
        </button>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部标题栏 */}
        <header className="bg-white dark:bg-[#171717] border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center gap-3">
          <FileText size={18} className="text-gray-400" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-2 py-1 bg-transparent border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 text-gray-900 dark:text-white font-medium transition-colors"
            placeholder="输入标题..."
          />
          {derivationId && (
            <span className="text-xs text-gray-400">已保存</span>
          )}
        </header>

        {/* 草稿纸 */}
        <div className="flex-1 overflow-hidden">
          <ScratchPad 
            initialSteps={steps}
            onStepsChange={setSteps}
          />
        </div>
      </div>

      {/* AI 助手侧边栏（可调整宽度） */}
      {showAI && (
        <>
          {/* 拖拽手柄 */}
          <div
            ref={resizeRef}
            onMouseDown={handleMouseDown}
            className={`w-1 cursor-col-resize flex items-center justify-center hover:bg-blue-500/50 transition-colors ${
              isResizing ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-800'
            }`}
          >
            <GripVertical size={12} className="text-gray-400" />
          </div>
          
          <aside 
            style={{ width: aiPanelWidth }}
            className="bg-white dark:bg-[#171717] border-l border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
          >
            <AIChat
              currentFormula={getCurrentFormula()}
              derivationHistory={getDerivationHistory()}
            />
          </aside>
        </>
      )}
    </div>
  );
}
