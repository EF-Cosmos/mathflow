import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../hooks/use-theme';
import { useToast } from '../hooks/use-toast';
import { getDerivation, getStepsForDerivation, saveDerivation as saveDerivationToDB, createDerivation, upsertDerivation, toComponentStep, toDbStep, Derivation } from '../lib/db';
import { ScratchPad, DerivationStep } from '../components/ScratchPad';
import AIChat from '../components/AIChat';
import {
  ArrowLeft,
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
  const { resolvedTheme, setTheme } = useTheme();
  const { success, error: showError } = useToast();

  const [title, setTitle] = useState('新推导');
  const [steps, setSteps] = useState<DerivationStep[]>([]);
  const [derivationId, setDerivationId] = useState<string | null>(id || null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showAI, setShowAI] = useState(false);
  const [aiPanelWidth, setAiPanelWidth] = useState(() => {
    const saved = localStorage.getItem('ai_panel_width');
    return saved ? parseInt(saved) : 360;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [mobileAIMenuOpen, setMobileAIMenuOpen] = useState(false);

  const resizeRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (id) loadDerivation(id);
  }, [id]);

  // Auto-save with 500ms debounce
  useEffect(() => {
    // Don't auto-save if there are no steps (empty new derivation)
    if (steps.length === 0) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        let dId = derivationId;
        if (!dId) {
          // First edit -- create the derivation record
          const newDer = await createDerivation(title);
          dId = newDer.id;
          setDerivationId(dId);
        } else {
          // Update title/timestamp
          await upsertDerivation({
            id: dId, title,
            description: null,
            created_at: '',
            updated_at: new Date().toISOString()
          });
        }

        if (dId) {
          const dbSteps = steps.map((s, i) => toDbStep(s, dId, i));
          // Get existing derivation for created_at
          const existing = await getDerivation(dId);
          await saveDerivationToDB(
            { id: dId, title, description: null, created_at: existing?.created_at || new Date().toISOString(), updated_at: new Date().toISOString() },
            dbSteps
          );
        }
        setSaveStatus('saved');
      } catch (err) {
        console.warn('Auto-save failed:', err);
        setSaveStatus('idle');
      }
    }, 500);

    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [steps, title, derivationId]);

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
    try {
      const derivation = await getDerivation(derivationId);
      if (derivation) setTitle(derivation.title);

      const dbSteps = await getStepsForDerivation(derivationId);
      if (dbSteps.length > 0) {
        setSteps(dbSteps.map(toComponentStep));
      }
    } catch (err) {
      console.error('Error loading derivation:', err);
      showError('加载推导失败');
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
          {saveStatus === 'saving' && <span className="text-xs text-warning">保存中...</span>}
          {saveStatus === 'saved' && <span className="text-xs text-success">已同步</span>}

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
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
