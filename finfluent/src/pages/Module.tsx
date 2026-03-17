import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, CheckCircle, ArrowRight, Activity, Award, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

// Explicit Asset Imports
import random4 from '../assets/random4.png';
import mascot from '../assets/mascot.gif';
import fincoin from '../assets/fincoin.gif';

const STEPS = ['Overview', 'Topic 1', 'Topic 2', 'Topic 3', 'Summary', 'Simulation'];

export default function Module() {
  const { moduleId } = useParams();
  const { user, refreshUserData } = useAppContext();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [isModuleLoading, setIsModuleLoading] = useState(true);
  const [showReward, setShowReward] = useState(false);

  const videoId = "dQw4w9WgXcQ"; // Placeholder

  useEffect(() => {
    setTimeout(() => setIsModuleLoading(false), 800);
  }, [moduleId]);

  const advanceStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleCompleteModule();
    }
  };

  const handleCompleteModule = async () => {
    if (!user || !moduleId) return;
    setShowReward(true);

    try {
      await supabase.from('user_progress').upsert({
        user_id: user.id,
        module_id: parseInt(moduleId),
        is_unlocked: true,
        status: 'completed',
        simulation_score: 100,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id, module_id' });

      if (parseInt(moduleId) < 16) {
        await supabase.from('user_progress').upsert({
          user_id: user.id,
          module_id: parseInt(moduleId) + 1,
          is_unlocked: true,
          status: 'not_started'
        }, { onConflict: 'user_id, module_id' });
      }

      await supabase.from('profiles').update({
        spendable_fin_coins: user.spendable_fin_coins + 100,
        lifetime_fin_coins: user.lifetime_fin_coins + 100
      }).eq('id', user.id);

      await refreshUserData();
      setTimeout(() => navigate('/dashboard'), 4000);
    } catch (error) {
      console.error("Error completing module:", error);
    }
  };

  if (isModuleLoading) return (
    <div className="h-full flex flex-col items-center justify-center gap-4 text-white/50">
      <Loader2 className="w-12 h-12 animate-spin" />
      Loading Module {moduleId}...
    </div>
  );

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto relative animate-fade-in text-white">
      <img src={random4} alt="Decor" className="absolute top-0 right-0 opacity-10 w-96 h-96 pointer-events-none -z-10" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Module {moduleId}</h1>
        <div className="flex justify-between items-center mb-2">
          {STEPS.map((step, idx) => (
            <div key={step} className={`text-xs font-bold uppercase tracking-wider transition-colors ${idx <= currentStep ? 'text-white' : 'text-white/30'}`}>
              {step}
            </div>
          ))}
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col"
        >
          {currentStep < 5 ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 flex flex-col h-full border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <PlayCircle className="text-white/60" /> {STEPS[currentStep]} Video
              </h2>
              
              <div className="w-full aspect-video bg-black/50 rounded-2xl overflow-hidden mb-6 border border-white/5 relative shadow-inner">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${videoId}?controls=1`} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>

              {currentStep > 0 && currentStep < 4 && (
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 mb-6">
                  <h3 className="font-bold mb-2">Knowledge Check:</h3>
                  <p className="text-sm text-white/70 mb-4">What is the primary takeaway from this specific topic?</p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-sm font-semibold">A: Option 1</button>
                    <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-sm font-semibold">B: The correct answer</button>
                  </div>
                </div>
              )}

              <div className="mt-auto flex justify-end">
                <button onClick={advanceStep} className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors">
                  Complete & Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center justify-center h-full border border-white/10 shadow-2xl relative overflow-hidden">
              <Activity size={48} className="text-blue-400 mb-6" />
              <h2 className="text-3xl font-bold mb-4 text-center">Interactive Simulation</h2>
              <p className="text-center text-white/70 max-w-md mb-8">
                Apply what you've learned. The market is crashing, how do you re-allocate your portfolio to minimize risk?
              </p>
              
              <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-8">
                <button className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-colors font-semibold">Panic Sell</button>
                <button className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl hover:bg-green-500/20 transition-colors font-semibold">Hold & Diversify</button>
              </div>

              <button onClick={advanceStep} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-500 shadow-lg shadow-blue-900/50 transition-colors">
                <Award size={20} /> Submit Simulation
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showReward && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white/5 p-10 rounded-3xl flex flex-col items-center text-center border-2 border-yellow-500/30 shadow-2xl"
            >
              <img src={mascot} alt="Hype" className="w-24 h-24 mb-4 object-contain" />
              <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
                MODULE CLEAR!
              </h2>
              <p className="text-white/80 mb-6 font-semibold">Simulation Passed with flying colors.</p>
              
              <div className="flex items-center gap-3 bg-black/40 px-6 py-4 rounded-2xl border border-white/10 shadow-inner">
                <span className="text-3xl font-bold text-yellow-400">+100</span>
                <img src={fincoin} alt="FinCoins" className="w-8 h-8 object-contain" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}