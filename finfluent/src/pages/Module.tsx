import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayCircle, ArrowRight, Activity, Award,
  Loader2, Book, TestTube, Check,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

import mascot from '../assets/mascot.gif';
import fincoin from '../assets/fincoin.gif';
import yayAudio from '../assets/yay.mp3';
import noAudio from '../assets/no.mp3';
import fanfareAudio from '../assets/fanfare.mp3';

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
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [totalModuleCoins, setTotalModuleCoins] = useState(100);
  const [coinBurst, setCoinBurst] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    const fetchContentAndProgress = async () => {
      if (!moduleId || !user) return;
      try {
        const { data: contentData } = await supabase
          .from('module_content').select('*')
          .eq('module_id', parseInt(moduleId))
          .order('step_index', { ascending: true });
        if (contentData) setContent(contentData);

        const { data: moduleInfo } = await supabase
          .from('modules').select('simulation_html')
          .eq('id', parseInt(moduleId)).single();
        if (moduleInfo?.simulation_html) setSimulationHtml(moduleInfo.simulation_html);

        const { data: progressData } = await supabase
          .from('user_progress').select('current_step, status')
          .eq('user_id', user.id).eq('module_id', parseInt(moduleId)).single();
        if (progressData && progressData.status !== 'completed') {
          setCurrentStep(progressData.current_step || 0);
        }
      } catch (error) { console.error('Fetch Error:', error); }
      finally { setIsModuleLoading(false); }
    };
    fetchContentAndProgress();
  }, [moduleId, user]);

  const handleCompleteRef = useRef<any>(null);
  useEffect(() => { handleCompleteRef.current = handleCompleteModule; });
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'FINFLUENT_SIM_COMPLETE') {
        if (handleCompleteRef.current) await handleCompleteRef.current(event.data.coins || 0);
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
      new Audio(yayAudio).play().catch(() => {});
      const coins = Math.floor(Math.random() * 11) + 10;
      setEarnedCoins(coins);
      setTotalModuleCoins(prev => prev + coins);
      setCoinBurst(Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 120,
        y: -(60 + Math.random() * 80),
        delay: i * 0.04,
      })));
      setTimeout(() => { setEarnedCoins(0); setCoinBurst([]); }, 2000);
    } else {
      new Audio(noAudio).play().catch(() => {});
    }
  };

  const recordDailyStreak = async () => {
    if (!user) return;
    try {
      const { data: streakData } = await supabase.from('user_streaks').select('*').eq('user_id', user.id).single();
      if (streakData) {
        const lastCheckIn = streakData.last_check_in ? new Date(streakData.last_check_in).toDateString() : '';
        if (lastCheckIn !== new Date().toDateString()) {
          const newStreak = streakData.current_streak + 1;
          await supabase.from('user_streaks').update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, streakData.longest_streak),
            last_check_in: new Date().toISOString(),
          }).eq('user_id', user.id);
        }
      }
    } catch (error) { console.error('Streak Error:', error); }
  };

  const advanceStep = async () => {
    if (!user || !moduleId || content.length === 0) return;
    setIsSaving(true);
    try {
      await recordDailyStreak();
      if (earnedCoins > 0) {
        await supabase.from('profiles').update({
          spendable_fin_coins: (user.spendable_fin_coins || 0) + earnedCoins,
          lifetime_fin_coins: (user.lifetime_fin_coins || 0) + earnedCoins,
        }).eq('id', user.id);
        await refreshUserData();
      }
      const nextStep = currentStep + 1;
      if (nextStep < content.length) {
        setCurrentStep(nextStep);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setEarnedCoins(0);
        setCoinBurst([]);
        await supabase.from('user_progress').upsert({
          user_id: user.id, module_id: parseInt(moduleId),
          current_step: nextStep, status: 'in_progress',
        }, { onConflict: 'user_id, module_id' });
      } else if (nextStep === content.length && simulationHtml) {
        setCurrentStep(nextStep);
        await supabase.from('user_progress').upsert({
          user_id: user.id, module_id: parseInt(moduleId),
          current_step: nextStep, status: 'in_progress',
        }, { onConflict: 'user_id, module_id' });
      } else {
        await handleCompleteModule(0);
      }
    } catch (e) { console.error('Error saving step progress:', e); }
    finally { setIsSaving(false); }
  };

  const handleCompleteModule = async (simCoinsEarned: number) => {
    if (!user || !moduleId || isSaving) return;
    setIsSaving(true);
    const finalPayout = 100 + simCoinsEarned;
    setTotalModuleCoins(prev => prev + simCoinsEarned);
    setShowReward(true);
    new Audio(fanfareAudio).play().catch(() => {});
    try {
      await recordDailyStreak();
      await supabase.from('user_progress').upsert({
        user_id: user.id, module_id: parseInt(moduleId),
        is_unlocked: true, status: 'completed', current_step: 0,
        simulation_score: 100, completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id, module_id' });
      if (parseInt(moduleId) < 16) {
        await supabase.from('user_progress').upsert({
          user_id: user.id, module_id: parseInt(moduleId) + 1,
          is_unlocked: true, status: 'not_started', current_step: 0,
        }, { onConflict: 'user_id, module_id' });
      }
      await supabase.from('profiles').update({
        spendable_fin_coins: user.spendable_fin_coins + finalPayout,
        lifetime_fin_coins: user.lifetime_fin_coins + finalPayout,
      }).eq('id', user.id);
      await refreshUserData();
      setTimeout(() => navigate('/modules'), 4000);
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  if (isModuleLoading || content.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3" style={{ color: 'var(--text-tertiary)' }}>
        <img src={mascot} className="w-12 h-12 object-contain opacity-50" alt="" />
        <span className="text-xs font-medium">Loading lesson…</span>
      </div>
    );
  }

  const totalSteps = simulationHtml ? content.length + 1 : content.length;
  const isAnswerSelected = selectedAnswer !== null;

  return (
    <div className="flex flex-col gap-4 pb-8" style={{ color: 'var(--text-primary)' }}>

      {/* Coin burst overlay */}
      <AnimatePresence>
        {isCorrect && earnedCoins > 0 && (
          <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
            {coinBurst.map(coin => (
              <motion.img key={coin.id} src={fincoin}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{ x: coin.x, y: coin.y, scale: 1, opacity: 0 }}
                transition={{ duration: 0.8 + coin.delay, ease: 'easeOut', delay: coin.delay }}
                className="absolute w-8 h-8 object-contain"
              />
            ))}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, type: 'spring', bounce: 0.5 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-lg"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--warning)', color: 'var(--warning)', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
            >
              +{earnedCoins}
              <img src={fincoin} className="w-5 h-5 object-contain" alt="" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Progress HUD */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border p-4"
        style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Book size={15} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Module {moduleId}</span>
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isSimStep = simulationHtml && index === content.length;
            const isFinalStep = index === totalSteps - 1;
            return (
              <div key={index}
                className="flex items-center justify-center rounded-full transition-all duration-300"
                style={{
                  width: isCurrent ? 28 : 22, height: isCurrent ? 28 : 22,
                  background: isCompleted ? 'var(--accent)' : isCurrent ? 'var(--accent-subtle)' : 'var(--bg-overlay)',
                  border: isCurrent ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                }}
              >
                {isCompleted ? <Check size={11} color="#fff" strokeWidth={3} />
                  : isSimStep ? <TestTube size={10} style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-disabled)' }} />
                  : isFinalStep && !isSimStep ? <Award size={10} style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-disabled)' }} />
                  : <span className="text-[9px] font-bold" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-disabled)' }}>{index + 1}</span>}
              </div>
            );
          })}
          <div className="flex-1 h-0.5 rounded-full ml-1" style={{ background: 'var(--bg-overlay)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / Math.max(totalSteps - 1, 1)) * 100}%`, background: 'var(--accent)' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Content area */}
      <AnimatePresence mode="wait">

        {/* STATE 1: Video + Quiz */}
        {currentStep < content.length && activeStepData && (
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row gap-4"
          >
            {/* ── Video panel ── */}
            <div
              className="flex-1 rounded-2xl border overflow-hidden"
              style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border-soft)' }}>
                <PlayCircle size={15} style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {activeStepData.step_title}
                </span>
              </div>

              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', background: '#000' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${activeStepData.video_id}?controls=1`}
                  title="Lesson"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                  }}
                />
              </div>
            </div>

            {/* ── Quiz panel ── */}
            <div
              className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col rounded-2xl border p-5"
              style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Activity size={15} style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Quick check</span>
              </div>

              {/* Added whitespace-normal break-words to handle long questions */}
              <p className="text-sm leading-relaxed mb-4 whitespace-normal break-words" style={{ color: 'var(--text-secondary)' }}>
                {activeStepData.question_text}
              </p>

              <div className="flex flex-col gap-3 mb-4">
                {(['A', 'B'] as const).map(opt => {
                  const label = opt === 'A' ? activeStepData.option_a : activeStepData.option_b;
                  const isSelected = selectedAnswer === opt;
                  const correct = activeStepData.correct_option === opt;
                  const answered = selectedAnswer !== null;

                  let bg = 'var(--bg-base)';
                  let borderColor = 'var(--border-default)';
                  let textColor = 'var(--text-primary)';

                  if (isSelected && isCorrect)                      { bg = 'var(--success-subtle)'; borderColor = 'var(--success)'; textColor = 'var(--success)'; }
                  else if (isSelected && !isCorrect)                { bg = 'var(--danger-subtle)';  borderColor = 'var(--danger)';  textColor = 'var(--danger)';  }
                  else if (answered && correct && !isCorrect)       { bg = 'var(--success-subtle)'; borderColor = 'var(--success)'; textColor = 'var(--success)'; }

                  return (
                    <motion.button
                      key={opt}
                      animate={isSelected && !isCorrect ? { x: [-6, 6, -4, 4, 0] } : {}}
                      transition={{ duration: 0.35 }}
                      onClick={() => handleAnswer(opt)}
                      disabled={!!selectedAnswer}
                      // FIX: h-auto to let it grow, items-start to keep the badge at the top
                      className="w-full h-auto flex items-start gap-3 rounded-xl border text-left text-sm font-medium transition-all duration-150"
                      style={{ background: bg, borderColor, color: textColor, padding: '12px 14px' }}
                    >
                      <span
                        // FIX: mt-0.5 to perfectly align the badge with the first line of text
                        className="w-6 h-6 mt-0.5 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: isSelected || (answered && correct && !isCorrect) ? borderColor : 'var(--bg-overlay)',
                          color: isSelected || (answered && correct && !isCorrect) ? '#fff' : 'var(--text-tertiary)',
                        }}
                      >
                        {opt}
                      </span>
                      {/* FIX: flex-1, whitespace-normal, and break-words force the text to wrap inside the bounds */}
                      <span className="flex-1 whitespace-normal break-words leading-relaxed">
                        {label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Disabled check modified to allow continuation as long as an answer is selected */}
              <button
                onClick={advanceStep}
                disabled={!isAnswerSelected || isSaving}
                className="mt-auto w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-150"
                style={{
                  padding: '11px 16px',
                  background: isAnswerSelected ? 'var(--accent)' : 'var(--bg-overlay)',
                  color: isAnswerSelected ? '#fff' : 'var(--text-disabled)',
                  cursor: isAnswerSelected ? 'pointer' : 'not-allowed',
                  border: 'none',
                }}
              >
                {isSaving ? <Loader2 size={15} className="animate-spin" /> : <>Continue <ArrowRight size={15} /></>}
              </button>
            </div>
          </motion.div>
        )}

        {/* STATE 2: Simulation */}
        {currentStep === content.length && simulationHtml && (
          <motion.div
            key="simulation"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: 'var(--border-soft)', height: 560 }}
          >
            <iframe
              srcDoc={simulationHtml}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              sandbox="allow-scripts allow-same-origin allow-forms"
              title="Finfluent Simulation"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATE 3: Completion overlay */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}
          >
            <motion.img
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
              src={mascot} alt="" className="w-32 h-32 object-contain mb-5"
            />
            <motion.h2
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-3xl font-semibold mb-2"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
            >
              Module complete!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}
            >
              You've earned your FinCoins. Heading back to roadmap…
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, type: 'spring', bounce: 0.4 }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl border font-bold text-lg"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--warning)' }}
            >
              +{totalModuleCoins}
              <img src={fincoin} className="w-6 h-6 object-contain" alt="" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}