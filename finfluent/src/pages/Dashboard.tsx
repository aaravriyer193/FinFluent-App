import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Lock, Trophy, TrendingUp, Sparkles, CheckCircle2,
  Book, Wallet, PiggyBank, Landmark, LineChart, Coins, CreditCard, 
  Gem, ShieldCheck, Briefcase, BarChart, PieChart, Target, Rocket, Crown,
  ArrowRight
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import type { UserProgress, Profile } from '../types';

import random3 from '../assets/random3.png';
import fincoin from '../assets/fincoin.gif';
import mascot from '../assets/mascot.gif';

const MODULE_THEMES: Record<number, any> = {
  1: { icon: Book, color: 'text-blue-400', bg: 'bg-blue-500/20', glow: 'shadow-[0_0_25px_rgba(59,130,246,0.25)]', border: 'border-blue-500/30' },
  2: { icon: Wallet, color: 'text-teal-400', bg: 'bg-teal-500/20', glow: 'shadow-[0_0_25px_rgba(20,184,166,0.25)]', border: 'border-teal-500/30' },
  3: { icon: PiggyBank, color: 'text-green-400', bg: 'bg-green-500/20', glow: 'shadow-[0_0_25px_rgba(34,197,94,0.25)]', border: 'border-green-500/30' },
  4: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/20', glow: 'shadow-[0_0_25px_rgba(16,185,129,0.25)]', border: 'border-emerald-500/30' },
  5: { icon: Landmark, color: 'text-purple-400', bg: 'bg-purple-500/20', glow: 'shadow-[0_0_25px_rgba(168,85,247,0.25)]', border: 'border-purple-500/30' },
  6: { icon: LineChart, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/20', glow: 'shadow-[0_0_25px_rgba(217,70,239,0.25)]', border: 'border-fuchsia-500/30' },
  7: { icon: Coins, color: 'text-pink-400', bg: 'bg-pink-500/20', glow: 'shadow-[0_0_25px_rgba(236,72,153,0.25)]', border: 'border-pink-500/30' },
  8: { icon: CreditCard, color: 'text-rose-400', bg: 'bg-rose-500/20', glow: 'shadow-[0_0_25px_rgba(244,63,94,0.25)]', border: 'border-rose-500/30' },
  9: { icon: Gem, color: 'text-orange-400', bg: 'bg-orange-500/20', glow: 'shadow-[0_0_25px_rgba(249,115,22,0.25)]', border: 'border-orange-500/30' },
  10: { icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/20', glow: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]', border: 'border-amber-500/30' },
  11: { icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/20', glow: 'shadow-[0_0_25px_rgba(99,102,241,0.25)]', border: 'border-indigo-500/30' },
  12: { icon: BarChart, color: 'text-violet-400', bg: 'bg-violet-500/20', glow: 'shadow-[0_0_25px_rgba(139,92,246,0.25)]', border: 'border-violet-500/30' },
  13: { icon: PieChart, color: 'text-cyan-400', bg: 'bg-cyan-500/20', glow: 'shadow-[0_0_25px_rgba(6,182,212,0.25)]', border: 'border-cyan-500/30' },
  14: { icon: Target, color: 'text-sky-400', bg: 'bg-sky-500/20', glow: 'shadow-[0_0_25px_rgba(14,165,233,0.25)]', border: 'border-sky-500/30' },
  15: { icon: Rocket, color: 'text-red-400', bg: 'bg-red-500/20', glow: 'shadow-[0_0_25px_rgba(239,68,68,0.25)]', border: 'border-red-500/30' },
  16: { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/20', glow: 'shadow-[0_0_25px_rgba(234,179,8,0.25)]', border: 'border-yellow-500/30' },
};

export default function Dashboard() {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [modules, setModules] = useState<{id: number, title: string, description: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchDashboardData = async () => {
      try {
        const [progressData, boardData, moduleData] = await Promise.all([
          supabase.from('user_progress').select('*').eq('user_id', user.id),
          supabase.from('profiles').select('*').order('lifetime_fin_coins', { ascending: false }).limit(3),
          supabase.from('modules').select('*').order('id', { ascending: true })
        ]);
        if (progressData.data) setProgress(progressData.data);
        if (boardData.data) setLeaderboard(boardData.data);
        if (moduleData.data) setModules(moduleData.data);
      } catch (error) {
        console.error(error);
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

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full animate-fade-in text-white pb-12 overflow-x-hidden">
      
      {/* LEFT COLUMN: Added min-w-0 to prevent flex blowout */}
      <div className="flex-1 flex flex-col gap-10 min-w-0">
        
        {/* HERO BANNER */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1e293b]/80 backdrop-blur-3xl rounded-[40px] p-8 md:p-12 relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-transparent pointer-events-none" />
          <div className="relative z-10 md:w-2/3">
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-tight">
              Ready to earn,<br/><span className="text-blue-400">{user?.full_name?.split(' ')[0] || 'Investor'}?</span>
            </h1>
            <div className="flex items-center gap-2 mb-8 bg-black/40 w-fit px-5 py-2 rounded-full border border-white/10 text-sm font-bold uppercase tracking-wider">
              <Sparkles className="text-yellow-400" size={16} /> Rank: <span className="text-white ml-2">{user?.current_title}</span>
            </div>
            <button onClick={() => navigate('/modules')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-500 transition-all shadow-lg border-b-4 border-blue-800 text-lg">
              <TrendingUp size={22} /> Enter Roadmap
            </button>
          </div>
          <motion.img animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} src={random3} className="absolute right-[-20px] bottom-[-20px] w-64 h-64 md:w-96 md:h-96 object-contain pointer-events-none" />
        </motion.div>

        {/* ROADMAP SECTION: Added overflow-hidden to clip the trailing line */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <Book size={28} className="text-blue-400" /> Roadmap
            </h2>
            <span className="text-sm font-black tracking-widest text-white/40 uppercase bg-white/5 px-4 py-2 rounded-full border border-white/5">
              {progress.filter(p => p.status === 'completed').length} / 16 MODULES
            </span>
          </div>
          
          <div className="relative flex flex-col gap-6 pl-2 md:pl-4">
            {/* Energy Path Line: Properly constrained to icon center */}
            <div className="absolute left-[35px] md:left-[45px] top-10 bottom-10 w-1 bg-gradient-to-b from-blue-500/40 via-white/10 to-transparent rounded-full z-0" />

            {isLoading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <img src={mascot} className="w-20 h-20 object-contain animate-bounce" />
                <span className="text-xs font-black tracking-widest text-blue-400 uppercase">Synchronizing Roadmap...</span>
              </div>
            ) : (
              modules.map((mod, index) => {
                const isUnlocked = checkIsUnlocked(mod.id);
                const isCompleted = progress.find(p => p.module_id === mod.id)?.status === 'completed';
                const theme = MODULE_THEMES[mod.id] || MODULE_THEMES[1];
                const Icon = theme.icon;
                
                return (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => isUnlocked && navigate(`/module/${mod.id}`)}
                    className={`relative z-10 flex items-center gap-4 md:gap-6 p-4 md:p-7 rounded-[32px] border-2 transition-all duration-300 cursor-pointer group w-full ${
                      isCompleted 
                        ? 'bg-[#0f172a]/80 border-yellow-500/30' 
                        : isUnlocked 
                        ? `bg-[#1e293b]/90 border-white/10 ${theme.glow}` 
                        : 'bg-black/40 border-white/5 opacity-40 grayscale'
                    }`}
                  >
                    {/* The Icon Node */}
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform duration-500 group-hover:scale-110 ${
                      isCompleted ? 'bg-yellow-500 text-yellow-900 border-2 md:border-4 border-yellow-200' : 
                      isUnlocked ? `${theme.bg} ${theme.color} border-2 md:border-4 ${theme.border}` : 
                      'bg-white/5 text-white/20 border-2 md:border-4 border-white/5'
                    }`}>
                      <Icon size={isMobile ? 22 : 30} strokeWidth={2.5} />
                    </div>

                    {/* Text Block: Now with min-w-0 to handle truncation inside flex */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.1em] ${isCompleted ? 'text-yellow-400' : isUnlocked ? theme.color : 'text-white/20'}`}>
                          M{mod.id}
                        </span>
                        {isCompleted && <div className="bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase border border-yellow-500/20">Cleared</div>}
                      </div>
                      <h3 className={`font-black text-sm md:text-xl leading-tight truncate ${isUnlocked ? 'text-white' : 'text-white/40'}`}>
                        {isUnlocked ? mod.title : 'Locked Module'}
                      </h3>
                      <p className="text-white/40 text-[10px] md:text-sm mt-0.5 font-semibold truncate">
                        {isUnlocked ? mod.description : 'Unlock to view content.'}
                      </p>
                    </div>

                    {/* End Cap Status */}
                    <div className="hidden sm:flex flex-col items-end gap-2 shrink-0 ml-2">
                      {isUnlocked && !isCompleted ? (
                        <div className="flex items-center gap-2">
                          <img src={fincoin} className="w-5 h-5 md:w-7 md:h-7 object-contain" />
                          <div className="bg-blue-600 p-2 md:p-3 rounded-2xl group-hover:translate-x-1 transition-transform">
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      ) : isCompleted ? (
                        <CheckCircle2 size={24} className="text-yellow-400 opacity-50" />
                      ) : (
                        <Lock size={18} className="text-white/10" />
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* HALL OF WEALTH */}
      <div className="w-full lg:w-[360px] shrink-0">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#1e293b]/80 backdrop-blur-3xl rounded-[40px] p-6 md:p-8 border border-white/10 shadow-2xl sticky top-8">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 mb-8">
            <Trophy size={24} className="text-yellow-400" /> Hall of Wealth
          </h2>
          <div className="flex flex-col gap-4">
            {leaderboard.map((leader, idx) => (
              <div key={leader.id} className="flex items-center gap-4 p-4 rounded-[24px] bg-black/40 border border-white/5 shadow-inner">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : idx === 1 ? 'bg-slate-300 text-slate-800' : 'bg-amber-600 text-amber-50'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-black text-sm truncate text-white">{leader.full_name}</h4>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest truncate">{leader.current_title}</p>
                </div>
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl">
                  <span className="font-black text-xs text-yellow-400">{leader.lifetime_fin_coins}</span>
                  <img src={fincoin} className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/leaderboard')} className="w-full mt-8 py-5 rounded-2xl bg-white/5 text-xs font-black tracking-[0.2em] uppercase text-white border border-white/10 hover:bg-white/10 transition-all active:scale-95">Full Global Standings</button>
        </motion.div>
      </div>
    </div>
  );
}