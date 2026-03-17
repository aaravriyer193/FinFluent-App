import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Play, CheckCircle, Trophy, TrendingUp, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import type { UserProgress, Profile } from '../types';

// VITE FIX: Explicit Lowercase Imports
import random3 from '../assets/random3.png';
import fincoin from '../assets/fincoin.gif';

const MODULE_MAP = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  title: `Module ${i + 1}`,
  description: i === 0 ? 'The Foundation' : `Advanced Concepts ${i + 1}`,
}));

export default function Dashboard() {
  const { user } = useAppContext();
  const navigate = useNavigate();
  
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchDashboardData = async () => {
      try {
        const { data: progressData } = await supabase.from('user_progress').select('*').eq('user_id', user.id);
        if (progressData) setProgress(progressData);

        const { data: boardData } = await supabase.from('profiles').select('*').order('lifetime_fin_coins', { ascending: false }).limit(3);
        if (boardData) setLeaderboard(boardData);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const checkIsUnlocked = (moduleId: number) => {
    if (moduleId === 1) return true;
    const prevModule = progress.find(p => p.module_id === moduleId - 1);
    return prevModule?.status === 'completed';
  };

  const checkIsCompleted = (moduleId: number) => {
    return progress.find(p => p.module_id === moduleId)?.status === 'completed';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full animate-fade-in text-white">
      
      {/* LEFT COLUMN: Main Hub */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-900/50 to-slate-900/80 rounded-3xl p-8 relative overflow-hidden border border-white/10 shadow-2xl"
        >
          <div className="relative z-10 md:w-2/3">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Ready to level up, {user?.full_name?.split(' ')[0] || 'Investor'}?
            </h1>
            <p className="text-white/70 mb-6">
              Your title is currently <strong className="text-white">{user?.current_title}</strong>. 
              Complete simulations to earn FinCoins and climb the ranks.
            </p>
            <button 
              onClick={() => navigate('/module/1')}
              className="bg-white text-[#0f172a] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-lg"
            >
              <Play size={18} fill="currentColor" /> Resume Learning
            </button>
          </div>
          
          {/* Working Vector Import! */}
          <img 
            src={random3} 
            alt="Growth Vector" 
            className="absolute right-0 bottom-0 w-64 h-64 object-contain opacity-70 md:opacity-100 translate-x-10 translate-y-10"
          />
        </motion.div>

        {/* The 16 Module Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-white/60" />
            <h2 className="text-xl font-bold">The Curriculum</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MODULE_MAP.map((mod, index) => {
              const isUnlocked = checkIsUnlocked(mod.id);
              const isCompleted = checkIsCompleted(mod.id);
              
              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => isUnlocked && navigate(`/module/${mod.id}`)}
                  className={`relative p-5 rounded-2xl border transition-all duration-300 ${
                    isUnlocked 
                      ? 'bg-white/10 backdrop-blur-md hover:bg-white/20 cursor-pointer border-white/20 hover:-translate-y-1 shadow-lg' 
                      : 'bg-black/20 border-white/5 cursor-not-allowed grayscale-[50%] opacity-50'
                  }`}
                >
                  <div className="absolute top-4 right-4">
                    {isCompleted ? <CheckCircle className="text-green-400" size={20} /> : isUnlocked ? <Play className="text-white/60" size={20} /> : <Lock className="text-white/30" size={20} />}
                  </div>
                  <div className="mt-6">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Module {mod.id}</span>
                    <h3 className="font-bold text-lg mt-1">{isUnlocked ? mod.title : 'Locked'}</h3>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Leaderboard */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="text-yellow-400" size={24} />
            <h2 className="text-xl font-bold">Top Investors</h2>
          </div>

          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-white/50 w-8 h-8" />
              </div>
            ) : (
              leaderboard.map((leader, idx) => (
                <div key={leader.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/20 hover:bg-white/10 transition-colors border border-white/5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-300 text-black' : 'bg-amber-700 text-white'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold truncate text-sm">{leader.full_name}</h4>
                    <p className="text-xs text-white/50 truncate">{leader.current_title}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm">{leader.lifetime_fin_coins}</span>
                    <img src={fincoin} alt="Coins" className="w-4 h-4 object-contain" />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
      
    </div>
  );
}