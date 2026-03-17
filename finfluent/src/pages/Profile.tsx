import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Edit2, Check, ShoppingCart, Award, Camera, Zap, Shield, Crown, Flame } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

import fincoin from '../assets/fincoin.gif';

const TITLES = [
  { id: '1', name: 'Budget Brawler', cost: 100, icon: Flame, color: 'text-orange-500' },
  { id: '2', name: 'Dividend Duke', cost: 300, icon: Shield, color: 'text-blue-500' },
  { id: '3', name: 'Portfolio Pilot', cost: 600, icon: Zap, color: 'text-purple-500' },
  { id: '4', name: 'Market Maestro', cost: 1200, icon: Crown, color: 'text-yellow-500' },
];

export default function Profile() {
  const { user, refreshUserData } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.full_name || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // FIX: Ensure this matches the column name in your DB
      const { error: patchError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (patchError) throw patchError;
      
      await refreshUserData();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Ensure the "avatar_url" column exists in your profiles table.');
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

  const handleBuyTitle = async (titleName: string, cost: number) => {
    if (!user || user.spendable_fin_coins < cost) return;
    await supabase.from('profiles').update({ 
      spendable_fin_coins: user.spendable_fin_coins - cost,
      current_title: titleName 
    }).eq('id', user.id);
    await refreshUserData();
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 text-white pb-10">
      
      {/* 👤 ID CARD SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#1e293b]/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          
          {/* Avatar Area */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 bg-slate-800 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center relative">
              {isUploading ? (
                <div className="animate-pulse text-xs font-bold text-blue-400 uppercase tracking-tighter">Uploading...</div>
              ) : user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-white/20" />
              )}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera size={24} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest mb-3">
              <Award size={12} /> {user?.current_title}
            </div>

            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="bg-slate-900/50 border border-white/20 rounded-xl px-4 py-2 text-xl font-bold focus:outline-none"
                />
                <button onClick={handleUpdateName} className="p-2.5 bg-blue-600 rounded-xl hover:bg-blue-500"><Check size={20}/></button>
              </div>
            ) : (
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h1 className="text-3xl font-black tracking-tight">{user?.full_name}</h1>
                <button onClick={() => setIsEditingName(true)} className="text-white/20 hover:text-white transition-colors"><Edit2 size={18}/></button>
              </div>
            )}
            <p className="text-white/30 text-xs font-bold mt-2 uppercase tracking-widest">ID: {user?.id.slice(0,8)}</p>
          </div>
        </div>

        {/* BALANCE CARD */}
        <div className="bg-[#1e293b]/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 flex flex-col justify-center items-center text-center shadow-sm">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Vault Balance</span>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl font-black">{user?.spendable_fin_coins || 0}</span>
            <img src={fincoin} alt="C" className="w-10 h-10 object-contain" />
          </div>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Lifetime Earned: {user?.lifetime_fin_coins}</p>
        </div>
      </div>

      {/* 🛒 SHOP SECTION */}
      <div className="bg-[#1e293b]/20 backdrop-blur-sm rounded-3xl border border-white/5 p-8">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="text-white/40" size={20} />
          <h2 className="text-xl font-black tracking-tight uppercase">Reward Shop</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TITLES.map((title) => {
            const isOwned = user?.current_title === title.name;
            const canAfford = (user?.spendable_fin_coins || 0) >= title.cost;
            const Icon = title.icon;

            return (
              <div key={title.id} className={`p-6 rounded-2xl border transition-all flex flex-col items-center text-center ${isOwned ? 'bg-blue-600/5 border-blue-500/20' : 'bg-white/5 border-white/5'}`}>
                <div className={`p-4 rounded-xl mb-4 bg-white/5 ${title.color}`}>
                  <Icon size={28} />
                </div>
                <h3 className="font-bold text-base mb-1">{title.name}</h3>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-6">Profile Title</p>

                {isOwned ? (
                  <div className="w-full py-2 bg-blue-600/20 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest">Equipped</div>
                ) : (
                  <button 
                    onClick={() => handleBuyTitle(title.name, title.cost)}
                    disabled={!canAfford}
                    className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${canAfford ? 'bg-white text-slate-950 hover:bg-blue-400 hover:text-white' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                  >
                    {title.cost} <img src={fincoin} className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}