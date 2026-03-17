import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

// VITE FIX: Explicitly import your assets so they never break!
import random1 from '../assets/random1.png';
import mascot from '../assets/mascot.gif';
import googleIcon from '../assets/google.svg';
import linkedinIcon from '../assets/linkedin.svg';
import facebookIcon from '../assets/facebook.svg';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthLogin = async (provider: 'google' | 'linkedin_oidc' | 'facebook') => {
    setIsLoading(true);
    try {
      // This dynamically grabs your active GitHub Codespace URL!
      const currentUrl = window.location.origin; 
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${currentUrl}/dashboard` }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login Error:', error);
      setIsLoading(false);
    }
  };

  return (
    // Forcing the Dark Navy Grey aesthetic from your whiteboard here
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0f172a] text-white">
      
      {/* Background ambient glows - Adjusted for Dark Mode */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col md:flex-row relative z-10 shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
      >
        {/* Left Side: Branding & Vector Art */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center items-center bg-black/20 border-r border-white/10 relative">
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <img src={mascot} alt="Finfluent" className="w-8 h-8 object-contain" />
            <span className="font-bold tracking-wider text-white">FINFLUENT</span>
          </div>
          
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            src={random1} 
            alt="Financial Growth" 
            className="w-64 h-64 object-contain mt-8 mb-6 drop-shadow-2xl"
          />
          <h2 className="text-2xl font-bold text-center mb-2 text-white">Master Your Money</h2>
          <p className="text-center text-white/60 text-sm">
            The mature, gamified platform to build real financial literacy.
          </p>
        </div>

        {/* Right Side: Login Controls */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center bg-[#1e293b]/50">
          <h3 className="text-3xl font-bold mb-8 text-center text-white">Welcome Back</h3>
          
          <div className="flex flex-col gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors shadow-lg"
            >
              <img src={googleIcon} alt="Google" className="w-5 h-5 object-contain" />
              Continue with Google
            </motion.button>
          </div>
          
          {isLoading && (
            <div className="mt-6 flex justify-center text-white/50 text-sm animate-pulse flex-col items-center gap-2">
              <img src={mascot} alt="Loading" className="w-8 h-8" />
              Securing connection...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}