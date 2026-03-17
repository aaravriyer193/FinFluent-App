import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, ArrowRight, Activity, Award, Loader2, CheckCircle2, Book } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

// Imported random PNGs for the background
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
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchContentAndProgress = async () => {
      if (!moduleId || !user) return;
      try {
        const { data: contentData } = await supabase.from('module_content')
          .select('*')
          .eq('module_id', parseInt(moduleId))
          .order('step_index', { ascending: true });
        
        if (contentData) setContent(contentData);

        const { data: progressData } = await supabase.from('user_progress')
          .select('current_step, status')
          .eq('user_id', user.id)
          .eq('module_id', parseInt(moduleId))
          .single();

        if (progressData && progressData.status !== 'completed') {
          setCurrentStep(progressData.current_step || 0);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setIsModuleLoading(false);
      }
    };
    fetchContentAndProgress();
  }, [moduleId, user]);

  const activeStepData = content.find(c => c.step_index === currentStep);

  const handleAnswer = (option: string) => {
    if (!activeStepData) return;
    setSelectedAnswer(option);
    setIsCorrect(option === activeStepData.correct_option);
  };

  // Helper: Call this whenever they do ANY work to update the streak
  const recordDailyStreak = async () => {
    if (!user) return;
    try {
      const { data: streakData } = await supabase.from('user_streaks').select('*').eq('user_id', user.id).single();
      if (streakData) {
        const lastCheckIn = streakData.last_check_in ? new Date(streakData.last_check_in).toDateString() : '';
        const today = new Date().toDateString();

        if (lastCheckIn !== today) {
          const newStreak = streakData.current_streak + 1;
          const newLongest = Math.max(newStreak, streakData.longest_streak);
          
          await supabase.from('user_streaks').update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_check_in: new Date().toISOString()
          }).eq('user_id', user.id);
        }
      }
    } catch (error) {
      console.error("Streak Error:", error);
    }
  };

  const advanceStep = async () => {
    if (!user || !moduleId || content.length === 0) return;
    setIsSaving(true);

    try {
      // Record their hard work!
      await recordDailyStreak();

      const nextStep = currentStep + 1;

      // If there are more videos/quizzes left in the array...
      if (nextStep < content.length) {
        setCurrentStep(nextStep);
        setSelectedAnswer(null);
        setIsCorrect(null);
        
        await supabase.from('user_progress').upsert({
          user_id: user.id, module_id: parseInt(moduleId), current_step: nextStep, status: 'in_progress'
        }, { onConflict: 'user_id, module_id' });

      } else {
        // No more simulation! Straight to the reward.
        await handleCompleteModule();
      }
    } catch (e) {
      console.error("Error saving step progress:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteModule = async () => {
    if (!user || !moduleId) return;
    setShowReward(true);
    
    try {
      await recordDailyStreak();

      await supabase.from('user_progress').upsert({
        user_id: user.id, module_id: parseInt(moduleId), is_unlocked: true, status: 'completed', current_step: 0, simulation_score: 100, completed_at: new Date().toISOString()
      }, { onConflict: 'user_id, module_id' });

      if (parseInt(moduleId) < 16) {
        await supabase.from('user_progress').upsert({
          user_id: user.id, module_id: parseInt(moduleId) + 1, is_unlocked: true, status: 'not_started', current_step: 0
        }, { onConflict: 'user_id, module_id' });
      }

      await supabase.from('profiles').update({
        spendable_fin_coins: user.spendable_fin_coins + 100, lifetime_fin_coins: user.lifetime_fin_coins + 100
      }).eq('id', user.id);

      await refreshUserData();
      
      // Let them enjoy the sick animation for 4.5 seconds before redirecting
      setTimeout(() => navigate('/streak'), 4500); 
    } catch (e) { 
      console.error(e); 
    }
  };

  if (isModuleLoading || content.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center gap-6 text-white animate-pulse">
      <img src={mascot} alt="Loading" className="w-20 h-20 object-contain" />
      <span className="font-black tracking-widest uppercase text-xl text-blue-400">Loading Lesson...</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto relative animate-fade-in text-white pt-4 pb-10">
      
      {/* 🌌 AMBIENT FLOATING VECTORS (NOT BLURRED) */}
      <motion.img 
        src={random1} 
        animate={{ y: [0, -25, 0], rotate: [0, 5, 0] }} 
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} 
        className="absolute top-[5%] left-[-10%] w-56 opacity-40 -z-10 pointer-events-none drop-shadow-2xl" 
      />
      <motion.img 
        src={random2} 
        animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }} 
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} 
        className="absolute bottom-[10%] right-[-15%] w-72 opacity-30 -z-10 pointer-events-none drop-shadow-2xl" 
      />
      <motion.img 
        src={random4} 
        animate={{ x: [0, 20, 0], y: [0, 15, 0] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} 
        className="absolute top-[40%] right-[-5%] w-40 opacity-30 -z-10 pointer-events-none drop-shadow-2xl" 
      />

      {/* PROGRESS HUD */}
      <div className="mb-10 bg-[#1e293b]/50 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 shadow-2xl z-10 mx-2">
        <h1 className="text-3xl font-black mb-6 tracking-tight flex items-center gap-4">
          <Book className="text-blue-400" size={32} /> Module {moduleId}
        </h1>
        <div className="flex justify-between items-center mb-4 relative px-2">
          {/* Progress Bar Track */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 rounded-full -z-10" />
          {/* Active Progress Bar */}
          <motion.div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full -z-10 shadow-[0_0_10px_rgba(37,99,235,0.8)]" 
            initial={{ width: 0 }} 
            animate={{ width: `${(currentStep / (content.length - 1 || 1)) * 100}%` }} 
          />
          
          {content.map((s, index) => {
            const isCompleted = s.step_index < currentStep;
            const isCurrent = s.step_index === currentStep;
            // If it's the very last step, show the Award icon instead of the number
            const isFinalStep = index === content.length - 1;

            return (
              <div key={s.step_index} className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 shadow-xl ${
                isCompleted 
                  ? 'bg-blue-500 text-white' 
                  : isCurrent 
                    ? 'bg-[#0f172a] border-4 border-blue-500 text-blue-400 scale-110' 
                    : 'bg-[#0f172a] border-2 border-white/10 text-white/30'
              }`}>
                {isCompleted ? <CheckCircle2 size={20} /> : (isFinalStep ? <Award size={20} className={isCurrent ? "text-blue-400" : "text-white/30"} /> : s.step_index + 1)}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentStep < content.length && activeStepData && (
          <motion.div key={currentStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col z-10 px-2">
            <div className="flex flex-col lg:flex-row gap-8 h-full">
              
              {/* VIDEO PLAYER CARD */}
              <div className="flex-1 flex flex-col bg-[#1e293b]/80 backdrop-blur-3xl rounded-[40px] p-6 border border-white/10 shadow-2xl">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <PlayCircle className="text-blue-400" size={28} /> {activeStepData.step_title}
                </h2>
                <div className="w-full aspect-video bg-black/80 rounded-[24px] overflow-hidden border border-white/5 shadow-inner">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${activeStepData.video_id}?controls=1`} 
                    title="Lesson" 
                    frameBorder="0" 
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  ></iframe>
                </div>
              </div>

              {/* QUIZ CARD */}
              <div className="w-full lg:w-96 flex flex-col bg-gradient-to-b from-[#1e293b]/90 to-black/60 backdrop-blur-3xl rounded-[40px] p-6 border border-white/10 shadow-2xl">
                <h3 className="font-black text-xl mb-4 flex items-center gap-2">
                  <Activity className="text-blue-400" size={24} /> Quiz
                </h3>
                <p className="text-white/70 mb-8 font-semibold leading-relaxed">{activeStepData.question_text}</p>
                
                <div className="flex flex-col gap-4 mb-8">
                  <button onClick={() => handleAnswer('A')} className={`p-5 rounded-2xl border-2 text-left font-bold transition-all ${selectedAnswer === 'A' ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-400') : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'}`}>
                    A. {activeStepData.option_a}
                  </button>
                  <button onClick={() => handleAnswer('B')} className={`p-5 rounded-2xl border-2 text-left font-bold transition-all ${selectedAnswer === 'B' ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-400') : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'}`}>
                    B. {activeStepData.option_b}
                  </button>
                </div>

                <button onClick={advanceStep} disabled={!isCorrect || isSaving} className="mt-auto w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-20 shadow-xl">
                  {isSaving ? <Loader2 className="animate-spin" size={24} /> : <>Continue <ArrowRight size={24} /></>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏆 GRAND FINALE REWARD SCREEN */}
      <AnimatePresence>
        {showReward && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b14]/90 backdrop-blur-xl overflow-hidden"
          >
            {/* Spinning Golden Aura */}
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }} 
              className="absolute w-[200vw] h-[200vw] bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(234,179,8,0.15)_360deg)] mix-blend-screen pointer-events-none" 
            />

            <motion.div 
              initial={{ scale: 0.5, y: 50, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              transition={{ type: "spring", bounce: 0.6, duration: 0.8 }} 
              className="bg-gradient-to-b from-[#1e293b] to-black p-10 md:p-16 rounded-[50px] flex flex-col items-center text-center border-4 border-yellow-500/50 shadow-[0_0_100px_rgba(234,179,8,0.3)] relative z-10 w-[90%] max-w-lg"
            >
              {/* Mascot Pops In */}
              <motion.img 
                initial={{ y: 50, scale: 0.8 }} 
                animate={{ y: 0, scale: 1 }} 
                transition={{ delay: 0.3, type: "spring" }} 
                src={mascot} 
                alt="Hype" 
                className="w-48 h-48 mb-6 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]" 
              />
              
              {/* Pulsing Text */}
              <motion.h2 
                initial={{ scale: 0.9 }} 
                animate={{ scale: 1 }} 
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }} 
                className="text-5xl md:text-6xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-lg"
              >
                MODULE CLEAR!
              </motion.h2>

              {/* Glowing Coin Box */}
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ delay: 0.5, type: "spring" }} 
                className="flex items-center gap-6 bg-yellow-500/10 px-10 py-6 rounded-full border-2 border-yellow-500/50 shadow-[inset_0_0_30px_rgba(234,179,8,0.2)]"
              >
                <span className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]">+100</span>
                <img src={fincoin} alt="Coins" className="w-14 h-14" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}