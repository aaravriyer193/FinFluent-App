import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Snowflake, ShieldCheck, Check, Zap, Loader2, PlayCircle, Flame, Share2, X, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import html2canvas from 'html2canvas';

// Imports
import fincoinImg from '../assets/fincoin.gif';
import streakGif from '../assets/Streak.gif';
import random3 from '../assets/random3.png';
import random5 from '../assets/random5.png';
import logo from '../assets/logo.png'; // NEW: Using logo instead of mascot for the share card

export default function Streak() {
  const { user, refreshUserData } = useAppContext();
  const navigate = useNavigate();
  const shareCardRef = useRef<HTMLDivElement>(null);
  
  const [streakData, setStreakData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [status, setStatus] = useState<'checked-in' | 'ready' | 'frozen' | 'lost'>('ready');
  const [hoursLeft, setHoursLeft] = useState(0);
  
  const [displayStreak, setDisplayStreak] = useState<number>(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const FREEZE_COST = 50;
  const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const todayIndex = new Date().getDay();

  // 1. CALCULATE HOURS LEFT IN DAY
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      setHoursLeft(Math.floor((midnight.getTime() - now.getTime()) / (1000 * 60 * 60)));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // 2. LOAD STREAK DATA
  useEffect(() => {
    const loadOrInitializeStreak = async () => {
      if (!user) return;
      try {
        let { data } = await supabase.from('user_streaks').select('*').eq('user_id', user.id).single();
        if (!data) {
          const { data: newData } = await supabase.from('user_streaks').insert({
            user_id: user.id, current_streak: 0, longest_streak: 0, freezes_available: 0
          }).select().single();
          data = newData;
        }
        evaluateStreakStatus(data);
      } catch (error) {
        console.error("Error loading streak:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadOrInitializeStreak();
  }, [user]);

  // 3. STATUS EVALUATION
  const evaluateStreakStatus = async (data: any) => {
    if (!data.last_check_in) {
      setStreakData(data);
      triggerNumberClimb(data.current_streak);
      setStatus('ready');
      return;
    }

    const now = new Date();
    const lastCheckIn = new Date(data.last_check_in);
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDate = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());
    
    const diffDays = Math.ceil(Math.abs(todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    let updatedData = { ...data };

    if (diffDays === 0) {
      setStatus('checked-in');
      triggerNumberClimb(updatedData.current_streak);
    } else if (diffDays === 1) {
      setStatus('ready');
      triggerNumberClimb(updatedData.current_streak);
    } else if (diffDays > 1) {
      const missedDays = diffDays - 1;
      if (updatedData.freezes_available >= missedDays) {
        updatedData.freezes_available -= missedDays;
        updatedData.last_check_in = new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString();
        await supabase.from('user_streaks').update({ freezes_available: updatedData.freezes_available, last_check_in: updatedData.last_check_in }).eq('user_id', user?.id);
        setStatus('frozen');
        triggerNumberClimb(updatedData.current_streak);
      } else {
        updatedData.current_streak = 0;
        updatedData.freezes_available = 0;
        await supabase.from('user_streaks').update({ current_streak: 0, freezes_available: 0 }).eq('user_id', user?.id);
        setStatus('lost');
        setDisplayStreak(0);
      }
    }
    setStreakData(updatedData);
  };

  // 🔥 COOLER NUMBER CLIMB ANIMATION
  const triggerNumberClimb = (target: number) => {
    if (target === 0) {
      setDisplayStreak(0);
      return;
    }
    const controls = animate(0, target, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(value) {
        setDisplayStreak(Math.round(value));
      }
    });
    return controls.stop;
  };

  // 4. BUY FREEZE ACTION
  const buyFreeze = async () => {
    if (!user || !streakData || isProcessing || (user.spendable_fin_coins || 0) < FREEZE_COST) return;
    setIsProcessing(true);
    try {
      await supabase.from('profiles').update({ spendable_fin_coins: user.spendable_fin_coins - FREEZE_COST }).eq('id', user.id);
      const newFreezes = streakData.freezes_available + 1;
      await supabase.from('user_streaks').update({ freezes_available: newFreezes }).eq('user_id', user.id);
      setStreakData({ ...streakData, freezes_available: newFreezes });
      await refreshUserData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 📸 NATIVE OS SHARE & IMAGE GENERATION
  const handleNativeShare = async () => {
    if (!shareCardRef.current || isSharing) return;
    setIsSharing(true);

    try {
      // Create the image from the DOM element
      const canvas = await html2canvas(shareCardRef.current, { 
        backgroundColor: null, 
        scale: 2, // High resolution
        logging: false,
        useCORS: true 
      });

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Canvas conversion failed');
        
        const file = new File([blob], 'finfluent-streak.png', { type: 'image/png' });

        // Check if the device supports the native share sheet
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My Finfluent Streak',
            text: `I'm on a ${streakData.current_streak} day financial learning streak!`,
            files: [file]
          });
        } else {
          // Fallback: Download the image directly if they are on Desktop without native sharing
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'finfluent-streak.png';
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setIsSharing(false);
      setShowShareModal(false); // Close modal after sharing
    }
  };

  if (isLoading || !streakData) return (
    <div className="h-full flex flex-col items-center justify-center text-orange-400 gap-4">
      <Loader2 className="animate-spin" size={40} />
      <span className="font-black tracking-widest uppercase">Igniting...</span>
    </div>
  );

  const isCheckedIn = status === 'checked-in';

  return (
    <div className="flex flex-col min-h-full max-w-2xl mx-auto p-4 md:p-8 pb-32 text-white animate-fade-in font-sans relative">
      
      {/* 🌌 AMBIENT FLOATING VECTORS */}
      <motion.img src={random3} animate={{ y: [0, -30, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 right-[-10%] w-64 opacity-20 pointer-events-none -z-10 object-contain drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]" />
      <motion.img src={random5} animate={{ y: [0, 40, 0], rotate: [0, -10, 10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-20 left-[-15%] w-72 opacity-15 pointer-events-none -z-10 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]" />

      {/* 💳 TOP HEADER */}
      <div className="flex justify-between items-center mb-8 shrink-0 relative z-10">
        <h1 className="text-xl font-black uppercase tracking-widest text-white/40 hidden sm:block">Energy</h1>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <div className={`flex items-center gap-1.5 backdrop-blur-xl px-3 py-1.5 md:px-4 md:py-2 rounded-2xl border shadow-lg transition-colors ${isCheckedIn ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/10'}`}>
            <span className={`text-sm md:text-lg font-black ${isCheckedIn ? 'text-orange-400' : 'text-white/40'}`}>{displayStreak}</span>
            <Flame className={`w-4 h-4 md:w-5 md:h-5 ${isCheckedIn ? 'text-orange-400' : 'text-white/40'}`} />
          </div>
          <div className="flex items-center gap-1.5 bg-[#1e293b]/80 backdrop-blur-xl px-3 py-1.5 md:px-4 md:py-2 rounded-2xl border border-white/10 shadow-lg">
            <span className="text-sm md:text-lg font-black text-yellow-400">{user?.spendable_fin_coins || 0}</span>
            <img src={fincoinImg} className="w-4 h-4 md:w-5 md:h-5 object-contain" alt="Coins" />
          </div>
        </div>
      </div>

      {/* 🔥 MAIN CENTRAL UI */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
        
        {/* Holographic Core */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-4 perspective-[1000px]">
          <div className={`absolute w-full h-full rounded-full blur-[70px] opacity-50 transition-colors duration-1000 ${isCheckedIn ? 'bg-orange-500' : status === 'frozen' ? 'bg-blue-500' : 'bg-red-500'}`} />
          <div className="relative w-full h-full flex items-center justify-center preserve-3d" style={{ transformStyle: 'preserve-3d' }}>
            {status === 'frozen' ? (
              <Snowflake size={120} className="text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.8)]" style={{ transform: 'translateZ(20px)' }} />
            ) : (
              <img src={streakGif} alt="Streak Flame" className={`w-40 h-40 object-contain drop-shadow-[0_0_30px_rgba(249,115,22,0.8)] ${!isCheckedIn && 'grayscale opacity-50'}`} style={{ transform: 'translateZ(30px)' }} />
            )}
            <motion.div animate={{ rotateY: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute w-[110%] h-[110%] border-4 border-orange-400/20 rounded-full" style={{ transform: 'translateZ(-10px) rotateX(60deg)' }} />
            <motion.div animate={{ rotateY: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute w-[130%] h-[130%] border-2 border-red-500/10 rounded-full" style={{ transform: 'translateZ(-20px) rotateX(70deg) rotateY(20deg)' }} />
          </div>
        </div>

        {/* 🎲 ROLLING NUMBER ANIMATION WITH FIXED CROP */}
        <div className="text-center flex flex-col items-center justify-center">
          <motion.h2 
            key={displayStreak}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            // FIX: Removed leading-none, added py-4 and overflow-visible so the shadow/text isn't cropped!
            className="text-8xl md:text-[120px] font-black tracking-tighter leading-tight py-4 overflow-visible text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-2xl"
          >
            {displayStreak}
          </motion.h2>
          <p className="text-xl md:text-2xl font-black uppercase text-orange-400 tracking-wide mt-[-10px]">Day Streak</p>
        </div>

        {/* The Week Tracker */}
        <div className="w-full max-w-sm mt-8 bg-[#0f172a]/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-6 px-2">
            {WEEK_DAYS.map((day, idx) => {
              const daysAgo = todayIndex >= idx ? todayIndex - idx : (7 + todayIndex) - idx;
              const isLit = isCheckedIn ? streakData.current_streak > daysAgo : streakData.current_streak > (daysAgo - 1);
              const isToday = idx === todayIndex;

              return (
                <div key={day} className="flex flex-col items-center gap-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isToday ? 'text-orange-400' : 'text-white/30'}`}>{day}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isLit ? 'bg-gradient-to-br from-orange-400 to-red-500 border-orange-300 text-white shadow-[0_0_15px_rgba(249,115,22,0.6)]' : 'bg-[#1e293b] border-white/5 text-transparent'}`}>
                    {isLit && <Check size={16} strokeWidth={4} />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="h-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isCheckedIn ? (
                <motion.p key="checked" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-center text-sm font-bold text-white/60">
                  Streak extended! <span className="text-orange-400">{hoursLeft} hours</span> left today.
                </motion.p>
              ) : status === 'frozen' ? (
                <motion.p key="frozen" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-center text-sm font-bold text-blue-400">
                  Freeze deployed. Your streak is safe.
                </motion.p>
              ) : (
                <motion.p key="ready" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-center text-sm font-bold text-white/60">
                  <span className="text-orange-400">{hoursLeft} hours</span> left to secure your streak!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 🕹️ CONTROLS FOOTER */}
      <div className="mt-8 shrink-0 flex flex-col gap-4 relative z-10">
        
        {/* Dynamic Action Button */}
        <button 
          onClick={() => {
            if (isCheckedIn) setShowShareModal(true);
            else navigate('/modules');
          }}
          className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-lg shadow-2xl transition-all flex items-center justify-center gap-3 ${
            isCheckedIn 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] active:scale-95 text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)]' 
              : 'bg-gradient-to-r from-orange-500 to-red-600 hover:scale-[1.02] active:scale-95 text-white shadow-[0_10px_30px_rgba(249,115,22,0.3)]'
          }`}
        >
          {isCheckedIn ? <Share2 size={24} /> : <PlayCircle size={24} className="animate-pulse" />}
          {isCheckedIn ? 'Share Milestone' : 'Complete a Lesson'}
        </button>

        {/* Defense Inventory Card */}
        <div className="bg-[#1e293b]/80 backdrop-blur-xl p-5 rounded-[24px] border border-white/10 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-400 border border-blue-500/30"><ShieldCheck size={24} /></div>
            <div>
              <div className="font-black text-sm">Buy Streak Freeze</div>
              <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Auto-deploys on miss</div>
            </div>
          </div>
          <button onClick={buyFreeze} disabled={isProcessing || (user?.spendable_fin_coins || 0) < FREEZE_COST} className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 py-3 px-5 rounded-xl transition-all flex items-center gap-2 group disabled:opacity-50 disabled:hover:bg-transparent">
            <span className="font-black text-blue-400 uppercase text-xs">Buy</span>
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded">
              <span className="font-black text-yellow-400 text-sm">{FREEZE_COST}</span>
              <img src={fincoinImg} className="w-3 h-3" alt="C" />
            </div>
          </button>
        </div>
      </div>

      {/* 📸 NATIVE SHARE MODAL WITH OS INTEGRATION */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070b14]/95 backdrop-blur-xl p-4"
          >
            <button onClick={() => setShowShareModal(false)} className="absolute top-8 right-8 text-white/50 hover:text-white bg-white/10 p-3 rounded-full transition-colors"><X size={24} /></button>
            
            <div className="flex flex-col items-center gap-8 w-full">
              
              {/* The "Social Card" - We attach the Ref here so html2canvas can target it */}
              <motion.div 
                ref={shareCardRef}
                initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} transition={{ type: "spring", bounce: 0.5 }}
                className="w-[320px] h-[320px] md:w-[400px] md:h-[400px] bg-gradient-to-br from-orange-400 to-orange-600 rounded-[40px] p-8 md:p-10 flex flex-col justify-center relative overflow-hidden shadow-[0_20px_60px_rgba(249,115,22,0.4)] border-4 border-orange-300/30"
              >
                {/* Background Decor */}
                <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(255,255,255,0.2)_0%,transparent_60%)] pointer-events-none" />
                
                {/* Logo watermark instead of mascot */}
                <img src={logo} className="absolute -right-8 -bottom-8 w-48 md:w-64 opacity-20 drop-shadow-2xl grayscale mix-blend-overlay pointer-events-none" alt="Logo" />
                
                {/* Card Content */}
                <div className="relative z-10 text-white font-black flex flex-col items-start text-left">
                  <p className="text-xl md:text-2xl text-white/90 tracking-wide mb-[-10px]">I'm on a</p>
                  <div className="text-[100px] md:text-[140px] leading-tight py-2 overflow-visible text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] tracking-tighter">
                    {streakData.current_streak}
                  </div>
                  <p className="text-2xl md:text-3xl leading-tight mt-0 text-white/90">
                    day financial<br/>learning streak!
                  </p>
                  
                  <div className="mt-8 flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/20">
                    <span className="text-sm tracking-widest uppercase">Finfluent</span>
                  </div>
                </div>
              </motion.div>

              {/* Native OS Share Trigger */}
              <button 
                onClick={handleNativeShare}
                disabled={isSharing}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black tracking-widest uppercase px-8 py-5 rounded-full shadow-[0_10px_30px_rgba(37,99,235,0.4)] flex items-center gap-3 transition-all active:scale-95"
              >
                {isSharing ? <Loader2 size={24} className="animate-spin" /> : (navigator.canShare ? <Share2 size={24} /> : <Download size={24} />)}
                {isSharing ? 'Generating Image...' : (navigator.canShare ? 'Share Image' : 'Download Image')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}