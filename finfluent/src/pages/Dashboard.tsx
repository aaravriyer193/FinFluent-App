import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Play, CheckCircle, Trophy, TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import type { UserProgress, Profile } from '../types';

import random3 from '../assets/random3.png';
import fincoin from '../assets/fincoin.gif';

const MODULE_MAP = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  title: `Module ${i + 1}`,
  description: i === 0 ? 'The Foundation' : `Level ${i + 1} Concepts`,
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
      <div className="flex-1 flex flex-col gap-8">
        
        {/* EPIC HERO BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1e293b]/80 backdrop-blur-2xl rounded-[40px] p-8 md:p-10 relative overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Inner Glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 md:w-2/3">
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
              Ready to level up,<br/><span className="text-blue-400">{user?.full_name?.split(' ')[0] || 'Investor'}?</span>
            </h1>
            <div className="flex items-center gap-2 mb-8 bg-black/40 w-fit px-4 py-2 rounded-full border border-white/5">
              <Sparkles className="text-yellow-400" size={16} />
              <p className="text-white/80 text-sm font-bold">
                Title: <span className="text-white">{user?.current_title}</span>
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/modules')}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/50"
            >
              <Play size={20} fill="currentColor" /> Enter Roadmap
            </motion.button>
          </div>
          
          {/* Animated Vector */}
          <motion.img 
            animate={{ y: [0, -15, 0], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            src={random3} 
            alt="Growth Vector" 
            className="absolute right-[-20px] bottom-[-20px] w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] pointer-events-none"
          />
        </motion.div>

        {/* NEON TERMINAL GRID */}
        <div>
          <div className="flex items-center gap-3 mb-6 px-2">
            <TrendingUp className="text-blue-400" size={24} />
            <h2 className="text-2xl font-black tracking-tight">Terminal Access</h2>
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
                  transition={{ delay: index * 0.03 }}
                  onClick={() => isUnlocked && navigate(`/module/${mod.id}`)}
                  className={`relative p-5 rounded-3xl border transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-900/20 border-emerald-500/30 hover:bg-emerald-900/40 cursor-pointer shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]'
                      : isUnlocked 
                      ? 'bg-blue-900/20 border-blue-500/50 hover:bg-blue-900/40 cursor-pointer hover:-translate-y-1 shadow-[0_0_15px_rgba(37,99,235,0.2)]' 
                      : 'bg-black/40 border-white/5 cursor-not-allowed grayscale opacity-40'
                  }`}
                >
                  <div className="absolute top-4 right-4">
                    {isCompleted ? (
                      <CheckCircle className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" size={24} />
                    ) : isUnlocked ? (
                      <Play className="text-blue-400 drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]" size={24} />
                    ) : (
                      <Lock className="text-white/20" size={20} />
                    )}
                  </div>
                  
                  <div className="mt-8">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-400/50' : isUnlocked ? 'text-blue-400/50' : 'text-white/30'}`}>
                      {mod.description}
                    </span>
                    <h3 className={`font-black text-lg mt-1 ${isUnlocked ? 'text-white' : 'text-white/50'}`}>
                      {isUnlocked ? mod.title : 'Encrypted'}
                    </h3>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Metallic Leaderboard */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#1e293b]/80 backdrop-blur-2xl rounded-[40px] p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" size={28} />
            <h2 className="text-2xl font-black tracking-tight">Top Ranked</h2>
          </div>

          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
              </div>
            ) : (
              leaderboard.map((leader, idx) => {
                // Determine Metallic Ranks
                const isGold = idx === 0;
                const isSilver = idx === 1;
                const isBronze = idx === 2;
                
                return (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    key={leader.id} 
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors cursor-default ${
                      isGold ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/50 shadow-[inset_0_0_20px_rgba(250,204,21,0.1)]' :
                      isSilver ? 'bg-gradient-to-r from-slate-300/10 to-transparent border-slate-400/30' :
                      isBronze ? 'bg-gradient-to-r from-amber-700/20 to-transparent border-amber-700/40' :
                      'bg-black/20 border-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-lg ${
                      isGold ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-900 border-2 border-yellow-200' : 
                      isSilver ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 border-2 border-white' : 
                      'bg-gradient-to-br from-amber-500 to-amber-800 text-amber-100 border-2 border-amber-400'
                    }`}>
                      {idx + 1}
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      <h4 className={`font-black truncate text-sm ${isGold ? 'text-yellow-400' : 'text-white'}`}>
                        {leader.full_name}
                      </h4>
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider truncate">
                        {leader.current_title}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="font-black text-sm">{leader.lifetime_fin_coins}</span>
                      <img src={fincoin} alt="Coins" className="w-4 h-4 object-contain" />
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
          
          <button 
            onClick={() => navigate('/leaderboard')}
            className="w-full mt-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-sm font-bold text-white transition-colors border border-white/5"
          >
            View Full Standings
          </button>
        </motion.div>
      </div>
      
    </div>
  );
}