import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, Check, Star, Trophy, Zap, BookOpen,
  Shield, Users, ArrowRight, Play, Clock, Award, Target,
  Flame, BarChart3, Brain, Lock, Unlock, Heart, GraduationCap,
  PiggyBank, Wallet, CreditCard, Landmark, LineChart, Building2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

import logo   from '../assets/logo.png';
import mascot from '../assets/mascot.gif';
import streakGif from '../assets/Streak.gif';
import fincoin   from '../assets/fincoin.gif';
import random1   from '../assets/random1.png';
import random2   from '../assets/random2.png';
import random3   from '../assets/random3.png';
import random4   from '../assets/random4.png';
import logo1     from '../assets/logo1.png';
import logo2     from '../assets/logo2.png';
import logo3     from '../assets/logo3.png';
import yayAudio  from '../assets/yay.mp3';

// ─── Chart data ───────────────────────────────────────────────────

const knowledgeGrowthData = [
  { month: 'Week 1', finfluent: 12, traditional: 5  },
  { month: 'Week 2', finfluent: 28, traditional: 9  },
  { month: 'Week 3', finfluent: 48, traditional: 14 },
  { month: 'Week 4', finfluent: 72, traditional: 18 },
  { month: 'Week 5', finfluent: 95, traditional: 22 },
  { month: 'Week 6', finfluent: 125, traditional: 26 },
  { month: 'Week 7', finfluent: 158, traditional: 29 },
  { month: 'Week 8', finfluent: 195, traditional: 32 },
];

const comparisonData = [
  { category: 'Engagement',      finfluent: 95, traditional: 25 },
  { category: 'Retention',       finfluent: 88, traditional: 30 },
  { category: 'Practical Skills',finfluent: 92, traditional: 35 },
  { category: 'Fun Factor',      finfluent: 97, traditional: 15 },
  { category: 'Accessibility',   finfluent: 90, traditional: 45 },
];

const moduleDistribution = [
  { name: 'Budgeting', value: 25, color: '#5e6ad2' },
  { name: 'Investing', value: 30, color: '#8b5cf6' },
  { name: 'Credit',    value: 20, color: '#06b6d4' },
  { name: 'Taxes',     value: 15, color: '#e8a030' },
  { name: 'Crypto',    value: 10, color: '#4cb782' },
];

const radarData = [
  { subject: 'Stocks',       A: 95, B: 40 },
  { subject: 'Bonds',        A: 85, B: 35 },
  { subject: 'Crypto',       A: 90, B: 20 },
  { subject: 'Real Estate',  A: 75, B: 45 },
  { subject: 'Budgeting',    A: 98, B: 50 },
  { subject: 'Taxes',        A: 88, B: 30 },
];

// ─── Static content ───────────────────────────────────────────────

const testimonials = [
  { name: 'Sarah Chen',      school: 'MIT, Class of 2026',       text: "I went from knowing nothing about investing to confidently managing my own portfolio. The gamification made it actually fun to learn.",          rating: 5, streak: 142, coins: 45200 },
  { name: 'Marcus Johnson',  school: 'UCLA, Class of 2025',      text: "This should be required for every college student. I've saved a lot since starting, just by applying what I learned about budgeting.",           rating: 5, streak: 98,  coins: 32100 },
  { name: 'Priya Patel',     school: 'Stanford, Class of 2027',  text: "The streak system is addictive in the best way. Several months straight and I finally understand how compound interest actually works!",           rating: 5, streak: 186, coins: 67800 },
  { name: 'Jake Williams',   school: 'UT Austin, Class of 2025', text: "Better than any finance class I've taken. The AI adapts to exactly what I need to learn. My credit score has genuinely improved.",               rating: 5, streak: 67,  coins: 21400 },
  { name: 'Emily Rodriguez', school: 'NYU, Class of 2026',       text: "I used to be terrified of taxes. Now I file them myself and actually understand what's happening. Game changer.",                                  rating: 5, streak: 124, coins: 38900 },
  { name: 'David Kim',       school: 'UC Berkeley, Class of 2024', text: "Landed my first internship in finance partly because of Finfluent. The practical knowledge here is unmatched.",                                  rating: 5, streak: 201, coins: 72400 },
];

const courses = [
  { icon: <PiggyBank size={18}/>, title: 'Budgeting 101',          lessons: 24, duration: '3.5 hrs', difficulty: 'Beginner',     color: 'bg-blue-50 text-blue-500 border-blue-100',    description: 'Master the 50/30/20 rule and build a budget that works for student life.' },
  { icon: <LineChart  size={18}/>, title: 'Stock Market Basics',   lessons: 36, duration: '5.2 hrs', difficulty: 'Beginner',     color: 'bg-purple-50 text-purple-500 border-purple-100', description: 'Understand stocks, ETFs, and how to start investing with any amount.' },
  { icon: <CreditCard size={18}/>, title: 'Credit Score Mastery',  lessons: 18, duration: '2.8 hrs', difficulty: 'Intermediate', color: 'bg-cyan-50 text-cyan-500 border-cyan-100',    description: 'Learn what affects your credit score and strategies to build excellent credit.' },
  { icon: <Landmark   size={18}/>, title: 'Tax Filing for Students',lessons:22, duration: '4.1 hrs', difficulty: 'Intermediate', color: 'bg-amber-50 text-amber-500 border-amber-100',  description: 'Navigate tax forms, deductions, and credits available to college students.' },
  { icon: <Building2  size={18}/>, title: 'Real Estate Investing', lessons: 30, duration: '6.0 hrs', difficulty: 'Advanced',     color: 'bg-emerald-50 text-emerald-500 border-emerald-100', description: 'Explore REITs, rental properties, and real estate as an asset class.' },
  { icon: <Wallet     size={18}/>, title: 'Crypto & DeFi',         lessons: 28, duration: '4.5 hrs', difficulty: 'Intermediate', color: 'bg-pink-50 text-pink-500 border-pink-100',    description: 'Understand blockchain, Bitcoin, Ethereum, and decentralised finance.' },
];

const leaderboardData = [
  { rank: 1, name: 'CryptoKing_23',  school: 'Wharton',  xp: 284500, streak: 301 },
  { rank: 2, name: 'BudgetBoss',     school: 'Harvard',  xp: 276200, streak: 287 },
  { rank: 3, name: 'FinanceQueen',   school: 'Stanford', xp: 268900, streak: 265 },
  { rank: 4, name: 'StockSavant',    school: 'MIT',      xp: 254300, streak: 243 },
  { rank: 5, name: 'MoneyMoves',     school: 'Yale',     xp: 241800, streak: 221 },
];

const faqs = [
  { question: "Is Finfluent free for college students?",               answer: "Yes — Finfluent is free for all students. Just sign up and you'll get full access to all modules, simulations, and features." },
  { question: "Do I need any prior finance knowledge?",                answer: "Not at all. The platform starts with the basics and adapts to your skill level as you progress through the modules." },
  { question: "What can I do with FinCoins?",                          answer: "FinCoins are earned by completing lessons and quizzes. They track your progress and rank you on the global leaderboard." },
  { question: "How does the streak system work?",                      answer: "Complete at least one lesson per day to maintain your streak. Longer streaks unlock special milestones and bonus rewards." },
  { question: "Is this a replacement for a finance class?",            answer: "Finfluent complements formal education. While courses teach theory, we focus on practical skills you'll use day-to-day." },
  { question: "Can I focus on specific topics like crypto or taxes?",  answer: "Yes. Modules are organised by topic so you can jump into exactly what you want to learn, in any order." },
];

// ─── Helpers ──────────────────────────────────────────────────────

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

const staggerItem = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
      <p style={{ color: 'var(--text-tertiary)', fontSize: 12, marginBottom: 6 }}>{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} style={{ color: e.color, fontSize: 13, fontWeight: 600 }}>{e.name}: {e.value}</p>
      ))}
    </div>
  );
};

const diffStyle: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: 'var(--success-subtle)', text: 'var(--success)' },
  Intermediate: { bg: 'var(--warning-subtle)', text: 'var(--warning)' },
  Advanced:     { bg: 'var(--danger-subtle)',  text: 'var(--danger)'  },
};

// ─── FAQ accordion ────────────────────────────────────────────────

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-base)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        style={{ background: 'transparent', height: 'auto', color: 'var(--text-primary)' }}
      >
        <span className="text-sm font-medium pr-4">{question}</span>
        <ChevronDown size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0, transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(id);
  }, []);

  const handleGetStarted = () => {
    new Audio(yayAudio).play().catch(() => {});
    navigate('/onboarding');
  };

  const S = 'py-20 md:py-28 px-6';
  const divider = { borderTop: '1px solid var(--border-soft)' };
  const card = { background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)', borderRadius: 14 };

  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-10"
        style={{ height: 56, background: 'var(--bg-base)', borderBottom: '1px solid var(--border-soft)' }}
      >
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5" style={{ background: 'transparent', height: 'auto', border: 'none' }}>
          <img src={logo} alt="Finfluent" className="w-7 h-7 object-contain" />
          <span className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Finfluent</span>
        </button>

        <div className="hidden md:flex items-center gap-7">
          {['Features', 'Courses', 'Reviews', 'FAQ'].map((label, i) => (
            <a key={label} href={['#features','#courses','#testimonials','#faq'][i]}
              className="text-xs font-medium transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate('/login')}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)', background: 'transparent', height: 'auto' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}>
            Log in
          </button>
          <button onClick={handleGetStarted}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg"
            style={{ background: 'var(--accent)', color: '#fff', height: 'auto', border: 'none' }}>
            Start free
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-28 pb-20 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.7 }}
          className="w-full lg:w-5/12 flex justify-center"
        >
          <img src={mascot} alt="Finfluent" className="w-56 md:w-72 object-contain" />
        </motion.div>

        <div className="w-full lg:w-7/12 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-5 text-xs font-medium border"
            style={{ background: 'var(--accent-subtle)', borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            <GraduationCap size={13} /> Built for college and high school students
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 leading-tight"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
          >
            The free, fun way<br />to learn finance.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base leading-relaxed mb-6 max-w-md"
            style={{ color: 'var(--text-secondary)' }}
          >
            Master budgeting, investing, and wealth-building through interactive lessons, an AI tutor, and a streak system that keeps you consistent.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="w-full max-w-xs flex flex-col gap-2.5"
          >
            <button onClick={handleGetStarted}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--accent)', color: '#fff', height: 'auto', border: 'none' }}>
              <Play size={14} /> Get started free
            </button>
            <button onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl text-sm font-medium border"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', height: 'auto' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}>
              I already have an account
            </button>
            <p className="text-center text-xs" style={{ color: 'var(--text-disabled)' }}>No credit card required · Free for students</p>
          </motion.div>
        </div>
      </section>

      {/* ── SPONSORED BY ── */}
      <section className={S} style={{ ...divider, background: 'var(--bg-subtle)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-9" style={{ color: 'var(--text-disabled)' }}>
            Sponsored by
          </p>
          <div className="flex items-center justify-center">
            {[logo1, logo2, logo3].map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="flex items-center justify-center flex-1"
                style={{
                  borderLeft: i > 0 ? '1px solid var(--border-soft)' : 'none',
                  padding: '0 32px',
                  minWidth: 0,
                }}
              >
                <img
                  src={src}
                  alt={`Sponsor ${i + 1}`}
                  style={{
                    height: 28,
                    width: 'auto',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'grayscale(1)',
                    opacity: 0.4,
                    transition: 'opacity 0.2s ease, filter 0.2s ease',
                    display: 'block',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLImageElement).style.filter = 'none';
                    (e.currentTarget as HTMLImageElement).style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLImageElement).style.filter = 'grayscale(1)';
                    (e.currentTarget as HTMLImageElement).style.opacity = '0.4';
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="features" className={S} style={divider}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...reveal} className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>How it works</p>
            <h2 className="text-3xl md:text-4xl font-semibold" style={{ letterSpacing: '-0.03em' }}>Financial literacy in 3 steps</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <Brain size={18}/>, title: 'Take the quiz', desc: 'Our AI assesses your current knowledge and builds a personalised learning path for you.' },
              { icon: <Target size={18}/>, title: 'Learn daily', desc: 'Bite-sized lessons, simulations, and quizzes tailored to your level — a few minutes a day.' },
              { icon: <Trophy size={18}/>, title: 'Level up', desc: 'Earn FinCoins, build streaks, and watch your real-world financial knowledge grow week by week.' },
            ].map((item, i) => (
              <motion.div key={i} {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }}
                className="p-5 rounded-2xl border" style={card}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4 border" style={{ background: 'var(--accent-subtle)', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                  {item.icon}
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-disabled)' }}>0{i + 1}</p>
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI LEARNING ── */}
      <section className={`${S} max-w-5xl mx-auto`} style={divider}>
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div {...reveal} className="w-full lg:w-5/12 flex justify-center">
            <motion.img animate={{ y: [-8, 8, -8] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              src={random1} alt="Modules" className="w-56 md:w-72 object-contain" />
          </motion.div>
          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="w-full lg:w-7/12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>AI-powered learning</p>
            <h2 className="text-3xl font-semibold mb-4" style={{ letterSpacing: '-0.03em' }}>Lessons that adapt to you.</h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
              Interactive modules adjust to your skill level, with video lessons and quizzes designed to make knowledge stick.
            </p>
            <div className="flex flex-col gap-2.5">
              {['Personalised learning paths', 'Interactive simulations', 'Instant AI feedback', 'Bite-sized lessons'].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--accent-subtle)' }}>
                    <Check size={10} style={{ color: 'var(--accent)' }} />
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── GROWTH CHART ── */}
      <section className={S} style={divider}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...reveal} className="text-center mb-10">
            <h2 className="text-3xl font-semibold mb-2" style={{ letterSpacing: '-0.03em' }}>Gamified learning vs. traditional</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Engagement and retention improve significantly with Finfluent's approach.</p>
          </motion.div>
          <motion.div {...reveal} className="p-6 rounded-2xl border" style={card}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Knowledge retention over time</p>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent)' }} /><span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Finfluent</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--border-strong)' }} /><span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Traditional</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={knowledgeGrowthData}>
                <defs>
                  <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#94a3b8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="finfluent"    stroke="var(--accent)" strokeWidth={2} fill="url(#gF)" name="Finfluent" />
                <Area type="monotone" dataKey="traditional"  stroke="#94a3b8"       strokeWidth={1.5} fill="url(#gT)" name="Traditional" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* ── FINCOINS ── */}
      <section className={`${S} max-w-5xl mx-auto`} style={divider}>
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
          <motion.div {...reveal} className="w-full lg:w-7/12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--warning)' }}>Earn while you learn</p>
            <h2 className="text-3xl font-semibold mb-4" style={{ letterSpacing: '-0.03em' }}>FinCoins reward consistency.</h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
              Earn FinCoins by completing lessons, passing quizzes, and maintaining your daily streak. They rank you on the global leaderboard.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Flame size={14}/>, label: 'Daily streak',     value: '+100 coins' },
                { icon: <Trophy size={14}/>, label: 'Module complete', value: '+100 coins' },
                { icon: <Award size={14}/>, label: 'Quiz perfect',     value: '+10–20 coins' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border-soft)' }}>
                  <div className="mb-2" style={{ color: 'var(--warning)' }}>{item.icon}</div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="w-full lg:w-5/12 flex justify-center">
            <div className="p-8 rounded-2xl border flex items-center justify-center" style={card}>
              <motion.img animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                src={fincoin} alt="FinCoins" className="w-28 h-28 object-contain" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STREAKS ── */}
      <section className={`${S} max-w-5xl mx-auto`} style={divider}>
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div {...reveal} className="w-full lg:w-5/12 flex justify-center">
            <div className="p-8 rounded-2xl border flex items-center justify-center" style={card}>
              <img src={streakGif} alt="Streak" className="w-28 h-28 object-contain" />
            </div>
          </motion.div>
          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="w-full lg:w-7/12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#f97316' }}>Habit building</p>
            <h2 className="text-3xl font-semibold mb-4" style={{ letterSpacing: '-0.03em' }}>Build an unbreakable habit.</h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
              Consistency is the key to financial knowledge. Protect your daily streak, hit milestones, and watch the concepts compound.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: <Flame   size={14}/>, text: 'Visual streak counter updated daily', active: true  },
                { icon: <Lock    size={14}/>, text: 'Freeze protection for missed days',   active: true  },
                { icon: <Unlock  size={14}/>, text: 'Milestones at 7, 30, and 100 days',  active: true  },
                { icon: <Heart   size={14}/>, text: 'Streak repair for dedicated learners', active: false },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-2.5 ${item.active ? '' : 'opacity-40'}`}>
                  <span style={{ color: '#f97316' }}>{item.icon}</span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.text}</span>
                  {!item.active && <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-overlay)', color: 'var(--text-disabled)' }}>Coming soon</span>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TOOLS ── */}
      <section className={`${S} max-w-5xl mx-auto`} style={divider}>
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
          <motion.div {...reveal} className="w-full lg:w-7/12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#06b6d4' }}>Tools</p>
            <h2 className="text-3xl font-semibold mb-4" style={{ letterSpacing: '-0.03em' }}>Practical tools for real life.</h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
              From stock charting to budget planning, Finfluent gives you the tools to apply what you learn immediately.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Stock Charts', 'Portfolio Simulator', 'Tax Calculator', 'Credit Analyser', 'Budget Planner', 'Investment Tracker'].map(t => (
                <span key={t} className="px-3 py-1.5 rounded-full text-xs font-medium border"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)', background: 'var(--bg-subtle)' }}>
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="w-full lg:w-5/12 relative flex justify-center h-56">
            <motion.img animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} src={random2} className="absolute top-2 left-4 w-24 object-contain z-20" />
            <motion.img animate={{ y: [0, 18, 0] }}  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} src={random4} className="absolute bottom-2 right-4 w-32 object-contain z-10" />
            <motion.img animate={{ y: [0, -8, 0], x: [0, 5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} src={random3} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 object-contain z-0" />
          </motion.div>
        </div>
      </section>

      {/* ── COMPARISON CHARTS ── */}
      <section className={S} style={divider}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...reveal} className="text-center mb-10">
            <h2 className="text-3xl font-semibold" style={{ letterSpacing: '-0.03em' }}>See how it compares</h2>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-4">
            <motion.div {...reveal} className="p-6 rounded-2xl border" style={card}>
              <p className="text-sm font-medium mb-5" style={{ color: 'var(--text-primary)' }}>Engagement comparison</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="finfluent"   fill="var(--accent)" radius={[0,4,4,0]} name="Finfluent" />
                  <Bar dataKey="traditional" fill="var(--bg-overlay)" radius={[0,4,4,0]} name="Traditional" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
            <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="p-6 rounded-2xl border" style={card}>
              <p className="text-sm font-medium mb-5" style={{ color: 'var(--text-primary)' }}>Topic coverage</p>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border-soft)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
                  <PolarRadiusAxis stroke="var(--border-soft)" tick={false} />
                  <Radar name="Finfluent"   dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} />
                  <Radar name="Traditional" dataKey="B" stroke="#94a3b8"       fill="#94a3b8"       fillOpacity={0.1} />
                  <Tooltip content={<ChartTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── COURSES ── */}
      <section id="courses" className={S} style={divider}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...reveal} className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)' }}>Course library</p>
            <h2 className="text-3xl font-semibold mb-2" style={{ letterSpacing: '-0.03em' }}>16 modules covering the essentials</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>From budgeting basics to advanced crypto — a structured curriculum for every level.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {courses.map((course, i) => (
              <motion.div key={i} {...staggerItem} transition={{ ...staggerItem.transition, delay: i * 0.06 }}
                className="p-5 rounded-2xl border cursor-pointer transition-all duration-150" style={card}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-soft)')}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 border ${course.color}`}>{course.icon}</div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 inline-block"
                  style={{ background: diffStyle[course.difficulty]?.bg, color: diffStyle[course.difficulty]?.text }}>
                  {course.difficulty}
                </span>
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{course.title}</h3>
                <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-tertiary)' }}>{course.description}</p>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-disabled)' }}>
                  <span className="flex items-center gap-1"><BookOpen size={10}/>{course.lessons} lessons</span>
                  <span className="flex items-center gap-1"><Clock size={10}/>{course.duration}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOPIC DISTRIBUTION ── */}
      <section className={S} style={{ ...divider, background: 'var(--bg-subtle)' }}>
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <motion.div {...reveal} className="w-full lg:w-1/2">
            <h2 className="text-3xl font-semibold mb-3" style={{ letterSpacing: '-0.03em' }}>Every topic you need</h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              Content is constantly updated based on what students actually need — no filler, just practical knowledge.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {moduleDistribution.map((m, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: m.color }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{m.name}</span>
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-disabled)' }}>{m.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="w-full lg:w-1/2">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={moduleDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={100} paddingAngle={4} dataKey="value">
                  {moduleDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* ── LEADERBOARD ── */}
      <section className={S} style={divider}>
        <div className="max-w-3xl mx-auto">
          <motion.div {...reveal} className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--warning)' }}>Compete</p>
            <h2 className="text-3xl font-semibold" style={{ letterSpacing: '-0.03em' }}>Climb the leaderboard</h2>
          </motion.div>
          <motion.div {...reveal} className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-base)' }}>
            <div className="grid grid-cols-[44px_1fr_76px_76px] md:grid-cols-[56px_1fr_120px_96px_96px] gap-3 px-5 py-3 border-b" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-subtle)' }}>
              {['Rank', 'Player', 'School', 'XP', 'Streak'].map((h, i) => (
                <span key={h} className={`text-[10px] font-semibold uppercase tracking-widest ${i > 1 ? 'text-right' : ''} ${i === 2 ? 'hidden md:block' : ''}`} style={{ color: 'var(--text-disabled)' }}>{h}</span>
              ))}
            </div>
            {leaderboardData.map((player, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="grid grid-cols-[44px_1fr_76px_76px] md:grid-cols-[56px_1fr_120px_96px_96px] gap-3 px-5 py-3.5 items-center border-b last:border-0 transition-colors"
                style={{ borderColor: 'var(--border-soft)', background: i < 3 ? 'var(--warning-subtle)' : 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = i < 3 ? 'var(--warning-subtle)' : 'transparent')}
              >
                <span className="text-base">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span style={{ color: 'var(--text-disabled)' }}>#{player.rank}</span>}</span>
                <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{player.name}</span>
                <span className="hidden md:block text-sm truncate" style={{ color: 'var(--text-tertiary)' }}>{player.school}</span>
                <span className="text-right text-sm font-medium" style={{ color: 'var(--accent)' }}>{(player.xp / 1000).toFixed(1)}K</span>
                <span className="text-right text-sm font-medium" style={{ color: '#f97316' }}>🔥 {player.streak}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className={S} style={{ ...divider, background: 'var(--bg-subtle)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...reveal} className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)' }}>Student feedback</p>
            <h2 className="text-3xl font-semibold" style={{ letterSpacing: '-0.03em' }}>What students are saying</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {testimonials.map((t, i) => (
              <motion.div key={i} {...staggerItem} transition={{ ...staggerItem.transition, delay: i * 0.06 }}
                className="p-5 rounded-2xl border transition-all"
                style={{ background: 'var(--bg-base)', borderColor: i === activeTestimonial ? 'var(--accent)' : 'var(--border-soft)' }}>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={11} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>"{t.text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-soft)' }}>🎓</div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{t.school}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t text-[10px]" style={{ borderColor: 'var(--border-soft)' }}>
                  <span className="flex items-center gap-1" style={{ color: '#f97316' }}><Flame size={10}/>{t.streak} day streak</span>
                  <span className="flex items-center gap-1" style={{ color: 'var(--warning)' }}><BarChart3 size={10}/>{t.coins.toLocaleString()} coins</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className={S} style={divider}>
        <div className="max-w-2xl mx-auto">
          <motion.div {...reveal} className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-disabled)' }}>FAQ</p>
            <h2 className="text-3xl font-semibold" style={{ letterSpacing: '-0.03em' }}>Got questions?</h2>
          </motion.div>
          <div className="flex flex-col gap-2">
            {faqs.map((faq, i) => <FAQItem key={i} question={faq.question} answer={faq.answer} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className={`${S} flex flex-col items-center text-center`} style={{ ...divider, background: 'var(--bg-subtle)' }}>
        <motion.h2 {...reveal} className="text-4xl md:text-5xl font-semibold mb-3" style={{ letterSpacing: '-0.04em' }}>
          Ready to start?
        </motion.h2>
        <motion.p {...reveal} className="text-sm mb-8 max-w-md" style={{ color: 'var(--text-secondary)' }}>
          Your financial future starts with small, consistent steps. Finfluent makes that easy.
        </motion.p>
        <motion.div {...reveal} className="w-full max-w-xs flex flex-col gap-2.5">
          <button onClick={handleGetStarted}
            className="w-full py-3.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--accent)', color: '#fff', height: 'auto', border: 'none' }}>
            Start learning free
          </button>
          <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>No credit card · Free for students</p>
        </motion.div>
        <motion.div {...reveal} className="flex items-center gap-6 mt-10">
          {[{ icon: <Shield size={13}/>, text: 'SSL encrypted' }, { icon: <Lock size={13}/>, text: 'Privacy first' }, { icon: <Heart size={13}/>, text: 'Made with care' }].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-disabled)' }}>{item.icon} {item.text}</div>
          ))}
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-12" style={{ borderTop: '1px solid var(--border-soft)', background: 'var(--bg-base)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src={logo} alt="Finfluent" className="w-6 h-6 object-contain" />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Finfluent</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                Making financial literacy accessible and practical for every college student.
              </p>
            </div>
            {[
              { heading: 'Product',  links: [{ label: 'Features', href: '#features' }, { label: 'Courses', href: '#courses' }, { label: 'Leaderboard', href: '#testimonials' }, { label: 'Get the app', href: '/login' }] },
              { heading: 'Company',  links: [{ label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }, { label: 'Careers', href: '/contact' }, { label: 'Press', href: '/contact' }] },
              { heading: 'Legal',    links: [{ label: 'Privacy policy', href: '/privacy' }, { label: 'Terms of service', href: '/terms' }, { label: 'Cookie policy', href: '/privacy' }, { label: 'Help centre', href: '/contact' }] },
            ].map(col => (
              <div key={col.heading}>
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{col.heading}</p>
                <div className="flex flex-col gap-2">
                  {col.links.map(link => (
                    <a key={link.label} href={link.href} className="text-xs" style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t" style={{ borderColor: 'var(--border-soft)' }}>
            <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>© 2026 Finfluent. All rights reserved.</p>
            <div className="flex items-center gap-5">
              {['Twitter', 'Discord', 'Instagram', 'TikTok'].map(s => (
                <a key={s} href="#" className="text-xs" style={{ color: 'var(--text-disabled)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-disabled)')}>
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}