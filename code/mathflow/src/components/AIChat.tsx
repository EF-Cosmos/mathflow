import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import MathRenderer from './MathRenderer';
import { Send, Key, Settings, Loader2, Bot, User } from 'lucide-react';

interface AIChatProps {
  currentFormula: string;
  derivationHistory: { operation: string; latex: string }[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat({ currentFormula, derivationHistory }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ai_api_key') || '');
  const [model, setModel] = useState(() => localStorage.getItem('ai_model') || 'gpt-4o-mini');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveSettings = () => {
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_model', model);
    setShowSettings(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          currentFormula,
          derivationHistory,
          apiKey,
          model
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data?.data?.content || 'No response received'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('AI chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to get response'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^$]+\$)/);
    return parts.map((part, i) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return <MathRenderer key={i} latex={part.slice(2, -2)} displayMode />;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        return <MathRenderer key={i} latex={part.slice(1, -1)} />;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const quickPrompts = [
    'What is the next step?',
    'Can you verify this step?',
    'Explain this formula',
    'Show alternative approach'
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-purple-500" />
          <span className="font-medium text-gray-900 dark:text-white">AI Assistant</span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <Settings size={16} className="text-gray-500" />
        </button>
      </div>

      {showSettings && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0A0A0A]">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">API Key</label>
              <div className="relative">
                <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#171717] text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#171717] text-gray-900 dark:text-white"
              >
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
              </select>
            </div>
            <button
              onClick={saveSettings}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {!apiKey && !showSettings && (
        <div className="p-4 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Configure your API key to use AI assistance
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            Open Settings
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && apiKey && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-3">Ask me about your derivation!</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-purple-600" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
            >
              {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-blue-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Loader2 size={14} className="text-purple-600 animate-spin" />
            </div>
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {apiKey && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about your derivation..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
