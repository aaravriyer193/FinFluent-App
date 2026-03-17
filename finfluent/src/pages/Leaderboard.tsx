import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

import fincoin from '../assets/fincoin.gif';
import random5 from '../assets/random5.png';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<Profile[]>([]);

  useEffect(() => {
    supabase.from('profiles').select('*').order('lifetime_fin_coins', { ascending: false }).limit(50)
      .then(({ data }) => { if (data) setLeaders(data); });
  }, []);

  return (
    <div className="max-w-4xl mx-auto h-full animate-fade-in text-white py-6">
      
      {/* 🚀 CRISP FOREGROUND HERO CARD */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12 z-10 bg-gradient-to-br from-yellow-500/10 to-amber-600/10 p-8 rounded-3xl border border-yellow-500/20 shadow-2xl backdrop-blur-xl">
        <img 
          src={random5} 
          alt="Wealth Decor" 
          className="w-40 h-40 object-contain drop-shadow-2xl" 
        />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-black mb-2 flex items-center justify-center md:justify-start gap-3">
            <Trophy className="text-yellow-400" size={36} /> Hall of Wealth
          </h1>
          <p className="text-white/70 font-medium">
            The highest lifetime FinCoin earners on the platform. Keep completing simulations to climb the ranks!
          </p>
        </div>
      </div>

      {/* The Leaderboard List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
        {leaders.map((leader, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={leader.id} 
            className={`flex items-center gap-4 p-4 rounded-2xl mb-3 border transition-colors ${
              idx === 0 ? 'bg-yellow-500/10 border-yellow-500/30 shadow-inner' :
              idx === 1 ? 'bg-gray-400/10 border-gray-400/30' :
              idx === 2 ? 'bg-amber-700/10 border-amber-700/30' :
              'bg-black/20 border-white/5 hover:bg-white/5'
            }`}
          >
            <div className="w-10 flex justify-center font-black text-xl text-white/50">
              {idx === 0 ? <Trophy className="text-yellow-400" /> : 
               idx === 1 ? <Medal className="text-gray-300" /> : 
               idx === 2 ? <Award className="text-amber-600" /> : 
               `#${idx + 1}`}
            </div>
            
            <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden border-2 border-white/10 flex-shrink-0">
              {leader.avatar_path ? (
                <img src={leader.avatar_path} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 font-bold">?</div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg">{leader.full_name || 'Anonymous Investor'}</h3>
              <p className="text-xs text-white/50">{leader.current_title}</p>
            </div>

            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/10">
              <span className="font-black text-lg">{leader.lifetime_fin_coins}</span>
              <img src={fincoin} alt="Coins" className="w-6 h-6 object-contain" />
            </div>
          </motion.div>
        ))}
      </div>
      
    </div>
  );
}