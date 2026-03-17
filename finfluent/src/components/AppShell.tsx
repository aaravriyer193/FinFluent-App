import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, User, Award, BookOpen } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AIChatBot from './AIChatBot';

// VITE FIX: Lowercase imports!
import mascot from '../assets/mascot.gif';
import fincoin from '../assets/fincoin.gif';
import random1 from '../assets/random1.png';

const navLinkClasses = ({ isActive }: { isActive: boolean }) => 
  `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
    isActive ? 'bg-white/20 shadow-inner text-white' : 'hover:bg-white/10 text-white/60 hover:text-white'
  }`;

export default function AppShell() {
  const { user } = useAppContext();

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/modules', icon: BookOpen, label: 'Lessons' },
    { to: '/leaderboard', icon: Award, label: 'Leaderboard' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    // FORCING DARK MODE: bg-[#0f172a] and text-white
    <div className="flex h-screen w-full bg-[#0f172a] text-white overflow-hidden animate-fade-in relative">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 z-10 shadow-2xl">
        <div className="flex items-center gap-3 mb-10">
          <img src={mascot} alt="Finfluent" className="w-10 h-10 object-contain" />
          <h1 className="text-2xl font-bold tracking-tight">Finfluent</h1>
        </div>

        {/* Wealth Display */}
        <div className="mb-8 p-4 rounded-2xl bg-black/20 border border-white/10 flex items-center justify-between shadow-inner">
          <div className="flex flex-col">
            <span className="text-xs text-white/50 uppercase tracking-wider">Wealth</span>
            <span className="font-bold text-lg">{user?.spendable_fin_coins || 0}</span>
          </div>
          <img src={fincoin} alt="FinCoins" className="w-8 h-8 object-contain" />
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClasses}>
              <item.icon size={20} />
              <span className="font-semibold">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-full overflow-y-auto relative pb-20 md:pb-0 z-0">
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none -z-10 w-96 h-96 bg-no-repeat bg-contain" 
             style={{ backgroundImage: `url(${random1})` }} />
        
        <div className="p-4 md:p-8 max-w-6xl mx-auto h-full animate-slide-up">
          <Outlet />
        </div>
      </main>

      {/* MOBILE BOTTOM NAVBAR */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0f172a]/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center p-4 pb-6 z-40">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `p-3 rounded-full transition-all ${isActive ? 'bg-white/20' : ''}`}>
            {({ isActive }) => <item.icon size={24} className={isActive ? 'text-white' : 'text-white/60'} />}
          </NavLink>
        ))}
      </nav>

      {/* THE PERSISTENT AI BRAIN */}
      <AIChatBot />
    </div>
  );
}