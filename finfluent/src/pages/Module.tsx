import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, ArrowRight, Activity, Award, Loader2, CheckCircle2, XCircle, Book } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

import random1 from '../assets/random1.png';
import random2 from '../assets/random2.png';
import random4 from '../assets/random4.png';
import mascot from '../assets/mascot.gif';
import fincoin from '../assets/fincoin.gif';

interface ModuleContent {
  step_index: number;
  step_title: string;
  video_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  correct_option: string;
}

export default function Module() {
  const { moduleId } = useParams();
  const { user, refreshUserData } = useAppContext();
  const navigate = useNavigate();

  const [content, setContent] = useState<ModuleContent[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isModuleLoading, setIsModuleLoading] = useState(true);
  const [showReward, setShowReward] = useState(false);
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!moduleId) return;
      try {
        const { data } = await supabase.from('module_content')
          .select('*')
          .eq('module_id', parseInt(moduleId))
          .order('step_index', { ascending: true });
        
        if (data) setContent(data);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setIsModuleLoading(false);
      }
    };
    fetchContent();
  }, [moduleId]);

  // THE KEY: Find the specific data for the current step
  const activeStepData = content.find(c => c.step_index === currentStep);

  const handleAnswer = (option: string) => {
    if (!activeStepData) return;
    setSelectedAnswer(option);
    setIsCorrect(option === activeStepData.correct_option);
  };

  const advanceStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else if (currentStep === 4) {
      setCurrentStep(5); // Final Simulation
    } else {
      handleCompleteModule();
    }
  };

  const handleCompleteModule = async () => {
    if (!user || !moduleId) return;
    setShowReward(true);
    try {
      await supabase.from('user_progress').upsert({
        user_id: user.id, module_id: parseInt(moduleId), is_unlocked: true, status: 'completed', simulation_score: 100, completed_at: new Date().toISOString()
      }, { onConflict: 'user_id, module_id' });

      if (parseInt(moduleId) < 16) {
        await supabase.from('user_progress').upsert({
          user_id: user.id, module_id: parseInt(moduleId) + 1, is_unlocked: true, status: 'not_started'
        }, { onConflict: 'user_id, module_id' });
      }

      await supabase.from('profiles').update({
        spendable_fin_coins: user.spendable_fin_coins + 100, lifetime_fin_coins: user.lifetime_fin_coins + 100
      }).eq('id', user.id);

      await refreshUserData();
      setTimeout(() => navigate('/dashboard'), 4000);
    } catch (e) { console.error(e); }
  };

  if (isModuleLoading || content.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center gap-6 text-white animate-pulse">
      <img src={mascot} alt="Loading" className="w-20 h-20 object-contain" />
      <span className="font-black tracking-widest uppercase text-xl text-blue-400">Loading Lesson...</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto relative animate-fade-in text-white pt-4 pb-10">
      
      {/* PROGRESS HUD */}
      <div className="mb-10 bg-[#1e293b]/50 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 shadow-2xl z-10 mx-2">
        <h1 className="text-3xl font-black mb-6 tracking-tight flex items-center gap-4">
          <Book className="text-blue-400" size={32} /> Module {moduleId}
        </h1>
        <div className="flex justify-between items-center mb-4 relative px-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 rounded-full -z-10" />
          <motion.div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full -z-10 shadow-[0_0_10px_rgba(37,99,235,0.8)]" initial={{ width: 0 }} animate={{ width: `${(currentStep / 5) * 100}%` }} />
          {content.map((s) => (
            <div key={s.step_index} className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 ${s.step_index < currentStep ? 'bg-blue-500 text-white shadow-lg' : s.step_index === currentStep ? 'bg-[#0f172a] border-4 border-blue-500 text-blue-400' : 'bg-[#0f172a] border-2 border-white/10 text-white/30'}`}>
              {s.step_index < currentStep ? <CheckCircle2 size={16} /> : s.step_index + 1}
            </div>
          ))}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${currentStep === 5 ? 'bg-yellow-400 text-yellow-900 shadow-lg' : 'bg-[#0f172a] border-2 border-white/10 text-white/30'}`}><Award size={16} /></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col z-10 px-2">
          {currentStep < 5 && activeStepData ? (
            <div className="flex flex-col lg:flex-row gap-8 h-full">
              <div className="flex-1 flex flex-col bg-[#1e293b]/80 backdrop-blur-3xl rounded-[40px] p-6 border border-white/10 shadow-2xl">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <PlayCircle className="text-blue-400" size={28} /> {activeStepData.step_title}
                </h2>
                <div className="w-full aspect-video bg-black/80 rounded-[24px] overflow-hidden border border-white/5 shadow-inner">
                  {/* DYNAMIC VIDEO LOADING */}
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${activeStepData.video_id}?controls=1`} title="Lesson" frameBorder="0" allowFullScreen></iframe>
                </div>
              </div>

              <div className="w-full lg:w-96 flex flex-col bg-gradient-to-b from-[#1e293b]/90 to-black/60 backdrop-blur-3xl rounded-[40px] p-6 border border-white/10 shadow-2xl">
                <h3 className="font-black text-xl mb-4 flex items-center gap-2">
                  <Activity className="text-blue-400" size={24} /> Quiz
                </h3>
                {/* DYNAMIC QUESTION LOADING */}
                <p className="text-white/70 mb-8 font-semibold leading-relaxed">{activeStepData.question_text}</p>
                
                <div className="flex flex-col gap-4 mb-8">
                  <button onClick={() => handleAnswer('A')} className={`p-5 rounded-2xl border-2 text-left font-bold transition-all ${selectedAnswer === 'A' ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-400') : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'}`}>
                    A. {activeStepData.option_a}
                  </button>
                  <button onClick={() => handleAnswer('B')} className={`p-5 rounded-2xl border-2 text-left font-bold transition-all ${selectedAnswer === 'B' ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-400') : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'}`}>
                    B. {activeStepData.option_b}
                  </button>
                </div>

                <button onClick={advanceStep} disabled={!isCorrect} className="mt-auto w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-20 shadow-xl">
                  Continue <ArrowRight size={24} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#1e293b]/90 backdrop-blur-3xl rounded-[40px] p-8 md:p-16 flex flex-col items-center justify-center h-full min-h-[500px] border border-white/10 text-center relative overflow-hidden">
               <motion.img animate={{ y: [0, 30, 0] }} transition={{ duration: 7, repeat: Infinity }} src={random1} className="absolute left-[-10%] top-[10%] w-[400px] opacity-10" />
               <Activity size={80} className="text-yellow-400 mb-8 drop-shadow-lg" />
               <h2 className="text-5xl font-black mb-6">Final Simulation</h2>
               <p className="text-white/80 max-w-2xl mb-12 text-xl">The market is shifting. How do you re-allocate based on this module's training?</p>
               <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 relative z-10">
                 <button className="p-8 bg-red-500/10 border-2 border-red-500/30 rounded-3xl font-black text-red-400">Panic Action</button>
                 <button className="p-8 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-3xl font-black text-emerald-400">Disciplined Action</button>
               </div>
               <button onClick={advanceStep} className="bg-yellow-500 text-yellow-900 px-12 py-6 rounded-full font-black text-2xl border-4 border-yellow-300 shadow-2xl">Submit Simulation</button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* REWARD SCREEN */}
      <AnimatePresence>
        {showReward && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b14]/95 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="bg-[#1e293b] p-12 rounded-[50px] flex flex-col items-center text-center border-4 border-yellow-500/50 shadow-2xl">
              <img src={mascot} alt="Hype" className="w-40 h-40 mb-8 object-contain" />
              <h2 className="text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600">MODULE CLEAR!</h2>
              <div className="flex items-center gap-6 bg-black/60 px-10 py-6 rounded-full border-2 border-yellow-500/30">
                <span className="text-5xl font-black text-yellow-400">+100</span>
                <img src={fincoin} alt="Coins" className="w-14 h-14" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}