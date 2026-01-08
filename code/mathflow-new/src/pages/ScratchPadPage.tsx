import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useTheme } from '../hooks/use-theme';
import { useToast } from '../hooks/use-toast';
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
  GripVertical,
  X
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Sheet } from '../components/ui/Sheet';

export default function ScratchPadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { success, error: showError } = useToast();

  const [title, setTitle] = useState('新推导');
  const [steps, setSteps] = useState<DerivationStep[]>([]);
  const [derivationId, setDerivationId] = useState<string | null>(id || null);
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiPanelWidth, setAiPanelWidth] = useState(() => {
    const saved = localStorage.getItem('ai_panel_width');
    return saved ? parseInt(saved) : 360;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [mobileAIMenuOpen, setMobileAIMenuOpen] = useState(false);

  const resizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    console.log('Loading derivation:', derivationId);
    const [derivationRes, stepsRes] = await Promise.all([
      supabase.from('derivations').select('*').eq('id', derivationId).maybeSingle(),
      supabase.from('derivation_steps').select('*').eq('derivation_id', derivationId).order('step_number')
    ]);

    if (derivationRes.error) {
      console.error('Error loading derivation:', derivationRes.error);
      showError(`加载推导失败: ${derivationRes.error.message}`);
    }

    if (derivationRes.data) {
      setTitle(derivationRes.data.title);
    }

    if (stepsRes.error) {
      console.error('Error loading steps:', stepsRes.error);
      showError(`加载步骤失败: ${stepsRes.error.message}`);
    }

    if (stepsRes.data) {
      console.log('Loaded steps:', stepsRes.data);
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
    if (!user) {
      showError('请先登录再保存！');
      return;
    }
    setSaving(true);

    try {
      let dId = derivationId;
      console.log('Saving derivation for user:', user.id);

      if (!dId) {
        console.log('Creating new derivation...');
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
          console.log('Created derivation:', dId);
        }
      } else {
        console.log('Updating derivation:', dId);
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
        console.log('Deleting old steps for:', dId);
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
            output_latex: s.latex || '',
            operation: s.operation || 'Input',
            annotation: s.annotation || '',
            is_verified: false
          }));

          console.log('Inserting new steps:', stepsToInsert);
          const { error: insertError } = await supabase.from('derivation_steps').insert(stepsToInsert);
          if (insertError) {
            console.error('Failed to insert new steps:', insertError);
            throw insertError;
          }
        }
      }
      success('保存成功！');
    } catch (err: any) {
      console.error('Save failed:', err);
      showError(`保存失败: ${err.message || '未知错误'}`);
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
    success('导出成功！');
  };

  const toggleDarkMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const getCurrentFormula = () => steps.length > 0 ? steps[steps.length - 1].latex : '';
  const getDerivationHistory = () => steps.map(s => ({ operation: s.operation, latex: s.latex }));

  return (
    <div className="h-screen flex bg-background">
      {/* 左侧工具栏 */}
      <aside className="hidden md:flex w-14 bg-card border-r border-border flex-col items-center py-3 gap-1">
        <button
          onClick={() => navigate('/')}
          className="p-3 hover:bg-background-tertiary rounded-xl transition-colors mb-2"
          title="返回首页"
        >
          <Home size={20} className="text-foreground-secondary" />
        </button>

        <div className="w-8 h-px bg-border" />

        <button
          onClick={saveDerivation}
          disabled={saving}
          className="p-3 hover:bg-background-tertiary rounded-xl transition-colors disabled:opacity-50"
          title={saving ? '保存中...' : '保存'}
        >
          <Save size={20} className={saving ? 'text-foreground-muted animate-pulse' : 'text-secondary'} />
        </button>

        <button
          onClick={exportDerivation}
          className="p-3 hover:bg-background-tertiary rounded-xl transition-colors"
          title="导出为 Markdown"
        >
          <Download size={20} className="text-foreground-secondary" />
        </button>

        <div className="flex-1" />

        <button
          onClick={toggleDarkMode}
          className="p-3 hover:bg-background-tertiary rounded-xl transition-colors"
          title={resolvedTheme === 'dark' ? '浅色模式' : '深色模式'}
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={20} className="text-warning" />
          ) : (
            <Moon size={20} className="text-foreground-secondary" />
          )}
        </button>

        <button
          onClick={() => setShowAI(!showAI)}
          className={`p-3 rounded-xl transition-colors ${
            showAI
              ? 'bg-accent-bg text-accent'
              : 'hover:bg-background-tertiary text-foreground-secondary'
          }`}
          title="AI 助手"
        >
          <MessageSquare size={20} />
        </button>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部标题栏 */}
        <header className="bg-card border-b border-border px-4 py-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="md:hidden p-2 hover:bg-background-tertiary rounded-lg transition-colors"
            aria-label="返回"
          >
            <ArrowLeft size={18} className="text-foreground-secondary" />
          </button>
          <FileText size={18} className="text-foreground-muted" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-2 py-1 bg-transparent border-b-2 border-transparent hover:border-border focus:border-primary text-foreground font-medium transition-colors outline-none"
            placeholder="输入标题..."
          />
          {derivationId && (
            <span className="text-xs text-success">已保存</span>
          )}

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <button
              onClick={saveDerivation}
              disabled={saving}
              className="p-2 hover:bg-background-tertiary rounded-lg transition-colors disabled:opacity-50"
              title="保存"
            >
              <Save size={18} className={saving ? 'text-foreground-muted animate-pulse' : 'text-secondary'} />
            </button>
            <button
              onClick={() => setMobileAIMenuOpen(true)}
              className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
              title="AI 助手"
            >
              <MessageSquare size={18} className="text-accent" />
            </button>
          </div>
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
            className={`hidden md:block w-1 cursor-col-resize flex items-center justify-center hover:bg-primary/50 transition-colors ${
              isResizing ? 'bg-primary' : 'bg-border'
            }`}
          >
            <GripVertical size={12} className="text-foreground-muted" />
          </div>

          <aside
            style={{ width: aiPanelWidth }}
            className="hidden md:flex bg-card border-l border-border flex-col overflow-hidden"
          >
            <AIChat
              currentFormula={getCurrentFormula()}
              derivationHistory={getDerivationHistory()}
            />
          </aside>
        </>
      )}

      {/* Mobile AI Sheet */}
      <Sheet
        open={mobileAIMenuOpen}
        onClose={() => setMobileAIMenuOpen(false)}
        side="right"
        size="full"
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">AI 助手</h2>
            <button
              onClick={() => setMobileAIMenuOpen(false)}
              className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
              aria-label="关闭"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <AIChat
              currentFormula={getCurrentFormula()}
              derivationHistory={getDerivationHistory()}
            />
          </div>
        </div>
      </Sheet>
    </div>
  );
}
