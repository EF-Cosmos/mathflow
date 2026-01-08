import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useTheme } from '../hooks/use-theme';
import { useToast } from '../hooks/use-toast';
import { supabase, Derivation, MathTemplate } from '../lib/supabase';
import { FileText, Clock, LogOut, User, Search, FolderOpen, Sparkles, Trash2, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Container } from '../components/ui/Container';
import { InlineLoading, ListSkeleton } from '../components/feedback/Loading';
import MathRenderer from '../components/MathRenderer';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { confirm: confirmToast, success, error: showError } = useToast();

  const [derivations, setDerivations] = useState<Derivation[]>([]);
  const [templates, setTemplates] = useState<MathTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [derivationsRes, templatesRes] = await Promise.all([
        supabase.from('derivations').select('*').eq('user_id', user?.id).order('updated_at', { ascending: false }),
        supabase.from('math_templates').select('*').order('category')
      ]);

      if (derivationsRes.data) setDerivations(derivationsRes.data);
      if (templatesRes.data) setTemplates(templatesRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      showError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteDerivation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = await confirmToast('确定要删除这个推导吗？', '删除确认');
    if (!confirmed) return;

    try {
      await supabase.from('derivation_steps').delete().eq('derivation_id', id);
      await supabase.from('derivations').delete().eq('id', id);
      setDerivations(prev => prev.filter(d => d.id !== id));
      success('Derivation deleted successfully');
    } catch (err) {
      console.error('删除失败:', err);
      showError('Failed to delete derivation');
    }
  };

  const toggleDarkMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const filteredDerivations = derivations.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTemplates = templates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, MathTemplate[]>);

  const categoryNames: Record<string, string> = {
    calculus: 'Calculus',
    linear_algebra: 'Linear Algebra',
    probability: 'Probability & Statistics',
    algebra: 'Algebra'
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-4 sm:px-6">
        <Container className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">MathFlow</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-background-tertiary text-foreground-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-foreground-secondary">
              <User size={16} />
              <span className="max-w-[150px] truncate">{user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-md hover:bg-background-tertiary text-foreground-secondary transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </Container>
      </header>

      <main className="px-4 sm:px-6 py-8">
        <Container>
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back!</h2>
            <p className="text-foreground-secondary">Continue your mathematical journey with AI-assisted derivations.</p>
          </div>

          {/* New Derivation Button */}
          <div className="mb-8">
            <Button
              onClick={() => navigate('/scratch')}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto gap-3 shadow-lg"
            >
              <Sparkles size={20} />
              <div className="text-left">
                <div className="font-medium">新建推导</div>
                <div className="text-xs opacity-80">点击公式项进行交互式推导</div>
              </div>
            </Button>
          </div>

          {/* Recent Derivations */}
          <section className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Derivations</h3>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" size={16} />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
            </div>

            {loading ? (
              <ListSkeleton count={3} />
            ) : filteredDerivations.length === 0 ? (
              <Card className="text-center py-12">
                <FolderOpen className="mx-auto text-foreground-muted mb-3" size={48} />
                <p className="text-foreground-secondary">
                  {searchQuery ? 'No derivations found.' : 'No derivations yet. Create your first one!'}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDerivations.map((d) => (
                  <Card
                    key={d.id}
                    onClick={() => navigate(`/scratch/${d.id}`)}
                    className="group relative cursor-pointer hover:border-primary transition-colors"
                  >
                    <button
                      onClick={(e) => deleteDerivation(d.id, e)}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-error-bg text-error opacity-0 group-hover:opacity-100 hover:bg-error/20 transition-all"
                      title="删除"
                    >
                      <Trash2 size={14} />
                    </button>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <FileText className="text-foreground-muted mt-1" size={20} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{d.title}</h4>
                          <div className="flex items-center gap-1 text-xs text-foreground-secondary mt-1">
                            <Clock size={12} />
                            <span>{new Date(d.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Formula Templates */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4">Formula Templates</h3>
            <div className="space-y-6">
              {Object.entries(groupedTemplates).map(([category, temps]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-foreground-muted uppercase tracking-wide mb-3">
                    {categoryNames[category] || category}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {temps.map((t) => (
                      <Card key={t.id} className="hover:border-primary transition-colors">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{t.name}</CardTitle>
                          <p className="text-sm text-foreground-secondary">{t.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-background-tertiary p-3 rounded overflow-x-auto">
                            <MathRenderer latex={t.latex_template} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}
