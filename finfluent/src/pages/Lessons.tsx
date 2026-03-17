import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Lock, Check, MapPin, Loader2,
  Book, Wallet, PiggyBank, TrendingUp, Landmark, 
  LineChart, Coins, CreditCard, Gem, ShieldCheck, 
  Briefcase, BarChart, PieChart, Target, Rocket, Crown 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import type { UserProgress } from '../types';

import random1 from '../assets/random1.png';
import random2 from '../assets/random2.png';
import random3 from '../assets/random3.png';
import random4 from '../assets/random4.png';
import random5 from '../assets/random5.png';

const MODULES_COUNT = 16;

const MODULE_CONFIG = [
  { icon: Book, bg: 'bg-blue-500', shadow: '#1e3a8a', border: '#bfdbfe' },
  { icon: Wallet, bg: 'bg-teal-500', shadow: '#115e59', border: '#99f6e4' },
  { icon: PiggyBank, bg: 'bg-green-500', shadow: '#14532d', border: '#bbf7d0' },
  { icon: TrendingUp, bg: 'bg-emerald-500', shadow: '#064e3b', border: '#a7f3d0' },
  { icon: Landmark, bg: 'bg-purple-500', shadow: '#4c1d95', border: '#e9d5ff' },
  { icon: LineChart, bg: 'bg-fuchsia-500', shadow: '#701a75', border: '#fbcfe8' },
  { icon: Coins, bg: 'bg-pink-500', shadow: '#831843', border: '#fce7f3' },
  { icon: CreditCard, bg: 'bg-rose-500', shadow: '#881337', border: '#ffe4e6' },
  { icon: Gem, bg: 'bg-orange-500', shadow: '#7c2d12', border: '#fed7aa' },
  { icon: ShieldCheck, bg: 'bg-amber-500', shadow: '#78350f', border: '#fde68a' },
  { icon: Briefcase, bg: 'bg-indigo-500', shadow: '#312e81', border: '#c7d2fe' },
  { icon: BarChart, bg: 'bg-violet-500', shadow: '#4c1d95', border: '#ede9fe' },
  { icon: PieChart, bg: 'bg-cyan-500', shadow: '#164e63', border: '#cffafe' },
  { icon: Target, bg: 'bg-sky-500', shadow: '#0c4a6e', border: '#e0f2fe' },
  { icon: Rocket, bg: 'bg-red-500', shadow: '#7f1d1d', border: '#fecaca' },
  { icon: Crown, bg: 'bg-yellow-400', shadow: '#713f12', border: '#fef08a' },
];

export default function Lessons() {
  const { user } = useAppContext();
  const navigate = useNavigate();
  
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [modules, setModules] = useState<{id: number, title: string, description: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // THE FIX: Screen size detection for responsive Roadmap rendering
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchRoadmapData = async () => {
      try {
        const [progressRes, modulesRes] = await Promise.all([
          supabase.from('user_progress').select('*').eq('user_id', user.id),
          supabase.from('modules').select('*').order('id', { ascending: true })
        ]);
        if (progressRes.data) setProgress(progressRes.data);
        if (modulesRes.data) setModules(modulesRes.data);
      } catch (error) {
        console.error("Error fetching roadmap data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoadmapData();
  }, [user]);

  const checkStatus = (modNum: number) => {
    if (modNum === 1) return progress.find(p => p.module_id === 1)?.status === 'completed' ? 'completed' : 'unlocked';
    const prevMod = progress.find(p => p.module_id === modNum - 1);
    const currMod = progress.find(p => p.module_id === modNum);
    if (currMod?.status === 'completed') return 'completed';
    if (prevMod?.status === 'completed') return 'unlocked';
    return 'locked';
  };

  const floatAnimation = (delay: number) => ({
    y: [0, -20, 0],
    rotate: [0, 3, -3, 0],
    transition: { duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }
  });

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-white/50">
        <Loader2 className="animate-spin text-blue-500 w-12 h-12 mb-4" />
        <span className="font-bold tracking-widest uppercase">Loading Curriculum...</span>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col items-center py-6 text-white animate-fade-in w-full relative overflow-x-hidden">
      
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16 md:mb-20 z-20 w-full max-w-3xl bg-[#1e293b]/80 p-8 md:p-10 rounded-[40px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            The Roadmap
          </h1>
          <p className="text-white/70 font-medium leading-relaxed text-base md:text-lg">
            Follow the path to financial mastery. Complete a module to unlock the next one and earn your FinCoins.
          </p>
        </div>
      </motion.div>

      <div className="relative flex flex-col items-center w-full max-w-md z-10 pb-40">
        {MODULE_CONFIG.map((config, i) => {
          const modNum = i + 1;
          const status = checkStatus(modNum);
          const modData = modules.find(m => m.id === modNum);
          
          const isLeft = i % 2 === 0;
          
          // THE FIX: Narrower zig-zag on mobile so text fits!
          const currentX = isMobile ? (isLeft ? -40 : 40) : (isLeft ? -90 : 90); 
          const svgW = isMobile ? 80 : 180;
          const svgPath = isLeft ? `M 0,0 C 0,96 ${svgW},96 ${svgW},192` : `M ${svgW},0 C ${svgW},96 0,96 0,192`;
          
          const Icon = config.icon;

          return (
            <div key={modNum} className="relative h-48 w-full flex justify-center items-center">
              
              {/* 🛣️ Dynamic SVG WINDING ROAD */}
              {modNum !== MODULE_CONFIG.length && (
                <svg className={`absolute top-1/2 left-1/2 -translate-x-1/2 h-[192px] -z-10 ${isMobile ? 'w-[80px]' : 'w-[180px]'}`} style={{ overflow: 'visible' }}>
                  <path d={svgPath} fill="none" stroke={status === 'completed' ? "#ca8a04" : "#1e293b"} strokeWidth={isMobile ? "20" : "28"} strokeLinecap="round" className="drop-shadow-2xl" />
                  <path d={svgPath} fill="none" stroke={status === 'completed' ? "#fde047" : "#334155"} strokeWidth={isMobile ? "8" : "12"} strokeLinecap="round" />
                </svg>
              )}

              {/* 🌲 SCENERY VECTORS (Hidden or shrunk on mobile to reduce clutter) */}
              {modNum === 2 && <motion.img animate={floatAnimation(0)} src={random1} alt="Scenery" className="hidden md:block absolute left-[-240px] w-56 h-56 object-contain drop-shadow-2xl z-0 pointer-events-none" />}
              {modNum === 5 && <motion.img animate={floatAnimation(1)} src={random2} alt="Scenery" className="hidden md:block absolute right-[-260px] w-64 h-64 object-contain drop-shadow-2xl z-0 pointer-events-none" />}
              {modNum === 8 && <motion.img animate={floatAnimation(2)} src={random3} alt="Scenery" className="hidden md:block absolute left-[-280px] w-72 h-72 object-contain drop-shadow-2xl z-0 pointer-events-none" />}

              <motion.div style={{ x: currentX }} className="relative z-20">
                
                {/* 📍 YOU ARE HERE INDICATOR */}
                {status === 'unlocked' && (
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }} animate={{ y: [0, -12, 0], opacity: 1 }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute -top-14 md:-top-16 left-1/2 -translate-x-1/2 flex flex-col items-center text-yellow-400 font-black drop-shadow-2xl z-30"
                  >
                    <span className="bg-white text-black px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs mb-1 tracking-widest shadow-xl">START</span>
                    <MapPin size={isMobile ? 24 : 28} fill="currentColor" className="text-white drop-shadow-md" />
                  </motion.div>
                )}

                {/* 🔘 BUTTON (Shrunk on mobile) */}
                <motion.button
                  whileHover={status !== 'locked' ? { scale: 1.08 } : {}}
                  whileTap={status !== 'locked' ? { scale: 0.95, y: 8, boxShadow: "0px 0px 0px rgba(0,0,0,0)" } : {}}
                  onClick={() => status !== 'locked' && navigate(`/module/${modNum}`)}
                  className={`w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center relative transition-colors duration-300 cursor-pointer
                    ${status === 'completed' ? `bg-yellow-400 text-yellow-900 border-[6px] md:border-[8px] border-yellow-200` 
                      : status === 'unlocked' ? `${config.bg} text-white border-[6px] md:border-[8px]`
                      : 'bg-[#1e293b] text-white/20 border-[6px] md:border-[8px] border-[#334155] cursor-not-allowed'
                    }
                  `}
                  style={{ 
                    borderColor: status === 'unlocked' ? config.border : undefined,
                    boxShadow: status === 'completed' ? `0px 8px 0px #a16207` : status === 'unlocked' ? `0px 8px 0px ${config.shadow}` : `0px 8px 0px #0f172a`
                  }}
                >
                  <div className="drop-shadow-lg">
                    {status === 'completed' ? <Check size={isMobile ? 32 : 48} strokeWidth={4} /> : 
                     status === 'locked' ? <Lock size={isMobile ? 24 : 36} /> : 
                     <Icon size={isMobile ? 32 : 48} strokeWidth={2.5} />}
                  </div>
                   
                  {/* THE FIX: Flexible wrapping container for the text */}
                  <div className={`absolute top-1/2 -translate-y-1/2 flex flex-col pointer-events-none
                    ${isLeft ? 'left-[90px] md:left-[130px] items-start text-left' : 'right-[90px] md:right-[130px] items-end text-right'}
                    w-[130px] md:w-[240px]
                  `}>
                    <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 ${status === 'locked' ? 'text-white/20' : 'text-blue-400/80 drop-shadow-md'}`}>
                      Module {modNum}
                    </div>
                    <div className={`font-black text-sm md:text-2xl leading-tight line-clamp-3 ${status === 'locked' ? 'text-white/30' : 'text-white drop-shadow-xl'}`}>
                      {modData ? modData.title : 'Encrypted'}
                    </div>
                    {status === 'completed' && <div className="text-yellow-400 text-[10px] md:text-sm font-bold uppercase tracking-wider drop-shadow-md mt-1">Cleared</div>}
                    {status === 'unlocked' && <div className="text-blue-300 text-[10px] md:text-sm font-bold uppercase tracking-wider drop-shadow-md mt-1">Next Lesson</div>}
                  </div>
                </motion.button>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}