import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';

import AppShell from './components/AppShell';
import Landing from './pages/Landing'; // NEW: Import the Landing page
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Module from './pages/Module';
import Profile from './pages/Profile';
import Lessons from './pages/Lessons';
import Leaderboard from './pages/Leaderboard';
import Streak from './pages/Streak'; 

import mascot from './assets/mascot.gif';

// ==========================================
// THE BOUNCERS (Route Guards)
// ==========================================

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { session, user, loading } = useAppContext();
  const location = useLocation();

  // 1. If we are still checking Supabase Auth, show the loader
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#070b14] text-white">
        <img src={mascot} alt="Loading" className="w-20 h-20 mb-4 animate-pulse" />
        <span className="font-black tracking-[0.3em] uppercase text-blue-400 text-sm">Authenticating...</span>
      </div>
    );
  }

  // 2. If no session exists at all, go to login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. THE FIX: If session exists but user profile isn't loaded yet, WAIT.
  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#070b14] text-white">
        <img src={mascot} alt="Syncing" className="w-16 h-16 animate-bounce" />
        <span className="font-black tracking-widest uppercase text-blue-400 text-[10px] mt-4">Syncing Profile...</span>
      </div>
    );
  }

  // 4. Now that we definitely have a user, check onboarding
  if (!user.has_completed_onboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const RequireOnboarding = ({ children }: { children: React.ReactNode }) => {
  const { session, user, loading } = useAppContext();

  if (loading) return null; 
  if (!session) return <Navigate to="/login" replace />;
  
  if (!user) return null; 
  if (user.has_completed_onboarding) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

// ==========================================
// MAIN APP ROUTER
// ==========================================
export default function App() {
  const { session, loading, user } = useAppContext();

  if (loading && !session) {
    return null; 
  }

  return (
    <Routes>
      {/* 🚀 THE FRONT DOOR */}
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

      <Route 
        path="/login" 
        element={
          (session && user?.has_completed_onboarding) 
            ? <Navigate to="/dashboard" replace /> 
            : <Login />
        } 
      />
      
      <Route path="/onboarding" element={<RequireOnboarding><Onboarding /></RequireOnboarding>} />

      {/* 🛡️ THE VAULT (Protected Routes) */}
      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/module/:moduleId" element={<Module />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/modules" element={<Lessons />} />
        <Route path="/streak" element={<Streak />} /> 
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Route>

      {/* Catch-all throws them back to the root, which handles logic automatically */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}