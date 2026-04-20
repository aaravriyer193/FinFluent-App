import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Globe, ChevronDown, Check, Star, Trophy, Zap, BookOpen, TrendingUp, Shield, Users, ArrowRight, Play, Clock, Award, Target, Flame, BarChart3, Brain, Lock, Unlock, Heart, MessageCircle, GraduationCap, Briefcase, PiggyBank, Wallet, CreditCard, Landmark, LineChart, Building2 } from 'lucide-react';

// Recharts
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

// Assets
import logo from '../assets/logo.png';
import mascot from '../assets/mascot.gif';
import streakGif from '../assets/Streak.gif';
import fincoin from '../assets/fincoin.gif';
import random1 from '../assets/random1.png';
import random2 from '../assets/random2.png';
import random3 from '../assets/random3.png';
import random4 from '../assets/random4.png';
import random5 from '../assets/random5.png';

// Audio
import yayAudio from '../assets/yay.mp3';



// Data for charts
const knowledgeGrowthData = [
  { month: 'Week 1', finfluent: 12, traditional: 5 },
  { month: 'Week 2', finfluent: 28, traditional: 9 },
  { month: 'Week 3', finfluent: 48, traditional: 14 },
  { month: 'Week 4', finfluent: 72, traditional: 18 },
  { month: 'Week 5', finfluent: 95, traditional: 22 },
  { month: 'Week 6', finfluent: 125, traditional: 26 },
  { month: 'Week 7', finfluent: 158, traditional: 29 },
  { month: 'Week 8', finfluent: 195, traditional: 32 },
];

const comparisonData = [
  { category: 'Engagement', finfluent: 95, traditional: 25 },
  { category: 'Retention', finfluent: 88, traditional: 30 },
  { category: 'Practical Skills', finfluent: 92, traditional: 35 },
  { category: 'Fun Factor', finfluent: 97, traditional: 15 },
  { category: 'Accessibility', finfluent: 90, traditional: 45 },
];

const moduleDistribution = [
  { name: 'Budgeting', value: 25, color: '#3b82f6' },
  { name: 'Investing', value: 30, color: '#8b5cf6' },
  { name: 'Credit', value: 20, color: '#06b6d4' },
  { name: 'Taxes', value: 15, color: '#f59e0b' },
  { name: 'Crypto', value: 10, color: '#10b981' },
];

const radarData = [
  { subject: 'Stocks', A: 95, B: 40 },
  { subject: 'Bonds', A: 85, B: 35 },
  { subject: 'Crypto', A: 90, B: 20 },
  { subject: 'Real Estate', A: 75, B: 45 },
  { subject: 'Budgeting', A: 98, B: 50 },
  { subject: 'Taxes', A: 88, B: 30 },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    school: 'MIT, Class of 2026',
    avatar: '🎓',
    text: "I went from knowing nothing about investing to confidently managing my own portfolio. The gamification made it actually fun to learn.",
    rating: 5,
    streak: 142,
    coins: 45200
  },
  {
    name: 'Marcus Johnson',
    school: 'UCLA, Class of 2025',
    avatar: '🎓',
    text: "This should be required for every college student. I've saved over $2,000 since starting just by applying what I learned about budgeting.",
    rating: 5,
    streak: 98,
    coins: 32100
  },
  {
    name: 'Priya Patel',
    school: 'Stanford, Class of 2027',
    avatar: '🎓',
    text: "The streak system is addictive in the best way. 6 months straight and I finally understand how compound interest actually works!",
    rating: 5,
    streak: 186,
    coins: 67800
  },
  {
    name: 'Jake Williams',
    school: 'UT Austin, Class of 2025',
    avatar: '🎓',
    text: "Better than any finance class I've taken. The AI adapts to exactly what I need to learn. My credit score went up 80 points.",
    rating: 5,
    streak: 67,
    coins: 21400
  },
  {
    name: 'Emily Rodriguez',
    school: 'NYU, Class of 2026',
    avatar: '🎓',
    text: "I used to be terrified of taxes. Now I file them myself and actually understand what's happening. Game changer.",
    rating: 5,
    streak: 124,
    coins: 38900
  },
  {
    name: 'David Kim',
    school: 'UC Berkeley, Class of 2024',
    avatar: '🎓',
    text: "Landed my first internship in finance partly because of Finfluent. The practical knowledge here is unmatched.",
    rating: 5,
    streak: 201,
    coins: 72400
  },
];

const courses = [
  {
    icon: <PiggyBank size={32} />,
    title: 'Budgeting 101',
    lessons: 24,
    duration: '3.5 hrs',
    difficulty: 'Beginner',
    color: 'from-blue-500 to-blue-700',
    description: 'Master the 50/30/20 rule and build a budget that actually works for student life.'
  },
  {
    icon: <LineChart size={32} />,
    title: 'Stock Market Basics',
    lessons: 36,
    duration: '5.2 hrs',
    difficulty: 'Beginner',
    color: 'from-purple-500 to-purple-700',
    description: 'Understand stocks, ETFs, and how to start investing with as little as $10.'
  },
  {
    icon: <CreditCard size={32} />,
    title: 'Credit Score Mastery',
    lessons: 18,
    duration: '2.8 hrs',
    difficulty: 'Intermediate',
    color: 'from-cyan-500 to-cyan-700',
    description: 'Learn what affects your credit score and strategies to build excellent credit.'
  },
  {
    icon: <Landmark size={32} />,
    title: 'Tax Filing for Students',
    lessons: 22,
    duration: '4.1 hrs',
    difficulty: 'Intermediate',
    color: 'from-amber-500 to-amber-700',
    description: 'Navigate tax forms, deductions, and credits available to college students.'
  },
  {
    icon: <Building2 size={32} />,
    title: 'Real Estate Investing',
    lessons: 30,
    duration: '6.0 hrs',
    difficulty: 'Advanced',
    color: 'from-emerald-500 to-emerald-700',
    description: 'Explore REITs, rental properties, and real estate as an asset class.'
  },
  {
    icon: <Wallet size={32} />,
    title: 'Crypto & DeFi',
    lessons: 28,
    duration: '4.5 hrs',
    difficulty: 'Intermediate',
    color: 'from-pink-500 to-pink-700',
    description: 'Understand blockchain, Bitcoin, Ethereum, and decentralized finance safely.'
  },
];

const leaderboardData = [
  { rank: 1, name: 'CryptoKing_23', school: 'Wharton', xp: 284500, streak: 301 },
  { rank: 2, name: 'BudgetBoss', school: 'Harvard', xp: 276200, streak: 287 },
  { rank: 3, name: 'FinanceQueen', school: 'Stanford', xp: 268900, streak: 265 },
  { rank: 4, name: 'StockSavant', school: 'MIT', xp: 254300, streak: 243 },
  { rank: 5, name: 'MoneyMoves', school: 'Yale', xp: 241800, streak: 221 },
];

const faqs = [
  {
    question: "Is Finfluent really free for college students?",
    answer: "Yes! Finfluent is 100% free for all verified college students. Just sign up with your .edu email and you'll get full access to all modules, simulations, and features forever."
  },
  {
    question: "Do I need any prior finance knowledge?",
    answer: "Not at all! Our AI-powered system starts with the absolute basics and adapts to your skill level. Whether you're completely new to finance or already know a bit, we'll meet you where you are."
  },
  {
    question: "What can I do with FinCoins?",
    answer: "FinCoins can be redeemed for real rewards including gift cards, premium course access, merch, and even scholarship entries. Top earners can redeem for exclusive mentorship sessions with finance professionals."
  },
  {
    question: "How does the streak system work?",
    answer: "Complete at least one lesson per day to maintain your streak. Miss a day? Use your Freeze power-up to protect it. Longer streaks unlock special bonuses and multiplier rewards."
  },
  {
    question: "Is this better than taking a finance class?",
    answer: "Finfluent complements formal education! While classes teach theory, we focus on practical, actionable skills you'll actually use. Many students use Finfluent alongside their coursework for better results."
  },
  {
    question: "Can I learn about specific topics like crypto or real estate?",
    answer: "Absolutely! We have specialized modules covering stocks, crypto, real estate, taxes, credit, budgeting, and more. Our library is constantly expanding based on what students want to learn."
  },
];

const stats = [
  { number: '250K+', label: 'Students Learning', icon: <Users size={24} /> },
  { number: '2M+', label: 'Lessons Completed', icon: <BookOpen size={24} /> },
  { number: '500+', label: 'Interactive Modules', icon: <Zap size={24} /> },
  { number: '4.9★', label: 'App Store Rating', icon: <Star size={24} /> },
];

const partnerLogos = [
  'Harvard', 'MIT', 'Stanford', 'Wharton', 'Yale', 'NYU', 'UCLA', 'Berkeley'
];

// Scroll animation settings
const scrollReveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, type: "spring", bounce: 0.4 }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } }
};

const staggerItem = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl">
        <p className="text-white/60 text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Landing() {
  const navigate = useNavigate();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    const audio = new Audio(yayAudio);
    audio.volume = 0.5;
    audio.play().catch(e => console.log(e));
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white font-sans overflow-x-hidden selection:bg-blue-500/30">

      {/* 🚀 TOP NAVIGATION */}
      <nav className="fixed top-0 left-0 w-full h-20 bg-[#070b14]/80 backdrop-blur-xl z-50 border-b border-white/5 flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={logo} alt="Finfluent" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
          <span className="text-2xl font-black tracking-tight text-white hidden sm:block">Finfluent</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-white/60 hover:text-white font-bold text-sm transition-colors">Features</a>
          <a href="#courses" className="text-white/60 hover:text-white font-bold text-sm transition-colors">Courses</a>
          <a href="#testimonials" className="text-white/60 hover:text-white font-bold text-sm transition-colors">Reviews</a>
          <a href="#faq" className="text-white/60 hover:text-white font-bold text-sm transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 text-white/60 hover:text-white font-black tracking-wide transition-colors uppercase text-sm bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl"
            >
              
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-[#1e293b]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden py-2 max-h-96 overflow-y-auto no-scrollbar z-50"
                >
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => { setSelectedLang(lang); setIsLangOpen(false); }}
                      className="w-full text-left px-5 py-3 text-sm font-bold hover:bg-white/10 transition-colors flex items-center justify-between group"
                    >
                      <span className={selectedLang === lang ? 'text-blue-400' : 'text-white/70 group-hover:text-white'}>{lang}</span>
                      {selectedLang === lang && <Check size={16} className="text-blue-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleGetStarted}
            className="hidden sm:flex bg-[#58cc02] hover:bg-[#46a302] text-white font-black uppercase tracking-widest px-6 py-2.5 rounded-xl border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition-all text-sm"
          >
            Start Free
          </button>
        </div>
      </nav>

      {/* 🦉 HERO SECTION */}
      <motion.section style={{ opacity: heroOpacity }} className="pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center min-h-screen gap-12 lg:gap-20 relative">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6, duration: 1 }}
          className="w-full lg:w-1/2 flex justify-center relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 blur-[100px] rounded-full -z-10" />
          <img src={mascot} alt="Finfluent Mascot" className="w-[300px] md:w-[400px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10" />
        </motion.div>

        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6"
          >
            <GraduationCap size={16} className="text-blue-400" />
            <span className="text-blue-400 text-sm font-bold">Built for College Students</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05] mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70"
          >
            The free, fun way to learn finance.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-white/50 font-medium leading-relaxed mb-4 max-w-lg"
          >
            Join 250,000+ students mastering budgeting, investing, and wealth-building through interactive lessons, AI tutoring, and addictive gamification.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="flex -space-x-2">
              {['🧑‍🎓', '👩‍🎓', '🧑‍💻', '👩‍💻', '🧑‍🎓'].map((emoji, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-[#1e293b] border-2 border-[#070b14] flex items-center justify-center text-sm">
                  {emoji}
                </div>
              ))}
            </div>
            <div className="text-sm text-white/50">
              <span className="text-white font-bold">4.9/5</span> from 12,000+ reviews
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="w-full max-w-sm flex flex-col gap-4">
            <button
              onClick={handleGetStarted}
              className="w-full bg-[#58cc02] hover:bg-[#46a302] text-white font-black uppercase tracking-widest py-4 rounded-2xl border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition-all text-lg shadow-[0_10px_30px_rgba(88,204,2,0.3)] flex items-center justify-center gap-2"
            >
              <Play size={20} /> Get Started Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#1e293b] hover:bg-[#334155] text-blue-400 font-black uppercase tracking-widest py-4 rounded-2xl border-2 border-slate-700 border-b-4 active:border-b-2 active:translate-y-1 transition-all text-lg"
            >
              I Already Have An Account
            </button>
            <p className="text-center text-white/30 text-xs mt-2">No credit card required • Free for all students</p>
          </motion.div>
        </div>
      </motion.section>

      {/* 📊 STATS BAR */}
      <section className="py-16 px-6 border-y border-white/5 bg-[#0a0f1e]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              {...scrollReveal}
              transition={{ ...scrollReveal.transition, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 mb-4 text-blue-400">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.number}</div>
              <div className="text-sm text-white/40 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🎓 TRUSTED BY UNIVERSITIES */}
      <section className="py-16 px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/30 text-sm font-bold uppercase tracking-widest mb-8">Trusted by students at top universities</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {partnerLogos.map((logo, i) => (
              <motion.span
                key={logo}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="text-white/20 hover:text-white/50 font-black text-lg md:text-xl transition-colors cursor-default"
              >
                {logo}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* 🎯 HOW IT WORKS */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...scrollReveal} className="text-center mb-20">
            <span className="text-blue-400 font-black text-sm uppercase tracking-widest">How It Works</span>
            <h2 className="text-4xl md:text-6xl font-black mt-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
              Financial literacy in 3 steps
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent -translate-y-1/2" />

            {[
              { step: '01', icon: <Brain size={32} />, title: 'Take the Quiz', description: 'Our AI assesses your current financial knowledge in 2 minutes and creates your personalized learning path.' },
              { step: '02', icon: <Target size={32} />, title: 'Learn Daily', description: 'Complete bite-sized lessons, interactive simulations, and quizzes tailored to your level and goals.' },
              { step: '03', icon: <Trophy size={32} />, title: 'Level Up', description: 'Earn FinCoins, build streaks, compete on leaderboards, and watch your real-world financial skills grow.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...scrollReveal}
                transition={{ ...scrollReveal.transition, delay: i * 0.15 }}
                className="relative bg-[#1e293b]/30 backdrop-blur-sm p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div className="absolute -top-4 -right-4 text-6xl font-black text-white/5">0{i + 1}</div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black mb-3">{item.title}</h3>
                <p className="text-white/50 font-medium leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ⚡ FEATURE 1: AI Modules */}
      <motion.section {...scrollReveal} className="py-32 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 border-y border-white/5">
        <div className="w-full lg:w-1/2 flex justify-center">
          <motion.img
            animate={{ y: [-15, 15, -15], rotate: [-2, 2, -2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            src={random1}
            alt="Modules"
            className="w-[80%] max-w-[400px] object-contain drop-shadow-[0_30px_60px_rgba(59,130,246,0.3)]"
          />
        </div>
        <div className="w-full lg:w-1/2">
          <span className="text-blue-400 font-black text-sm uppercase tracking-widest">AI-Powered Learning</span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6 tracking-tight text-white leading-tight">Master the market<br />with AI paths.</h2>
          <p className="text-lg text-white/50 font-medium leading-relaxed mb-8 max-w-md">
            Stop reading boring textbooks. Our interactive modules adapt to your skill level, offering personalized video lessons and quizzes that actually stick.
          </p>
          <div className="space-y-4">
            {[
              'Personalized learning paths based on your goals',
              'Interactive simulations with real market data',
              'Instant feedback and AI-powered explanations',
              'Bite-sized lessons perfect for busy schedules',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-blue-400" />
                </div>
                <span className="text-white/70 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 📈 KNOWLEDGE GROWTH CHART */}
      <section className="py-32 px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div {...scrollReveal} className="text-center mb-16">
            <span className="text-purple-400 font-black text-sm uppercase tracking-widest">Proven Results</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-white">
              Learn 6x faster than traditional methods
            </h2>
            <p className="text-white/40 font-medium mt-4 max-w-2xl mx-auto">
              Our gamified approach combined with AI tutoring results in dramatically faster knowledge acquisition and better retention.
            </p>
          </motion.div>

          <motion.div {...scrollReveal} className="bg-[#1e293b]/30 backdrop-blur-sm rounded-3xl border border-white/5 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black">Knowledge Retention Over Time</h3>
                <p className="text-white/40 text-sm mt-1">Comparing Finfluent vs. Traditional Learning</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-white/60">Finfluent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                  <span className="text-sm text-white/60">Traditional</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={knowledgeGrowthData}>
                <defs>
                  <linearGradient id="colorFinfluent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTraditional" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="finfluent" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorFinfluent)" name="Finfluent" />
                <Area type="monotone" dataKey="traditional" stroke="rgba(255,255,255,0.3)" strokeWidth={2} fillOpacity={1} fill="url(#colorTraditional)" name="Traditional" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* 💰 FEATURE 2: FinCoins */}
      <motion.section {...scrollReveal} className="py-32 px-6 max-w-5xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-center gap-16 border-b border-white/5">
        <div className="w-full lg:w-1/2">
          <span className="text-yellow-400 font-black text-sm uppercase tracking-widest">Earn While You Learn</span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6 tracking-tight text-white">Secure the bag.</h2>
          <p className="text-lg text-white/50 font-medium leading-relaxed mb-8 max-w-md">
            Learning shouldn't be boring. Earn FinCoins by mastering market simulations, passing quizzes, and crushing your daily goals.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Flame size={20} />, label: 'Daily Streak', value: '+100 coins' },
              { icon: <Trophy size={20} />, label: 'Win Challenges', value: '+500 coins' },
              { icon: <Award size={20} />, label: 'Top Leaderboard', value: '+1000 coins' },
            ].map((item, i) => (
              <div key={i} className="bg-[#1e293b]/30 p-4 rounded-2xl border border-white/5">
                <div className="text-yellow-400 mb-2">{item.icon}</div>
                <div className="text-white/80 font-bold text-sm">{item.label}</div>
                <div className="text-yellow-400 font-black text-lg">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <div className="bg-[#1e293b]/40 backdrop-blur-md p-10 rounded-[3rem] border border-white/5 shadow-2xl relative">
            <div className="absolute inset-0 bg-yellow-500/10 blur-[50px] rounded-full pointer-events-none" />
            <motion.img
              animate={{ rotateY: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              src={fincoin}
              alt="FinCoins"
              className="w-48 h-48 object-contain relative z-10 drop-shadow-[0_0_40px_rgba(250,204,21,0.6)]"
            />
          </div>
        </div>
      </motion.section>

      {/* 🔥 FEATURE 3: Streaks */}
      <motion.section {...scrollReveal} className="py-32 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 border-b border-white/5">
        <div className="w-full lg:w-1/2 flex justify-center">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-[#1e293b]/40 backdrop-blur-md p-12 rounded-[3rem] border border-white/5 shadow-2xl relative">
            <div className="absolute inset-0 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none" />
            <img src={streakGif} alt="Streak" className="w-56 h-56 object-contain relative z-10 drop-shadow-[0_0_40px_rgba(249,115,22,0.6)]" />
          </motion.div>
        </div>
        <div className="w-full lg:w-1/2">
          <span className="text-orange-400 font-black text-sm uppercase tracking-widest">Habit Building</span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6 tracking-tight text-white leading-tight">Build an<br />unbreakable habit.</h2>
          <p className="text-lg text-white/50 font-medium leading-relaxed mb-8 max-w-md">
            Consistency is the only secret to wealth. Protect your daily streak, unlock freeze defenses, and watch your financial knowledge compound.
          </p>
          <div className="space-y-3">
            {[
              { icon: <Flame size={20} />, text: 'Visual streak counter with fire animations', active: true },
              { icon: <Lock size={20} />, text: 'Streak Freeze protects against missed days', active: true },
              { icon: <Unlock size={20} />, text: 'Unlock at 7, 30, and 100 day milestones', active: true },
              { icon: <Heart size={20} />, text: 'Streak repair options for dedicated learners', active: false },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 ${item.active ? '' : 'opacity-40'}`}>
                <div className="text-orange-400">{item.icon}</div>
                <span className="text-white/70 font-medium">{item.text}</span>
                {!item.active && <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full ml-auto">Coming Soon</span>}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 🛠️ FEATURE 4: Modern Tools */}
      <motion.section {...scrollReveal} className="py-32 px-6 max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16 border-b border-white/5">
        <div className="w-full lg:w-1/2">
          <span className="text-cyan-400 font-black text-sm uppercase tracking-widest">Advanced Tools</span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6 tracking-tight text-white leading-tight">Tools for the<br />modern market.</h2>
          <p className="text-lg text-white/50 font-medium leading-relaxed mb-8 max-w-md">
            Dive into advanced stock charting, real-time leaderboard battles, and personalized onboarding tailored to your specific financial dreams.
          </p>
          <div className="flex flex-wrap gap-3">
            {['Stock Charts', 'Portfolio Simulator', 'Tax Calculator', 'Credit Analyzer', 'Budget Planner', 'Investment Tracker'].map((tool, i) => (
              <span key={i} className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm text-white/60 font-medium hover:bg-white/10 hover:text-white transition-colors cursor-default">
                {tool}
              </span>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex justify-center relative h-[400px]">
          <motion.img animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} src={random2} className="absolute top-10 left-10 w-40 drop-shadow-2xl z-20" />
          <motion.img animate={{ y: [0, 30, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} src={random4} className="absolute bottom-10 right-10 w-48 drop-shadow-2xl z-10" />
          <motion.img animate={{ y: [0, -15, 0], x: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} src={random3} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 drop-shadow-[0_0_60px_rgba(255,255,255,0.1)] z-0" />
          <motion.img animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} src={random5} className="absolute -top-10 -right-10 w-32 opacity-40 blur-sm -z-10" />
        </div>
      </motion.section>

      {/* 📊 COMPARISON CHART */}
      <section className="py-32 px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div {...scrollReveal} className="text-center mb-16">
            <span className="text-emerald-400 font-black text-sm uppercase tracking-widest">Why Finfluent</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-white">
              See the difference
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div {...scrollReveal} className="bg-[#1e293b]/30 backdrop-blur-sm rounded-3xl border border-white/5 p-8">
              <h3 className="text-xl font-black mb-6">Engagement Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <YAxis dataKey="category" type="category" stroke="rgba(255,255,255,0.3)" fontSize={12} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="finfluent" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Finfluent" />
                  <Bar dataKey="traditional" fill="rgba(255,255,255,0.15)" radius={[0, 6, 6, 0]} name="Traditional" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div {...scrollReveal} transition={{ ...scrollReveal.transition, delay: 0.2 }} className="bg-[#1e293b]/30 backdrop-blur-sm rounded-3xl border border-white/5 p-8">
              <h3 className="text-xl font-black mb-6">Topic Coverage</h3>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                    <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" />
                    <Radar name="Finfluent" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Radar name="Traditional" dataKey="B" stroke="rgba(255,255,255,0.3)" fill="rgba(255,255,255,0.1)" fillOpacity={0.3} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 📚 COURSES SECTION */}
      <section id="courses" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...scrollReveal} className="text-center mb-16">
            <span className="text-pink-400 font-black text-sm uppercase tracking-widest">Course Library</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-white">
              500+ modules covering everything
            </h2>
            <p className="text-white/40 font-medium mt-4 max-w-2xl mx-auto">
              From budgeting basics to advanced crypto strategies, we've got you covered.
            </p>
          </motion.div>

          <motion.div {...staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <motion.div
                key={i}
                {...staggerItem}
                className="bg-[#1e293b]/30 backdrop-blur-sm rounded-3xl border border-white/5 p-6 hover:border-white/10 transition-all group cursor-pointer hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {course.icon}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    course.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                    course.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {course.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-black mb-2">{course.title}</h3>
                <p className="text-white/40 text-sm font-medium leading-relaxed mb-4">{course.description}</p>
                <div className="flex items-center gap-4 text-white/30 text-sm">
                  <div className="flex items-center gap-1">
                    <BookOpen size={14} />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...scrollReveal} className="text-center mt-12">
            <button className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl font-black text-white transition-colors">
              View All Courses <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* 📊 MODULE DISTRIBUTION */}
      <section className="py-32 px-6 border-y border-white/5 bg-[#0a0f1e]">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <motion.div {...scrollReveal}>
              <span className="text-violet-400 font-black text-sm uppercase tracking-widest">Content Library</span>
              <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6 tracking-tight text-white">
                Every topic you need
              </h2>
              <p className="text-white/50 font-medium leading-relaxed mb-8">
                Our content is constantly updated based on what students actually need to know. No fluff, just practical knowledge.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {moduleDistribution.map((module, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: module.color }} />
                    <span className="text-white/60 font-medium">{module.name}</span>
                    <span className="text-white/30 text-sm ml-auto">{module.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          <motion.div {...scrollReveal} className="w-full lg:w-1/2">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={moduleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {moduleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* 🏆 LEADERBOARD PREVIEW */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...scrollReveal} className="text-center mb-16">
            <span className="text-amber-400 font-black text-sm uppercase tracking-widest">Compete & Win</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-white">
              Climb the leaderboard
            </h2>
          </motion.div>

          <motion.div {...scrollReveal} className="bg-[#1e293b]/30 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden">
            <div className="grid grid-cols-[60px_1fr_100px_100px_100px] md:grid-cols-[80px_1fr_150px_120px_120px] gap-4 p-6 border-b border-white/5 text-white/40 text-sm font-bold uppercase tracking-wider">
              <span>Rank</span>
              <span>Player</span>
              <span className="hidden md:block">School</span>
              <span className="text-right">XP</span>
              <span className="text-right">Streak</span>
            </div>
            {leaderboardData.map((player, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`grid grid-cols-[60px_1fr_100px_100px_100px] md:grid-cols-[80px_1fr_150px_120px_120px] gap-4 p-6 items-center border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${
                  i < 3 ? 'bg-amber-500/5' : ''
                }`}
              >
                <span className={`text-2xl font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-white/30'}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${player.rank}`}
                </span>
                <span className="font-bold text-white truncate">{player.name}</span>
                <span className="hidden md:block text-white/50 truncate">{player.school}</span>
                <span className="text-right font-bold text-blue-400">{(player.xp / 1000).toFixed(1)}K</span>
                <span className="text-right font-bold text-orange-400">🔥 {player.streak}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 💬 TESTIMONIALS */}
      <section id="testimonials" className="py-32 px-6 border-t border-white/5 bg-[#0a0f1e]">
        <div className="max-w-6xl mx-auto">
          <motion.div {...scrollReveal} className="text-center mb-16">
            <span className="text-blue-400 font-black text-sm uppercase tracking-widest">Student Love</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-white">
              Don't take our word for it
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                {...staggerItem}
                className={`bg-[#1e293b]/30 backdrop-blur-sm rounded-3xl border border-white/5 p-6 transition-all ${
                  i === activeTestimonial ? 'border-blue-500/30 bg-blue-500/5' : 'hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white/70 font-medium leading-relaxed mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{testimonial.name}</div>
                    <div className="text-white/40 text-xs">{testimonial.school}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1 text-orange-400 text-xs">
                    <Flame size={12} /> {testimonial.streak} day streak
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 text-xs">
                    <BarChart3 size={12} /> {testimonial.coins.toLocaleString()} coins
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ❓ FAQ SECTION */}
      <section id="faq" className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div {...scrollReveal} className="text-center mb-16">
            <span className="text-white/40 font-black text-sm uppercase tracking-widest">FAQ</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 tracking-tight text-white">
              Got questions?
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 FINAL CTA */}
      <section className="py-40 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />

        <motion.div {...scrollReveal} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 mb-8">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-white/60 text-sm font-bold">Join 250,000+ students already learning</span>
        </motion.div>

        <motion.h2 {...scrollReveal} className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter relative z-10">
          Ready to level up?
        </motion.h2>

        <motion.p {...scrollReveal} className="text-white/40 text-lg md:text-xl font-medium mb-12 max-w-2xl relative z-10">
          Your financial future starts today. Stop scrolling, start learning.
        </motion.p>

        <motion.div {...scrollReveal} className="w-full max-w-md relative z-10 flex flex-col gap-4">
          <button
            onClick={handleGetStarted}
            className="w-full bg-[#58cc02] hover:bg-[#46a302] text-white font-black uppercase tracking-widest py-6 rounded-2xl border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition-all text-xl md:text-2xl shadow-[0_20px_50px_rgba(88,204,2,0.4)]"
          >
            Start Learning Free
          </button>
          <p className="text-white/30 text-sm">No credit card • Free forever for students • Cancel anytime</p>
        </motion.div>

        <motion.div {...scrollReveal} className="flex items-center gap-8 mt-16 relative z-10">
          {[
            { icon: <Shield size={20} />, text: 'SSL Encrypted' },
            { icon: <Lock size={20} />, text: 'Privacy First' },
            { icon: <Heart size={20} />, text: 'Made with ❤️' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-white/30">
              {item.icon}
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* 📱 FOOTER */}
      <footer className="py-16 px-6 border-t border-white/5 bg-[#050810]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="Finfluent" className="w-8 h-8 object-contain" />
                <span className="text-xl font-black">Finfluent</span>
              </div>
              <p className="text-white/40 text-sm font-medium leading-relaxed">
                Making financial literacy accessible, engaging, and free for every college student.
              </p>
            </div>

            <div>
              <h4 className="font-black text-white mb-4">Product</h4>
              <div className="space-y-3">
                {['Features', 'Courses', 'Pricing', 'Mobile App'].map((item) => (
                  <a key={item} href="#" className="block text-white/40 hover:text-white text-sm font-medium transition-colors">{item}</a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-black text-white mb-4">Company</h4>
              <div className="space-y-3">
                {['About', 'Blog', 'Careers', 'Press'].map((item) => (
                  <a key={item} href="#" className="block text-white/40 hover:text-white text-sm font-medium transition-colors">{item}</a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-black text-white mb-4">Support</h4>
              <div className="space-y-3">
                {['Help Center', 'Contact', 'Privacy', 'Terms'].map((item) => (
                  <a key={item} href="#" className="block text-white/40 hover:text-white text-sm font-medium transition-colors">{item}</a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">© 2026 Finfluent. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {['Twitter', 'Discord', 'Instagram', 'TikTok'].map((social) => (
                <a key={social} href="#" className="text-white/30 hover:text-white text-sm font-medium transition-colors">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// FAQ Accordion Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[#1e293b]/30 border border-white/5 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="font-bold text-white pr-4">{question}</span>
        <ChevronDown size={20} className={`text-white/40 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 text-white/50 font-medium leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}