import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, ArrowRight, Activity, Award, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

// Power UI Vectors
import random1 from '../assets/random1.png';
import random2 from '../assets/random2.png';
import random4 from '../assets/random4.png';
import mascot from '../assets/mascot.gif';
import fincoin from '../assets/fincoin.gif';

// Defines the exact structure we are pulling from your Supabase table
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

  // Core State
  const [content, setContent] = useState<ModuleContent[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isModuleLoading, setIsModuleLoading] = useState(true);
  const [showReward, setShowReward] = useState(false);
  
  // Quiz Engine State
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 🗄️ FETCH THE CURRICULUM FROM SUPABASE
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
        console.error("Error fetching module content:", error);
      } finally {
        setIsModuleLoading(false);
      }
    };
    fetchContent();
  }, [moduleId]);

  const activeStep = content.find(c => c.step_index === currentStep);

  const handleAnswer = (option: string) => {
    if (!activeStep) return;
    setSelectedAnswer(option);
    setIsCorrect(option === activeStep.correct_option);
  };

  const advanceStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      setSelectedAnswer(null); // Reset quiz for the next step
      setIsCorrect(null);
    } else if (currentStep === 4) {
      setCurrentStep(5); // Enter the Final Simulation
    } else {
      handleCompleteModule(); // They cleared the boss fight!
    }
  };

  const handleCompleteModule = async () => {
    if (!user || !moduleId) return;
    setShowReward(true);

    try {
      // Mark current module cleared
      await supabase.from('user_progress').upsert({
        user_id: user.id, module_id: parseInt(moduleId), is_unlocked: true, status: 'completed', simulation_score: 100, completed_at: new Date().toISOString()
      }, { onConflict: 'user_id, module_id' });

      // Unlock next module
      if (parseInt(moduleId) < 16) {
        await supabase.from('user_progress').upsert({
          user_id: user.id, module_id: parseInt(moduleId) + 1, is_unlocked: true, status: 'not_started'
        }, { onConflict: 'user_id, module_id' });
      }

      // Award the bag 💰
      await supabase.from('profiles').update({
        spendable_fin_coins: user.spendable_fin_coins + 100, lifetime_fin_coins: user.lifetime_fin_coins + 100
      }).eq('id', user.id);

      await refreshUserData();
      setTimeout(() => navigate('/dashboard'), 4000);
    } catch (error) {
      console.error("Error completing module:", error);
    }
  };

// Loading Screen
  if (isModuleLoading || content.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center gap-6 text-white animate-pulse">
      <img src={mascot} alt="Loading" className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
      <span className="font-black tracking-widest uppercase text-xl text-blue-400">Loading Lesson...</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto relative animate-fade-in text-white pt-4 pb-10 px-2 md:px-0">
      
      {/* 🌌 AMBIENT GLOWS & PARALLAX VECTORS */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-20" />
      <motion.img 
        animate={{ y: [0, -20, 0], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        src={random4} alt="Decor" 
        className="absolute top-10 right-0 w-[400px] opacity-10 pointer-events-none -z-10 object-contain mix-blend-screen" 
      />

      {/* 📊 PROGRESS HUD */}
      <div className="mb-10 bg-[#1e293b]/50 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-10">
        <h1 className="text-3xl md:text-4xl font-black mb-6 tracking-tight flex items-center gap-4">
          <Book className="text-blue-400" size={32} /> Module {moduleId}
        </h1>
        
        {/* Step Nodes */}
        <div className="flex justify-between items-center mb-4 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 rounded-full -z-10" />
          <motion.div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full -z-10 shadow-[0_0_10px_rgba(37,99,235,0.8)]" 
            initial={{ width: 0 }} animate={{ width: `${(currentStep / 5) * 100}%` }} transition={{ duration: 0.5 }}
          />
          
          {content.map((step) => (
            <div key={step.step_index} className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 ${
              step.step_index < currentStep ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' :
              step.step_index === currentStep ? 'bg-[#0f172a] border-4 border-blue-500 text-blue-400' :
              'bg-[#0f172a] border-2 border-white/10 text-white/30'
            }`}>
              {step.step_index < currentStep ? <CheckCircle2 size={16} /> : step.step_index + 1}
            </div>
          ))}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 ${
            currentStep === 5 ? 'bg-[#0f172a] border-4 border-yellow-400 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]' : 'bg-[#0f172a] border-2 border-white/10 text-white/30'
          }`}>
            <Award size={16} />
          </div>
        </div>
        
        {/* Step Labels */}
        <div className="flex justify-between items-center px-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">Start</div>
          <div className={`text-[10px] font-black uppercase tracking-widest transition-colors ${currentStep === 5 ? 'text-yellow-400' : 'text-white/30'}`}>Simulation</div>
        </div>
      </div>

      {/* 🎬 DYNAMIC CONTENT ENGINE */}
      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -20 }} className="flex-1 flex flex-col z-10">
          
          {currentStep < 5 && activeStep ? (
            // ==========================================
            // VIDEO & QUIZ VIEW
            // ==========================================
            <div className="flex flex-col lg:flex-row gap-8 h-full">
              
              {/* Left Side: Video Player */}
              <div className="flex-1 flex flex-col bg-[#1e293b]/80 backdrop-blur-3xl rounded-[40px] p-6 md:p-8 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-3 mb-6">
                  <PlayCircle className="text-blue-400 drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]" size={32} />
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">{activeStep.step_title}</h2>
                </div>
                
                <div className="w-full aspect-video bg-black/80 rounded-[24px] overflow-hidden border border-white/5 relative shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${activeStep.video_id}?controls=1`} title="YouTube player" frameBorder="0" allowFullScreen></iframe>
                </div>
              </div>

              {/* Right Side: Knowledge Check (The Arcade Buttons) */}
              <div className="w-full lg:w-96 flex flex-col bg-gradient-to-b from-[#1e293b]/90 to-black/60 backdrop-blur-3xl rounded-[40px] p-6 md:p-8 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                <h3 className="font-black text-xl mb-4 flex items-center gap-2 text-white/90">
                  <Activity className="text-blue-400" size={24} /> Knowledge Check
                </h3>
                <p className="text-white/70 mb-8 font-semibold text-lg leading-relaxed">{activeStep.question_text}</p>
                
                <div className="flex flex-col gap-4 mb-8">
                  {/* Option A */}
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer('A')}
                    className={`relative overflow-hidden p-5 rounded-2xl border-2 text-left font-bold text-base transition-all duration-300 ${
                      selectedAnswer === 'A' 
                        ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]' : 'bg-red-500/20 border-red-500 text-red-400 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]') 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 text-white/80'
                    }`}
                  >
                    <span className="opacity-50 mr-2">A.</span> {activeStep.option_a}
                    {selectedAnswer === 'A' && isCorrect && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400" size={24} />}
                    {selectedAnswer === 'A' && !isCorrect && <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400" size={24} />}
                  </motion.button>

                  {/* Option B */}
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer('B')}
                    className={`relative overflow-hidden p-5 rounded-2xl border-2 text-left font-bold text-base transition-all duration-300 ${
                      selectedAnswer === 'B' 
                        ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]' : 'bg-red-500/20 border-red-500 text-red-400 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]') 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 text-white/80'
                    }`}
                  >
                    <span className="opacity-50 mr-2">B.</span> {activeStep.option_b}
                    {selectedAnswer === 'B' && isCorrect && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400" size={24} />}
                    {selectedAnswer === 'B' && !isCorrect && <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400" size={24} />}
                  </motion.button>
                </div>

                <div className="mt-auto">
                  <motion.button 
                    whileHover={isCorrect ? { scale: 1.05 } : {}} whileTap={isCorrect ? { scale: 0.95 } : {}}
                    onClick={advanceStep} 
                    disabled={!isCorrect} 
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(37,99,235,0.4)] disabled:opacity-20 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    Continue <ArrowRight size={24} />
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            // ==========================================
            // THE BOSS FIGHT (Simulation Step 5)
            // ==========================================
            <div className="bg-gradient-to-br from-indigo-900/60 via-[#1e293b]/90 to-black/80 backdrop-blur-3xl rounded-[40px] p-8 md:p-16 flex flex-col items-center justify-center h-full min-h-[500px] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.7)] relative overflow-hidden">
              
              {/* Massive Floating Background Vector */}
              <motion.img 
                animate={{ y: [0, -30, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                src={random1} alt="Simulation" 
                className="absolute left-[-10%] top-[10%] w-[400px] opacity-20 pointer-events-none drop-shadow-[0_0_50px_rgba(250,204,21,0.5)]" 
              />
              <motion.img 
                animate={{ y: [0, 30, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                src={random2} alt="Simulation" 
                className="absolute right-[-5%] bottom-[-5%] w-[350px] opacity-20 pointer-events-none mix-blend-screen" 
              />

              <Activity size={80} className="text-yellow-400 mb-8 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] relative z-10" />
              <h2 className="text-5xl font-black mb-6 text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 relative z-10">Final Simulation</h2>
              <p className="text-center text-white/80 max-w-2xl mb-12 text-xl font-medium relative z-10">
                You've mastered the theory. Now prove it. The market is experiencing a massive 20% correction, how do you re-allocate your portfolio to minimize long-term risk?
              </p>
              
              <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 relative z-10">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="p-8 bg-red-500/10 border-2 border-red-500/30 rounded-3xl hover:bg-red-500/20 hover:border-red-500/50 transition-all font-black text-xl text-red-400 flex flex-col items-center justify-center text-center gap-3">
                  <XCircle size={32} /> Panic Sell Everything
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="p-8 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-3xl hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all font-black text-xl text-emerald-400 flex flex-col items-center justify-center text-center gap-3">
                  <CheckCircle2 size={32} /> Hold & Diversify Assets
                </motion.button>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={advanceStep} 
                className="relative z-10 bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-950 px-12 py-6 rounded-full font-black text-2xl flex items-center gap-4 hover:shadow-[0_0_50px_rgba(250,204,21,0.6)] border-4 border-yellow-300 transition-all"
              >
                <Award size={32} /> Submit Simulation Strategy
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 🎆 EXPLOSIVE REWARD SCREEN */}
      <AnimatePresence>
        {showReward && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b14]/95 backdrop-blur-3xl">
            <motion.div 
              initial={{ scale: 0.5, y: 100, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              transition={{ type: "spring", damping: 15, stiffness: 100 }}
              className="bg-gradient-to-b from-[#1e293b] to-black p-12 md:p-16 rounded-[50px] flex flex-col items-center text-center border-4 border-yellow-500/50 shadow-[0_0_150px_rgba(250,204,21,0.3)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent pointer-events-none" />
              
              <img src={mascot} alt="Hype" className="w-40 h-40 mb-8 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] relative z-10" />
              <h2 className="text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 relative z-10">MODULE CLEAR!</h2>
              <p className="text-white/70 mb-10 font-black tracking-widest uppercase text-xl relative z-10">Simulation Passed. Vault Updated.</p>
              
              <div className="flex items-center gap-6 bg-black/60 px-10 py-6 rounded-full border-2 border-yellow-500/30 shadow-[inset_0_0_30px_rgba(250,204,21,0.1)] relative z-10">
                <span className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">+100</span>
                <img src={fincoin} alt="FinCoins" className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}