import React, { useState, useRef, useEffect } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { api } from '../services/api';
import { Bot, X, Send, Sparkles, User, RefreshCw, MessageSquare } from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const { currentAnalysis, currentResult, currentInput } = useAnalysis();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your Solvify AI financial risk analyst. I have loaded the current financial statements and risk scores for **${currentInput.company_name}**. Ask me anything regarding liquidity, debt restructuring, Altman Z-Score analysis, or scenario stress testing.`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'How do our liquidity ratios compare against distress benchmarks?',
    'What specific steps would reduce our debt-to-equity ratio to 1.5x?',
    'Explain why our Altman Z-score is in its current zone.',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isSending) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInputMessage('');
    setIsSending(true);

    try {
      const contextSnapshot = {
        company_name: currentAnalysis?.company_name || currentInput.company_name,
        financial_year: currentAnalysis?.financial_year || currentInput.financial_year,
        risk_probability: currentAnalysis?.risk_probability || currentResult?.probability,
        risk_band: currentAnalysis?.risk_band || currentResult?.risk_band,
        ratios: currentAnalysis?.ratios || currentResult?.ratios || {},
        input_snapshot: currentAnalysis?.input_snapshot || currentInput,
      };

      const res = await api.chatAssistant(query, contextSnapshot);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
      if (res.suggested_followups && res.suggested_followups.length > 0) {
        setSuggestedPrompts(res.suggested_followups);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Failed to get AI response: ${err.message}. Please check network connection.`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Solvify AI Financial Analyst
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
                Context-Aware
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Grounded on {currentInput.company_name} metrics
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isAssistant
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-sky-600 text-white rounded-br-none shadow-md shadow-sky-600/20'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              {!isAssistant && (
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
        {isSending && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
              <span>Analyzing financial models & generating response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Followups */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Suggested Financial Queries
        </div>
        <div className="space-y-1.5">
          {suggestedPrompts.slice(0, 2).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="w-full text-left text-[11px] px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/40 hover:bg-slate-850 transition-all truncate"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask about ${currentInput.company_name}'s financial ratios...`}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
