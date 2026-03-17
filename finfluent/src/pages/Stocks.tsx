import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, Loader2, 
  Zap, Wallet, Package, TrendingDown, History, Bell, Star, BarChart3, 
  Target, Calendar, ChevronDown, ChevronUp, Trash2, Plus, X
} from 'lucide-react';
import { AreaChart, Area, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, XAxis } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

import fincoinImg from '../assets/fincoin.gif';

const ASSETS = [
  { id: 'f500', name: 'Finfluent 500', symbol: 'F500', color: '#3b82f6', volatility: 4.0, desc: 'Top 500 companies index' },
  { id: 'dbone', name: 'Dog & Bone Index', symbol: 'BONE', color: '#f59e0b', volatility: 12.0, desc: 'Meme stock tracker' },
  { id: 'fbit', name: 'Finfluent BTC', symbol: 'F-BTC', color: '#f97316', volatility: 15.0, desc: 'Crypto proxy asset' },
];

interface Position {
  asset_id: string;
  asset_name: string;
  asset_symbol: string;
  total_units: number;
  avg_buy_price: number;
  current_price: number;
  total_invested: number;
  current_value: number;
  profit_loss: number;
  profit_loss_percent: number;
  color: string;
}

interface Trade {
  id: string;
  asset_id: string;
  asset_name: string;
  amount: number;
  buy_price: number;
  trade_type: 'buy' | 'sell';
  created_at: string;
}

interface PriceAlert {
  id: string;
  asset_id: string;
  target_price: number;
  condition: 'above' | 'below';
  is_triggered: boolean;
  created_at: string;
}

interface PortfolioSnapshot {
  date: string;
  value: number;
}

interface WatchlistItem {
  id: string;
  asset_id: string;
  added_at: string;
}

export default function Stocks() {
  const { user, refreshUserData } = useAppContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Core state
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [marketState, setMarketState] = useState<Record<string, any>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [tradeAmount, setTradeAmount] = useState(0.1);
  const [activeTab, setActiveTab] = useState<'chart' | 'positions' | 'history' | 'alerts'>('chart');
  
  // New features state
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioSnapshot[]>([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    watchlist: true,
    stats: true,
  });

  // Derived state
  const portfolioStats = useMemo(() => {
    const totalInvested = positions.reduce((sum, pos) => sum + pos.total_invested, 0);
    const currentValue = positions.reduce((sum, pos) => sum + pos.current_value, 0);
    const totalProfitLoss = currentValue - totalInvested;
    const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    const bestPerformer = positions.length > 0 
      ? positions.reduce((best, pos) => pos.profit_loss_percent > best.profit_loss_percent ? pos : best, positions[0])
      : null;
    const worstPerformer = positions.length > 0
      ? positions.reduce((worst, pos) => pos.profit_loss_percent < worst.profit_loss_percent ? pos : worst, positions[0])
      : null;
    return { totalInvested, currentValue, totalProfitLoss, totalProfitLossPercent, bestPerformer, worstPerformer };
  }, [positions]);

  const selectedPosition = useMemo(() => {
    return positions.find(p => p.asset_id === selectedAsset.id);
  }, [positions, selectedAsset]);

  const isWatched = watchlist.includes(selectedAsset.id);

  // Initialize all market data
  useEffect(() => {
    const initMarkets = async () => {
      const { data: markets } = await supabase.from('global_market').select('*');
      if (markets) {
        const marketMap: Record<string, any> = {};
        markets.forEach(m => marketMap[m.asset_id] = m);
        setMarketState(marketMap);
      }
    };
    initMarkets();
    fetchWatchlist();
    fetchPriceAlerts();
  }, []);

  // Subscribe to all market updates
  useEffect(() => {
    const channel = supabase.channel('global-market-all')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'global_market'
      }, (payload) => {
        setMarketState(prev => ({
          ...prev,
          [payload.new.asset_id]: payload.new
        }));
        
        // Update history for selected asset
        if (payload.new.asset_id === selectedAsset.id) {
          setHistory(prev => {
            const newPoint = { 
              time: prev.length, 
              price: parseFloat(payload.new.current_price),
              timestamp: Date.now()
            };
            return [...prev, newPoint].slice(-50);
          });
        }

        // Check price alerts
        checkPriceAlerts(payload.new.asset_id, parseFloat(payload.new.current_price));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedAsset]);

  // Load selected asset history
  useEffect(() => {
    const loadHistory = async () => {
      const { data: hist } = await supabase
        .from('market_history')
        .select('price, created_at')
        .eq('asset_id', selectedAsset.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (hist) {
        const formatted = hist
          .map((h, i) => ({ 
            time: i, 
            price: parseFloat(h.price),
            timestamp: new Date(h.created_at).getTime()
          }))
          .reverse();
        setHistory(formatted);
      }
    };
    loadHistory();
  }, [selectedAsset]);

  // Fetch user data
  useEffect(() => {
    if (!user) return;
    fetchPositions();
    fetchRecentTrades();
    fetchPortfolioHistory();
  }, [user]);

  // Price heartbeat for all assets
  useEffect(() => {
    const interval = setInterval(async () => {
      for (const asset of ASSETS) {
        const market = marketState[asset.id];
        if (!market) continue;
        
        const change = (Math.random() - 0.5) * asset.volatility;
        const nextPrice = Math.max(1, parseFloat(market.current_price) + change);

        await supabase
          .from('global_market')
          .update({ current_price: nextPrice, last_updated: new Date() })
          .eq('asset_id', asset.id);
        
        await supabase.from('market_history').insert({ asset_id: asset.id, price: nextPrice });
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [marketState]);

  // Record portfolio snapshot every minute
  useEffect(() => {
    if (!user || positions.length === 0) return;
    
    const interval = setInterval(async () => {
      const totalValue = portfolioStats.currentValue + (user.spendable_fin_coins || 0);
      await supabase.from('portfolio_history').insert({
        user_id: user.id,
        total_value: totalValue,
        positions_value: portfolioStats.currentValue,
        cash_balance: user.spendable_fin_coins || 0
      });
      fetchPortfolioHistory();
    }, 60000);

    return () => clearInterval(interval);
  }, [user, positions, portfolioStats]);

  const fetchPositions = async () => {
    if (!user) return;
    
    const { data: trades } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!trades) return;

    const { data: markets } = await supabase.from('global_market').select('*');
    const marketPrices: Record<string, number> = {};
    markets?.forEach(m => marketPrices[m.asset_id] = parseFloat(m.current_price));

    const positionMap: Record<string, Position> = {};

    trades.forEach((trade: Trade) => {
      const asset = ASSETS.find(a => a.id === trade.asset_id);
      if (!asset) return;

      if (!positionMap[trade.asset_id]) {
        positionMap[trade.asset_id] = {
          asset_id: trade.asset_id,
          asset_name: trade.asset_name,
          asset_symbol: asset.symbol,
          total_units: 0,
          avg_buy_price: 0,
          current_price: marketPrices[trade.asset_id] || 0,
          total_invested: 0,
          current_value: 0,
          profit_loss: 0,
          profit_loss_percent: 0,
          color: asset.color
        };
      }

      const pos = positionMap[trade.asset_id];
      
      if (trade.trade_type === 'buy') {
        const newTotalUnits = pos.total_units + trade.amount;
        const newTotalInvested = pos.total_invested + (trade.amount * trade.buy_price);
        pos.total_units = newTotalUnits;
        pos.total_invested = newTotalInvested;
        pos.avg_buy_price = newTotalUnits > 0 ? newTotalInvested / newTotalUnits : 0;
      } else {
        pos.total_units = Math.max(0, pos.total_units - trade.amount);
        pos.total_invested = Math.max(0, pos.total_invested - (trade.amount * trade.buy_price));
      }
    });

    Object.values(positionMap).forEach(pos => {
      pos.current_price = marketPrices[pos.asset_id] || pos.current_price;
      pos.current_value = pos.total_units * pos.current_price;
      pos.profit_loss = pos.current_value - pos.total_invested;
      pos.profit_loss_percent = pos.total_invested > 0 ? (pos.profit_loss / pos.total_invested) * 100 : 0;
    });

    setPositions(Object.values(positionMap).filter(p => p.total_units > 0.001));
  };

  const fetchRecentTrades = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setRecentTrades(data);
  };

  const fetchWatchlist = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('watchlist')
      .select('asset_id')
      .eq('user_id', user.id);
    if (data) setWatchlist(data.map((w: WatchlistItem) => w.asset_id));
  };

  const fetchPriceAlerts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_triggered', false)
      .order('created_at', { ascending: false });
    if (data) setPriceAlerts(data);
  };

  const fetchPortfolioHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('portfolio_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    
    if (data) {
      const formatted = data.reverse().map((h: any) => ({
        date: new Date(h.created_at).toLocaleDateString(),
        value: parseFloat(h.total_value)
      }));
      setPortfolioHistory(formatted);
    }
  };

  const toggleWatchlist = async () => {
    if (!user) return;
    
    if (isWatched) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('asset_id', selectedAsset.id);
      setWatchlist(prev => prev.filter(id => id !== selectedAsset.id));
    } else {
      await supabase.from('watchlist').insert({ user_id: user.id, asset_id: selectedAsset.id });
      setWatchlist(prev => [...prev, selectedAsset.id]);
    }
  };

  const createPriceAlert = async () => {
    if (!user || !alertPrice) return;
    
    await supabase.from('price_alerts').insert({
      user_id: user.id,
      asset_id: selectedAsset.id,
      target_price: parseFloat(alertPrice),
      condition: alertCondition
    });
    
    setAlertPrice('');
    setShowAlertModal(false);
    fetchPriceAlerts();
    setFeedback({ type: 'success', msg: `Alert set for ${selectedAsset.symbol} ${alertCondition} $${alertPrice}` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const deletePriceAlert = async (alertId: string) => {
    await supabase.from('price_alerts').delete().eq('id', alertId);
    fetchPriceAlerts();
  };

  const checkPriceAlerts = (assetId: string, currentPrice: number) => {
    const alerts = priceAlerts.filter(a => a.asset_id === assetId && !a.is_triggered);
    alerts.forEach(alert => {
      const shouldTrigger = 
        (alert.condition === 'above' && currentPrice >= alert.target_price) ||
        (alert.condition === 'below' && currentPrice <= alert.target_price);
      
      if (shouldTrigger) {
        supabase.from('price_alerts').update({ is_triggered: true }).eq('id', alert.id);
        setFeedback({ 
          type: 'success', 
          msg: `🚨 ${ASSETS.find(a => a.id === assetId)?.symbol} is ${alert.condition} $${alert.target_price}!` 
        });
        setTimeout(() => setFeedback(null), 5000);
        fetchPriceAlerts();
      }
    });
  };

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (!user || !marketState[selectedAsset.id] || isProcessing) return;
    setIsProcessing(true);

    const executionPrice = parseFloat(marketState[selectedAsset.id].current_price);
    const totalCost = executionPrice * tradeAmount;

    if (type === 'buy' && (user.spendable_fin_coins || 0) < totalCost) {
      setFeedback({ type: 'error', msg: 'Insufficient FinCoins!' });
      setIsProcessing(false);
      return;
    }

    if (type === 'sell') {
      const position = positions.find(p => p.asset_id === selectedAsset.id);
      if (!position || position.total_units < tradeAmount) {
        setFeedback({ type: 'error', msg: `You only own ${position?.total_units.toFixed(3) || 0} units!` });
        setIsProcessing(false);
        return;
      }
    }

    try {
      await supabase.from('trades').insert({
        user_id: user.id,
        asset_id: selectedAsset.id,
        asset_name: selectedAsset.name,
        amount: tradeAmount,
        buy_price: executionPrice,
        trade_type: type
      });

      const balanceChange = type === 'buy' ? -totalCost : totalCost;
      await supabase.from('profiles').update({ 
        spendable_fin_coins: (user.spendable_fin_coins || 0) + balanceChange 
      }).eq('id', user.id);

      setFeedback({ 
        type: 'success', 
        msg: `${type === 'buy' ? 'Bought' : 'Sold'} ${tradeAmount} ${selectedAsset.symbol} @ $${executionPrice.toFixed(2)}` 
      });
      
      await refreshUserData();
      await fetchPositions();
      await fetchRecentTrades();
    } catch (e) {
      setFeedback({ type: 'error', msg: 'Trade Failed' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const tradeAmounts = [0.1, 0.5, 1, 5, 10];

  if (Object.keys(marketState).length === 0) return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center text-blue-400 font-black tracking-widest uppercase gap-4">
      <Loader2 className="animate-spin" size={40} />
      Syncing with Exchange...
    </div>
  );

  const currentPrice = parseFloat(marketState[selectedAsset.id]?.current_price || '0');

  return (
    <div ref={scrollRef} className="w-full min-h-screen text-white pb-32">
      
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 rounded-xl text-blue-400 border border-blue-500/30">
              <Wallet size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase italic">Trading Floor</h1>
              <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
                {positions.length} Positions • ${portfolioStats.currentValue.toFixed(0)} Portfolio
              </span>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <div className="bg-black/50 px-4 py-2.5 rounded-xl border border-white/10 whitespace-nowrap">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Total P&L</p>
              <p className={`text-lg font-black ${portfolioStats.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {portfolioStats.totalProfitLoss >= 0 ? '+' : ''}${portfolioStats.totalProfitLoss.toFixed(0)}
              </p>
            </div>

            <div className="bg-black/50 px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-3 whitespace-nowrap">
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Available</p>
                <p className="text-lg font-black text-yellow-400">
                  {Math.floor(user?.spendable_fin_coins || 0).toLocaleString()}
                </p>
              </div>
              <img src={fincoinImg} className="w-7 h-7 object-contain" alt="FC" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* WATCHLIST */}
        <div className="bg-[#1e293b]/50 rounded-2xl border border-white/10 overflow-hidden">
          <button 
            onClick={() => toggleSection('watchlist')}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Star size={18} className="text-amber-400" />
              <span className="font-black text-sm uppercase tracking-widest">Watchlist</span>
            </div>
            {expandedSections.watchlist ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          <AnimatePresence>
            {expandedSections.watchlist && (
              <motion.div 
                initial={{ height: 0 }} 
                animate={{ height: 'auto' }} 
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {ASSETS.map((asset) => {
                      const market = marketState[asset.id];
                      const price = market ? parseFloat(market.current_price) : 0;
                      const isInWatchlist = watchlist.includes(asset.id);
                      
                      return (
                        <button
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className={`flex-shrink-0 w-40 p-4 rounded-xl border transition-all text-left
                            ${selectedAsset.id === asset.id 
                              ? 'bg-blue-600/20 border-blue-500/50' 
                              : 'bg-white/5 border-white/10 hover:bg-white/10'}
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-sm">{asset.symbol}</span>
                            {isInWatchlist && <Star size={12} className="text-amber-400 fill-amber-400" />}
                          </div>
                          <p className="text-lg font-black">${price.toFixed(2)}</p>
                          <p className="text-[10px] text-white/40 truncate">{asset.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CHART CARD */}
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 overflow-hidden">
              {/* Chart Header */}
              <div className="p-4 md:p-6 border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl md:text-3xl font-black italic uppercase text-white">
                        {selectedAsset.name}
                      </h2>
                      <button
                        onClick={toggleWatchlist}
                        className={`p-2 rounded-lg transition-all ${isWatched ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/40 hover:text-white'}`}
                      >
                        <Star size={18} className={isWatched ? 'fill-amber-400' : ''} />
                      </button>
                      <button
                        onClick={() => setShowAlertModal(true)}
                        className="p-2 rounded-lg bg-white/10 text-white/40 hover:text-white hover:bg-white/20 transition-all"
                      >
                        <Bell size={18} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live Market</span>
                      <span className="text-[10px] text-white/30">• Vol: {selectedAsset.volatility}%</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-3xl md:text-4xl font-black tracking-tight text-white">
                      ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {selectedPosition && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[11px] text-white/50">
                          You own <span className="text-white font-bold">{selectedPosition.total_units.toFixed(3)}</span> units
                        </p>
                        <p className={`text-[11px] font-bold ${selectedPosition.profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          Unrealized: {selectedPosition.profit_loss >= 0 ? '+' : ''}${selectedPosition.profit_loss.toFixed(2)} ({selectedPosition.profit_loss_percent.toFixed(1)}%)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10">
                {[
                  { id: 'chart', label: 'Chart', icon: BarChart3 },
                  { id: 'positions', label: 'Positions', icon: Package },
                  { id: 'history', label: 'History', icon: History },
                  { id: 'alerts', label: 'Alerts', icon: Bell },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all
                      ${activeTab === id 
                        ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' 
                        : 'text-white/40 hover:text-white/60 hover:bg-white/5'}
                    `}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab === 'chart' && (
                  <div className="h-[300px] md:h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`chartColor-${selectedAsset.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={selectedAsset.color} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={selectedAsset.color} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          orientation="right"
                          tick={{ fill: '#ffffff50', fontSize: 10, fontWeight: 700 }}
                          tickFormatter={(val) => `$${val.toFixed(0)}`}
                          axisLine={false}
                          tickLine={false}
                          width={50}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-[#1e293b] border border-white/20 rounded-xl px-4 py-2 shadow-2xl">
                                  <p className="text-white font-black text-lg">
                                    ${payload[0].value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke={selectedAsset.color} 
                          strokeWidth={2.5}
                          fill={`url(#chartColor-${selectedAsset.id})`}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {activeTab === 'positions' && (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {positions.length === 0 ? (
                      <div className="py-12 text-center">
                        <Package size={48} className="mx-auto mb-4 text-white/20" />
                        <p className="text-white/40 font-bold">No positions yet</p>
                        <p className="text-[11px] text-white/30 mt-1">Start trading to build your portfolio</p>
                      </div>
                    ) : (
                      <>
                        {positions.map((pos) => (
                          <div
                            key={pos.asset_id}
                            onClick={() => {
                              const asset = ASSETS.find(a => a.id === pos.asset_id);
                              if (asset) setSelectedAsset(asset);
                            }}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 cursor-pointer transition-all"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm"
                                  style={{ backgroundColor: `${pos.color}25`, color: pos.color }}
                                >
                                  {pos.asset_symbol}
                                </div>
                                <div>
                                  <p className="font-bold text-white">{pos.asset_name}</p>
                                  <p className="text-[10px] text-white/50">{pos.total_units.toFixed(3)} units @ ${pos.avg_buy_price.toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-white">${pos.current_value.toFixed(2)}</p>
                                <p className={`text-[11px] font-bold ${pos.profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {pos.profit_loss >= 0 ? '+' : ''}{pos.profit_loss_percent.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="bg-gradient-to-r from-blue-600/20 to-emerald-600/20 border border-white/10 rounded-xl p-4 mt-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-white/50 uppercase tracking-widest">Total Invested</p>
                              <p className="font-black text-white">${portfolioStats.totalInvested.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-white/50 uppercase tracking-widest">Total P&L</p>
                              <p className={`font-black text-xl ${portfolioStats.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {portfolioStats.totalProfitLoss >= 0 ? '+' : ''}${portfolioStats.totalProfitLoss.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {recentTrades.length === 0 ? (
                      <p className="text-center py-8 text-white/40">No trades yet</p>
                    ) : (
                      recentTrades.map((trade) => (
                        <div key={trade.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${trade.trade_type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                              {trade.trade_type}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-white">{trade.amount} {ASSETS.find(a => a.id === trade.asset_id)?.symbol}</p>
                              <p className="text-[9px] text-white/40">{new Date(trade.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">@${trade.buy_price.toFixed(2)}</p>
                            <p className="text-[10px] text-white/40">${(trade.amount * trade.buy_price).toFixed(2)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'alerts' && (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    <button
                      onClick={() => setShowAlertModal(true)}
                      className="w-full p-3 bg-blue-600/20 border border-blue-500/30 border-dashed rounded-xl text-blue-400 font-bold text-sm hover:bg-blue-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Create New Alert
                    </button>
                    
                    {priceAlerts.length === 0 ? (
                      <p className="text-center py-8 text-white/40">No active alerts</p>
                    ) : (
                      priceAlerts.map((alert) => (
                        <div key={alert.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Bell size={16} className="text-amber-400" />
                            <div>
                              <p className="text-sm font-bold text-white">
                                {ASSETS.find(a => a.id === alert.asset_id)?.symbol} {alert.condition} ${alert.target_price}
                              </p>
                              <p className="text-[9px] text-white/40">
                                Current: ${marketState[alert.asset_id] ? parseFloat(marketState[alert.asset_id].current_price).toFixed(2) : '--'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => deletePriceAlert(alert.id)}
                            className="p-2 text-white/30 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* PORTFOLIO PERFORMANCE CHART */}
            {portfolioHistory.length > 1 && (
              <div className="bg-[#1e293b] rounded-2xl border border-white/10 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-emerald-400" />
                  <span className="font-black text-sm uppercase tracking-widest">Portfolio Performance</span>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                      <XAxis dataKey="date" tick={{ fill: '#ffffff40', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#ffffff40', fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload?.length) {
                            return (
                              <div className="bg-[#1e293b] border border-white/20 rounded-lg px-3 py-2">
                                <p className="text-white font-bold">${payload[0].value?.toLocaleString()}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - TRADING */}
          <div className="space-y-4">
            
            {/* Trade Size */}
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 p-4">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Trade Size</p>
              <div className="grid grid-cols-5 gap-2">
                {tradeAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTradeAmount(amt)}
                    className={`py-2.5 rounded-lg text-[11px] font-black transition-all
                      ${tradeAmount === amt 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    {amt}
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="text-[11px] text-white/40 font-bold">Total Cost</span>
                <span className="font-black text-white">${(currentPrice * tradeAmount).toFixed(2)} FC</span>
              </div>
            </div>

            {/* Buy/Sell */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleTrade('buy')} 
                disabled={isProcessing || (user?.spendable_fin_coins || 0) < currentPrice * tradeAmount}
                className="flex flex-col items-center justify-center gap-1 p-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900/30 disabled:text-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
              >
                <ArrowUpRight size={24} strokeWidth={3} />
                <span className="font-black uppercase tracking-wider text-[11px]">Buy</span>
                <span className="text-[9px] text-white/70">{tradeAmount} {selectedAsset.symbol}</span>
              </button>
              <button 
                onClick={() => handleTrade('sell')} 
                disabled={isProcessing || !selectedPosition || selectedPosition.total_units < tradeAmount}
                className="flex flex-col items-center justify-center gap-1 p-4 bg-red-600 hover:bg-red-500 disabled:bg-red-900/30 disabled:text-red-700 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
              >
                <ArrowDownRight size={24} strokeWidth={3} />
                <span className="font-black uppercase tracking-wider text-[11px]">Sell</span>
                <span className="text-[9px] text-white/70">{tradeAmount} {selectedAsset.symbol}</span>
              </button>
            </div>

            {/* Position Card */}
            {selectedPosition ? (
              <div className="bg-gradient-to-br from-blue-600/15 to-purple-600/10 border border-blue-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={16} className="text-blue-400" />
                  <span className="font-black text-[10px] uppercase tracking-widest text-blue-400">Position Details</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[11px] text-white/50 font-bold">Units</span>
                    <span className="font-black text-white">{selectedPosition.total_units.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-white/50 font-bold">Avg Entry</span>
                    <span className="font-bold text-white">${selectedPosition.avg_buy_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-white/50 font-bold">Current</span>
                    <span className="font-bold text-white">${selectedPosition.current_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-white/50 font-bold">Value</span>
                    <span className="font-bold text-white">${selectedPosition.current_value.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[11px] text-white/50 font-bold">P&L</span>
                    <span className={`font-black text-lg ${selectedPosition.profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {selectedPosition.profit_loss >= 0 ? '+' : ''}${selectedPosition.profit_loss.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-6 text-center">
                <Package size={32} className="mx-auto mb-3 text-white/20" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">No Position</span>
                <p className="text-[10px] text-white/30 mt-1">Buy {selectedAsset.symbol} to start</p>
              </div>
            )}

            {/* Stats */}
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={16} className="text-purple-400" />
                <span className="font-black text-[10px] uppercase tracking-widest text-white/60">Stats</span>
              </div>
              <div className="space-y-3">
                {portfolioStats.bestPerformer && (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-white/50">Best</span>
                    <span className="text-[11px] font-bold text-emerald-400">
                      {portfolioStats.bestPerformer.asset_symbol} +{portfolioStats.bestPerformer.profit_loss_percent.toFixed(1)}%
                    </span>
                  </div>
                )}
                {portfolioStats.worstPerformer && (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-white/50">Worst</span>
                    <span className="text-[11px] font-bold text-red-400">
                      {portfolioStats.worstPerformer.asset_symbol} {portfolioStats.worstPerformer.profit_loss_percent.toFixed(1)}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-white/50">Win Rate</span>
                  <span className="text-[11px] font-bold text-white">
                    {positions.length > 0 
                      ? Math.round((positions.filter(p => p.profit_loss > 0).length / positions.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AnimatePresence>
        {showAlertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e293b] rounded-2xl border border-white/10 p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-lg">Price Alert</h3>
                <button onClick={() => setShowAlertModal(false)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-sm text-white/60 mb-4">
                Alert me when {selectedAsset.symbol} goes
              </p>
              
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAlertCondition('above')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${alertCondition === 'above' ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white/50'}`}
                >
                  Above
                </button>
                <button
                  onClick={() => setAlertCondition('below')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${alertCondition === 'below' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/50'}`}
                >
                  Below
                </button>
              </div>
              
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                <input
                  type="number"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  placeholder="Target price"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <button
                onClick={createPriceAlert}
                disabled={!alertPrice}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/30 rounded-xl font-black transition-all"
              >
                Set Alert
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }} 
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-black text-xs shadow-2xl z-50 flex items-center gap-3 uppercase tracking-widest border ${feedback.type === 'success' ? 'bg-emerald-600 border-emerald-400' : 'bg-red-600 border-red-400'}`}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {feedback.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.3);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}