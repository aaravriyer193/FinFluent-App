import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { generateAIResponse } from '../lib/openrouter';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatBot() {
  const { user } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hey ${user?.full_name?.split(' ')[0] || 'there'}! I'm here to help you secure that bag. What are we working on today?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    
    // 1. Add user message
    const newChatHistory = [...messages, { role: 'user' as const, content: userText }];
    setMessages(newChatHistory);
    
    // 2. Add an empty assistant message to act as a placeholder for the stream
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    setIsTyping(true);

    // 3. Format context for the LLM
    const aiContext = {
      userName: user?.full_name || 'User',
      spendableCoins: user?.spendable_fin_coins || 0,
      currentTitle: user?.current_title || 'Novice',
      aiMemory: user?.ai_context_summary || {},
      moduleProgress: 'Check DB for latest progress' // You can expand this logic later!
    };

    // 4. Call the streaming API
    await generateAIResponse(
      userText,
      aiContext,
      newChatHistory.map(m => ({ role: m.role, content: m.content })),
      (chunkText) => {
        // Update the VERY LAST message in the array with the incoming streamed text
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = chunkText;
          return updated;
        });
      }
    );

    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end">
      {/* ========================================== */}
      {/* THE CHAT WINDOW */}
      {/* ========================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 md:w-96 h-[450px] glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-white/20"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <img src="/src/assets/mascot.gif" alt="Mascot" className="w-8 h-8" />
                <span className="font-bold">Finfluent Tutor</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-white text-background rounded-br-sm font-semibold' 
                      : 'bg-white/10 text-white rounded-bl-sm border border-white/5'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-3 rounded-2xl rounded-bl-sm border border-white/5 flex gap-1 items-center h-10">
                    <motion.div className="w-2 h-2 bg-white/50 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-2 h-2 bg-white/50 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-2 h-2 bg-white/50 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/20 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-white/30 text-white placeholder-white/40"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="bg-white text-background p-2 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* THE TRIGGER BUTTON (Always visible) */}
      {/* ========================================== */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full glass-panel flex items-center justify-center shadow-lg border border-white/20 relative overflow-hidden group"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <img src="/src/assets/mascot.gif" alt="Chat" className="w-12 h-12 object-contain" />
      </motion.button>
    </div>
  );
}