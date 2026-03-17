import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit2, Check, ShoppingCart, Award } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

// Explicit Asset Imports
import random5 from '../assets/random5.png';
import fincoin from '../assets/fincoin.gif';

const AVAILABLE_TITLES = [
  { id: '1', name: 'Budget Brawler', cost: 100 },
  { id: '2', name: 'Dividend Duke', cost: 300 },
  { id: '3', name: 'Market Maestro', cost: 1000 },
];

export default function Profile() {
  const { user, refreshUserData } = useAppContext();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.full_name || '');
  const [isProcessingTitle, setIsProcessingTitle] = useState(false);

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;
    try {
      await supabase.from('profiles').update({ full_name: newName }).eq('id', user.id);
      setIsEditingName(false);
      await refreshUserData();
    } catch (e) { console.error(e); }
  };

  const handleBuyTitle = async (titleName: string, cost: number) => {
    if (!user || user.spendable_fin_coins < cost) return;
    setIsProcessingTitle(true);
    
    try {
      await supabase.from('profiles').update({
        spendable_fin_coins: user.spendable_fin_coins - cost,
        current_title: titleName
      }).eq('id', user.id);
      await refreshUserData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingTitle(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-full animate-fade-in flex flex-col gap-6 text-white">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 md:col-span-2 relative overflow-hidden flex items-center gap-6 shadow-xl">
          <img src={random5} alt="Decor" className="absolute right-0 top-0 w-48 opacity-10 pointer-events-none object-contain" />
          
          <div className="w-24 h-24 bg-black/20 rounded-full flex items-center justify-center border-4 border-white/10 overflow-hidden relative group cursor-pointer shadow-inner">
             {user?.avatar_path ? (
               <img src={user.avatar_path} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
               <User size={40} className="text-white/40" />
             )}
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Edit2 size={20} className="text-white" />
             </div>
          </div>
          
          <div className="flex-1 z-10">
            <div className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Award size={16} /> {user?.current_title}
            </div>
            
            {isEditingName ? (
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-xl font-bold focus:outline-none focus:border-white/50"
                />
                <button onClick={handleUpdateName} className="p-3 bg-green-600 rounded-lg hover:bg-green-500 transition-colors">
                  <Check size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{user?.full_name || 'Set your name'}</h1>
                <button onClick={() => setIsEditingName(true)} className="text-white/40 hover:text-white transition-colors">
                  <Edit2 size={18} />
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex flex-col justify-center items-center text-center relative shadow-xl">
          <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Available Balance</h3>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl font-black">{user?.spendable_fin_coins || 0}</span>
            <img src={fincoin} alt="FinCoins" className="w-10 h-10 object-contain" />
          </div>
          <p className="text-xs text-white/40 font-medium">Lifetime Earned: {user?.lifetime_fin_coins || 0}</p>
        </motion.div>
      </div>

      <motion.div className="bg-white/5 backdrop-blur-xl flex-1 rounded-3xl border border-white/10 p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-8">
          <ShoppingCart className="text-white/60" />
          <h2 className="text-2xl font-bold tracking-tight">Reward Shop</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AVAILABLE_TITLES.map((title) => {
            const isOwned = user?.current_title === title.name;
            const canAfford = (user?.spendable_fin_coins || 0) >= title.cost;
            
            return (
              <div key={title.id} className="bg-black/20 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center transition-all hover:bg-white/5 shadow-inner">
                <Award size={36} className={`mb-4 ${isOwned ? 'text-yellow-400' : 'text-white/30'}`} />
                <h3 className="font-bold text-lg mb-1">{title.name}</h3>
                <p className="text-sm text-white/40 mb-6 font-medium">Profile Title</p>
                
                {isOwned ? (
                  <button disabled className="w-full py-3 bg-white/5 text-white/40 rounded-xl font-bold cursor-default border border-white/5">
                    Equipped
                  </button>
                ) : (
                  <button 
                    onClick={() => handleBuyTitle(title.name, title.cost)}
                    disabled={!canAfford || isProcessingTitle}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      canAfford 
                        ? 'bg-white text-[#0f172a] hover:bg-gray-200 shadow-lg' 
                        : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {title.cost} <img src={fincoin} alt="cost" className="w-5 h-5 object-contain" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
      
    </div>
  );
}