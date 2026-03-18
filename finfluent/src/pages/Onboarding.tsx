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
    { role: 'assistant', content: `Hey ${user?.full_name?.split(' ')[0] || 'there'}! I'm your Finfluent Tutor. 🚀\n\nI'm here to help you secure that bag. Tell me a bit about your financial goals, or if you're ready to jump straight into the action, just hit **Enter Platform**!` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // 🔥 THE NEW EXTRACTION & NOTIFICATION LOGIC 🔥
  const completeOnboarding = async () => {
    if (!user) return;
    setIsLocking(true);
    
    try {
      let finalSummary = 'User skipped onboarding chat. Goals unknown. General financial literacy path recommended.';
      let parsedNotifications = [];

      if (chatHistory.length > 1) {
        const fullConversation = chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
        
        // --- API CALL 1: Extract Context ---
        const extractionPrompt = `
          You are an expert data extractor for a financial app. Analyze the following onboarding conversation and extract ONLY the user's specific financial goals, their current experience level, and motivations.
          Format the output as a clean, concise bulleted list of facts. Do not include conversational filler.
          
          CONVERSATION LOG:
          ${fullConversation}
        `;

        let extractedSummary = "";
        await generateAIResponse(extractionPrompt, null, [], (chunk) => { extractedSummary = chunk; });
        
        if (extractedSummary && extractedSummary.trim() !== "") {
          finalSummary = extractedSummary.trim();
        }

        // --- API CALL 2: Generate Custom JSON Notifications ---
        const notificationPrompt = `
          Based on the following user profile and goals, generate 10 highly engaging, personalized push notifications for our financial app called "Finfluent".
          
          Constraints:
          1. Exactly 10 notifications.
          2. Max 2 short lines each. Keep them punchy.
          3. Create urgency, motivation, or curiosity directly related to their specific goals mentioned in the profile.
          4. Output STRICTLY as a valid JSON array of objects. Do not use markdown blocks (\`\`\`). Do not include any text outside the JSON array.
          
          Format: [{"notification": "text here"}, {"notification": "text here"}]
          
          USER PROFILE:
          ${finalSummary}
        `;

        let notificationsRaw = "";
        await generateAIResponse(notificationPrompt, null, [], (chunk) => { notificationsRaw = chunk; });

        // Safely parse the JSON (stripping out any markdown backticks the AI might accidentally add)
        try {
          const cleanedJson = notificationsRaw.replace(/```json/gi, '').replace(/```/g, '').trim();
          parsedNotifications = JSON.parse(cleanedJson);
        } catch (parseError) {
          console.error("Failed to parse notifications JSON:", parseError);
          // Fallback generic notifications if parsing fails
          parsedNotifications = [
            { notification: "Time to secure the bag! Open Finfluent and continue your journey. 🚀" },
            { notification: "Your daily financial lesson is waiting. Don't lose your streak! 🔥" }
          ];
        }
      } else {
        // Fallback for users who skipped the chat entirely
        parsedNotifications = [
          { notification: "Ready to master your money? Jump into your first Finfluent module! 💸" },
          { notification: "Consistency is key. Secure your daily FinCoins now! 🪙" }
        ];
      }

      // --- SAVE TO SUPABASE ---
      await supabase.from('profiles').update({ 
        has_completed_onboarding: true, 
        ai_context_summary: finalSummary,
        notifications: parsedNotifications // Saves the JSON array directly to the jsonb column
      }).eq('id', user.id);

      await refreshUserData();
      navigate('/dashboard'); 

    } catch (error) {
      console.error("Error finalizing onboarding:", error);
      setIsLocking(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full flex flex-col md:flex-row bg-[#070b14] text-white overflow-hidden overscroll-none font-sans">
      
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* LEFT SIDE: Persistent Info (Desktop only) */}
      <div className="hidden md:flex flex-col justify-between w-1/3 p-12 relative z-10 border-r border-white/5 bg-[#0f172a]/50 backdrop-blur-2xl">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <img src={logo} alt="Finfluent" className="w-12 h-12 object-contain" />
            <h1 className="text-3xl font-black tracking-tight">Finfluent</h1>
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight">Welcome to<br/><span className="text-blue-400">The Platform.</span></h2>
          <p className="text-white/60 text-lg mb-12">Set your goals with your tutor to customize your wealth journey.</p>
        </div>
        <motion.img animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} src={random2} alt="Decor" className="w-full max-w-xs object-contain opacity-20 self-center" />
      </div>

      {/* RIGHT SIDE: The Chat Sandwich */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10 bg-transparent">
        
        {/* TOP BAR: shrink-0 (Never moves) */}
        <div className="shrink-0 p-4 border-b border-white/10 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-xl z-20 shadow-lg">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8 md:hidden" />
            <h1 className="font-black text-lg text-white">Setup Profile</h1>
          </div>
          <button 
            onClick={completeOnboarding}
            disabled={isLocking}
            className="flex items-center gap-2 bg-blue-600 px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50"
          >
            {isLocking ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : <><Rocket size={18} /> Enter Platform</>}
          </button>
        </div>

        {/* MIDDLE: flex-1 overflow-y-auto */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 scroll-smooth min-h-0">
          <AnimatePresence initial={false}>
            {chatHistory.map((msg, i) => {
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
          <div ref={messagesEndRef} className="h-4 shrink-0" />
        </div>

        {/* BOTTOM BAR: shrink-0 */}
        <div className="shrink-0 p-4 bg-[#070b14] border-t border-white/5 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping || isLocking}
              placeholder="Chat with your tutor..."
              className="w-full bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] pl-6 pr-14 py-4 text-base text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors shadow-2xl"
            />
            <button type="submit" disabled={!input.trim() || isTyping || isLocking} className="absolute right-2.5 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-all disabled:opacity-50">
              <Send size={20} className={input.trim() && !isTyping ? 'translate-x-0.5 -translate-y-0.5' : ''} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}