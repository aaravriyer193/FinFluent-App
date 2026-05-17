import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';
import fincoin from '../assets/fincoin.gif';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .order('lifetime_fin_coins', { ascending: false })
      .limit(50)
      .then(({ data }) => { if (data) setLeaders(data); setIsLoading(false); });
  }, []);

  const podiumColors = [
    { bg: '#fef9c3', border: '#fde047', text: '#713f12' },  // gold
    { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' },  // silver
    { bg: '#fff7ed', border: '#fed7aa', text: '#92400e' },  // bronze
  ];

  const podiumIcons = [Trophy, Medal, Award];

  return (
    <div className="max-w-2xl mx-auto pb-16 animate-fade-in" style={{ color: 'var(--text-primary)' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={18} style={{ color: 'var(--warning)' }} />
          <h1 className="text-xl font-semibold" style={{ letterSpacing: '-0.025em' }}>Hall of Wealth</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          The highest lifetime FinCoin earners on the platform.
        </p>
      </motion.div>

      {/* Top 3 Podium */}
      {leaders.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-3 gap-3 mb-5"
        >
          {/* Reorder: 2nd, 1st, 3rd */}
          {[1, 0, 2].map((rank, col) => {
            const leader = leaders[rank];
            const palette = podiumColors[rank];
            const Icon = podiumIcons[rank];
            const isFirst = rank === 0;

            return (
              <div
                key={rank}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border text-center"
                style={{
                  background: palette.bg,
                  borderColor: palette.border,
                  transform: isFirst ? 'translateY(-8px)' : 'none',
                }}
              >
                <Icon size={16} style={{ color: palette.text }} />
                <div
                  className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2"
                  style={{ borderColor: palette.border, background: 'var(--bg-base)' }}
                >
                  {leader.avatar_url
                    ? <img src={leader.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-sm font-bold" style={{ color: palette.text }}>
                        {(leader.full_name || '?')[0].toUpperCase()}
                      </span>
                  }
                </div>
                <p className="text-xs font-semibold leading-tight truncate w-full" style={{ color: 'var(--text-primary)' }}>
                  {leader.full_name || 'Anon'}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold" style={{ color: palette.text }}>{leader.lifetime_fin_coins}</span>
                  <img src={fincoin} className="w-3.5 h-3.5" alt="" />
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Full list */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--bg-base)', borderColor: 'var(--border-soft)' }}
      >
        {/* Table header */}
        <div
          className="grid items-center px-4 py-2.5 border-b"
          style={{ gridTemplateColumns: '40px 1fr auto', borderColor: 'var(--border-soft)', background: 'var(--bg-subtle)' }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>#</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Player</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Earned</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading…</span>
          </div>
        ) : (
          leaders.map((leader, idx) => {
            const palette = idx < 3 ? podiumColors[idx] : null;
            const Icon = idx < 3 ? podiumIcons[idx] : null;

            return (
              <motion.div
                key={leader.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                className="grid items-center px-4 py-3 border-b transition-colors last:border-0"
                style={{
                  gridTemplateColumns: '40px 1fr auto',
                  borderColor: 'var(--border-soft)',
                  background: idx < 3 ? palette!.bg : 'var(--bg-base)',
                }}
              >
                {/* Rank */}
                <div className="flex items-center">
                  {Icon
                    ? <Icon size={16} style={{ color: palette!.text }} />
                    : <span className="text-xs font-semibold" style={{ color: 'var(--text-disabled)' }}>#{idx + 1}</span>
                  }
                </div>

                {/* Player */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border shrink-0"
                    style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-soft)' }}
                  >
                    {leader.avatar_url
                      ? <img src={leader.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                          {(leader.full_name || '?')[0].toUpperCase()}
                        </span>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {leader.full_name || 'Anonymous Investor'}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                      {leader.current_title || '—'}
                    </p>
                  </div>
                </div>

                {/* Coins */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-sm font-bold" style={{ color: idx < 3 ? palette!.text : 'var(--warning)' }}>
                    {leader.lifetime_fin_coins.toLocaleString()}
                  </span>
                  <img src={fincoin} alt="" className="w-5 h-5 object-contain" />
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Footer note */}
      <p className="text-center text-xs mt-5" style={{ color: 'var(--text-disabled)' }}>
        Rankings update in real-time · Based on lifetime FinCoins
      </p>
    </div>
  );
}