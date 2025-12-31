import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase, Derivation, MathTemplate } from '../lib/supabase';
import { FileText, Clock, LogOut, User, Sun, Moon, Search, FolderOpen, Sparkles, Trash2 } from 'lucide-react';
import MathRenderer from '../components/MathRenderer';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [derivations, setDerivations] = useState<Derivation[]>([]);
  const [templates, setTemplates] = useState<MathTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
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
    } finally {
      setLoading(false);
    }
  };

  const deleteDerivation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个推导吗？')) return;
    
    try {
      await supabase.from('derivation_steps').delete().eq('derivation_id', id);
      await supabase.from('derivations').delete().eq('id', id);
      setDerivations(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('删除失败:', err);
    }
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
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
    <div className={`min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] ${darkMode ? 'dark' : ''}`}>
      <header className="sticky top-0 z-20 bg-white dark:bg-[#171717] border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">MathFlow</h1>
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User size={16} />
              <span>{user?.email}</span>
            </div>
            <button onClick={handleSignOut} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h2>
          <p className="text-gray-600 dark:text-gray-400">Continue your mathematical journey with AI-assisted derivations.</p>
        </div>

        <div className="mb-8">
          <button
            onClick={() => navigate('/scratch')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all shadow-lg shadow-purple-500/20"
          >
            <Sparkles size={24} />
            <div className="text-left">
              <div className="font-medium">新建推导</div>
              <div className="text-sm opacity-80">点击公式项进行交互式推导</div>
            </div>
          </button>
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Derivations</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#171717] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          ) : filteredDerivations.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#171717] rounded-lg border border-gray-200 dark:border-gray-800">
              <FolderOpen className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500 dark:text-gray-400">No derivations yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDerivations.map((d) => (
                <div
                  key={d.id}
                  onClick={() => navigate(`/scratch/${d.id}`)}
                  className="group relative text-left p-4 bg-white dark:bg-[#171717] rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <button
                    onClick={(e) => deleteDerivation(d.id, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-red-50 dark:bg-red-900/20 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-start gap-3">
                    <FileText className="text-gray-400 mt-1" size={20} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">{d.title}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Clock size={12} />
                        <span>{new Date(d.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Formula Templates</h3>
          <div className="space-y-6">
            {Object.entries(groupedTemplates).map(([category, temps]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  {categoryNames[category] || category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {temps.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 bg-white dark:bg-[#171717] rounded-lg border border-gray-200 dark:border-gray-800"
                    >
                      <div className="font-medium text-gray-900 dark:text-white mb-2">{t.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t.description}</div>
                      <div className="bg-gray-50 dark:bg-[#0A0A0A] p-3 rounded overflow-x-auto">
                        <MathRenderer latex={t.latex_template} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
