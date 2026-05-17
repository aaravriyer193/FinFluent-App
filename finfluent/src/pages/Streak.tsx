import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Snowflake, ShieldCheck, Check, Loader2, PlayCircle, Flame, Share2, X, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import html2canvas from 'html2canvas';

import fincoinImg from '../assets/fincoin.gif';
import streakGif from '../assets/Streak.gif';
import logo from '../assets/logo.png';

export default function Streak() {
  const { user, refreshUserData } = useAppContext();
  const navigate = useNavigate();
  const shareCardRef = useRef<HTMLDivElement>(null);

  const [streakData, setStreakData] = useState<any>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSharing, setIsSharing]   = useState(false);
  const [status, setStatus]         = useState<'checked-in' | 'ready' | 'frozen' | 'lost'>('ready');
  const [hoursLeft, setHoursLeft]   = useState(0);
  const [displayStreak, setDisplayStreak] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [frozenIndices, setFrozenIndices]   = useState<number[]>([]);

  const FREEZE_COST = 50;
  const WEEK_DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const todayIndex  = new Date().getDay();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      setHoursLeft(Math.floor((midnight.getTime() - now.getTime()) / 3600000));
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        let { data } = await supabase.from('user_streaks').select('*').eq('user_id', user.id).single();
        if (!data) {
          const { data: nd } = await supabase.from('user_streaks').insert({
            user_id: user.id, current_streak: 0, longest_streak: 0, freezes_available: 0,
          }).select().single();
          data = nd;
        }
        evaluateStreakStatus(data);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    load();
  }, [user]);

  const evaluateStreakStatus = async (data: any) => {
    if (!data.last_check_in) {
      setStreakData(data); triggerNumberClimb(data.current_streak); setStatus('ready'); return;
    }
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDate  = new Date(new Date(data.last_check_in).toDateString());
    const diffDays  = Math.ceil(Math.abs(todayDate.getTime() - lastDate.getTime()) / 86400000);
    let updated = { ...data };

    const storageKey = `finfluent_frozen_${user?.id}`;
    let cached: { date: string; idx: number }[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const sevenDaysAgo = new Date(todayDate.getTime() - 7 * 86400000);
    cached = cached.filter(f => new Date(f.date) > sevenDaysAgo);

    if (diffDays === 0) {
      setStatus('checked-in'); triggerNumberClimb(updated.current_streak);
    } else if (diffDays === 1) {
      setStatus('ready'); triggerNumberClimb(updated.current_streak);
    } else {
      const missed = diffDays - 1;
      if (updated.freezes_available >= missed) {
        updated.freezes_available -= missed;
        updated.last_check_in = new Date(now.getTime() - 86400000).toISOString();
        await supabase.from('user_streaks').update({
          freezes_available: updated.freezes_available, last_check_in: updated.last_check_in,
        }).eq('user_id', user?.id);
        for (let i = 1; i <= missed; i++) {
          const d = new Date(todayDate.getTime() - i * 86400000);
          if (!cached.some(f => f.date === d.toISOString())) cached.push({ date: d.toISOString(), idx: d.getDay() });
        }
        setStatus('frozen'); triggerNumberClimb(updated.current_streak);
      } else {
        updated.current_streak = 0; updated.freezes_available = 0;
        await supabase.from('user_streaks').update({ current_streak: 0, freezes_available: 0 }).eq('user_id', user?.id);
        cached = []; setStatus('lost'); setDisplayStreak(0);
      }
    }
    localStorage.setItem(storageKey, JSON.stringify(cached));
    setFrozenIndices(cached.map(f => f.idx));
    setStreakData(updated);
  };

  const triggerNumberClimb = (target: number) => {
    if (target === 0) { setDisplayStreak(0); return; }
    const c = animate(0, target, { duration: 1.2, ease: 'easeOut', onUpdate: v => setDisplayStreak(Math.round(v)) });
    return c.stop;
  };

  const buyFreeze = async () => {
    if (!user || !streakData || isProcessing || (user.spendable_fin_coins || 0) < FREEZE_COST) return;
    setIsProcessing(true);
    try {
      await supabase.from('profiles').update({ spendable_fin_coins: user.spendable_fin_coins - FREEZE_COST }).eq('id', user.id);
      const nf = streakData.freezes_available + 1;
      await supabase.from('user_streaks').update({ freezes_available: nf }).eq('user_id', user.id);
      setStreakData({ ...streakData, freezes_available: nf });
      await refreshUserData();
    } catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  const handleNativeShare = async () => {
    if (!shareCardRef.current || isSharing) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, { backgroundColor: null, scale: 2, logging: false, useCORS: true });
      canvas.toBlob(async blob => {
        if (!blob) throw new Error('failed');
        const file = new File([blob], 'finfluent-streak.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: 'My Finfluent Streak', text: `I'm on a ${streakData.current_streak} day streak!`, files: [file] });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'finfluent-streak.png'; a.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (e) { console.error(e); }
    finally { setIsSharing(false); setShowShareModal(false); }
  };

  if (isLoading || !streakData) return (
    <div className="h-full flex flex-col items-center justify-center gap-3" style={{ color: 'var(--text-tertiary)' }}>
      <Loader2 className="animate-spin" size={24} />
      <span className="text-sm font-medium">Loading streak…</span>
    </div>
  );

  const isCheckedIn = status === 'checked-in';
  const isFrozen    = status === 'frozen';

  const accentColor = isCheckedIn ? '#f97316' : isFrozen ? '#3b82f6' : 'var(--accent)';

  return (
    <div className="flex flex-col min-h-full max-w-lg mx-auto p-4 pb-24 animate-fade-in" style={{ color: 'var(--text-primary)' }}>

      {/* Header row */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-sm font-semibold" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px' }}>
          Daily Energy
        </h1>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold"
            style={{ background: isCheckedIn ? '#fff7ed' : 'var(--bg-subtle)', borderColor: isCheckedIn ? '#fed7aa' : 'var(--border-soft)', color: isCheckedIn ? '#ea580c' : 'var(--text-secondary)' }}
          >
            {displayStreak} <Flame size={14} />
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold"
            style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)', color: 'var(--warning)' }}
          >
            {user?.spendable_fin_coins || 0}
            <img src={fincoinImg} className="w-4 h-4" alt="" />
          </div>
        </div>
      </div>

      {/* Central flame */}
      <div className="flex flex-col items-center gap-5 flex-1 justify-center">

        {/* Flame / snowflake visual */}
        <div className="relative flex items-center justify-center w-40 h-40">
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-20"
            style={{ background: accentColor }}
          />
          {isFrozen
            ? <Snowflake size={80} style={{ color: '#3b82f6', filter: 'drop-shadow(0 0 12px rgba(59,130,246,0.4))' }} />
            : (
              <img
                src={streakGif}
                alt="Streak"
                className="w-36 h-36 object-contain"
                style={{
                  filter: isCheckedIn
                    ? 'drop-shadow(0 0 16px rgba(249,115,22,0.5))'
                    : 'grayscale(1) opacity(0.35)',
                }}
              />
            )
          }
        </div>

        {/* Big number */}
        <div className="text-center">
          <motion.p
            key={displayStreak}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="font-bold leading-none"
            style={{ fontSize: 'clamp(80px, 20vw, 120px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
          >
            {displayStreak}
          </motion.p>
          <p className="text-sm font-semibold mt-1" style={{ color: accentColor, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '11px' }}>
            Day Streak
          </p>
        </div>

        {/* Week tracker */}
        <div
          className="w-full rounded-2xl border p-6"
          style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}
        >
          <div className="flex justify-between items-center mb-4">
            {WEEK_DAYS.map((day, idx) => {
              const isFuture  = idx > todayIndex;
              const daysAgo   = isFuture ? -1 : todayIndex - idx;
              const isLit     = !isFuture && (isCheckedIn ? streakData.current_streak > daysAgo : streakData.current_streak > daysAgo - 1);
              const isToday   = idx === todayIndex;
              const dayFrozen = isLit && frozenIndices.includes(idx);

              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase"
                    style={{ color: isToday ? accentColor : 'var(--text-disabled)' }}
                  >
                    {day}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                    style={{
                      background: dayFrozen ? '#eff6ff' : isLit ? (isCheckedIn ? '#fff7ed' : 'var(--bg-overlay)') : 'var(--bg-base)',
                      borderColor: dayFrozen ? '#93c5fd' : isLit ? (isCheckedIn ? '#fed7aa' : 'var(--border-default)') : 'var(--border-soft)',
                    }}
                  >
                    {(isLit || dayFrozen) && (
                      <Check
                        size={14}
                        strokeWidth={3}
                        style={{ color: dayFrozen ? '#3b82f6' : isCheckedIn ? '#ea580c' : 'var(--text-secondary)' }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <AnimatePresence mode="wait">
              {isCheckedIn ? (
                <motion.p key="ci" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Streak extended — <span style={{ color: accentColor }}>{hoursLeft}h</span> left today
                </motion.p>
              ) : isFrozen ? (
                <motion.p key="fr" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-medium" style={{ color: '#3b82f6' }}>
                  Freeze deployed. Streak protected.
                </motion.p>
              ) : (
                <motion.p key="rd" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: accentColor }}>{hoursLeft}h</span> left to secure your streak
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="mt-6 flex flex-col gap-3">
        {/* Main CTA */}
        <button
          onClick={() => isCheckedIn ? setShowShareModal(true) : navigate('/modules')}
          className="w-full flex items-center justify-center gap-2 font-semibold text-sm transition-all"
          style={{
            height: '48px',
            borderRadius: '12px',
            background: isCheckedIn ? '#1d4ed8' : 'var(--accent)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isCheckedIn ? <Share2 size={16} /> : <PlayCircle size={16} />}
          {isCheckedIn ? 'Share Milestone' : 'Complete a Lesson'}
        </button>

        {/* Freeze shop */}
        <div
          className="flex items-center justify-between p-4 rounded-xl border"
          style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center border"
              style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}
            >
              <ShieldCheck size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Streak Freeze</p>
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                {streakData.freezes_available} available · auto-deploys on miss
              </p>
            </div>
          </div>
          <button
            onClick={buyFreeze}
            disabled={isProcessing || (user?.spendable_fin_coins || 0) < FREEZE_COST}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-all disabled:opacity-40"
            style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}
          >
            Buy · <span style={{ color: 'var(--warning)' }}>{FREEZE_COST}</span>
            <img src={fincoinImg} className="w-3.5 h-3.5" alt="" />
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          >
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)' }}
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center gap-6">
              <motion.div
                ref={shareCardRef}
                initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="w-72 h-72 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #ea580c, #dc2626)' }}
              >
                <div className="relative z-10 text-white">
                  <p className="text-lg font-semibold opacity-80 mb-1">I'm on a</p>
                  <p className="font-bold leading-none mb-2" style={{ fontSize: '100px', letterSpacing: '-0.04em' }}>
                    {streakData.current_streak}
                  </p>
                  <p className="text-xl font-semibold opacity-90">day financial<br />learning streak!</p>
                  <div className="mt-6 flex items-center gap-2 opacity-70">
                    <img src={logo} className="w-5 h-5 object-contain" alt="" />
                    <span className="text-xs font-bold tracking-widest uppercase">Finfluent</span>
                  </div>
                </div>
              </motion.div>

              <button
                onClick={handleNativeShare}
                disabled={isSharing}
                className="flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl text-white disabled:opacity-50"
                style={{ background: '#1d4ed8' }}
              >
                {isSharing ? <Loader2 size={16} className="animate-spin" /> : (navigator.canShare ? <Share2 size={16} /> : <Download size={16} />)}
                {isSharing ? 'Generating…' : navigator.canShare ? 'Share Image' : 'Download Image'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}