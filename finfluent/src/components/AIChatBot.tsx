import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Zap, AlertCircle } from 'lucide-react';
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
      content: `Hey **${user?.full_name?.split(' ')[0] || 'there'}**! I'm your Finfluent Tutor. 🤖\n\nI can help you with up to 100 queries per month. How can I help you scale today?` 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🛡️ LIMIT CHECK (100 responses)
  const monthlyLimit =100;
  const currentUsage = user?.ai_message_count || 0;
  const isLimitReached = currentUsage >= monthlyLimit;

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || isLimitReached) return;

    const userText = input.trim();
    setInput('');
    
    const newChatHistory = [...messages, { role: 'user' as const, content: userText }];
    setMessages(newChatHistory);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    setIsTyping(true);

    const aiContext = {
      userName: user?.full_name || 'User',
      spendableCoins: user?.spendable_fin_coins || 0,
      currentTitle: user?.current_title || 'Novice',
      aiMemory: user?.ai_context_summary || {}
    };

    try {
      await generateAIResponse(
        userText,
        aiContext,
        newChatHistory,
        (chunkText) => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].content = chunkText;
            return updated;
          });
        }
      );

      // 📈 Increment the counter in the DB after successful response
      await supabase.rpc('increment_ai_count', { user_id: user?.id });
      await refreshUserData(); // Update local state so the UI knows the new count
      
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(10px)' }}
            className="mb-6 w-[calc(100vw-2rem)] md:w-[400px] h-[550px] bg-[#0f172a]/90 backdrop-blur-2xl rounded-[32px] flex flex-col overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6)] border border-white/10"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-gradient-to-r from-blue-600/20 to-transparent">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400 blur-md opacity-40 animate-pulse" />
                  <img src={mascot} alt="Mascot" className="w-10 h-10 object-contain relative z-10" />
                </div>
                <div>
                  <h3 className="font-black text-white leading-none text-sm">Finfluent Tutor</h3>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">
                    Usage: {currentUsage} / {monthlyLimit}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white transition-colors bg-white/5 p-2 rounded-xl">
                <X size={20} />
              </button>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 scroll-smooth custom-scrollbar">
              {messages.map((msg, idx) => {
                const isAssistant = msg.role === 'assistant';
                const isStreaming = isAssistant && !msg.content;

                return (
                  <motion.div initial={{ opacity: 0, x: isAssistant ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} key={idx} className={`flex w-full ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                    <div className={`relative max-w-[85%] p-4 rounded-[24px] text-sm leading-relaxed shadow-2xl ${!isAssistant ? 'bg-blue-600 text-white font-bold rounded-br-sm border-b-4 border-blue-800' : 'bg-[#1e293b]/90 text-white/90 rounded-bl-sm border border-white/10'}`}>
                      {isStreaming ? (
                        <div className="flex items-center gap-3 px-2 py-1">
                          <img src={mascot} className="w-6 h-6 object-contain grayscale brightness-200" alt="loading" />
                          <div className="flex gap-1">
                            <motion.div className="w-1.5 h-1.5 bg-blue-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} />
                            <motion.div className="w-1.5 h-1.5 bg-blue-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
                          </div>
                        </div>
                      ) : isAssistant ? (
                        <ReactMarkdown className="prose prose-invert prose-p:mb-2 prose-strong:text-blue-300 max-w-none text-sm">
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* INPUT AREA */}
            <form onSubmit={handleSend} className="p-5 bg-black/40 border-t border-white/5">
              {isLimitReached ? (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold">
                  <AlertCircle size={18} />
                  <span>Monthly response limit reached (100/100).</span>
                </div>
              ) : (
                <div className="relative flex items-center group">
                  <div className="absolute left-4 text-white/20 group-focus-within:text-blue-400 transition-colors">
                    <Sparkles size={18} />
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isTyping}
                    placeholder="Ask your tutor anything..."
                    className="w-full bg-[#0f172a] border border-white/10 rounded-2xl pl-12 pr-14 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 shadow-inner"
                  />
                  <button type="submit" disabled={!input.trim() || isTyping} className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/10 transition-all">
                    <Send size={18} />
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TRIGGER BUTTON (Red Dot removed) */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-20 h-20 rounded-[24px] bg-blue-600 flex items-center justify-center shadow-[0_15px_40px_rgba(37,99,235,0.4)] border-b-4 border-blue-800 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <img src={mascot} alt="Chat" className="w-12 h-12 object-contain drop-shadow-xl" />
      </motion.button>
    </div>
  );
}