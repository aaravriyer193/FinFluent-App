import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, User, Award, BookOpen, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import AIChatBot from './AIChatBot';

// Using static logo for UI, keeping mascot for chat, fincoin for wealth
import logo from '../assets/logo.png';
import fincoin from '../assets/fincoin.gif';

// Upgraded active styling to match the new dark premium theme
const navLinkClasses = ({ isActive }: { isActive: boolean }) => 
  `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
    isActive 
      ? 'bg-blue-600/20 shadow-[inset_0_0_20px_rgba(37,99,235,0.2)] border border-blue-500/30 text-blue-400' 
      : 'hover:bg-white/10 text-white/50 hover:text-white border border-transparent'
  }`;

export default function AppShell() {
  const { user } = useAppContext();

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/modules', icon: BookOpen, label: 'Lessons' },
    { to: '/leaderboard', icon: Award, label: 'Leaderboard' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login'; // Force reload to clear all states
  };

  return (
    // STRICT FIX: h-[100dvh] fixes mobile scrolling forever
    <div className="flex h-[100dvh] w-full bg-[#070b14] text-white overflow-hidden animate-fade-in relative">
      
      {/* 🌌 AMBIENT GLOWS (Added behind everything) */}
      <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <motion.div animate={{ rotate: -360, scale: [1, 1.2, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* ========================================== */}
      {/* DESKTOP SIDEBAR */}
      {/* ========================================== */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0f172a]/70 backdrop-blur-3xl border-r border-white/5 p-6 z-20 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Swapped to Logo.png */}
        <div className="flex items-center gap-3 mb-10">
          <img src={logo} alt="Finfluent" className="w-10 h-10 object-contain drop-shadow-lg" />
          <h1 className="text-2xl font-black tracking-tight text-white">Finfluent</h1>
        </div>

        {/* Wealth Display */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-br from-black/40 to-black/60 border border-white/10 flex items-center justify-between shadow-inner">
          <div className="flex flex-col z-10">
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Wealth</span>
            <span className="font-black text-xl text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">{user?.spendable_fin_coins || 0}</span>
          </div>
          <img src={fincoin} alt="FinCoins" className="w-10 h-10 object-contain z-10" />
        </div>

        {/* Navigation Links (Using your exact working syntax) */}
        <nav className="flex flex-col gap-2 flex-1 relative z-10">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClasses}>
              <item.icon size={20} />
              <span className="font-bold">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Desktop Logout Button */}
        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 p-3 rounded-xl text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all font-bold group z-10"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> Logout
        </button>
      </aside>

      {/* ========================================== */}
      {/* MOBILE TOP BAR (New Feature) */}
      {/* ========================================== */}
      <header className="md:hidden fixed top-0 left-0 w-full h-16 bg-[#0f172a]/90 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-4 z-40 shadow-lg">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Finfluent" className="w-8 h-8 object-contain" />
          <h1 className="text-lg font-black tracking-tight">Finfluent</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
            <span className="font-black text-sm text-yellow-400">{user?.spendable_fin_coins || 0}</span>
            <img src={fincoin} alt="Coins" className="w-4 h-4 object-contain" />
          </div>
          <button onClick={handleLogout} className="text-white/50 hover:text-red-400 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* ========================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================== */}
      {/* pt-16 added here to push content below the new mobile header */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative pt-16 md:pt-0 pb-20 md:pb-0 z-10">
        <div className="p-4 md:p-8 max-w-6xl mx-auto h-full animate-slide-up">
          <Outlet />
        </div>
      </main>

      {/* ========================================== */}
      {/* MOBILE BOTTOM NAVBAR */}
      {/* ========================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0f172a]/95 backdrop-blur-3xl border-t border-white/10 flex justify-around items-center p-2 pb-6 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to} 
            className={({ isActive }) => `p-3 rounded-2xl transition-all ${isActive ? 'bg-blue-600/20 shadow-inner' : ''}`}
          >
            {/* Using your exact working callback syntax for the icon */}
            {({ isActive }) => (
              <item.icon 
                size={24} 
                className={isActive ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]' : 'text-white/40'} 
              />
            )}
          </NavLink>
        ))}
      </nav>

      {/* THE PERSISTENT AI BRAIN */}
      <AIChatBot />
    </div>
  );
}