import { useState, useRef, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';
import MathRenderer from './MathRenderer';
import { Send, Key, Settings, Loader2, Bot, User, Globe, Sparkles, Trash2, AlertCircle, X } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface AIChatProps {
  currentFormula: string;
  derivationHistory: { operation: string; latex: string }[];
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const DEFAULT_BASE_URL = 'https://api.deepseek.com';

const SYSTEM_PROMPT = `你是一个数学推导助手。你正在帮助用户进行数学公式的推导和计算。
请用简洁清晰的语言回答用户的问题，使用 LaTeX 格式来表示数学公式。
- 行内公式使用 $...$ 包裹
- 独立公式块使用 $$...$$ 包裹

当前用户正在处理的公式信息会在对话中提供给你。`;

export default function AIChat({ currentFormula, derivationHistory }: AIChatProps) {
  const { error: showError } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<AIConfig>(() => ({
    apiKey: localStorage.getItem('ai_api_key') || '',
    baseUrl: localStorage.getItem('ai_base_url') || DEFAULT_BASE_URL,
    model: localStorage.getItem('ai_model') || 'deepseek-chat',
  }));
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveSettings = () => {
    localStorage.setItem('ai_api_key', config.apiKey);
    localStorage.setItem('ai_base_url', config.baseUrl);
    localStorage.setItem('ai_model', config.model);
    setShowSettings(false);
    setError(null);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  // 构建上下文消息
  const buildContextMessage = (): string => {
    let context = '';
    if (currentFormula) {
      context += `当前公式: $${currentFormula}$\n`;
    }
    if (derivationHistory.length > 0) {
      context += '\n推导历史:\n';
      derivationHistory.slice(-5).forEach((step, i) => {
        context += `${i + 1}. [${step.operation}] $${step.latex}$\n`;
      });
    }
    return context;
  };

  // 请求 API（非流式，避免 CORS 问题）
  const sendMessage = async () => {
    if (!input.trim() || !config.apiKey) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const contextInfo = buildContextMessage();
      const systemMessage: Message = {
        role: 'system',
        content: SYSTEM_PROMPT + (contextInfo ? `\n\n当前上下文:\n${contextInfo}` : '')
      };

      const apiMessages = [
        systemMessage,
        ...newMessages.map(m => ({ role: m.role, content: m.content }))
      ];

      // 使用非流式请求
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: apiMessages,
          stream: false,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content || '无响应内容';

      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);

    } catch (err: any) {
      console.error('AI chat error:', err);

      // 更友好的错误提示
      let errorMsg = err.message || '请求失败';
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        errorMsg = '网络请求失败。可能的原因：\n1. API 端点不支持浏览器直接访问（CORS限制）\n2. 网络连接问题\n3. API 地址不正确\n\n建议：使用支持 CORS 的 API 服务，如 DeepSeek、SiliconFlow 等';
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content: string) => {
    // 处理 $$ 和 $ 包裹的 LaTeX
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/);
    return parts.map((part, i) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return <MathRenderer key={i} latex={part.slice(2, -2)} displayMode />;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        return <MathRenderer key={i} latex={part.slice(1, -1)} />;
      }
      // 处理换行
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  };

  const quickPrompts = [
    { label: '下一步？', prompt: '这个公式下一步应该怎么推导？' },
    { label: '验证', prompt: '请验证这一步推导是否正确' },
    { label: '解释', prompt: '请解释这个公式的含义' },
    { label: '简化', prompt: '这个公式可以如何简化？' },
  ];

  const presetModels = [
    { value: 'deepseek-chat', label: 'DeepSeek Chat' },
    { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
    { value: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen2.5-7B (SF)' },
    { value: 'Qwen/Qwen2.5-72B-Instruct', label: 'Qwen2.5-72B (SF)' },
    { value: 'THUDM/glm-4-9b-chat', label: 'GLM-4-9B (SF)' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'moonshot-v1-8k', label: 'Moonshot v1' },
  ];

  // 支持 CORS 的 API 端点
  const presetEndpoints = [
    { value: 'https://api.deepseek.com', label: 'DeepSeek ✓' },
    { value: 'https://api.siliconflow.cn/v1', label: 'SiliconFlow ✓' },
    { value: 'https://api.moonshot.cn/v1', label: 'Moonshot ✓' },
    { value: 'https://api.openai.com/v1', label: 'OpenAI' },
    { value: 'https://dashscope.aliyuncs.com/compatible-mode/v1', label: '阿里云' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-accent" />
          <span className="font-medium text-foreground">AI 助手</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-1.5 hover:bg-background-tertiary rounded text-foreground-secondary hover:text-error"
              title="清空对话"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 hover:bg-background-tertiary rounded ${!config.apiKey ? 'text-warning' : 'text-foreground-secondary'}`}
            title="设置"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-border bg-background-secondary">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">API Key</label>
              <div className="relative">
                <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted" size={14} />
                <Input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig(c => ({ ...c, apiKey: e.target.value }))}
                  placeholder="输入你的 API Key"
                  className="pl-8 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">API 端点</label>
              <div className="relative">
                <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted" size={14} />
                <Input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) => setConfig(c => ({ ...c, baseUrl: e.target.value }))}
                  placeholder="https://api.openai.com/v1"
                  className="pl-8 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {presetEndpoints.map(ep => (
                  <button
                    key={ep.value}
                    onClick={() => setConfig(c => ({ ...c, baseUrl: ep.value }))}
                    className={`px-2 py-0.5 text-xs rounded ${
                      config.baseUrl === ep.value
                        ? 'bg-accent-bg text-accent'
                        : 'bg-background-tertiary text-foreground-secondary hover:bg-border'
                    }`}
                  >
                    {ep.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">模型</label>
              <div className="relative">
                <Sparkles className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted" size={14} />
                <Input
                  type="text"
                  value={config.model}
                  onChange={(e) => setConfig(c => ({ ...c, model: e.target.value }))}
                  placeholder="gpt-4o-mini"
                  className="pl-8 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {presetModels.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setConfig(c => ({ ...c, model: m.value }))}
                    className={`px-2 py-0.5 text-xs rounded ${
                      config.model === m.value
                        ? 'bg-accent-bg text-accent'
                        : 'bg-background-tertiary text-foreground-secondary hover:bg-border'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={saveSettings}
              variant="primary"
              className="w-full"
              size="sm"
            >
              保存设置
            </Button>
          </div>
        </div>
      )}

      {/* API Key Notice */}
      {!config.apiKey && !showSettings && (
        <div className="p-4 text-center">
          <div className="text-sm text-foreground-secondary mb-2">
            配置 API Key 以使用 AI 助手
          </div>
          <Button
            onClick={() => setShowSettings(true)}
            variant="link"
            size="sm"
          >
            打开设置
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && config.apiKey && (
          <div className="text-center text-sm text-foreground-secondary">
            <p className="mb-3">有问题就问我吧！</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickPrompts.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setInput(item.prompt)}
                  className="px-3 py-1.5 text-xs bg-background-tertiary hover:bg-border rounded-full transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
            {currentFormula && (
              <div className="mt-4 p-3 bg-background-tertiary rounded-lg">
                <div className="text-xs text-foreground-muted mb-1">当前公式</div>
                <MathRenderer latex={currentFormula} />
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-accent-bg flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-accent" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-background-tertiary text-foreground'
              }`}
            >
              {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-secondary-bg flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-secondary" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-accent-bg flex items-center justify-center">
              <Loader2 size={14} className="text-accent animate-spin" />
            </div>
            <div className="flex-1 p-3 rounded-lg bg-background-tertiary text-sm text-foreground">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-foreground-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-foreground-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-foreground-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-error-bg border border-error">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-error mt-0.5 flex-shrink-0" />
              <div className="text-sm text-error-foreground whitespace-pre-wrap flex-1">
                {error}
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs text-error hover:underline"
            >
              关闭
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {config.apiKey && (
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="输入你的问题..."
              className="flex-1"
              disabled={loading}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              variant="primary"
              size="icon"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </Button>
          </div>
          <div className="mt-2 text-xs text-foreground-muted text-center">
            {config.model} @ {(() => {
              try {
                return new URL(config.baseUrl).host;
              } catch {
                return config.baseUrl || '未设置';
              }
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
