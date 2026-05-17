import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Send, Sparkles, AlertCircle, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppContext } from '../context/AppContext';
import { generateAIResponse } from '../lib/openrouter';
import { supabase } from '../lib/supabase';

import mascot from '../assets/mascot.gif';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatBot() {
  const { user, refreshUserData } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hey **${user?.full_name?.split(' ')[0] || 'there'}**! I'm your Finfluent Tutor.\n\nYou have up to 100 queries per month. What can I help you with today?`,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const monthlyLimit = 100;
  const currentUsage = user?.ai_message_count || 0;
  const isLimitReached = currentUsage >= monthlyLimit;

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || isLimitReached) return;

    const userText = input.trim();
    setInput('');
    const newChatHistory = [...messages, { role: 'user' as const, content: userText }];
    setMessages(newChatHistory);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    setIsTyping(true);

    const aiContext = {
      userName: user?.full_name || 'User',
      spendableCoins: user?.spendable_fin_coins || 0,
      currentTitle: user?.current_title || 'Novice',
      aiMemory: user?.ai_context_summary || {},
    };

    try {
      await generateAIResponse(userText, aiContext, newChatHistory, chunkText => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = chunkText;
          return updated;
        });
      });
      await supabase.rpc('increment_ai_count', { user_id: user?.id });
      await refreshUserData();
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 w-[calc(100vw-2rem)] md:w-[360px] flex flex-col overflow-hidden rounded-2xl border shadow-lg"
            style={{
              background: 'var(--bg-base)',
              borderColor: 'var(--border-default)',
              height: '480px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}
          >
            {/* HEADER */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b shrink-0"
              style={{
                background: 'var(--bg-subtle)',
                borderColor: 'var(--border-soft)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <img src={mascot} alt="Tutor" className="w-8 h-8 object-contain" />
                <div>
                  <p
                    className="text-sm font-semibold leading-none mb-0.5"
                    style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
                  >
                    Finfluent Tutor
                  </p>
                  <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    {currentUsage} / {monthlyLimit} queries used
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
              >
                <X size={16} />
              </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
              {messages.map((msg, idx) => {
                const isAssistant = msg.role === 'assistant';
                const isStreaming = isAssistant && !msg.content;

                return (
                  <div
                    key={idx}
                    className={`flex w-full ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className="max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed"
                      style={
                        isAssistant
                          ? {
                              background: 'var(--bg-subtle)',
                              border: '1px solid var(--border-soft)',
                              color: 'var(--text-primary)',
                              borderRadius: '4px 12px 12px 12px',
                            }
                          : {
                              background: 'var(--accent)',
                              color: '#fff',
                              borderRadius: '12px 4px 12px 12px',
                            }
                      }
                    >
                      {isStreaming ? (
                        <div className="flex items-center gap-1 py-1">
                          {[0, 0.15, 0.3].map((delay, i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: 'var(--accent)' }}
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ repeat: Infinity, duration: 0.9, delay }}
                            />
                          ))}
                        </div>
                      ) : isAssistant ? (
                        <ReactMarkdown className="prose prose-sm max-w-none [&_strong]:font-semibold [&_p]:mb-1 last:[&_p]:mb-0">
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div
              className="shrink-0 px-3 py-3 border-t"
              style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}
            >
              {isLimitReached ? (
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border"
                  style={{
                    background: 'var(--warning-subtle, #fffbeb)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <AlertCircle size={14} />
                  Monthly limit reached (100/100).
                </div>
              ) : (
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={isTyping}
                    placeholder="Ask your tutor anything…"
                    className="flex-1 text-sm px-3 py-2 rounded-lg border outline-none transition-colors"
                    style={{
                      background: 'var(--bg-base)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={e =>
                      (e.currentTarget.style.borderColor = 'var(--accent)')
                    }
                    onBlur={e =>
                      (e.currentTarget.style.borderColor = 'var(--border-default)')
                    }
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="p-2 rounded-lg transition-colors shrink-0"
                    style={{
                      background: input.trim() && !isTyping ? 'var(--accent)' : 'var(--bg-overlay)',
                      color: input.trim() && !isTyping ? '#fff' : 'var(--text-disabled)',
                    }}
                  >
                    <Send size={15} />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TRIGGER BUTTON */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-all"
        style={{
          background: isOpen ? 'var(--accent)' : 'var(--bg-subtle)',
          borderColor: 'var(--border-default)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        {isOpen ? (
          <X size={20} color="#fff" />
        ) : (
          <img src={mascot} alt="Chat" className="w-9 h-9 object-contain" />
        )}
      </motion.button>
    </div>
  );
}