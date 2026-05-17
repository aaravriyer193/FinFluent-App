import React, { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, User, Award, BookOpen, LogOut, Sun, Moon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import AIChatBot from './AIChatBot';

import logo from '../assets/logo.png';
import fincoin from '../assets/fincoin.gif';
import streakGif from '../assets/Streak.gif';

// ── Theme hook ────────────────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('finfluent-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('finfluent-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}

// ── Streak icon ───────────────────────────────────────────────────────────────
const StreakIcon = ({ size, style }: { size?: number; style?: React.CSSProperties }) => (
  <img
    src={streakGif}
    alt="Streak"
    style={{ width: size, height: size, objectFit: 'contain', ...style }}
  />
);

const navItems = [
  { to: '/dashboard',   icon: Home,       label: 'Dashboard'   },
  { to: '/modules',     icon: BookOpen,   label: 'Lessons'     },
  { to: '/streak',      icon: StreakIcon, label: 'Streak'      },
  { to: '/leaderboard', icon: Award,      label: 'Leaderboard' },
  { to: '/resources',   icon: BookOpen,   label: 'Resources'   },
  { to: '/profile',     icon: User,       label: 'Profile'     },
];

export default function AppShell() {
  const { user } = useAppContext();
  const { dark, toggle } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div
      className="flex h-[100dvh] w-full overflow-hidden font-sans"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 border-r overflow-y-auto"
        style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
          <img src={logo} alt="Finfluent" className="w-8 h-8 object-contain" />
          <span
            className="text-base font-bold"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Finfluent
          </span>
        </div>

        {/* Wealth chip */}
        <div
          className="mx-4 mb-5 flex items-center justify-between px-3 py-2.5 rounded-xl border"
          style={{ background: 'var(--bg-base)', borderColor: 'var(--border-default)' }}
        >
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Wealth
            </p>
            <p className="text-sm font-bold" style={{ color: 'var(--warning)' }}>
              {user?.spendable_fin_coins || 0}
            </p>
          </div>
          <img src={fincoin} alt="FinCoins" className="w-7 h-7 object-contain" />
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 px-3 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s',
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              })}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="mx-4 mb-6 flex flex-col gap-1 pt-3 border-t" style={{ borderColor: 'var(--border-soft)' }}>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ color: 'var(--text-tertiary)', background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-overlay)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span className="flex items-center gap-2.5">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
              {dark ? 'Light mode' : 'Dark mode'}
            </span>
            {/* Pill toggle */}
            <div
              className="relative w-8 h-4 rounded-full transition-colors duration-200 shrink-0"
              style={{ background: dark ? 'var(--accent)' : 'var(--bg-overlay)' }}
            >
              <div
                className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-sm"
                style={{ transform: dark ? 'translateX(18px)' : 'translateX(2px)' }}
              />
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e53e3e')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <header
        className="md:hidden fixed top-0 left-0 w-full h-14 flex items-center justify-between px-4 z-40 border-b"
        style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}
      >
        <div className="flex items-center gap-2">
          <img src={logo} alt="Finfluent" className="w-7 h-7 object-contain" />
          <span
            className="text-sm font-bold"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Finfluent
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile theme toggle — icon only */}
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all"
            style={{
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)',
              background: 'var(--bg-base)',
            }}
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold"
            style={{
              background: 'var(--bg-base)',
              borderColor: 'var(--border-default)',
              color: 'var(--warning)',
            }}
          >
            {user?.spendable_fin_coins || 0}
            <img src={fincoin} className="w-4 h-4 object-contain" alt="" />
          </div>

          <button onClick={handleLogout} style={{ color: 'var(--text-tertiary)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden pt-14 md:pt-0 pb-20 md:pb-0">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pt-2 z-40 border-t"
        style={{
          background: 'var(--bg-subtle)',
          borderColor: 'var(--border-soft)',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="p-2.5 rounded-lg transition-all"
          >
            {({ isActive }) => (
              <item.icon
                size={22}
                style={{ color: isActive ? 'var(--accent)' : 'var(--text-disabled)' }}
              />
            )}
          </NavLink>
        ))}
      </nav>

      <AIChatBot />
    </div>
  );
}