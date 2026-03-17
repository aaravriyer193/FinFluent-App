import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, Loader2, 
  Zap, Wallet, Package, TrendingDown, History, Bell, Star, BarChart3, 
  Target, ChevronDown, ChevronUp, Trash2, Plus, X, CandlestickChart,
  LineChart as LineChartIcon, Settings, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { 
  AreaChart, Area, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line, XAxis, BarChart, Bar, Cell 
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

import fincoinImg from '../assets/fincoin.gif';

// Asset definitions - prices under 100 FC
const ASSETS = [
  { 
    id: 'f500', 
    name: 'Finfluent 500', 
    symbol: 'F500', 
    color: '#3b82f6', 
    volatility: 2.5,
    basePrice: 45.00,
    desc: 'Blue chip index tracking top 500 companies'
  },
  { 
    id: 'techx', 
    name: 'Tech Growth', 
    symbol: 'TECH', 
    color: '#8b5cf6', 
    volatility: 4.0,
    basePrice: 28.50,
    desc: 'High-growth technology companies'
  },
  { 
    id: 'gold', 
    name: 'Gold Reserve', 
    symbol: 'GOLD', 
    color: '#fbbf24', 
    volatility: 1.2,
    basePrice: 62.00,
    desc: 'Precious metals and commodities'
  },
  { 
    id: 'crypto', 
    name: 'Crypto Index', 
    symbol: 'CRYP', 
    color: '#f97316', 
    volatility: 8.5,
    basePrice: 15.75,
    desc: 'Cryptocurrency market proxy'
  },
  { 
    id: 'green', 
    name: 'Green Energy', 
    symbol: 'GREEN', 
    color: '#10b981', 
    volatility: 3.5,
    basePrice: 22.30,
    desc: 'Renewable energy and ESG stocks'
  },
  { 
    id: 'meme', 
    name: 'Meme Stocks', 
    symbol: 'MEME', 
    color: '#ec4899', 
    volatility: 12.0,
    basePrice: 8.90,
    desc: 'High volatility retail favorites'
  },
];

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: number;
}

interface Position {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_symbol: string;
  units: number;
  avg_buy_price: number;
  current_price: number;
  total_cost: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  color: string;
  created_at: string;
}

interface Trade {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_symbol: string;
  units: number;
  price: number;
  total: number;
  trade_type: 'buy' | 'sell' | 'close';
  pnl?: number;
  created_at: string;
}

interface PriceAlert {
  id: string;
  asset_id: string;
  target_price: number;
  condition: 'above' | 'below';
  is_triggered: boolean;
}

// Custom Candlestick Component
const Candlestick = ({ x, y, width, height, payload, fill }: any) => {
  if (!payload) return null;
  const { open, high, low, close } = payload;
  const isGreen = close >= open;
  const color = isGreen ? '#10b981' : '#ef4444';
  const bodyHeight = Math.abs(close - open) * (height / (high - low || 1));
  const bodyY = y + (Math.max(open, close) - high) * (height / (high - low || 1));
  const wickX = x + width / 2;
  
  return (
    <g>
      {/* Wick */}
      <line 
        x1={wickX} y1={y} 
        x2={wickX} y2={y + height} 
        stroke={color} 
        strokeWidth={1}
      />
      {/* Body */}
      <rect 
        x={x + width * 0.2} 
        y={bodyY} 
        width={width * 0.6} 
        height={Math.max(bodyHeight, 2)} 
        fill={color}
        rx={1}
      />
    </g>
  );
};

export default function Stocks() {
  const { user, refreshUserData } = useAppContext();
  
  // Market state
  const [marketData, setMarketData] = useState<Record<string, any>>({});
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  
  // User data
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  
  // UI state
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [tradeAmount, setTradeAmount] = useState(1);
  const [activeTab, setActiveTab] = useState<'chart' | 'positions' | 'history'>('chart');
  const [chartType, setChartType] = useState<'line' | 'candles'>('candles');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h'>('5m');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [showCloseModal, setShowCloseModal] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived values
  const currentPrice = marketData[selectedAsset.id]?.current_price || selectedAsset.basePrice;
  
  const selectedPosition = useMemo(() => 
    positions.find(p => p.asset_id === selectedAsset.id),
  [positions, selectedAsset]);

  const portfolioStats = useMemo(() => {
    const totalCost = positions.reduce((sum, p) => sum + p.total_cost, 0);
    const currentValue = positions.reduce((sum, p) => sum + p.current_value, 0);
    const unrealizedPnl = currentValue - totalCost;
    const unrealizedPnlPercent = totalCost > 0 ? (unrealizedPnl / totalCost) * 100 : 0;
    
    // Calculate realized P&L from closed trades
    const realizedPnl = trades
      .filter(t => t.trade_type === 'close' && t.pnl)
      .reduce((sum, t) => sum + (t.pnl || 0), 0);
    
    return { 
      totalCost, 
      currentValue, 
      unrealizedPnl, 
      unrealizedPnlPercent,
      realizedPnl,
      totalPnl: unrealizedPnl + realizedPnl
    };
  }, [positions, trades]);

  const isWatched = watchlist.includes(selectedAsset.id);

  // Initialize market data
  useEffect(() => {
    const initMarket = async () => {
      setIsLoading(true);
      
      // Check if market data exists
      const { data: existing } = await supabase.from('global_market').select('*');
      
      if (!existing || existing.length === 0) {
        // Initialize with base prices
        for (const asset of ASSETS) {
          await supabase.from('global_market').insert({
            asset_id: asset.id,
            asset_name: asset.name,
            current_price: asset.basePrice,
            open_price: asset.basePrice,
            high_price: asset.basePrice,
            low_price: asset.basePrice,
            volume: 0,
            last_updated: new Date()
          });
        }
      }
      
      // Load all market data
      const { data: markets } = await supabase.from('global_market').select('*');
      if (markets) {
        const marketMap: Record<string, any> = {};
        markets.forEach(m => marketMap[m.asset_id] = m);
        setMarketData(marketMap);
      }
      
      await fetchUserData();
      setIsLoading(false);
    };
    
    initMarket();
  }, []);

  // Real-time market updates
  useEffect(() => {
    const channel = supabase
      .channel('market-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'global_market' 
      }, (payload) => {
        setMarketData(prev => ({
          ...prev,
          [payload.new.asset_id]: payload.new
        }));
        
        // Update positions with new prices
        if (payload.new.asset_id === selectedAsset.id) {
          updateChartData(payload.new);
        }
        
        // Update all positions' current values
        setPositions(prev => prev.map(pos => {
          if (pos.asset_id === payload.new.asset_id) {
            const newPrice = parseFloat(payload.new.current_price);
            return {
              ...pos,
              current_price: newPrice,
              current_value: pos.units * newPrice,
              unrealized_pnl: (pos.units * newPrice) - pos.total_cost,
              unrealized_pnl_percent: ((pos.units * newPrice) - pos.total_cost) / pos.total_cost * 100
            };
          }
          return pos;
        }));
        
        checkPriceAlerts(payload.new.asset_id, parseFloat(payload.new.current_price));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedAsset]);

  // Market simulation - price movements
  useEffect(() => {
    const interval = setInterval(async () => {
      for (const asset of ASSETS) {
        const market = marketData[asset.id];
        if (!market) continue;
        
        const currentPrice = parseFloat(market.current_price);
        const change = (Math.random() - 0.5) * asset.volatility * 0.1;
        const newPrice = Math.max(0.10, currentPrice + change);
        
        const newHigh = Math.max(parseFloat(market.high_price), newPrice);
        const newLow = Math.min(parseFloat(market.low_price), newPrice);
        
        await supabase.from('global_market')
          .update({
            current_price: newPrice,
            high_price: newHigh,
            low_price: newLow,
            last_updated: new Date()
          })
          .eq('asset_id', asset.id);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [marketData]);

  // Generate candle data
  const updateChartData = (market: any) => {
    const price = parseFloat(market.current_price);
    const now = Date.now();
    
    setLineData(prev => [...prev.slice(-49), { time: now, price }]);
    
    setCandleData(prev => {
      const lastCandle = prev[prev.length - 1];
      const candleDuration = timeframe === '1m' ? 60000 : timeframe === '5m' ? 300000 : timeframe === '15m' ? 900000 : 3600000;
      
      if (!lastCandle || now - lastCandle.timestamp >= candleDuration) {
        // New candle
        return [...prev.slice(-29), {
          time: prev.length,
          open: price,
          high: price,
          low: price,
          close: price,
          timestamp: now
        }];
      } else {
        // Update current candle
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...lastCandle,
          high: Math.max(lastCandle.high, price),
          low: Math.min(lastCandle.low, price),
          close: price
        };
        return updated;
      }
    });
  };

  const fetchUserData = async () => {
    if (!user) return;
    
    // Fetch positions
    const { data: positionsData } = await supabase
      .from('positions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_open', true);
    
    if (positionsData) {
      const formattedPositions = positionsData.map((p: any) => ({
        id: p.id,
        asset_id: p.asset_id,
        asset_name: p.asset_name,
        asset_symbol: p.asset_symbol,
        units: parseFloat(p.units),
        avg_buy_price: parseFloat(p.avg_buy_price),
        current_price: parseFloat(p.current_price),
        total_cost: parseFloat(p.total_cost),
        current_value: parseFloat(p.current_value),
        unrealized_pnl: parseFloat(p.unrealized_pnl),
        unrealized_pnl_percent: parseFloat(p.unrealized_pnl_percent),
        color: ASSETS.find(a => a.id === p.asset_id)?.color || '#3b82f6',
        created_at: p.created_at
      }));
      setPositions(formattedPositions);
    }
    
    // Fetch trades
    const { data: tradesData } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (tradesData) {
      setTrades(tradesData.map((t: any) => ({
        id: t.id,
        asset_id: t.asset_id,
        asset_name: t.asset_name,
        asset_symbol: t.asset_symbol,
        units: parseFloat(t.units),
        price: parseFloat(t.price),
        total: parseFloat(t.total),
        trade_type: t.trade_type,
        pnl: t.pnl ? parseFloat(t.pnl) : undefined,
        created_at: t.created_at
      })));
    }
    
    // Fetch watchlist
    const { data: watchData } = await supabase
      .from('watchlist')
      .select('asset_id')
      .eq('user_id', user.id);
    
    if (watchData) setWatchlist(watchData.map((w: any) => w.asset_id));
    
    // Fetch alerts
    const { data: alertsData } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_triggered', false);
    
    if (alertsData) setPriceAlerts(alertsData);
  };

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (!user || isProcessing) return;
    setIsProcessing(true);
    
    const price = currentPrice;
    const total = price * tradeAmount;
    
    // Validate
    if (type === 'buy') {
      const availableCoins = user.fincoins || user.spendable_fin_coins || 0;
      if (availableCoins < total) {
        setFeedback({ type: 'error', msg: `Need ${total.toFixed(2)} FC, you have ${availableCoins.toFixed(2)}` });
        setIsProcessing(false);
        return;
      }
    } else {
      if (!selectedPosition || selectedPosition.units < tradeAmount) {
        setFeedback({ type: 'error', msg: `You only have ${selectedPosition?.units.toFixed(2) || 0} units` });
        setIsProcessing(false);
        return;
      }
    }
    
    try {
      if (type === 'buy') {
        // Buy - create or update position
        if (selectedPosition) {
          // Update existing position
          const newUnits = selectedPosition.units + tradeAmount;
          const newTotalCost = selectedPosition.total_cost + total;
          const newAvgPrice = newTotalCost / newUnits;
          
          await supabase.from('positions')
            .update({
              units: newUnits,
              avg_buy_price: newAvgPrice,
              total_cost: newTotalCost,
              current_value: newUnits * price,
              unrealized_pnl: (newUnits * price) - newTotalCost,
              unrealized_pnl_percent: ((newUnits * price) - newTotalCost) / newTotalCost * 100,
              last_updated: new Date()
            })
            .eq('id', selectedPosition.id);
        } else {
          // Create new position
          await supabase.from('positions').insert({
            user_id: user.id,
            asset_id: selectedAsset.id,
            asset_name: selectedAsset.name,
            asset_symbol: selectedAsset.symbol,
            units: tradeAmount,
            avg_buy_price: price,
            current_price: price,
            total_cost: total,
            current_value: total,
            unrealized_pnl: 0,
            unrealized_pnl_percent: 0,
            is_open: true
          });
        }
        
        // Deduct FinCoins
        const currentCoins = user.fincoins || user.spendable_fin_coins || 0;
        await supabase.from('profiles')
          .update({ fincoins: currentCoins - total })
          .eq('id', user.id);
        
      } else {
        // Sell - reduce or close position
        const position = selectedPosition!;
        const saleProceeds = tradeAmount * price;
        const costBasis = tradeAmount * position.avg_buy_price;
        const pnl = saleProceeds - costBasis;
        
        // Record the trade with P&L
        await supabase.from('trades').insert({
          user_id: user.id,
          asset_id: selectedAsset.id,
          asset_name: selectedAsset.name,
          asset_symbol: selectedAsset.symbol,
          units: tradeAmount,
          price: price,
          total: saleProceeds,
          trade_type: 'sell',
          pnl: pnl
        });
        
        if (position.units <= tradeAmount) {
          // Close entire position
          await supabase.from('positions')
            .update({ is_open: false, closed_at: new Date() })
            .eq('id', position.id);
        } else {
          // Partial sell
          const newUnits = position.units - tradeAmount;
          const newTotalCost = position.total_cost - costBasis;
          
          await supabase.from('positions')
            .update({
              units: newUnits,
              total_cost: newTotalCost,
              current_value: newUnits * price,
              unrealized_pnl: (newUnits * price) - newTotalCost,
              unrealized_pnl_percent: ((newUnits * price) - newTotalCost) / newTotalCost * 100
            })
            .eq('id', position.id);
        }
        
        // Add FinCoins
        const currentCoins = user.fincoins || user.spendable_fin_coins || 0;
        await supabase.from('profiles')
          .update({ fincoins: currentCoins + saleProceeds })
          .eq('id', user.id);
      }
      
      // Record buy trade
      if (type === 'buy') {
        await supabase.from('trades').insert({
          user_id: user.id,
          asset_id: selectedAsset.id,
          asset_name: selectedAsset.name,
          asset_symbol: selectedAsset.symbol,
          units: tradeAmount,
          price: price,
          total: total,
          trade_type: 'buy'
        });
      }
      
      setFeedback({ 
        type: 'success', 
        msg: `${type === 'buy' ? 'Bought' : 'Sold'} ${tradeAmount} ${selectedAsset.symbol} @ ${price.toFixed(2)} FC` 
      });
      
      await refreshUserData();
      await fetchUserData();
    } catch (e) {
      console.error('Trade error:', e);
      setFeedback({ type: 'error', msg: 'Trade failed. Try again.' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const closePosition = async (position: Position) => {
    if (!user || isProcessing) return;
    setIsProcessing(true);
    
    try {
      const price = currentPrice;
      const saleProceeds = position.units * price;
      const pnl = saleProceeds - position.total_cost;
      
      // Record closing trade
      await supabase.from('trades').insert({
        user_id: user.id,
        asset_id: position.asset_id,
        asset_name: position.asset_name,
        asset_symbol: position.asset_symbol,
        units: position.units,
        price: price,
        total: saleProceeds,
        trade_type: 'close',
        pnl: pnl
      });
      
      // Close position
      await supabase.from('positions')
        .update({ is_open: false, closed_at: new Date() })
        .eq('id', position.id);
      
      // Return FinCoins
      const currentCoins = user.fincoins || user.spendable_fin_coins || 0;
      await supabase.from('profiles')
        .update({ fincoins: currentCoins + saleProceeds })
        .eq('id', user.id);
      
      setFeedback({ 
        type: 'success', 
        msg: `Closed ${position.asset_symbol} position. P&L: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} FC` 
      });
      
      setShowCloseModal(null);
      await refreshUserData();
      await fetchUserData();
    } catch (e) {
      setFeedback({ type: 'error', msg: 'Failed to close position' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const toggleWatchlist = async () => {
    if (!user) return;
    
    if (isWatched) {
      await supabase.from('watchlist').delete()
        .eq('user_id', user.id)
        .eq('asset_id', selectedAsset.id);
      setWatchlist(prev => prev.filter(id => id !== selectedAsset.id));
    } else {
      await supabase.from('watchlist').insert({
        user_id: user.id,
        asset_id: selectedAsset.id
      });
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
    fetchUserData();
    setFeedback({ type: 'success', msg: `Alert set for ${selectedAsset.symbol}` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const checkPriceAlerts = (assetId: string, price: number) => {
    const alerts = priceAlerts.filter(a => a.asset_id === assetId && !a.is_triggered);
    alerts.forEach(async (alert) => {
      const shouldTrigger = 
        (alert.condition === 'above' && price >= alert.target_price) ||
        (alert.condition === 'below' && price <= alert.target_price);
      
      if (shouldTrigger) {
        await supabase.from('price_alerts')
          .update({ is_triggered: true })
          .eq('id', alert.id);
        
        setFeedback({ 
          type: 'success', 
          msg: `🚨 ${ASSETS.find(a => a.id === assetId)?.symbol} ${alert.condition} $${alert.target_price}!` 
        });
        fetchUserData();
      }
    });
  };

  const tradeAmounts = [0.5, 1, 2, 5, 10, 25];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-400">
        <Loader2 className="animate-spin mr-2" size={24} />
        <span className="font-black uppercase tracking-widest">Loading Market...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-white/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 rounded-xl text-blue-400 border border-blue-500/30">
              <CandlestickChart size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase italic">FinExchange</h1>
              <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
                Live Trading • {positions.length} Open
              </span>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <div className="bg-black/50 px-4 py-2.5 rounded-xl border border-white/10 whitespace-nowrap">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Portfolio</p>
              <p className={`text-lg font-black ${portfolioStats.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {portfolioStats.unrealizedPnl >= 0 ? '+' : ''}${portfolioStats.unrealizedPnl.toFixed(0)}
              </p>
            </div>

            <div className="bg-black/50 px-4 py-2.5 rounded-xl border border-white/10 whitespace-nowrap">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Realized</p>
              <p className={`text-lg font-black ${portfolioStats.realizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {portfolioStats.realizedPnl >= 0 ? '+' : ''}${portfolioStats.realizedPnl.toFixed(0)}
              </p>
            </div>

            <div className="bg-black/50 px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-3 whitespace-nowrap">
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Balance</p>
                <p className="text-lg font-black text-yellow-400">
                  {(user?.fincoins || user?.spendable_fin_coins || 0).toFixed(0)}
                </p>
              </div>
              <img src={fincoinImg} className="w-7 h-7 object-contain" alt="FC" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Asset Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {ASSETS.map((asset) => {
            const market = marketData[asset.id];
            const price = market ? parseFloat(market.current_price) : asset.basePrice;
            const hasPosition = positions.some(p => p.asset_id === asset.id);
            
            return (
              <button
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`flex-shrink-0 min-w-[140px] p-3 rounded-xl border transition-all text-left
                  ${selectedAsset.id === asset.id 
                    ? 'bg-blue-600/20 border-blue-500' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'}
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm" style={{ color: asset.color }}>{asset.symbol}</span>
                  {hasPosition && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                </div>
                <p className="text-lg font-black text-white">{price.toFixed(2)}</p>
                <p className="text-[9px] text-white/40 truncate">{asset.name}</p>
              </button>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0f1525] rounded-2xl border border-white/10 overflow-hidden">
              {/* Chart Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black italic text-white">{selectedAsset.name}</h2>
                      <button
                        onClick={toggleWatchlist}
                        className={`p-2 rounded-lg transition-all ${isWatched ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/40'}`}
                      >
                        <Star size={16} className={isWatched ? 'fill-amber-400' : ''} />
                      </button>
                      <button
                        onClick={() => setShowAlertModal(true)}
                        className="p-2 rounded-lg bg-white/10 text-white/40 hover:text-white transition-all"
                      >
                        <Bell size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live</span>
                      <span className="text-[10px] text-white/30">Vol: {selectedAsset.volatility}%</span>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right">
                    <div className="text-3xl font-black text-white">
                      {currentPrice.toFixed(2)} <span className="text-lg text-white/50">FC</span>
                    </div>
                    {selectedPosition && (
                      <div className="mt-1">
                        <p className="text-[11px] text-white/50">
                          Position: <span className="text-white font-bold">{selectedPosition.units.toFixed(2)}</span> units
                        </p>
                        <p className={`text-[11px] font-bold ${selectedPosition.unrealized_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          P&L: {selectedPosition.unrealized_pnl >= 0 ? '+' : ''}{selectedPosition.unrealized_pnl.toFixed(2)} FC
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chart Controls */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                <div className="flex gap-1">
                  {(['1m', '5m', '15m', '1h'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all
                        ${timeframe === tf ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}
                      `}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setChartType('candles')}
                    className={`p-2 rounded transition-all ${chartType === 'candles' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    <CandlestickChart size={16} />
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`p-2 rounded transition-all ${chartType === 'line' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    <LineChartIcon size={16} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10">
                {[
                  { id: 'chart', label: 'Chart' },
                  { id: 'positions', label: `Positions (${positions.length})` },
                  { id: 'history', label: 'History' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all
                      ${activeTab === id 
                        ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' 
                        : 'text-white/40 hover:text-white/60'}
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab === 'chart' && (
                  <div className="h-[320px]">
                    {chartType === 'candles' ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={candleData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                          <YAxis 
                            domain={['auto', 'auto']} 
                            orientation="right"
                            tick={{ fill: '#ffffff50', fontSize: 10 }}
                            tickFormatter={(v) => v.toFixed(1)}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload?.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-[#0f1525] border border-white/20 rounded-lg px-3 py-2">
                                    <p className="text-[10px] text-white/50">O: {data.open.toFixed(2)} H: {data.high.toFixed(2)}</p>
                                    <p className="text-[10px] text-white/50">L: {data.low.toFixed(2)} C: {data.close.toFixed(2)}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="close" shape={<Candlestick />} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={lineData}>
                          <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={selectedAsset.color} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={selectedAsset.color} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                          <YAxis 
                            orientation="right"
                            tick={{ fill: '#ffffff50', fontSize: 10 }}
                            tickFormatter={(v) => v.toFixed(0)}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload?.length) {
                                return (
                                  <div className="bg-[#0f1525] border border-white/20 rounded-lg px-3 py-2">
                                    <p className="text-white font-bold">{payload[0].value?.toFixed(2)} FC</p>
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
                            strokeWidth={2}
                            fill="url(#lineGradient)"
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}

                {activeTab === 'positions' && (
                  <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar">
                    {positions.length === 0 ? (
                      <div className="py-12 text-center">
                        <Package size={48} className="mx-auto mb-4 text-white/20" />
                        <p className="text-white/40 font-bold">No open positions</p>
                        <p className="text-[11px] text-white/30 mt-1">Buy assets to start trading</p>
                      </div>
                    ) : (
                      <>
                        {positions.map((pos) => (
                          <div
                            key={pos.id}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm"
                                  style={{ backgroundColor: `${pos.color}25`, color: pos.color }}
                                >
                                  {pos.asset_symbol}
                                </div>
                                <div>
                                  <p className="font-bold text-white">{pos.asset_name}</p>
                                  <p className="text-[10px] text-white/50">
                                    {pos.units.toFixed(2)} @ {pos.avg_buy_price.toFixed(2)} FC
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-white">{pos.current_value.toFixed(2)} FC</p>
                                <p className={`text-[11px] font-bold ${pos.unrealized_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {pos.unrealized_pnl >= 0 ? '+' : ''}{pos.unrealized_pnl.toFixed(2)} ({pos.unrealized_pnl_percent.toFixed(1)}%)
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => setSelectedAsset(ASSETS.find(a => a.id === pos.asset_id) || ASSETS[0])}
                                className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase transition-all"
                              >
                                Trade
                              </button>
                              <button
                                onClick={() => setShowCloseModal(pos)}
                                className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-[10px] font-bold uppercase transition-all"
                              >
                                Close Position
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        <div className="bg-gradient-to-r from-blue-600/20 to-emerald-600/20 border border-white/10 rounded-xl p-4 mt-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-white/50 uppercase tracking-widest">Total Invested</p>
                              <p className="font-black text-white">{portfolioStats.totalCost.toFixed(2)} FC</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-white/50 uppercase tracking-widest">Unrealized P&L</p>
                              <p className={`font-black text-xl ${portfolioStats.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {portfolioStats.unrealizedPnl >= 0 ? '+' : ''}{portfolioStats.unrealizedPnl.toFixed(2)} FC
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                    {trades.length === 0 ? (
                      <p className="text-center py-8 text-white/40">No trades yet</p>
                    ) : (
                      trades.map((trade) => (
                        <div key={trade.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase 
                              ${trade.trade_type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 
                                trade.trade_type === 'sell' ? 'bg-red-500/20 text-red-400' : 
                                'bg-blue-500/20 text-blue-400'}`}
                            >
                              {trade.trade_type}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-white">{trade.units.toFixed(2)} {trade.asset_symbol}</p>
                              <p className="text-[9px] text-white/40">
                                {new Date(trade.created_at).toLocaleDateString()} {new Date(trade.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">{trade.total.toFixed(2)} FC</p>
                            {trade.pnl !== undefined && (
                              <p className={`text-[10px] font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="space-y-4">
            
            {/* Trade Size */}
            <div className="bg-[#0f1525] rounded-2xl border border-white/10 p-4">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Quantity</p>
              <div className="grid grid-cols-3 gap-2">
                {tradeAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTradeAmount(amt)}
                    className={`py-2.5 rounded-lg text-[12px] font-black transition-all
                      ${tradeAmount === amt 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    {amt}
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[11px] text-white/40">Price</span>
                  <span className="font-bold text-white">{currentPrice.toFixed(2)} FC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-white/40">Total</span>
                  <span className="font-black text-white">{(currentPrice * tradeAmount).toFixed(2)} FC</span>
                </div>
              </div>
            </div>

            {/* Buy/Sell */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleTrade('buy')} 
                disabled={isProcessing}
                className="flex flex-col items-center justify-center gap-1 p-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
              >
                <ArrowUpRight size={24} strokeWidth={3} />
                <span className="font-black uppercase tracking-wider text-[11px]">Buy</span>
                <span className="text-[9px] text-white/70">{tradeAmount} {selectedAsset.symbol}</span>
              </button>
              <button 
                onClick={() => handleTrade('sell')} 
                disabled={isProcessing || !selectedPosition || selectedPosition.units < tradeAmount}
                className="flex flex-col items-center justify-center gap-1 p-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
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
                  <span className="font-black text-[10px] uppercase tracking-widest text-blue-400">Your Position</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[11px] text-white/50">Units</span>
                    <span className="font-black text-white">{selectedPosition.units.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-white/50">Avg Price</span>
                    <span className="font-bold text-white">{selectedPosition.avg_buy_price.toFixed(2)} FC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-white/50">Current</span>
                    <span className="font-bold text-white">{selectedPosition.current_price.toFixed(2)} FC</span>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-white/50">Value</span>
                      <span className="font-bold text-white">{selectedPosition.current_value.toFixed(2)} FC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[11px] text-white/50">P&L</span>
                      <span className={`font-black ${selectedPosition.unrealized_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {selectedPosition.unrealized_pnl >= 0 ? '+' : ''}{selectedPosition.unrealized_pnl.toFixed(2)} FC
                      </span>
                    </div>
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

            {/* Asset Info */}
            <div className="bg-[#0f1525] rounded-2xl border border-white/10 p-4">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">About {selectedAsset.symbol}</p>
              <p className="text-[11px] text-white/60 leading-relaxed">{selectedAsset.desc}</p>
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
                <span className="text-[10px] text-white/40">Volatility</span>
                <span className="text-[11px] font-bold text-amber-400">{selectedAsset.volatility}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close Position Modal */}
      <AnimatePresence>
        {showCloseModal && (
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
              className="bg-[#0f1525] rounded-2xl border border-white/10 p-6 w-full max-w-sm"
            >
              <h3 className="font-black text-lg mb-4">Close Position</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-white/50">Asset</span>
                  <span className="font-bold">{showCloseModal.asset_symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Units</span>
                  <span className="font-bold">{showCloseModal.units.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Current Price</span>
                  <span className="font-bold">{currentPrice.toFixed(2)} FC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Sale Value</span>
                  <span className="font-bold">{(showCloseModal.units * currentPrice).toFixed(2)} FC</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/10">
                  <span className="text-white/50">Expected P&L</span>
                  <span className={`font-black ${showCloseModal.unrealized_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {showCloseModal.unrealized_pnl >= 0 ? '+' : ''}{showCloseModal.unrealized_pnl.toFixed(2)} FC
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCloseModal(null)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => closePosition(showCloseModal)}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-all"
                >
                  {isProcessing ? 'Closing...' : 'Confirm Close'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-[#0f1525] rounded-2xl border border-white/10 p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-lg">Price Alert</h3>
                <button onClick={() => setShowAlertModal(false)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-sm text-white/60 mb-4">
                Alert when {selectedAsset.symbol} goes
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
                <input
                  type="number"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  placeholder="Target price"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">FC</span>
              </div>
              
              <button
                onClick={createPriceAlert}
                disabled={!alertPrice}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-black transition-all"
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}