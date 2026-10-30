import React, { useState, useEffect, useRef } from 'react';
import { FDRApplication, UserProfile } from '../types/aicte';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Copy, 
  Check, 
  RotateCcw, 
  Square, 
  Trash2, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  Building2,
  ChevronRight,
  Info
} from 'lucide-react';
import { FDRGuardIcon } from './FDRGuardLogo';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  currentCase?: FDRApplication;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: string[];
  suggestedActions?: string[];
  timestamp: string;
  model?: string;
  isStreaming?: boolean;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentCase
}) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const storageKey = `fdr_guard_copilot_${currentUser.role}_${currentUser.institutionId || 'national'}`;

  // Initial welcome message generator
  const getWelcomeMessage = (): ChatMessage => ({
    id: `welcome_${Date.now()}`,
    sender: 'assistant',
    text: `Hello **${currentUser.name}**! I am the **FDR GUARD AI Compliance Copilot**.\n\nI provide answers grounded directly in our **live regulatory database**, verified banking certificates, and **AICTE Approval Process Handbook (Table 2.1)** standards.\n\nHow can I assist your scrutiny or surveillance workflow today?`,
    citations: ['AICTE Approval Process Handbook (APH) Table 2.1', 'SmartTrack Security Engine v2.1'],
    suggestedActions: [
      'What cases require attention today?',
      'How many institutions are registered?',
      'What are the mandatory deposit amount rules?',
      currentCase ? `Why was case ${currentCase.fdr_number} flagged?` : 'Which FDRs are approaching maturity?'
    ],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    model: 'FDR GUARD Regulatory Compliance Engine'
  });

  // Load chat history from localStorage or set welcome message
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read chat history from localStorage:', e);
    }
    setMessages([getWelcomeMessage()]);
  }, [currentUser.role, currentUser.institutionId]);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (e) {
        console.warn('Could not save chat history to localStorage:', e);
      }
    }
  }, [messages, storageKey]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  if (!isOpen) return null;

  // New Chat
  const handleNewChat = () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    const freshWelcome = getWelcomeMessage();
    setMessages([freshWelcome]);
    try {
      localStorage.setItem(storageKey, JSON.stringify([freshWelcome]));
    } catch (e) {
      // ignore
    }
  };

  // Clear Chat History
  const handleClearHistory = () => {
    if (window.confirm('Clear your conversation history with FDR GUARD Copilot?')) {
      handleNewChat();
    }
  };

  // Stop Generation
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg))
    );
  };

  // Copy Message Text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send Prompt (Streaming with Fallback)
  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || query).trim();
    if (!prompt || isLoading) return;

    const userMsgId = `usr_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const botMsgId = `bot_${Date.now()}`;
    const placeholderBotMsg: ChatMessage = {
      id: botMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true
    };

    // Keep last 6 conversation turns for multi-turn context
    const conversationHistory = messages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text
    }));

    setMessages((prev) => [...prev, userMsg, placeholderBotMsg]);
    setQuery('');
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // 1. Try Streaming Endpoint (SSE)
      const res = await fetch('/api/copilot/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-institution-id': currentUser.institutionId || ''
        },
        body: JSON.stringify({
          query: prompt,
          contextCaseId: currentCase?.id,
          conversationHistory
        }),
        signal: controller.signal
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        let citations: string[] = [];
        let suggestedActions: string[] = [];

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value, { stream: true });
          const lines = textChunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr === '[DONE]') break;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMsgId
                        ? { ...msg, text: accumulatedText }
                        : msg
                    )
                  );
                }
                if (parsed.citations) citations = parsed.citations;
                if (parsed.suggested_actions) suggestedActions = parsed.suggested_actions;
              } catch (e) {
                // partial line ignore
              }
            }
          }
        }

        // Finalize streaming bot message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId
              ? {
                  ...msg,
                  text: accumulatedText || 'Response received.',
                  citations: citations.length > 0 ? citations : undefined,
                  suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
                  isStreaming: false
                }
              : msg
          )
        );
        setIsLoading(false);
        abortControllerRef.current = null;
        return;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User clicked Stop Generating
        setIsLoading(false);
        return;
      }

      // 2. Fallback to Standard POST /api/copilot
      try {
        const fallbackRes = await fetch('/api/copilot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser.role,
            'x-institution-id': currentUser.institutionId || ''
          },
          body: JSON.stringify({
            query: prompt,
            contextCaseId: currentCase?.id,
            conversationHistory
          })
        });

        const fallbackData = await fallbackRes.json();
        if (fallbackData.success && fallbackData.data) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId
                ? {
                    ...msg,
                    text: fallbackData.data.answer || 'Response generated.',
                    citations: fallbackData.data.citations || [],
                    suggestedActions: fallbackData.data.suggested_actions || [],
                    model: fallbackData.data.model,
                    isStreaming: false
                  }
                : msg
            )
          );
        } else {
          throw new Error(fallbackData.error || 'Server error');
        }
      } catch (fbErr: any) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId
              ? {
                  ...msg,
                  text: `⚠️ **Unable to complete inquiry**: ${fbErr.message || 'Network disconnected'}.\n\nPlease ensure the SmartTrack application server is active and retry.`,
                  isStreaming: false
                }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last user prompt
  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.text);
    }
  };

  // Simple Markdown Formatter Helper
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = (keyPrefix: string) => {
      if (tableRows.length > 0) {
        const header = tableRows[0];
        const bodyRows = tableRows.slice(1).filter((r) => !r.every((c) => c.includes('---') || c.includes(':--')));

        elements.push(
          <div key={`${keyPrefix}_tbl`} className="my-2.5 overflow-x-auto rounded border border-slate-700/60 bg-[#060D18]">
            <table className="min-w-full divide-y divide-slate-700/80 text-[11px] font-sans">
              <thead className="bg-[#091422] text-amber-300 font-semibold">
                <tr>
                  {header.map((col, idx) => (
                    <th key={idx} className="px-2.5 py-1.5 text-left font-medium">
                      {formatInline(col.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-transparent' : 'bg-[#0A1626]/50'}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-2.5 py-1.5 whitespace-nowrap">
                        {formatInline(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    const formatInline = (str: string): React.ReactNode => {
      const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
      return parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={pIdx} className="px-1 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10.5px]">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      // Markdown Table Row
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        const cells = line
          .trim()
          .slice(1, -1)
          .split('|');
        tableRows.push(cells);
        return;
      } else if (inTable) {
        flushTable(`tbl_${index}`);
      }

      // Heading 3
      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={index} className="text-xs font-bold text-amber-300 mt-2 mb-1 tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            {line.replace('### ', '')}
          </h4>
        );
        return;
      }

      // Bullet List Item
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(
          <div key={index} className="flex items-start gap-1.5 ml-1 my-0.5 text-slate-200">
            <span className="text-amber-400 font-bold shrink-0 leading-relaxed">•</span>
            <span className="leading-relaxed">{formatInline(line.trim().slice(2))}</span>
          </div>
        );
        return;
      }

      // Numbered List Item
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        elements.push(
          <div key={index} className="flex items-start gap-1.5 ml-1 my-0.5 text-slate-200">
            <span className="font-mono text-[10px] text-amber-400 font-bold shrink-0 mt-0.5">{numMatch[1]}.</span>
            <span className="leading-relaxed">{formatInline(numMatch[2])}</span>
          </div>
        );
        return;
      }

      // Empty Line
      if (!line.trim()) {
        elements.push(<div key={index} className="h-1.5" />);
        return;
      }

      // Standard Paragraph
      elements.push(
        <p key={index} className="leading-relaxed text-slate-200 my-0.5">
          {formatInline(line)}
        </p>
      );
    });

    if (inTable) {
      flushTable('tbl_end');
    }

    return elements;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-[#0A1626] border-l border-slate-700/80 shadow-2xl z-50 flex flex-col font-sans select-none animate-fade-in text-white">
      {/* 1. Header */}
      <div className="bg-[#07101C] p-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0F223A] border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <FDRGuardIcon size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">FDR GUARD Copilot</h3>
              <span className="text-[9.5px] font-mono uppercase bg-teal-950/70 text-teal-300 border border-teal-500/40 px-1.5 py-0.2 rounded">
                Live AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[280px]">
              Grounded in AICTE Regulatory Database &amp; Gemini 3.8 Flash
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleNewChat}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Start New Conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            title="Close Copilot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Active Context Ribbon */}
      <div className="px-4 py-2 bg-[#081220] border-b border-slate-800 text-xs flex items-center justify-between shrink-0">
        {currentCase ? (
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
            <span className="truncate text-slate-300">
              Active Case: <strong className="font-mono text-white font-semibold">{currentCase.fdr_number}</strong> ({currentCase.institution_name.slice(0, 18)}...)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate">
              Jurisdiction: <strong className="text-white font-medium">{currentUser.role === 'INSTITUTION_USER' ? 'My Institution Records' : 'National Regulatory Portfolio'}</strong>
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-slate-400">
          <span>Role:</span>
          <span className="bg-slate-800 text-teal-300 px-1.5 py-0.5 rounded border border-slate-700">
            {currentUser.role.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* 3. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Label & Timestamp */}
            <div className="flex items-center gap-1.5 px-1 mb-1 text-[10px] text-slate-400">
              {msg.sender === 'user' ? (
                <>
                  <span>You</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span className="font-semibold text-amber-300">FDR GUARD Copilot</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </>
              )}
            </div>

            {/* Bubble Content */}
            <div
              className={`max-w-[92%] p-3.5 rounded-xl text-xs leading-relaxed transition-all shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-[#142640] text-white border border-teal-500/30'
                  : 'bg-[#0C1A2E] text-slate-100 border border-slate-700/80 shadow-md'
              }`}
            >
              {msg.sender === 'user' ? (
                <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
              ) : (
                <div>
                  {renderFormattedMarkdown(msg.text)}

                  {/* Streaming Cursor */}
                  {msg.isStreaming && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-amber-400 animate-pulse align-middle" />
                  )}

                  {/* Citations Box */}
                  {msg.citations && msg.citations.length > 0 && !msg.isStreaming && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 text-[10.5px] text-slate-400 space-y-1 bg-[#060D18]/60 p-2 rounded">
                      <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-amber-400" /> Statutory &amp; Evidence Citations:
                      </div>
                      {msg.citations.map((c, i) => (
                        <div key={i} className="font-mono text-slate-300 truncate">
                          • {c}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Action Toolbar */}
                  {!msg.isStreaming && msg.text && (
                    <div className="mt-2.5 pt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800">
                      <span className="font-mono text-[9px] text-slate-500">
                        {msg.model || 'FDR GUARD Regulatory Engine'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                          title="Copy message to clipboard"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Suggested Follow-up Actions (Chips) */}
            {msg.suggestedActions && msg.suggestedActions.length > 0 && !msg.isStreaming && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[92%]">
                {msg.suggestedActions.map((actionText, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(actionText)}
                    disabled={isLoading}
                    className="text-[11px] text-amber-300 hover:text-white bg-[#0E1F36] hover:bg-[#152B4B] px-2.5 py-1 rounded-full border border-amber-500/40 hover:border-amber-400 transition-all text-left flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{actionText}</span>
                    <ChevronRight className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading Spinner & Status */}
        {isLoading && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D1E34] border border-amber-500/30 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Analyzing regulations, database records, and APH norms...</span>
            </div>
            <button
              onClick={handleStopGenerating}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/60 text-rose-300 hover:bg-rose-900 text-[10px] font-semibold transition-colors cursor-pointer"
            >
              <Square className="w-2.5 h-2.5" /> Stop
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Quick Prompts Bar (when not loading) */}
      {!isLoading && (
        <div className="px-3 pt-2 bg-[#07101C] border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1 no-scrollbar">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Prompts:
          </span>
          <button
            onClick={() => handleSend('What cases require attention today?')}
            className="shrink-0 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10.5px] border border-slate-700 transition-colors cursor-pointer"
          >
            Today's Urgent Cases
          </button>
          <button
            onClick={() => handleSend('Summarize the current portfolio dashboard')}
            className="shrink-0 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10.5px] border border-slate-700 transition-colors cursor-pointer"
          >
            Dashboard Summary
          </button>
          <button
            onClick={() => handleSend('What are the mandatory deposit amount rules under Table 2.1?')}
            className="shrink-0 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10.5px] border border-slate-700 transition-colors cursor-pointer"
          >
            APH Table 2.1 Rules
          </button>
          <button
            onClick={() => handleSend('What is the procedure for security deposit release under Clause 6.46?')}
            className="shrink-0 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10.5px] border border-slate-700 transition-colors cursor-pointer"
          >
            Release Checklist
          </button>
        </div>
      )}

      {/* 5. Input Box Area */}
      <div className="p-3 bg-[#07101C] border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                currentCase
                  ? `Ask about ${currentCase.fdr_number}, flags, missing fields, or rules...`
                  : 'Ask about live portfolio stats, Table 2.1 rules, or renewals...'
              }
              disabled={isLoading}
              className="w-full pl-3 pr-8 py-2 text-xs bg-[#0F2035] text-white placeholder-slate-400 rounded-lg border border-slate-700 focus:border-amber-400 focus:outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isLoading ? (
            <button
              type="button"
              onClick={handleStopGenerating}
              className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer"
              title="Stop Generating"
            >
              <Square className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!query.trim()}
              className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}

          {messages.length > 1 && !isLoading && (
            <button
              type="button"
              onClick={handleRegenerate}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Regenerate last response"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-0.5">
          <span>AICTE SmartTrack / FDR GUARD Enterprise Copilot</span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};
