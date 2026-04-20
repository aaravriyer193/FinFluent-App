import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, ArrowRight, Activity, Award, Loader2, CheckCircle2, Book, TestTube } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

// Imported Assets
import random1 from '../assets/random1.png';
import random2 from '../assets/random2.png';
import random4 from '../assets/random4.png';
import mascot from '../assets/mascot.gif';
import fincoin from '../assets/fincoin.gif';

// Audio imports
import yayAudio from '../assets/yay.mp3';
import noAudio from '../assets/no.mp3';
import fanfareAudio from '../assets/fanfare.mp3'; // NEW: Added Fanfare

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
  const [simulationHtml, setSimulationHtml] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [isModuleLoading, setIsModuleLoading] = useState(true);
  const [showReward, setShowReward] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [earnedCoins, setEarnedCoins] = useState<number>(0);
  const [totalModuleCoins, setTotalModuleCoins] = useState<number>(100);
  // Added duration to the coin state to allow for organic, random speeds
  const [dopamineCoins, setDopamineCoins] = useState<{id: number, startX: number, endX: number, endY: number, duration: number}[]>([]);

  useEffect(() => {
    const fetchContentAndProgress = async () => {
      if (!moduleId || !user) return;
      try {
        const { data: contentData } = await supabase.from('module_content')
          .select('*')
          .eq('module_id', parseInt(moduleId))
          .order('step_index', { ascending: true });
        
        if (contentData) setContent(contentData);

        const { data: moduleInfo } = await supabase.from('modules')
          .select('simulation_html')
          .eq('id', parseInt(moduleId))
          .single();
          
        if (moduleInfo?.simulation_html) {
          setSimulationHtml(moduleInfo.simulation_html);
        }

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

  // 🔥 THE IFRAME LISTENER FIX 🔥
  const handleCompleteRef = useRef<any>(null);

  useEffect(() => {
    handleCompleteRef.current = handleCompleteModule;
  }); 

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'FINFLUENT_SIM_COMPLETE') {
        const simCoins = event.data.coins || 0;
        if (handleCompleteRef.current) {
          await handleCompleteRef.current(simCoins);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []); 

  const activeStepData = content.find(c => c.step_index === currentStep);

  const handleAnswer = (option: string) => {
    if (!activeStepData || isCorrect) return; 

    const correct = option === activeStepData.correct_option;
    setSelectedAnswer(option);
    setIsCorrect(correct);

    if (correct) {
      const audio = new Audio(yayAudio);
      audio.volume = 0.6;
      audio.play().catch(e => console.log("Audio error:", e));

      const randomAmount = Math.floor(Math.random() * 11) + 10;
      setEarnedCoins(randomAmount);
      setTotalModuleCoins(prev => prev + randomAmount);

      // 🪙 ORGANIC PHYSICS-BASED COIN FOUNTAIN
      const burstCoins = Array.from({ length: 20 }).map((_, i) => {
        const angle = (Math.random() - 0.5) * Math.PI * 0.8; 
        // Randomize the power of the shot
        const velocity = 300 + Math.random() * 600; 
        // Randomize how long it takes to fall (creates separation)
        const duration = 1.5 + Math.random() * 1.5; 
        
        return {
          id: Date.now() + i,
          startX: 0,
          endX: Math.sin(angle) * velocity,
          endY: -Math.cos(angle) * velocity,
          duration: duration
        };
      });
      setDopamineCoins(burstCoins);
      
      // Clear coins after the longest possible duration (3 seconds)
      setTimeout(() => {
        setEarnedCoins(0);
        setDopamineCoins([]);
      }, 3000); 
      
    } else {
      const audio = new Audio(noAudio);
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio error:", e));
    }
  };

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
      await recordDailyStreak();

      if (earnedCoins > 0) {
        await supabase.from('profiles').update({
          spendable_fin_coins: (user.spendable_fin_coins || 0) + earnedCoins,
          lifetime_fin_coins: (user.lifetime_fin_coins || 0) + earnedCoins
        }).eq('id', user.id);
        await refreshUserData(); 
      }

      const nextStep = currentStep + 1;

      if (nextStep < content.length) {
        setCurrentStep(nextStep);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setEarnedCoins(0);
        setDopamineCoins([]);
        
        await supabase.from('user_progress').upsert({
          user_id: user.id, module_id: parseInt(moduleId), current_step: nextStep, status: 'in_progress'
        }, { onConflict: 'user_id, module_id' });

      } else if (nextStep === content.length && simulationHtml) {
        setCurrentStep(nextStep);
        await supabase.from('user_progress').upsert({
          user_id: user.id, module_id: parseInt(moduleId), current_step: nextStep, status: 'in_progress'
        }, { onConflict: 'user_id, module_id' });

      } else {
        await handleCompleteModule(0);
      }
    } catch (e) {
      console.error("Error saving step progress:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteModule = async (simCoinsEarned: number) => {
    if (!user || !moduleId || isSaving) return;
    setIsSaving(true);
    
    const finalPayout = 100 + simCoinsEarned;
    setTotalModuleCoins(prev => prev + simCoinsEarned); 
    
    setShowReward(true);

    // 🎺 Play the triumphant fanfare
    const audio = new Audio(fanfareAudio);
    audio.volume = 0.6;
    audio.play().catch(e => console.log("Audio error:", e));
    
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
        spendable_fin_coins: user.spendable_fin_coins + finalPayout, 
        lifetime_fin_coins: user.lifetime_fin_coins + finalPayout
      }).eq('id', user.id);

      await refreshUserData();
      
      setTimeout(() => navigate('/modules'), 4500); 
    } catch (e) { 
      console.error(e); 
    } finally {
      setIsSaving(false);
    }
  };

  if (isModuleLoading || content.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center gap-6 text-white animate-pulse">
      <img src={mascot} alt="Loading" className="w-20 h-20 object-contain" />
      <span className="font-black tracking-widest uppercase text-xl text-blue-400">Loading Lesson...</span>
    </div>
  );

  const totalSteps = simulationHtml ? content.length + 1 : content.length;

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto relative animate-fade-in text-white pt-4 pb-10">
      
      {/* 💥 ORGANIC PHYSICS-BASED COIN FOUNTAIN 💥 */}
      <AnimatePresence>
        {isCorrect && earnedCoins > 0 && (
          <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
            {dopamineCoins.map((coin) => (
              <motion.img
                key={coin.id}
                src={fincoin}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 1.5, 0.8], 
                  x: coin.endX, 
                  y: [0, coin.endY, coin.endY + 1000], 
                  opacity: [1, 1, 0] 
                }}
                transition={{ 
                  duration: coin.duration, // Each coin follows its own random timeline
                  ease: ["easeOut", "easeIn"], 
                  times: [0, 0.4, 1] 
                }}
                className="absolute w-14 h-14 object-contain drop-shadow-[0_0_20px_rgba(250,204,21,1)]"
              />
            ))}
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.6 }}
              className="text-8xl md:text-[120px] font-black text-yellow-400 drop-shadow-[0_10px_30px_rgba(234,179,8,1)] tracking-tighter z-10"
            >
              +{earnedCoins}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.img src={random1} animate={{ y: [0, -25, 0], rotate: [0, 5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[5%] left-[-10%] w-56 opacity-40 -z-10 pointer-events-none drop-shadow-2xl" />
      <motion.img src={random2} animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[10%] right-[-15%] w-72 opacity-30 -z-10 pointer-events-none drop-shadow-2xl" />
      <motion.img src={random4} animate={{ x: [0, 20, 0], y: [0, 15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[40%] right-[-5%] w-40 opacity-30 -z-10 pointer-events-none drop-shadow-2xl" />

      {/* PROGRESS HUD */}
      <div className="mb-10 bg-[#1e293b]/50 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 shadow-2xl z-10 mx-2">
        <h1 className="text-3xl font-black mb-6 tracking-tight flex items-center gap-4">
          <Book className="text-blue-400" size={32} /> Module {moduleId}
        </h1>
        <div className="flex justify-between items-center mb-4 relative px-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 rounded-full -z-10" />
          <motion.div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full -z-10 shadow-[0_0_10px_rgba(37,99,235,0.8)]" initial={{ width: 0 }} animate={{ width: `${(currentStep / (totalSteps - 1 || 1)) * 100}%` }} />
          
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isSimulationStep = simulationHtml && index === content.length;
            const isFinalStep = index === totalSteps - 1;

            return (
              <div key={index} className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 shadow-xl ${
                isCompleted ? 'bg-blue-500 text-white' : isCurrent ? 'bg-[#0f172a] border-4 border-blue-500 text-blue-400 scale-110' : 'bg-[#0f172a] border-2 border-white/10 text-white/30'
              }`}>
                {/* 🧪 Updated Code2 icon to TestTube for simulations! */}
                {isCompleted ? <CheckCircle2 size={20} /> : (isSimulationStep ? <TestTube size={18} className={isCurrent ? "text-blue-400" : "text-white/30"} /> : isFinalStep ? <Award size={20} className={isCurrent ? "text-blue-400" : "text-white/30"} /> : index + 1)}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* 🎬 STATE 1: VIDEO AND QUIZ */}
        {currentStep < content.length && activeStepData ? (
          <motion.div key={`step-${currentStep}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col z-10 px-2">
            <div className="flex flex-col lg:flex-row gap-8 h-full">
              
              <div className="flex-1 flex flex-col bg-[#1e293b]/80 backdrop-blur-3xl rounded-[40px] p-6 border border-white/10 shadow-2xl">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <PlayCircle className="text-blue-400" size={28} /> {activeStepData.step_title}
                </h2>
                <div className="w-full aspect-video bg-black/80 rounded-[24px] overflow-hidden border border-white/5 shadow-inner">
                  <iframe 
                    width="100%" height="100%" 
                    src={`https://www.youtube.com/embed/${activeStepData.video_id}?controls=1`} 
                    title="Lesson" frameBorder="0" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
                  ></iframe>
                </div>
              </div>

              <div className="w-full lg:w-96 flex flex-col bg-gradient-to-b from-[#1e293b]/90 to-black/60 backdrop-blur-3xl rounded-[40px] p-6 border border-white/10 shadow-2xl">
                <h3 className="font-black text-xl mb-4 flex items-center gap-2">
                  <Activity className="text-blue-400" size={24} /> Quiz
                </h3>
                <p className="text-white/70 mb-8 font-semibold leading-relaxed">{activeStepData.question_text}</p>
                
                <div className="flex flex-col gap-4 mb-8">
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    animate={selectedAnswer === 'A' && isCorrect === false ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    onClick={() => handleAnswer('A')} 
                    className={`p-5 rounded-2xl border-2 text-left font-bold transition-all ${selectedAnswer === 'A' ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-red-500/20 border-red-500 text-red-400') : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'}`}
                  >
                    A. {activeStepData.option_a}
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    animate={selectedAnswer === 'B' && isCorrect === false ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    onClick={() => handleAnswer('B')} 
                    className={`p-5 rounded-2xl border-2 text-left font-bold transition-all ${selectedAnswer === 'B' ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80') : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'}`}
                  >
                    B. {activeStepData.option_b}
                  </motion.button>
                </div>

                <button onClick={advanceStep} disabled={!isCorrect || isSaving} className="mt-auto w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-20 shadow-xl">
                  {isSaving ? <Loader2 className="animate-spin" size={24} /> : <>Continue <ArrowRight size={24} /></>}
                </button>
              </div>
            </div>
          </motion.div>

        // 💻 STATE 2: THE CUSTOM HTML SIMULATION
        ) : currentStep === content.length && simulationHtml ? (
          <motion.div key="simulation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col z-10 px-2 h-full min-h-[600px]">
            <div className="w-full h-full bg-[#070b14]/50 backdrop-blur-md rounded-[40px] overflow-hidden border border-white/10 shadow-2xl relative">
              <iframe 
                srcDoc={simulationHtml} 
                className="w-full h-full border-none rounded-[40px]"
                sandbox="allow-scripts allow-same-origin allow-forms"
                title="Finfluent Simulation"
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 🏆 STATE 3: SLEEK FINALE SCREEN (Simplicity) */}
      <AnimatePresence>
        {showReward && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#070b14]/95 backdrop-blur-3xl overflow-hidden"
          >
            <motion.img 
              initial={{ y: 50, scale: 0.8, opacity: 0 }} 
              animate={{ y: 0, scale: 1, opacity: 1 }} 
              transition={{ type: "spring", bounce: 0.4, delay: 0.1 }} 
              src={mascot} 
              alt="Hype" 
              className="w-56 h-56 mb-6 object-contain drop-shadow-[0_0_40px_rgba(59,130,246,0.4)] z-10" 
            />
            
            <motion.h2 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ type: "spring", bounce: 0.5, delay: 0.3 }} 
              className="text-[50px] md:text-[80px] font-black leading-none text-white drop-shadow-xl z-10 text-center tracking-tight"
            >
              MODULE CLEAR
            </motion.h2>

            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.6, type: "spring", bounce: 0.5 }} 
              className="flex items-center gap-4 mt-8 z-10 bg-white/5 px-8 py-4 rounded-[24px] border border-white/10 shadow-2xl"
            >
              <span className="text-4xl md:text-5xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">+{totalModuleCoins}</span>
              <img src={fincoin} alt="Coins" className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}