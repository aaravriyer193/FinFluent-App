import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock, Trophy, TrendingUp, CheckCircle2,
  Book, Wallet, PiggyBank, Landmark, LineChart, Coins, CreditCard,
  Gem, ShieldCheck, Briefcase, BarChart, PieChart, Target, Rocket, Crown,
  ArrowRight, MapPin
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import type { UserProgress, Profile } from '../types';

import random3 from '../assets/random3.png';
import fincoin from '../assets/fincoin.gif';
import mascot from '../assets/mascot.gif';

const MODULE_THEMES: Record<number, any> = {
  1:  { icon: Book,        color: 'text-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-100'   },
  2:  { icon: Wallet,      color: 'text-teal-500',    bg: 'bg-teal-50',    border: 'border-teal-100'   },
  3:  { icon: PiggyBank,   color: 'text-green-500',   bg: 'bg-green-50',   border: 'border-green-100'  },
  4:  { icon: TrendingUp,  color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  5:  { icon: Landmark,    color: 'text-purple-500',  bg: 'bg-purple-50',  border: 'border-purple-100' },
  6:  { icon: LineChart,   color: 'text-fuchsia-500', bg: 'bg-fuchsia-50', border: 'border-fuchsia-100' },
  7:  { icon: Coins,       color: 'text-pink-500',    bg: 'bg-pink-50',    border: 'border-pink-100'   },
  8:  { icon: CreditCard,  color: 'text-rose-500',    bg: 'bg-rose-50',    border: 'border-rose-100'   },
  9:  { icon: Gem,         color: 'text-orange-500',  bg: 'bg-orange-50',  border: 'border-orange-100' },
  10: { icon: ShieldCheck, color: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-100'  },
  11: { icon: Briefcase,   color: 'text-indigo-500',  bg: 'bg-indigo-50',  border: 'border-indigo-100' },
  12: { icon: BarChart,    color: 'text-violet-500',  bg: 'bg-violet-50',  border: 'border-violet-100' },
  13: { icon: PieChart,    color: 'text-cyan-500',    bg: 'bg-cyan-50',    border: 'border-cyan-100'   },
  14: { icon: Target,      color: 'text-sky-500',     bg: 'bg-sky-50',     border: 'border-sky-100'    },
  15: { icon: Rocket,      color: 'text-red-500',     bg: 'bg-red-50',     border: 'border-red-100'    },
  16: { icon: Crown,       color: 'text-yellow-500',  bg: 'bg-yellow-50',  border: 'border-yellow-100' },
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay },
});

export default function Dashboard() {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [progress, setProgress]     = useState<UserProgress[]>([]);
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [modules, setModules]        = useState<{ id: number; title: string; description: string }[]>([]);
  const [isLoading, setIsLoading]    = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [p, b, m] = await Promise.all([
          supabase.from('user_progress').select('*').eq('user_id', user.id),
          supabase.from('profiles').select('*').order('lifetime_fin_coins', { ascending: false }).limit(3),
          supabase.from('modules').select('*').order('id', { ascending: true }),
        ]);
        if (p.data) setProgress(p.data);
        if (b.data) setLeaderboard(b.data);
        if (m.data) setModules(m.data);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, [user]);

  const checkIsUnlocked = (id: number) => {
    if (id === 1) return true;
    return progress.find(p => p.module_id === id - 1)?.status === 'completed';
  };

  const completedCount = progress.filter(p => p.status === 'completed').length;

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full animate-fade-in pb-16 min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ── LEFT COLUMN ── */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">

        {/* Hero Banner */}
        <motion.div
          {...fadeUp(0)}
          className="relative overflow-hidden rounded-2xl border p-8"
          style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}
        >
          <div className="relative z-10 max-w-md">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Good to see you back</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Ready to earn,{' '}
              <span style={{ color: 'var(--accent)' }}>
                {user?.full_name?.split(' ')[0] || 'Investor'}?
              </span>
            </h2>
            <button
              onClick={() => navigate('/modules')}
              className="btn-primary inline-flex items-center gap-2"
              style={{ borderRadius: '10px', height: '38px', padding: '0 16px', fontSize: '0.875rem' }}
            >
              <TrendingUp size={16} />
              Enter Roadmap
            </button>
          </div>

          {/* Floating art */}
          <motion.img
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            src={random3}
            alt=""
            className="absolute right-0 bottom-0 w-52 h-52 object-contain pointer-events-none opacity-60"
          />
        </motion.div>

        {/* Progress bar */}
        <motion.div {...fadeUp(0.05)} className="flex items-center gap-3 px-1">
          <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
            {completedCount} / 16 modules complete
          </span>
          <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--bg-overlay)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(completedCount / 16) * 100}%`, background: 'var(--accent)' }}
            />
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            {Math.round((completedCount / 16) * 100)}%
          </span>
        </motion.div>

        {/* Section heading */}
        <motion.div {...fadeUp(0.08)} className="flex items-center justify-between px-1">
          <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Book size={16} style={{ color: 'var(--accent)' }} />
            Your Roadmap
          </h2>
        </motion.div>

        {/* Module list */}
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <img src={mascot} className="w-14 h-14 object-contain opacity-50" alt="" />
              <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Loading roadmap…</span>
            </div>
          ) : (
            modules.map((mod, index) => {
              const isUnlocked  = checkIsUnlocked(mod.id);
              const isCompleted = progress.find(p => p.module_id === mod.id)?.status === 'completed';
              const theme = MODULE_THEMES[mod.id] || MODULE_THEMES[1];
              const Icon  = theme.icon;

              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => isUnlocked && navigate(`/module/${mod.id}`)}
                  className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 ${isUnlocked ? 'cursor-pointer' : 'cursor-default opacity-40'}`}
                  style={{
                    background: isCompleted ? 'var(--bg-subtle)' : isUnlocked ? 'var(--bg-base)' : 'var(--bg-subtle)',
                    borderColor: isCompleted ? 'var(--border-soft)' : isUnlocked ? 'var(--border-default)' : 'var(--border-soft)',
                  }}
                  onMouseEnter={e => {
                    if (isUnlocked) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = isCompleted ? 'var(--border-soft)' : isUnlocked ? 'var(--border-default)' : 'var(--border-soft)';
                  }}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? 'bg-amber-50' : isUnlocked ? theme.bg : 'bg-gray-50'} border ${isCompleted ? 'border-amber-100' : isUnlocked ? theme.border : 'border-gray-100'}`}>
                    {isCompleted
                      ? <CheckCircle2 size={20} className="text-amber-500" />
                      : isUnlocked
                        ? <Icon size={20} className={theme.color} />
                        : <Lock size={16} style={{ color: 'var(--text-disabled)' }} />
                    }
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: isUnlocked ? 'var(--text-tertiary)' : 'var(--text-disabled)' }}>
                        Module {mod.id}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--warning-subtle)', color: 'var(--warning)' }}>
                          Cleared
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold truncate" style={{ color: isUnlocked ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
                      {isUnlocked ? mod.title : 'Locked Module'}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {isUnlocked ? mod.description : 'Complete previous module to unlock'}
                    </p>
                  </div>

                  {/* Right cap */}
                  {isUnlocked && !isCompleted && (
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={16} style={{ color: 'var(--accent)' }} />
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="w-full lg:w-72 shrink-0">
        <motion.div
          {...fadeUp(0.1)}
          className="sticky top-6 rounded-2xl border p-6"
          style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}
        >
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-5" style={{ color: 'var(--text-primary)' }}>
            <Trophy size={15} style={{ color: 'var(--warning)' }} />
            Hall of Wealth
          </h2>

          <div className="flex flex-col gap-2 mb-5">
            {leaderboard.map((leader, idx) => (
              <div
                key={leader.id}
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ background: 'var(--bg-base)', borderColor: 'var(--border-soft)' }}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: idx === 0 ? '#fef08a' : idx === 1 ? '#e2e8f0' : '#fde68a',
                    color: idx === 0 ? '#713f12' : idx === 1 ? '#475569' : '#92400e',
                  }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{leader.full_name || 'Anon'}</p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>{leader.current_title}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs font-bold" style={{ color: 'var(--warning)' }}>{leader.lifetime_fin_coins}</span>
                  <img src={fincoin} className="w-4 h-4" alt="" />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/leaderboard')}
            className="w-full text-xs font-semibold py-2.5 rounded-lg border transition-all"
            style={{ background: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)'}
          >
            Full Global Standings →
          </button>

          {/* Quick stats */}
          <div className="mt-5 pt-5 border-t grid grid-cols-2 gap-3" style={{ borderColor: 'var(--border-soft)' }}>
            <div className="rounded-lg p-3" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-soft)' }}>
              <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Coins</p>
              <div className="flex items-center gap-1">
                <span className="text-base font-bold" style={{ color: 'var(--warning)' }}>{user?.spendable_fin_coins || 0}</span>
                <img src={fincoin} className="w-4 h-4" alt="" />
              </div>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-soft)' }}>
              <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Complete</p>
              <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{completedCount}/16</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}