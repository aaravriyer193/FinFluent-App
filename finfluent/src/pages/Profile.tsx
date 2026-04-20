import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit2, Check, ShoppingCart, Award, Camera, Zap, Shield, Crown, Flame, Gem, TrendingUp, Anchor, Rocket, Star, Sparkles, Palette, Tag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

import fincoin from '../assets/fincoin.gif';

// --- MASSIVE SHOP INVENTORY ---
const SHOP_ITEMS = {
  titles: [
    { id: 't1', type: 'title', name: 'Budget Brawler', cost: 100, icon: Flame, color: 'text-orange-500' },
    { id: 't2', type: 'title', name: 'Dividend Duke', cost: 300, icon: Shield, color: 'text-blue-500' },
    { id: 't3', type: 'title', name: 'Portfolio Pilot', cost: 600, icon: Rocket, color: 'text-purple-500' },
    { id: 't4', type: 'title', name: 'Market Maestro', cost: 1200, icon: Crown, color: 'text-yellow-500' },
    { id: 't5', type: 'title', name: 'Wall St. Wolf', cost: 2500, icon: TrendingUp, color: 'text-emerald-500' },
  ],
  badges: [
    { id: 'b1', type: 'badge', name: 'Early Adopter', cost: 500, icon: Star, color: 'text-yellow-400' },
    { id: 'b2', type: 'badge', name: 'Diamond Hands', cost: 1500, icon: Gem, color: 'text-cyan-300' },
    { id: 'b3', type: 'badge', name: 'Whale Status', cost: 5000, icon: Anchor, color: 'text-blue-400' },
  ],
  themes: [
    { id: 'th1', type: 'theme', name: 'Neon Cyber', cost: 2000, icon: Sparkles, color: 'text-fuchsia-500', borderClass: 'border-fuchsia-500/50 shadow-[0_0_30px_rgba(217,70,239,0.3)]', bgClass: 'bg-fuchsia-500/10' },
    { id: 'th2', type: 'theme', name: 'Gold Rush', cost: 5000, icon: Crown, color: 'text-yellow-500', borderClass: 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]', bgClass: 'bg-yellow-500/10' },
    { id: 'th3', type: 'theme', name: 'Deep Space', cost: 10000, icon: Rocket, color: 'text-indigo-500', borderClass: 'border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.3)]', bgClass: 'bg-indigo-500/10' },
  ]
};

export default function Profile() {
  const { user, refreshUserData } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.full_name || '');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'titles' | 'badges' | 'themes'>('titles');
  const [isProcessing, setIsProcessing] = useState(false);

  const unlockedItems = user?.unlocked_cosmetics || [];
  const currentBadge = SHOP_ITEMS.badges.find(b => b.name === user?.equipped_badge);
  const currentTheme = SHOP_ITEMS.themes.find(t => t.name === user?.profile_theme);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;
      setIsUploading(true);
      const filePath = `${user.id}/${Math.random()}.${file.name.split('.').pop()}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: patchError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (patchError) throw patchError;
      
      await refreshUserData();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;
    await supabase.from('profiles').update({ full_name: newName }).eq('id', user.id);
    setIsEditingName(false);
    await refreshUserData();
  };

  const handlePurchaseOrEquip = async (item: any) => {
    if (!user || isProcessing) return;
    setIsProcessing(true);

    try {
      const isOwned = unlockedItems.includes(item.id);
      let newBalance = user.spendable_fin_coins;
      let newUnlocked = [...unlockedItems];

      if (!isOwned) {
        if (newBalance < item.cost) return; 
        newBalance -= item.cost;
        newUnlocked.push(item.id);
      }

      const updates: any = {
        spendable_fin_coins: newBalance,
        unlocked_cosmetics: newUnlocked
      };

      if (item.type === 'title') updates.current_title = item.name;
      if (item.type === 'badge') updates.equipped_badge = item.name;
      if (item.type === 'theme') updates.profile_theme = item.name;

      await supabase.from('profiles').update(updates).eq('id', user.id);
      await refreshUserData();
    } catch (error) {
      console.error("Transaction Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeThemeBorder = currentTheme ? currentTheme.borderClass : 'border-white/10';
  const activeThemeBg = currentTheme ? currentTheme.bgClass : 'bg-[#1e293b]/40';

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 md:gap-8 text-white pb-10 px-2 sm:px-4 md:px-0">
      
      {/* 👤 ID CARD SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          layout
          className={`lg:col-span-2 backdrop-blur-3xl p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-2 transition-all duration-500 flex flex-col sm:flex-row items-center gap-6 md:gap-8 ${activeThemeBorder} ${activeThemeBg}`}
        >
          {/* Avatar Area - Mobile Optimized */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 md:w-36 md:h-36 bg-slate-800 rounded-[24px] md:rounded-[32px] border-4 border-black/20 overflow-hidden flex items-center justify-center relative shadow-2xl">
              {isUploading ? (
                <div className="animate-pulse text-[10px] md:text-xs font-black text-blue-400 uppercase tracking-tighter">Uploading...</div>
              ) : user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-white/20 md:w-14 md:h-14" />
              )}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera size={28} className="text-white md:w-8 md:h-8" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>

            {/* EQUIPPED BADGE */}
            {currentBadge && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -bottom-2 -right-2 bg-[#070b14] border-2 border-white/20 p-2 md:p-2.5 rounded-2xl shadow-xl z-10"
              >
                <currentBadge.icon size={16} className={`${currentBadge.color} md:w-5 md:h-5`} />
              </motion.div>
            )}
          </div>

          {/* Name & Info Area - Mobile Optimized */}
          <div className="flex-1 text-center sm:text-left w-full">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-4 md:py-1.5 bg-black/40 border border-white/10 rounded-full text-blue-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-3 md:mb-4 shadow-inner">
              <Award size={12} className="md:w-3.5 md:h-3.5" /> {user?.current_title || 'Beginner'}
            </div>

            {isEditingName ? (
              <div className="flex items-center justify-center sm:justify-start gap-2 w-full">
                <input 
                  type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="bg-black/50 border border-white/20 rounded-xl md:rounded-2xl px-4 py-2.5 md:px-5 md:py-3 text-xl md:text-2xl font-black focus:outline-none focus:border-blue-500 w-full max-w-[200px] md:max-w-[250px]"
                />
                <button onClick={handleUpdateName} className="p-3 md:p-3.5 bg-blue-600 rounded-xl md:rounded-2xl hover:bg-blue-500 shadow-lg"><Check size={18} className="md:w-5 md:h-5"/></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-3 justify-center sm:justify-start">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight drop-shadow-md break-words">{user?.full_name}</h1>
                <button onClick={() => setIsEditingName(true)} className="text-white/20 hover:text-white transition-colors bg-black/20 p-2 rounded-xl shrink-0"><Edit2 size={16} className="md:w-[18px] md:h-[18px]"/></button>
              </div>
            )}
            <p className="text-white/40 text-[9px] md:text-[10px] font-black mt-2 md:mt-3 uppercase tracking-[0.3em]">ID: {user?.id.slice(0,8)}</p>
          </div>
        </motion.div>

        {/* BALANCE CARD */}
        <div className="bg-[#1e293b]/40 backdrop-blur-3xl p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/10 flex flex-col justify-center items-center text-center shadow-xl">
          <span className="text-[9px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 md:mb-4">Vault Balance</span>
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4 bg-black/20 px-5 py-3 md:px-6 md:py-4 rounded-3xl border border-white/5">
            <span className="text-4xl md:text-5xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]">{user?.spendable_fin_coins || 0}</span>
            <img src={fincoin} alt="C" className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-xl" />
          </div>
          <p className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest">Lifetime: {user?.lifetime_fin_coins}</p>
        </div>
      </div>

      {/* 🛒 SHOP SECTION */}
      <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-[32px] md:rounded-[40px] border border-white/5 p-5 sm:p-6 md:p-10 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 md:gap-6 mb-8 md:mb-10">
          <div className="flex items-center justify-center lg:justify-start gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/30">
              <ShoppingCart size={20} className="md:w-6 md:h-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">Cosmetics Shop</h2>
          </div>
          
          {/* TABS - Fixed for Mobile Squishing */}
          <div className="flex w-full lg:w-auto bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-hidden">
            <button onClick={() => setActiveTab('titles')} className={`flex-1 px-2 sm:px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest transition-colors flex items-center justify-center gap-1 sm:gap-2 ${activeTab === 'titles' ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white'}`}>
              <Tag size={14} className="sm:w-4 sm:h-4"/> <span className="hidden sm:inline">Titles</span><span className="sm:hidden">Title</span>
            </button>
            <button onClick={() => setActiveTab('badges')} className={`flex-1 px-2 sm:px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest transition-colors flex items-center justify-center gap-1 sm:gap-2 ${activeTab === 'badges' ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white'}`}>
              <Shield size={14} className="sm:w-4 sm:h-4"/> <span className="hidden sm:inline">Badges</span><span className="sm:hidden">Badge</span>
            </button>
            <button onClick={() => setActiveTab('themes')} className={`flex-1 px-2 sm:px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest transition-colors flex items-center justify-center gap-1 sm:gap-2 ${activeTab === 'themes' ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white'}`}>
              <Palette size={14} className="sm:w-4 sm:h-4"/> <span className="hidden sm:inline">Themes</span><span className="sm:hidden">Theme</span>
            </button>
          </div>
        </div>

        {/* SHOP GRID */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
          >
            {SHOP_ITEMS[activeTab].map((item) => {
              const isOwned = unlockedItems.includes(item.id);
              const isEquipped = user?.current_title === item.name || user?.equipped_badge === item.name || user?.profile_theme === item.name;
              const canAfford = (user?.spendable_fin_coins || 0) >= item.cost;
              const Icon = item.icon;

              return (
                <motion.div whileHover={{ scale: 1.02 }} key={item.id} className={`p-5 md:p-6 rounded-[24px] md:rounded-[32px] border-2 transition-all flex flex-col items-center text-center shadow-lg relative overflow-hidden ${isEquipped ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'bg-black/20 border-white/5'}`}>
                  
                  {isOwned && !isEquipped && <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
                  
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[24px] mb-4 md:mb-5 bg-black/40 flex items-center justify-center border border-white/5 shadow-inner ${item.color}`}>
                    <Icon size={32} className="md:w-9 md:h-9 drop-shadow-lg" />
                  </div>
                  
                  <h3 className="font-black text-base md:text-lg mb-1">{item.name}</h3>
                  <p className="text-[9px] md:text-[10px] font-bold text-white/30 uppercase tracking-widest mb-5 md:mb-6">Rare {item.type}</p>

                  {isEquipped ? (
                    <div className="w-full py-3.5 md:py-4 bg-blue-600/20 text-blue-400 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest border border-blue-500/30">Equipped</div>
                  ) : isOwned ? (
                    <button 
                      onClick={() => handlePurchaseOrEquip(item)}
                      disabled={isProcessing}
                      className="w-full py-3.5 md:py-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all"
                    >
                      Equip Now
                    </button>
                  ) : (
                    <button 
                      onClick={() => handlePurchaseOrEquip(item)}
                      disabled={!canAfford || isProcessing}
                      className={`w-full py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${canAfford ? 'bg-white text-slate-950 hover:bg-yellow-400 hover:text-black shadow-[0_10px_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}`}
                    >
                      {item.cost} <img src={fincoin} className="w-4 h-4 md:w-5 md:h-5 drop-shadow-md" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}