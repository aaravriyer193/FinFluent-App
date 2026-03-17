import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { generateAIResponse } from '../lib/openrouter';

// Explicit Asset Imports
import random2 from '../assets/random2.png';
import mascot from '../assets/mascot.gif';

const ONBOARDING_QUESTIONS = [
  "What is your single biggest financial goal right now?",
  "How would you describe your current experience with investing?",
  "What is your biggest frustration when it comes to managing money?",
  "If you had an extra $1,000 right now, what would you do with it?",
  "Are you more focused on saving money or growing your income?"
];

export default function Onboarding() {
  const { user, refreshUserData } = useAppContext();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'assistant' | 'user', content: string}[]>([
    { role: 'assistant', content: `Hey there! I'm your Finfluent Tutor. Before we unlock your modules, I need to get to know you. Question 1: ${ONBOARDING_QUESTIONS[0]}` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || step >= 5) return;

    const userAnswer = input.trim();
    setInput('');
    const currentStep = step;
    
    const newAnswers = [...answers, userAnswer];
    setAnswers(newAnswers);
    
    const updatedHistory = [...chatHistory, { role: 'user' as const, content: userAnswer }];
    setChatHistory(updatedHistory);
    
    setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);
    setIsTyping(true);
    setStep(currentStep + 1);

    const isFinished = currentStep === 4;
    const aiPrompt = isFinished 
      ? `The user just answered the final question: "${userAnswer}". Give a brief, hype 2-sentence congratulatory response welcoming them to Finfluent.`
      : `The user answered: "${userAnswer}". Give a brief, encouraging 1-sentence reaction, and then explicitly ask this exact next question: "${ONBOARDING_QUESTIONS[currentStep + 1]}"`;

    await generateAIResponse(
      aiPrompt, null, updatedHistory.slice(-2),
      (chunkText) => {
        setChatHistory(prev => {
          const newH = [...prev];
          newH[newH.length - 1].content = chunkText;
          return newH;
        });
      }
    );

    setIsTyping(false);

    if (isFinished) {
      await completeOnboarding(newAnswers);
    }
  };

  const completeOnboarding = async (finalAnswers: string[]) => {
    if (!user) return;
    try {
      const logs = finalAnswers.map((ans, idx) => ({
        user_id: user.id, question_number: idx + 1, question: ONBOARDING_QUESTIONS[idx], answer: ans
      }));
      await supabase.from('onboarding_logs').insert(logs);

      const aiContext = { baseline: finalAnswers.join(" | ") };

      await supabase.from('profiles').update({ has_completed_onboarding: true, ai_context_summary: aiContext }).eq('id', user.id);
        
      await refreshUserData();
      setTimeout(() => navigate('/dashboard'), 3000); 
    } catch (error) {
      console.error("Error saving onboarding data:", error);
    }
  };

  return (
    // FORCING DARK MODE HERE
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f172a] text-white relative overflow-hidden">
      <img src={random2} alt="Decor" className="absolute top-10 left-10 opacity-10 w-64 h-64 pointer-events-none object-contain" />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/5 backdrop-blur-xl w-full max-w-2xl h-[600px] flex flex-col rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative z-10"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <img src={mascot} alt="Mascot" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="font-bold text-lg">Financial Profiling</h1>
              <p className="text-xs text-white/50">Step {Math.min(step + 1, 5)} of 5</p>
            </div>
          </div>
          <div className="w-32 h-2 bg-black/50 rounded-full overflow-hidden">
            <motion.div className="h-full bg-blue-500" initial={{ width: 0 }} animate={{ width: `${(step / 5) * 100}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {chatHistory.map((msg, i) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm md:text-base leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white font-medium rounded-br-sm shadow-md' : 'bg-white/10 text-white border border-white/5 rounded-bl-sm'}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/5 p-4 rounded-2xl rounded-bl-sm border border-white/5 flex gap-1 items-center">
                <motion.div className="w-2 h-2 bg-white/50 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                <motion.div className="w-2 h-2 bg-white/50 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                <motion.div className="w-2 h-2 bg-white/50 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
              </div>
            </div>
          )}
          {step >= 5 && !isTyping && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-4 text-sm text-green-400 font-bold flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin" />
                Profile Complete. Preparing your dashboard...
             </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-white/10">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping || step >= 5}
              placeholder={step >= 5 ? "Onboarding complete..." : "Type your answer..."}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
            />
            <button type="submit" disabled={!input.trim() || isTyping || step >= 5} className="absolute right-2 p-2 bg-white text-[#0f172a] rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors">
              <Send size={20} />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}