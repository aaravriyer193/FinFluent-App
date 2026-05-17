import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock, Check, MapPin, Loader2,
  Book, Wallet, PiggyBank, TrendingUp, Landmark,
  LineChart, Coins, CreditCard, Gem, ShieldCheck,
  Briefcase, BarChart, PieChart, Target, Rocket, Crown,
  ArrowRight,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import type { UserProgress } from '../types';
import mascot from '../assets/mascot.gif';

const MODULE_CONFIG = [
  { icon: Book,        color: 'text-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-200',   dot: '#3b82f6' },
  { icon: Wallet,      color: 'text-teal-500',    bg: 'bg-teal-50',    border: 'border-teal-200',   dot: '#14b8a6' },
  { icon: PiggyBank,   color: 'text-green-500',   bg: 'bg-green-50',   border: 'border-green-200',  dot: '#22c55e' },
  { icon: TrendingUp,  color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200',dot: '#10b981' },
  { icon: Landmark,    color: 'text-purple-500',  bg: 'bg-purple-50',  border: 'border-purple-200', dot: '#a855f7' },
  { icon: LineChart,   color: 'text-fuchsia-500', bg: 'bg-fuchsia-50', border: 'border-fuchsia-200',dot: '#d946ef' },
  { icon: Coins,       color: 'text-pink-500',    bg: 'bg-pink-50',    border: 'border-pink-200',   dot: '#ec4899' },
  { icon: CreditCard,  color: 'text-rose-500',    bg: 'bg-rose-50',    border: 'border-rose-200',   dot: '#f43f5e' },
  { icon: Gem,         color: 'text-orange-500',  bg: 'bg-orange-50',  border: 'border-orange-200', dot: '#f97316' },
  { icon: ShieldCheck, color: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-200',  dot: '#f59e0b' },
  { icon: Briefcase,   color: 'text-indigo-500',  bg: 'bg-indigo-50',  border: 'border-indigo-200', dot: '#6366f1' },
  { icon: BarChart,    color: 'text-violet-500',  bg: 'bg-violet-50',  border: 'border-violet-200', dot: '#8b5cf6' },
  { icon: PieChart,    color: 'text-cyan-500',    bg: 'bg-cyan-50',    border: 'border-cyan-200',   dot: '#06b6d4' },
  { icon: Target,      color: 'text-sky-500',     bg: 'bg-sky-50',     border: 'border-sky-200',    dot: '#0ea5e9' },
  { icon: Rocket,      color: 'text-red-500',     bg: 'bg-red-50',     border: 'border-red-200',    dot: '#ef4444' },
  { icon: Crown,       color: 'text-yellow-500',  bg: 'bg-yellow-50',  border: 'border-yellow-200', dot: '#eab308' },
];

export default function Lessons() {
  const { user } = useAppContext();
  const navigate = useNavigate();

  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [modules, setModules] = useState<{ id: number; title: string; description: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchRoadmapData = async () => {
      try {
        const [progressRes, modulesRes] = await Promise.all([
          supabase.from('user_progress').select('*').eq('user_id', user.id),
          supabase.from('modules').select('*').order('id', { ascending: true }),
        ]);
        if (progressRes.data) setProgress(progressRes.data);
        if (modulesRes.data) setModules(modulesRes.data);
      } catch (error) {
        console.error('Error fetching roadmap data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoadmapData();
  }, [user]);

  const checkStatus = (modNum: number) => {
    if (modNum === 1)
      return progress.find(p => p.module_id === 1)?.status === 'completed' ? 'completed' : 'unlocked';
    const prevMod = progress.find(p => p.module_id === modNum - 1);
    const currMod = progress.find(p => p.module_id === modNum);
    if (currMod?.status === 'completed') return 'completed';
    if (prevMod?.status === 'completed') return 'unlocked';
    return 'locked';
  };

  const completedCount = MODULE_CONFIG.filter((_, i) => checkStatus(i + 1) === 'completed').length;

  if (isLoading) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center gap-3"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <img src={mascot} className="w-12 h-12 object-contain opacity-50" alt="" />
        <span className="text-xs font-medium">Loading curriculum…</span>
      </div>
    );
  }

  return (
    <div
      className="min-h-full pb-16"
      style={{ color: 'var(--text-primary)' }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <h1
          className="text-2xl font-semibold mb-1"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
        >
          Your Roadmap
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Complete each module to unlock the next. {completedCount} of {MODULE_CONFIG.length} cleared.
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--bg-overlay)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(completedCount / 16) * 100}%`, background: 'var(--accent)' }}
            />
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            {Math.round((completedCount / 16) * 100)}%
          </span>
        </div>
      </motion.div>

      {/* Module list */}
      <div className="flex flex-col gap-2">
        {MODULE_CONFIG.map((config, i) => {
          const modNum = i + 1;
          const status = checkStatus(modNum);
          const modData = modules.find(m => m.id === modNum);
          const Icon = config.icon;
          const isUnlocked = status !== 'locked';
          const isCompleted = status === 'completed';
          const isCurrent = status === 'unlocked';

          return (
            <motion.div
              key={modNum}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => isUnlocked && navigate(`/module/${modNum}`)}
              className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 ${isUnlocked ? 'cursor-pointer' : 'cursor-default opacity-40'}`}
              style={{
                background: isCompleted ? 'var(--bg-subtle)' : 'var(--bg-base)',
                borderColor: isCurrent ? 'var(--accent)' : isCompleted ? 'var(--border-soft)' : 'var(--border-soft)',
                boxShadow: isCurrent ? '0 0 0 1px var(--accent)' : 'none',
              }}
              onMouseEnter={e => {
                if (isUnlocked)
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = isCurrent
                  ? 'var(--accent)'
                  : isCompleted
                  ? 'var(--border-soft)'
                  : 'var(--border-soft)';
              }}
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                  isCompleted
                    ? 'bg-amber-50 border-amber-100'
                    : isUnlocked
                    ? `${config.bg} ${config.border}`
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                {isCompleted ? (
                  <Check size={18} className="text-amber-500" />
                ) : isUnlocked ? (
                  <Icon size={18} className={config.color} />
                ) : (
                  <Lock size={14} style={{ color: 'var(--text-disabled)' }} />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: isUnlocked ? 'var(--text-tertiary)' : 'var(--text-disabled)' }}
                  >
                    Module {modNum}
                  </span>
                  {isCompleted && (
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--warning-subtle)', color: 'var(--warning)' }}
                    >
                      Cleared
                    </span>
                  )}
                  {isCurrent && (
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                    >
                      Up next
                    </span>
                  )}
                </div>
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: isUnlocked ? 'var(--text-primary)' : 'var(--text-disabled)' }}
                >
                  {isUnlocked ? (modData?.title || `Module ${modNum}`) : 'Locked'}
                </p>
                {isUnlocked && modData?.description && (
                  <p
                    className="text-xs truncate mt-0.5"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {modData.description}
                  </p>
                )}
              </div>

              {/* Arrow */}
              {isUnlocked && !isCompleted && (
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={15} style={{ color: 'var(--accent)' }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}