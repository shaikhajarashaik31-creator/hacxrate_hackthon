import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import {
  Bot,
  Send,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Check,
  Copy,
  Square,
  MessageSquare,
  Code2,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  User,
  PanelLeftClose,
  PanelLeft,
  RefreshCw,
  Terminal
} from 'lucide-react';

/**
 * Helper to render markdown content with syntax-highlighted code blocks & copy buttons
 */
function FormattedMessage({ content }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let blockIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        text: content.substring(lastIndex, match.index)
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      code: match[2].trim(),
      index: blockIndex++
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      text: content.substring(lastIndex)
    });
  }

  return (
    <div className="space-y-3 leading-relaxed text-xs sm:text-sm">
      {parts.map((part, i) => {
        if (part.type === 'code') {
          return (
            <div
              key={i}
              className="my-3 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md text-xs font-mono"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700 text-slate-400">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px] font-bold uppercase">{part.language || 'code'}</span>
                </div>
                <button
                  onClick={() => handleCopy(part.code, part.index)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 transition text-[11px] font-semibold"
                >
                  {copiedIndex === part.index ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-slate-100 font-mono text-[11px] sm:text-xs leading-relaxed selection:bg-indigo-600">
                <code>{part.code}</code>
              </pre>
            </div>
          );
        }

        // Render plain text paragraphs with basic formatting
        const paragraphs = part.text.split('\n\n');
        return (
          <div key={i} className="space-y-2">
            {paragraphs.map((p, pIdx) => {
              if (!p.trim()) return null;
              // Bold and inline code replacement
              const lines = p.split('\n');
              return (
                <div key={pIdx} className="space-y-1">
                  {lines.map((line, lIdx) => {
                    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
                    return (
                      <p
                        key={lIdx}
                        className={isBullet ? 'pl-4 relative before:content-["•"] before:absolute before:left-1 before:text-indigo-500' : ''}
                      >
                        {line.replace(/^[-*]\s+/, '')}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function AIAssistant() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const loadSessions = async () => {
    try {
      setInitialLoading(true);
      const res = await api.get('/ai/sessions');
      const loadedSessions = res.data?.sessions || [];
      setSessions(loadedSessions);

      if (loadedSessions.length > 0) {
        // Select newest session
        selectSession(loadedSessions[0].id);
      } else {
        // Create initial session
        await handleNewChat();
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const selectSession = async (sessionId) => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    setActiveSessionId(sessionId);
    try {
      const res = await api.get(`/ai/sessions/${sessionId}/messages`);
      setMessages(res.data?.messages || []);
    } catch (err) {
      console.error('Failed to load session messages:', err);
    }
  };

  const handleNewChat = async () => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    try {
      const res = await api.post('/ai/sessions', { title: 'New Conversation' });
      const newSession = res.data?.session;
      if (newSession) {
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to create new chat:', err);
    }
  };

  const handleRename = async (sessionId, e) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    try {
      await api.patch(`/ai/sessions/${sessionId}`, { title: editTitle.trim() });
      setSessions(prev =>
        prev.map(s => (s.id === sessionId ? { ...s, title: editTitle.trim() } : s))
      );
      setEditingSessionId(null);
    } catch (err) {
      console.error('Failed to rename session:', err);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await api.delete(`/ai/sessions/${sessionId}`);
      const remaining = sessions.filter(s => s.id !== sessionId);
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          selectSession(remaining[0].id);
        } else {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const handleSend = async (customPrompt) => {
    const text = customPrompt || input;
    if (!text || !text.trim() || isGenerating) return;

    const trimmed = text.trim();
    setInput('');

    // Append user message immediately
    const userMessage = { role: 'user', message: trimmed };
    setMessages(prev => [...prev, userMessage]);

    // Prepare assistant placeholder for streaming
    const assistantPlaceholder = { role: 'assistant', message: '' };
    setMessages(prev => [...prev, assistantPlaceholder]);
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          message: trimmed,
          sessionId: activeSessionId
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep partial line

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const data = JSON.parse(dataStr);
              if (data.sessionId && !activeSessionId) {
                setActiveSessionId(data.sessionId);
              }
              if (data.chunk) {
                accumulated += data.chunk;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      message: accumulated
                    };
                  }
                  return updated;
                });
              }
              if (data.done) {
                setIsGenerating(false);
              }
            } catch (err) {
              // Non-fatal parse warning
            }
          }
        }
      }

      // Refresh sessions in background to update title & last message
      api.get('/ai/sessions').then(res => {
        if (res.data?.sessions) setSessions(res.data.sessions);
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        console.error('Chat stream error:', err);
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              role: 'assistant',
              message: updated[lastIdx].message || 'Unable to connect to Gemini AI mentor. Please try again.'
            };
          }
          return updated;
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const samplePrompts = [
    {
      title: 'Dynamic Programming Guide',
      prompt: 'Explain the difference between Memoization and Tabulation in Dynamic Programming with a short, clean code example.',
      icon: Code2
    },
    {
      title: 'React 18 Performance',
      prompt: 'How does React 18 useTransition and useDeferredValue prevent UI blocking during heavy data rendering?',
      icon: Sparkles
    },
    {
      title: 'Honors Attendance Catchup',
      prompt: 'My attendance is below the 80% honors threshold. Create a 7-day catchup plan for my missed subjects and assignments.',
      icon: CalendarCheck
    },
    {
      title: 'System Design Interview',
      prompt: 'Provide a high-level architectural walkthrough for designing a real-time notification service handling 100k events/sec.',
      icon: TrendingUp
    }
  ];

  if (initialLoading) {
    return <Loader text="Connecting to EduPulse AI Mentor and loading sessions..." />;
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Left Conversations Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } transition-all duration-300 ease-in-out border-r border-slate-200/80 flex flex-col bg-slate-50/70 overflow-hidden flex-shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <button
            onClick={handleNewChat}
            className="flex-1 mr-2 px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <p className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Recent Conversations
          </p>
          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            const isEditing = editingSessionId === sess.id;

            return (
              <div
                key={sess.id}
                onClick={() => selectSession(sess.id)}
                className={`group relative p-3 rounded-2xl transition cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100 font-bold'
                    : 'text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={(e) => handleRename(sess.id, e)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename(sess.id, e)}
                      autoFocus
                      className="w-full bg-white px-2 py-0.5 text-xs rounded border border-indigo-300 focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs truncate block">{sess.title}</span>
                  )}
                </div>

                {/* Session Actions */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 pl-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSessionId(sess.id);
                      setEditTitle(sess.title);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                    title="Rename"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteSession(sess.id, e)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200/80 text-[11px] text-slate-400 text-center font-medium">
          Powered by Gemini • Realtime SSE
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
                title="Open conversation list"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-slate-900 truncate">
                {activeSession?.title || 'EduPulse AI Academic Mentor'}
              </h2>
              <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>Live Personalized Academic Advisor</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewChat}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Session</span>
            </button>
          </div>
        </div>

        {/* Messages Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            /* Empty Chat Onboarding Prompts */
            <div className="max-w-2xl mx-auto py-10 space-y-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Welcome, {user?.name || 'Scholar'}!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  I have full context of your enrolled courses, recent performance, and attendance records. Ask anything from coding algorithms to exam prep!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {samplePrompts.map((sp, idx) => {
                  const Icon = sp.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(sp.prompt)}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 transition text-left space-y-2 group"
                    >
                      <div className="flex items-center space-x-2 text-indigo-600">
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                          {sp.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {sp.prompt}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const isLastAssistant = !isUser && idx === messages.length - 1 && isGenerating;

                return (
                  <div
                    key={idx}
                    className={`flex items-start space-x-3 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-3xl p-4 sm:p-5 ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-600/10'
                          : 'bg-slate-50 text-slate-800 rounded-tl-sm border border-slate-200/80 shadow-sm'
                      }`}
                    >
                      {isUser ? (
                        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      ) : (
                        <div>
                          <FormattedMessage content={msg.message || ''} />
                          {isLastAssistant && (
                            <span className="inline-block w-2 h-4 bg-indigo-600 ml-1 animate-pulse" />
                          )}
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-2xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                        {user?.name?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="max-w-3xl mx-auto space-y-2">
            {isGenerating && (
              <div className="flex justify-center">
                <button
                  onClick={handleStopGenerating}
                  className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-md flex items-center space-x-2 transition"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop Generating</span>
                </button>
              </div>
            )}

            <div className="relative flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about data structures, homework, exam tips, or coding..."
                rows={1}
                disabled={isGenerating}
                className="w-full pl-4 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none transition"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isGenerating}
                className="absolute right-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-400">
              Shift + Enter for new line • EduPulse AI answers any academic, coding or study inquiry
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
