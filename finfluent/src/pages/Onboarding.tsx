import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Rocket } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { generateAIResponse } from '../lib/openrouter';

import random2 from '../assets/random5.png';
import mascot from '../assets/mascot.gif';
import logo from '../assets/logo.png';

export default function Onboarding() {
  const { user, refreshUserData } = useAppContext();
  const navigate = useNavigate();
  
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'assistant' | 'user', content: string}[]>([
    { role: 'assistant', content: `Hey ${user?.full_name?.split(' ')[0] || 'there'}! I'm your Finfluent Tutor. 🚀\n\nI'm here to help you secure that bag. Tell me a bit about your financial goals, or if you're ready to jump straight into the action, just hit **Enter Finfluent**!` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userAnswer = input.trim();
    setInput('');
    
    const updatedHistory = [...chatHistory, { role: 'user' as const, content: userAnswer }];
    setChatHistory(updatedHistory);
    
    // Add the empty placeholder (The loading dots will render INSIDE this now)
    setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);
    setIsTyping(true);

    const aiPrompt = `The user says: "${userAnswer}". You are the Finfluent AI Tutor. Give a hype, encouraging, 1-to-2 sentence response. Use markdown. Keep it a general conversation about their financial goals.`;

    await generateAIResponse(
      aiPrompt, null, updatedHistory.slice(-4),
      (chunkText) => {
        setChatHistory(prev => {
          const newH = [...prev];
          newH[newH.length - 1].content = chunkText;
          return newH;
        });
      }
    );

    setIsTyping(false);
  };

  const completeOnboarding = async () => {
    if (!user) return;
    setIsLocking(true);
    
    try {
      // Save their free-flowing chat as a baseline summary
      const aiContext = { baseline: chatHistory.map(m => m.content).join(" | ") };
      await supabase.from('profiles').update({ 
        has_completed_onboarding: true, 
        ai_context_summary: aiContext 
      }).eq('id', user.id);
        
      await refreshUserData();
      navigate('/dashboard'); 
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      setIsLocking(false);
    }
  };

  return (
    // STRICT FIX: h-[100dvh] prevents mobile address bar scrolling
    <div className="h-[100dvh] w-full flex flex-col md:flex-row bg-[#070b14] text-white overflow-hidden font-sans">
      
      {/* 🌌 AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* LEFT SIDE: Briefing (Hidden on Mobile to maximize chat space) */}
      <div className="hidden md:flex flex-col justify-between w-1/3 p-12 relative z-10 border-r border-white/5 bg-[#0f172a]/50 backdrop-blur-2xl">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <img src={logo} alt="Finfluent" className="w-12 h-12 object-contain" />
            <h1 className="text-3xl font-black tracking-tight">Finfluent</h1>
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight">Welcome to<br/><span className="text-blue-400">The Platform.</span></h2>
          <p className="text-white/60 text-lg mb-12">Chat with your tutor to set your goals, or enter the platform immediately.</p>
        </div>
        <motion.img animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} src={random2} alt="Decor" className="w-full max-w-xs object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] self-center" />
      </div>

      {/* RIGHT SIDE: Strictly Constrained Chat Flexbox */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10 bg-transparent">
        
        {/* Header with the Enter Button */}
        <div className="shrink-0 p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-xl shadow-md">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8 md:hidden" />
            <h1 className="font-black text-lg text-white">Setup Profile</h1>
          </div>
          <button 
            onClick={completeOnboarding}
            disabled={isLocking}
            className="flex items-center gap-2 bg-blue-600 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            {isLocking ? <Loader2 className="animate-spin" size={18} /> : <><Rocket size={18} /> Enter Finfluent</>}
          </button>
        </div>

        {/* Chat History Area (This is the ONLY thing that scrolls) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 scroll-smooth">
          <AnimatePresence>
            {chatHistory.map((msg, i) => {
              // THE BUG FIX: Identify if this is the empty streaming bubble
              const isStreamingPlaceholder = msg.role === 'assistant' && !msg.content;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} 
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && <img src={mascot} alt="Tutor" className="w-10 h-10 object-contain mr-3 self-end drop-shadow-lg" />}
                  
                  <div className={`max-w-[85%] md:max-w-[70%] p-4 md:p-5 rounded-3xl text-sm md:text-base leading-relaxed shadow-xl
                    ${msg.role === 'user' 
                      ? 'bg-blue-600 text-white font-medium rounded-br-sm border border-blue-500' 
                      : 'bg-[#1e293b]/90 backdrop-blur-md text-white/90 border border-white/10 rounded-bl-sm'}
                  `}>
                    {/* Render Loading Dots INSIDE the empty bubble! */}
                    {isStreamingPlaceholder ? (
                      <div className="flex gap-1.5 items-center h-6 px-2">
                        <motion.div className="w-2 h-2 bg-blue-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                        <motion.div className="w-2 h-2 bg-blue-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                        <motion.div className="w-2 h-2 bg-blue-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                      </div>
                    ) : msg.role === 'assistant' ? (
                      <ReactMarkdown className="prose prose-invert prose-p:mb-2 prose-strong:text-blue-300 max-w-none">
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area (Pinned to bottom) */}
        <div className="shrink-0 p-4 md:p-6 bg-[#070b14] border-t border-white/5">
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping || isLocking}
              placeholder="Chat with your tutor..."
              className="w-full bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] pl-6 pr-14 py-4 text-base text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors shadow-2xl"
            />
            <button type="submit" disabled={!input.trim() || isTyping || isLocking} className="absolute right-2.5 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/30 transition-all">
              <Send size={20} className={input.trim() && !isTyping ? 'translate-x-0.5 -translate-y-0.5 transition-transform' : ''} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}