import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Edit2, Check, ShoppingCart, Award, Camera,
  Flame, Shield, Crown, Gem, TrendingUp, Anchor, Rocket,
  Star, Sparkles, Palette, Tag,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import fincoin from '../assets/fincoin.gif';

const SHOP_ITEMS = {
  titles: [
    { id: 't1', type: 'title', name: 'Budget Brawler',  cost: 100,   icon: Flame,     accent: '#ea580c' },
    { id: 't2', type: 'title', name: 'Dividend Duke',   cost: 300,   icon: Shield,    accent: '#3b82f6' },
    { id: 't3', type: 'title', name: 'Portfolio Pilot', cost: 600,   icon: Rocket,    accent: '#8b5cf6' },
    { id: 't4', type: 'title', name: 'Market Maestro',  cost: 1200,  icon: Crown,     accent: '#eab308' },
    { id: 't5', type: 'title', name: 'Wall St. Wolf',   cost: 2500,  icon: TrendingUp,accent: '#10b981' },
  ],
  badges: [
    { id: 'b1', type: 'badge', name: 'Early Adopter',   cost: 500,   icon: Star,     accent: '#eab308' },
    { id: 'b2', type: 'badge', name: 'Diamond Hands',   cost: 1500,  icon: Gem,      accent: '#06b6d4' },
    { id: 'b3', type: 'badge', name: 'Whale Status',    cost: 5000,  icon: Anchor,   accent: '#3b82f6' },
  ],
  themes: [
    { id: 'th1', type: 'theme', name: 'Neon Cyber',  cost: 2000,  icon: Sparkles, accent: '#d946ef' },
    { id: 'th2', type: 'theme', name: 'Gold Rush',   cost: 5000,  icon: Crown,    accent: '#eab308' },
    { id: 'th3', type: 'theme', name: 'Deep Space',  cost: 10000, icon: Rocket,   accent: '#6366f1' },
  ],
};

const TABS = [
  { key: 'titles',  label: 'Titles',  icon: Tag },
  { key: 'badges',  label: 'Badges',  icon: Shield },
  { key: 'themes',  label: 'Themes',  icon: Palette },
] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay },
});

export default function Profile() {
  const { user, refreshUserData } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingName, setIsEditingName]   = useState(false);
  const [newName, setNewName]               = useState(user?.full_name || '');
  const [isUploading, setIsUploading]       = useState(false);
  const [activeTab, setActiveTab]           = useState<'titles' | 'badges' | 'themes'>('titles');
  const [isProcessing, setIsProcessing]     = useState(false);

  const unlockedItems = user?.unlocked_cosmetics || [];
  const currentBadge  = SHOP_ITEMS.badges.find(b => b.name === user?.equipped_badge);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    try {
      const path = `${user.id}/${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file);
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      await refreshUserData();
    } catch (err) { console.error(err); }
    finally { setIsUploading(false); }
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
      let balance   = user.spendable_fin_coins;
      let unlocked  = [...unlockedItems];

      if (!isOwned) {
        if (balance < item.cost) return;
        balance -= item.cost;
        unlocked.push(item.id);
      }

      const updates: any = { spendable_fin_coins: balance, unlocked_cosmetics: unlocked };
      if (item.type === 'title') updates.current_title  = item.name;
      if (item.type === 'badge') updates.equipped_badge = item.name;
      if (item.type === 'theme') updates.profile_theme  = item.name;

      await supabase.from('profiles').update(updates).eq('id', user.id);
      await refreshUserData();
    } catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5 pb-16 animate-fade-in" style={{ color: 'var(--text-primary)' }}>

      {/* ── ID CARD ── */}
      <motion.div
        {...fadeUp(0)}
        className="rounded-2xl border p-6 flex flex-col sm:flex-row items-center gap-6"
        style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}
      >
        {/* Avatar */}
        <div className="relative group shrink-0">
          <div
            className="w-20 h-20 rounded-2xl border-2 overflow-hidden flex items-center justify-center"
            style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-default)' }}
          >
            {isUploading ? (
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Uploading…</span>
            ) : user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={32} style={{ color: 'var(--text-disabled)' }} />
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.4)' }}
            >
              <Camera size={20} className="text-white" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>

          {currentBadge && (
            <div
              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--bg-subtle)' }}
            >
              <currentBadge.icon size={12} style={{ color: currentBadge.accent }} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold mb-3 border"
            style={{ background: 'var(--accent-subtle)', borderColor: 'transparent', color: 'var(--accent-text)' }}
          >
            <Award size={11} /> {user?.current_title || 'Beginner'}
          </div>

          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="text-xl font-semibold border rounded-lg px-3 py-1.5 focus:outline-none"
                style={{ background: 'var(--bg-base)', borderColor: 'var(--accent)', color: 'var(--text-primary)', maxWidth: 220 }}
              />
              <button onClick={handleUpdateName} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)', color: '#fff' }}>
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-semibold" style={{ letterSpacing: '-0.03em' }}>{user?.full_name}</h1>
              <button
                onClick={() => setIsEditingName(true)}
                className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all"
                style={{ background: 'var(--bg-base)', borderColor: 'var(--border-soft)', color: 'var(--text-tertiary)' }}
              >
                <Edit2 size={12} />
              </button>
            </div>
          )}
          <p className="text-[10px] font-medium mt-1.5" style={{ color: 'var(--text-disabled)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            ID · {user?.id.slice(0, 8)}
          </p>
        </div>

        {/* Balance */}
        <div
          className="shrink-0 flex flex-col items-center gap-1.5 p-4 rounded-xl border"
          style={{ background: 'var(--bg-base)', borderColor: 'var(--border-soft)' }}
        >
          <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vault</p>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>{user?.spendable_fin_coins || 0}</span>
            <img src={fincoin} alt="" className="w-6 h-6 object-contain" />
          </div>
          <p className="text-[10px]" style={{ color: 'var(--text-disabled)' }}>Lifetime: {user?.lifetime_fin_coins || 0}</p>
        </div>
      </motion.div>

      {/* ── SHOP ── */}
      <motion.div
        {...fadeUp(0.06)}
        className="rounded-2xl border"
        style={{ background: 'var(--bg-base)', borderColor: 'var(--border-soft)' }}
      >
        {/* Shop header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-soft)' }}>
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} style={{ color: 'var(--text-secondary)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Cosmetics Shop</h2>
          </div>

          {/* Tab bar */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-lg"
            style={{ background: 'var(--bg-muted)' }}
          >
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={{
                  background: activeTab === key ? 'var(--bg-base)' : 'transparent',
                  color: activeTab === key ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  boxShadow: activeTab === key ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Shop grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {SHOP_ITEMS[activeTab].map(item => {
              const isOwned   = unlockedItems.includes(item.id);
              const isEquipped = user?.current_title === item.name || user?.equipped_badge === item.name || user?.profile_theme === item.name;
              const canAfford = (user?.spendable_fin_coins || 0) >= item.cost;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border p-4 flex flex-col items-center text-center gap-3 transition-all"
                  style={{
                    background: isEquipped ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                    borderColor: isEquipped ? 'var(--accent)' : 'var(--border-soft)',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border"
                    style={{ background: `${item.accent}15`, borderColor: `${item.accent}30` }}
                  >
                    <Icon size={24} style={{ color: item.accent }} />
                  </div>

                  {/* Name */}
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Rare {item.type}
                    </p>
                  </div>

                  {/* Action */}
                  {isEquipped ? (
                    <div
                      className="w-full text-[10px] font-semibold py-2 rounded-lg"
                      style={{ background: 'var(--accent-subtle)', color: 'var(--accent-text)' }}
                    >
                      Equipped
                    </div>
                  ) : isOwned ? (
                    <button
                      onClick={() => handlePurchaseOrEquip(item)}
                      disabled={isProcessing}
                      className="w-full text-[10px] font-semibold py-2 rounded-lg border transition-all"
                      style={{ background: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchaseOrEquip(item)}
                      disabled={!canAfford || isProcessing}
                      className="w-full flex items-center justify-center gap-1 text-[10px] font-semibold py-2 rounded-lg transition-all disabled:opacity-30"
                      style={{ background: canAfford ? 'var(--text-primary)' : 'var(--bg-overlay)', color: canAfford ? 'var(--bg-base)' : 'var(--text-disabled)' }}
                    >
                      {item.cost}
                      <img src={fincoin} className="w-3 h-3" alt="" />
                    </button>
                  )}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}