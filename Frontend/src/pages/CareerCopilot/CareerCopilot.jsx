import { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components';
import { Bot, Send, Sparkles, User, RefreshCw, AlertCircle } from 'lucide-react';

export default function CareerCopilot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your **AI Career Copilot**. 🚀\n\nI can help you build resumes, mock-interview you, plan study roadmaps, and optimize your job search tactics. Try clicking one of the suggestions below, or ask me anything!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const promptSuggestions = [
    'Critique my resume template',
    'Recommend a Frontend learning roadmap',
    'Write a cold outreach message for LinkedIn',
    'Help me prepare for standard interview questions'
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (text) => {
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Exclude greeting message to avoid polluting history
      const history = messages.slice(1);
      const res = await api.copilot.chat(history, text);
      
      setMessages(prev => [...prev, { role: 'assistant', content: res.content }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '❌ Sorry, I encountered an error connecting to the AI services. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I am your **AI Career Copilot**. 🚀\n\nI can help you build resumes, mock-interview you, plan study roadmaps, and optimize your job search tactics. Try clicking one of the suggestions below, or ask me anything!"
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
      {/* Copilot Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="size-6 text-[#8B5CF6]" />
            AI Career Copilot
          </h1>
          <p className="text-xs text-slate-400 mt-1">Get immediate, personalized career guidance and preparation resources.</p>
        </div>
        
        <button
          onClick={handleClear}
          className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition"
        >
          <RefreshCw className="size-3.5" /> Clear History
        </button>
      </div>

      {/* Message Feed Area */}
      <div className="flex-1 overflow-y-auto pr-2 mb-4 space-y-4 scrollbar-thin">
        {messages.map((msg, index) => {
          const isAI = msg.role === 'assistant';
          return (
            <div
              key={index}
              className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`grid size-9 place-items-center rounded-xl shrink-0 font-bold border text-sm ${
                isAI
                  ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/20 text-[#A78BFA]'
                  : 'bg-[#06B6D4]/15 border-[#06B6D4]/20 text-[#22D3EE]'
              }`}>
                {isAI ? <Bot className="size-4.5" /> : <User className="size-4.5" />}
              </div>

              {/* Message Bubble */}
              <div className={`rounded-2xl px-4.5 py-3 border text-xs leading-relaxed ${
                isAI
                  ? 'bg-[#111827]/70 border-white/5 text-slate-200'
                  : 'bg-gradient-to-br from-[#8B5CF6]/90 to-[#7C3AED]/90 border-[#8B5CF6]/30 text-white'
              }`}>
                {/* Parse simple markdown (headers/lists) in message */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.content.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('### ')) {
                      return <h3 key={pIdx} className="text-sm font-bold text-white mt-3 border-b border-white/5 pb-1">{paragraph.replace('### ', '')}</h3>;
                    }
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return <strong key={pIdx} className="block text-white font-bold">{paragraph.replaceAll('**', '')}</strong>;
                    }
                    if (paragraph.includes('\n- ') || paragraph.includes('\n* ')) {
                      // list items parsing
                      return (
                        <ul key={pIdx} className="list-disc pl-4 space-y-1.5 mt-2">
                          {paragraph.split(/\n[-*] /).filter(Boolean).map((li, lIdx) => (
                            <li key={lIdx}>{li.replace(/^[-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={pIdx}>{paragraph}</p>;
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 mr-auto max-w-[80%]">
            <div className="grid size-9 place-items-center rounded-xl shrink-0 bg-[#8B5CF6]/15 border border-[#8B5CF6]/20 text-[#A78BFA]">
              <Bot className="size-4.5" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-[#111827]/70 border border-white/5 text-slate-400 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="size-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="size-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts list (Only show when history is short) */}
      {messages.length === 1 && !loading && (
        <div className="shrink-0 grid gap-2 sm:grid-cols-2 mb-4">
          {promptSuggestions.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-left rounded-xl border border-white/5 bg-[#111827]/40 hover:bg-[#111827]/80 hover:border-[#8B5CF6]/30 px-4 py-2.5 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Message input area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="shrink-0 relative flex items-center"
      >
        <input
          type="text"
          placeholder="Ask anything about your career..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="w-full bg-[#111827] border border-white/10 rounded-2xl py-3.5 pl-4 pr-12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2.5 grid size-9 place-items-center rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
