import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';

import AppShell from './components/AppShell';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Module from './pages/Module';
import Profile from './pages/Profile';
import Lessons from './pages/Lessons';
import Leaderboard from './pages/Leaderboard';

// ==========================================
// THE BOUNCERS (Route Guards)
// ==========================================

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { session, user, loading } = useAppContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0f172a] text-white/50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        Authenticating...
      </div>
    );
  }

  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user && !user.has_completed_onboarding) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
};

const RequireOnboarding = ({ children }: { children: React.ReactNode }) => {
  const { session, user, loading } = useAppContext();

  if (loading) return null; 
  if (!session) return <Navigate to="/login" replace />;
  if (user?.has_completed_onboarding) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

// ==========================================
// MAIN APP ROUTER
// ==========================================
export default function App() {
  const { session } = useAppContext();

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/onboarding" element={<RequireOnboarding><Onboarding /></RequireOnboarding>} />

      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/module/:moduleId" element={<Module />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/modules" element={<Lessons />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}