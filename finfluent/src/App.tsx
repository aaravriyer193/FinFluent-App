import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';

import AppShell from './components/AppShell';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Module from './pages/Module';
import Profile from './pages/Profile';

// ==========================================
// THE BOUNCERS (Route Guards)
// ==========================================

// 1. Protects the Main App (Dashboard, Modules, Profile)
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { session, user, loading } = useAppContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-white/50">
        <img src="/src/assets/mascot.gif" alt="Loading..." className="w-16 h-16 mb-4 animate-pulse" />
        Authenticating...
      </div>
    );
  }

  // Not logged in? Kick to login.
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in, but skipped the AI interview? Trap them in Onboarding.
  if (user && !user.has_completed_onboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // They are worthy. Let them in.
  return <>{children}</>;
};

// 2. Protects the Onboarding Page (Only for logged-in newbies)
const RequireOnboarding = ({ children }: { children: React.ReactNode }) => {
  const { session, user, loading } = useAppContext();

  if (loading) return null; // Wait for state to settle

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
      {/* PUBLIC ROUTE: If they are already logged in, push them away from Login */}
      <Route 
        path="/login" 
        element={session ? <Navigate to="/dashboard" replace /> : <Login />} 
      />

      {/* ONBOARDING ROUTE: "Happens Only Once" Rule Enforced */}
      <Route 
        path="/onboarding" 
        element={
          <RequireOnboarding>
            <Onboarding />
          </RequireOnboarding>
        } 
      />

      {/* PROTECTED APP ROUTES: Enforces Auth & Onboarding */}
      <Route 
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/module/:moduleId" element={<Module />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}