import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

import mascot from '../assets/mascot.gif';
import logo from '../assets/logo.png';
import googleIcon from '../assets/google.svg';
import random1 from '../assets/random1.png';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { session, user } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (session && user) {
      navigate(user.has_completed_onboarding ? '/dashboard' : '/onboarding');
    }
  }, [session, user, navigate]);

  const handleOAuthLogin = async (provider: 'google') => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login Error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 font-sans"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col md:flex-row border shadow-sm"
        style={{ borderColor: 'var(--border-default)', background: 'var(--bg-base)' }}
      >
        {/* Left: Branding */}
        <div
          className="md:w-5/12 flex flex-col justify-between p-8 relative overflow-hidden"
          style={{ background: 'var(--bg-subtle)', borderRight: '1px solid var(--border-soft)' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Finfluent" className="w-8 h-8 object-contain" />
            <span
              className="text-sm font-bold"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              Finfluent
            </span>
          </div>

          {/* Art */}
          <motion.img
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            src={random1}
            alt=""
            className="w-48 h-48 object-contain self-center my-6 opacity-80"
          />

          {/* Tagline */}
          <div>
            <p
              className="text-lg font-semibold mb-1"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              Master your money.
            </p>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              The gamified platform built for real financial literacy.
            </p>
          </div>
        </div>

        {/* Right: Login */}
        <div className="md:w-7/12 flex flex-col justify-center p-8 md:p-10">
          <h2
            className="text-xl font-semibold mb-1"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Welcome back
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
            Sign in to continue your wealth journey.
          </p>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150"
            style={{
              background: 'var(--bg-base)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={e =>
              (e.currentTarget.style.borderColor = 'var(--border-strong)')
            }
            onMouseLeave={e =>
              (e.currentTarget.style.borderColor = 'var(--border-default)')
            }
          >
            <img src={googleIcon} alt="Google" className="w-4 h-4 object-contain" />
            Continue with Google
          </motion.button>

          {/* Loading state */}
          {(isLoading || (session && !user)) && (
            <div
              className="mt-6 flex items-center justify-center gap-2 text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <img src={mascot} alt="" className="w-5 h-5 object-contain opacity-60" />
              Securing connection…
            </div>
          )}

          <p
            className="mt-8 text-center text-xs"
            style={{ color: 'var(--text-disabled)' }}
          >
            Free for all students · No credit card required
          </p>
        </div>
      </motion.div>
    </div>
  );
}