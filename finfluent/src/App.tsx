import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';

// Shell
import AppShell from './components/AppShell';

// Marketing / public
import Landing  from './pages/Landing';
import About    from './pages/About';
import Contact  from './pages/Contact';
import Privacy  from './pages/Privacy';
import Terms    from './pages/Terms';

// Auth
import Login      from './pages/Login';
import Onboarding from './pages/Onboarding';

// Protected app pages
import Dashboard   from './pages/Dashboard';
import Module      from './pages/Module';
import Profile     from './pages/Profile';
import Lessons     from './pages/Lessons';
import Leaderboard from './pages/Leaderboard';
import Streak      from './pages/Streak';
import Resources   from './pages/Resources';
import Discover    from './pages/Discover';

import mascot from './assets/mascot.gif';

// ==========================================
// THE BOUNCERS (Route Guards)
// ==========================================

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { session, user, loading } = useAppContext();
  const location = useLocation();

  // 1. Still checking Supabase auth — show loader
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center"
        style={{ background: 'var(--bg-base)' }}>
        <img src={mascot} alt="Loading" className="w-16 h-16 mb-4 opacity-60" />
        <span className="text-xs font-medium tracking-widest uppercase"
          style={{ color: 'var(--text-tertiary)' }}>
          Authenticating…
        </span>
      </div>
    );
  }

  // 2. No session — go to login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Session exists but profile not yet loaded — wait
  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center"
        style={{ background: 'var(--bg-base)' }}>
        <img src={mascot} alt="Syncing" className="w-14 h-14 mb-4 opacity-50" />
        <span className="text-xs font-medium tracking-widest uppercase"
          style={{ color: 'var(--text-tertiary)' }}>
          Syncing profile…
        </span>
      </div>
    );
  }

  // 4. Profile loaded — check onboarding
  if (!user.has_completed_onboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const RequireOnboarding = ({ children }: { children: React.ReactNode }) => {
  const { session, user, loading } = useAppContext();

  if (loading) return null;
  if (!session)  return <Navigate to="/login" replace />;
  if (!user)     return null;
  if (user.has_completed_onboarding) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

// ==========================================
// MAIN APP ROUTER
// ==========================================
export default function App() {
  const { session, loading, user } = useAppContext();

  if (loading && !session) return null;

  return (
    <Routes>

      {/* ── Front door ─────────────────────────────────────────── */}
      <Route
        path="/"
        element={
          (session && user?.has_completed_onboarding)
            ? <Navigate to="/dashboard" replace />
            : (session && !user?.has_completed_onboarding)
              ? <Navigate to="/onboarding" replace />
              : <Landing />
        }
      />

      {/* ── Marketing pages (always public) ────────────────────── */}
      <Route path="/about"   element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms"   element={<Terms />} />

      {/* ── Auth ───────────────────────────────────────────────── */}
      <Route
        path="/login"
        element={
          (session && user?.has_completed_onboarding)
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />
      <Route
        path="/onboarding"
        element={<RequireOnboarding><Onboarding /></RequireOnboarding>}
      />

      {/* ── Protected vault ────────────────────────────────────── */}
      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/dashboard"        element={<Dashboard />} />
        <Route path="/module/:moduleId" element={<Module />} />
        <Route path="/modules"          element={<Lessons />} />
        <Route path="/streak"           element={<Streak />} />
        <Route path="/leaderboard"      element={<Leaderboard />} />
        <Route path="/resources"        element={<Resources />} />
        <Route path="/profile"          element={<Profile />} />
        <Route path="/discover"         element={<Discover />} />
      </Route>

      {/* ── Catch-all → root handles logic ─────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}