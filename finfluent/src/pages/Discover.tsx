import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TestTube, Calculator, PieChart, TrendingUp, Target, Search, X, 
  ShieldAlert, Zap, Filter, Loader2, Landmark, Wallet, 
  Banknote, Flame, AlertCircle, BarChart3, ArrowRight, Plus, Trash2, CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type Category = 'all' | 'sims' | 'budget' | 'invest' | 'business' | 'debt';

interface CatalogItem {
  id: string;
  type: 'sim' | 'tool';
  title: string;
  description: string;
  category: Category;
  icon: React.ElementType;
  color: string;
  html?: string; 
}

// ============================================================================
// MAIN MARKETPLACE COMPONENT
// ============================================================================

export default function FinfluentMarketplace() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sims, setSims] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  useEffect(() => {
    const fetchSims = async () => {
      try {
        const { data } = await supabase.from('modules').select('*').not('simulation_html', 'is', null);
        if (data) {
          const formatted: CatalogItem[] = data.map(s => ({
            id: `sim-${s.id}`,
            type: 'sim',
            title: s.title || `Sim ${s.id}`,
            description: s.description || 'Interactive learning scenario.',
            category: 'sims',
            icon: TestTube,
            color: '#3b82f6', // Blueprint blue for sims
            html: s.simulation_html
          }));
          setSims(formatted);
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetchSims();
  }, []);

  const tools: CatalogItem[] = [
    { id: 't1', type: 'tool', category: 'budget', title: '50/30/20 Planner', description: 'Split your income into Needs, Wants, and Savings.', icon: PieChart, color: '#10b981' },
    { id: 't2', type: 'tool', category: 'business', title: 'Break-Even Point', description: 'Calculate exact units needed to cover your fixed business costs.', icon: Target, color: '#3b82f6' },
    { id: 't3', type: 'tool', category: 'invest', title: 'Compound Predictor', description: 'See your wealth grow over decades with reinvested returns.', icon: TrendingUp, color: '#8b5cf6' },
    { id: 't4', type: 'tool', category: 'invest', title: 'Rule of 72', description: 'Quick mental math: How fast will your money double?', icon: Zap, color: '#f59e0b' },
    { id: 't5', type: 'tool', category: 'budget', title: 'Emergency Fund', description: 'Calculate your tiered safety net based on essential living costs.', icon: ShieldAlert, color: '#ef4444' },
    { id: 't6', type: 'tool', category: 'debt', title: 'Debt Snowball', description: 'Multi-loan payoff timeline using the snowball method.', icon: Banknote, color: '#ec4899' },
    { id: 't7', type: 'tool', category: 'invest', title: 'FIRE Calculator', description: 'Find your Financial Independence Retire Early goal variants.', icon: Flame, color: '#f97316' },
    { id: 't8', type: 'tool', category: 'budget', title: 'Inflation Impact', description: 'Visualize the loss of purchasing power over decades.', icon: AlertCircle, color: '#64748b' },
    { id: 't9', type: 'tool', category: 'budget', title: 'Net Worth Tracker', description: 'Comprehensive Assets minus Liabilities calculator.', icon: Wallet, color: '#06b6d4' },
    { id: 't10', type: 'tool', category: 'invest', title: 'Risk Profiler', description: 'Interactive quiz to determine your ideal asset allocation.', icon: BarChart3, color: '#6366f1' },
  ];

  const catalog = useMemo(() => {
    let combined = [...sims, ...tools];
    if (activeCategory !== 'all') combined = combined.filter(i => i.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      combined = combined.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return combined;
  }, [sims, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans transition-colors duration-300" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      
      {/* Header */}
      <header className="mb-10 max-w-7xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-bold" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
          <Landmark size={14} /> Finfluent Hub
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Marketplace</h1>
        <p className="text-base md:text-lg opacity-60 max-w-2xl leading-relaxed">
          Your complete financial operating system. Launch interactive simulations from your curriculum or use our suite of advanced financial tools to plan your future.
        </p>
      </header>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={18} />
          <input 
            type="text" placeholder="Search apps, tools, and sims..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-offset-2 transition-all font-medium"
            style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)', ringColor: 'var(--accent)' }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full scrollbar-hide pb-2 md:pb-0">
          <div className="flex items-center justify-center px-3 opacity-40"><Filter size={18} /></div>
          {(['all', 'sims', 'budget', 'invest', 'business', 'debt'] as Category[]).map(c => (
            <button key={c} onClick={() => setActiveCategory(c)} 
              className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all border shrink-0 ${activeCategory === c ? 'bg-[var(--accent)] text-white border-transparent shadow-lg shadow-[var(--accent)]/20' : 'bg-transparent border-[var(--border-soft)] opacity-60 hover:opacity-100 hover:bg-[var(--bg-subtle)]'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* App Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {isLoading ? (
          <div className="col-span-full py-32 flex flex-col items-center opacity-40 gap-4">
            <Loader2 className="animate-spin w-8 h-8" />
            <p className="font-medium tracking-wide">Loading secure catalog...</p>
          </div>
        ) : catalog.map(item => (
          <motion.div 
            key={item.id} layoutId={`card-${item.id}`} onClick={() => setSelectedItem(item)}
            whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="cursor-pointer p-6 rounded-3xl border flex flex-col gap-5 group transition-all hover:shadow-2xl"
            style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}
          >
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-6" 
                style={{ background: `${item.color}15`, color: item.color }}>
                <item.icon size={28} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border" style={{ borderColor: 'var(--border-soft)', color: 'var(--text-tertiary)', background: 'var(--bg-base)' }}>
                {item.type}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2 tracking-tight group-hover:text-[var(--accent)] transition-colors">{item.title}</h3>
              <p className="text-sm opacity-60 leading-relaxed line-clamp-2">{item.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-soft)' }}>
              <span className="text-xs font-bold opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: item.color }}>Launch App</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ background: item.color, color: '#fff' }}>
                <ArrowRight size={14} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overlay Player / Full Tool View */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} animate={{ opacity: 1, backdropFilter: 'blur(12px)' }} exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 bg-black/40"
          >
            <motion.div 
              layoutId={`card-${selectedItem.id}`}
              className="relative w-full max-w-6xl h-full max-h-[90vh] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border-soft)' }}
            >
              {/* Tool Header */}
              <div className="px-6 py-5 border-b flex items-center justify-between bg-black/5" style={{ borderColor: 'var(--border-soft)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${selectedItem.color}20`, color: selectedItem.color }}>
                    <selectedItem.icon size={24} />
                  </div>
                  <div>
                    <h2 className="font-black text-xl md:text-2xl tracking-tight">{selectedItem.title}</h2>
                    <p className="text-xs md:text-sm font-medium opacity-50 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: selectedItem.color }} />
                      {selectedItem.category.toUpperCase()} • {selectedItem.type === 'sim' ? 'Interactive Web Sim' : 'React Applet'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedItem(null)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Tool Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar relative">
                {selectedItem.type === 'sim' ? (
                  <iframe 
                    srcDoc={selectedItem.html} title="sim"
                    className="w-full h-full border-0 rounded-2xl bg-white shadow-inner"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <p className="text-lg opacity-70 mb-10 leading-relaxed">{selectedItem.description}</p>
                    <ToolRenderer id={selectedItem.id} />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// REUSABLE UI COMPONENTS FOR TOOLS
// ============================================================================

const InputRow = ({ label, value, onChange, prefix, suffix, subtext }: any) => (
  <div className="flex flex-col gap-1.5 mb-6">
    <label className="text-sm font-bold opacity-80">{label}</label>
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-4 opacity-50 font-bold">{prefix}</span>}
      <input 
        type="number" value={value === 0 && !prefix ? '' : value} onChange={e => onChange(Number(e.target.value))}
        className="w-full py-4 rounded-xl border bg-transparent outline-none focus:ring-2 font-mono text-lg transition-all" 
        style={{ borderColor: 'var(--border-soft)', paddingLeft: prefix ? '2.5rem' : '1rem', paddingRight: suffix ? '2.5rem' : '1rem' }}
      />
      {suffix && <span className="absolute right-4 opacity-50 font-bold">{suffix}</span>}
    </div>
    {subtext && <span className="text-xs opacity-50 mt-1">{subtext}</span>}
  </div>
);

const ResultCard = ({ title, amount, color, sub, icon: Icon }: any) => (
  <div className="p-6 rounded-2xl border flex flex-col gap-2 relative overflow-hidden group hover:shadow-lg transition-all" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-subtle)' }}>
    <div className="absolute -right-4 -top-4 opacity-5 transition-transform group-hover:scale-150 group-hover:rotate-12 duration-500">
      {Icon && <Icon size={120} />}
    </div>
    <span className="text-xs font-black opacity-50 uppercase tracking-widest z-10">{title}</span>
    <span className="text-4xl font-black z-10 tracking-tight" style={{ color }}>{amount}</span>
    {sub && <span className="text-sm opacity-60 font-medium z-10 mt-1">{sub}</span>}
  </div>
);

// ============================================================================
// THE 10 HEAVY-LOGIC TOOL RENDERERS
// ============================================================================

function ToolRenderer({ id }: { id: string }) {
  
  // T1: 50/30/20 Budget
  const [t1Income, setT1Income] = useState(4000);
  
  // T2: Break Even
  const [t2Fixed, setT2Fixed] = useState(1500);
  const [t2Price, setT2Price] = useState(50);
  const [t2Var, setT2Var] = useState(20);

  // T3: Compound Interest
  const [t3Princ, setT3Princ] = useState(10000);
  const [t3Rate, setT3Rate] = useState(7);
  const [t3Years, setT3Years] = useState(20);
  const [t3Add, setT3Add] = useState(200);

  // T5: Emergency Fund
  const [t5Exp, setT5Exp] = useState(2500);

  // T6: Debt Snowball (Complex State)
  const [debts, setDebts] = useState([
    { id: 1, name: 'Credit Card', balance: 3000, rate: 19.9, min: 100 },
    { id: 2, name: 'Car Loan', balance: 12000, rate: 5.5, min: 250 }
  ]);
  const [extraPay, setExtraPay] = useState(150);

  // T7: FIRE
  const [t7Spend, setT7Spend] = useState(60000);

  // T8: Inflation
  const [t8Amt, setT8Amt] = useState(10000);
  const [t8Inf, setT8Inf] = useState(3);
  const [t8Yrs, setT8Yrs] = useState(10);

  // T9: Net Worth (Complex State)
  const [assets, setAssets] = useState([{ id: 1, name: 'Checking', val: 5000 }, { id: 2, name: '401k', val: 45000 }]);
  const [liabilities, setLiabilities] = useState([{ id: 1, name: 'Student Loan', val: 18000 }]);

  // T10: Risk Profiler
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const questions = [
    { q: "If your portfolio dropped 20% in a month, you would:", opts: [{ t: "Sell everything", v: 1 }, { t: "Do nothing", v: 3 }, { t: "Buy more", v: 5 }] },
    { q: "When do you need to withdraw this money?", opts: [{ t: "< 2 Years", v: 1 }, { t: "5-10 Years", v: 3 }, { t: "15+ Years", v: 5 }] },
    { q: "Your primary goal is:", opts: [{ t: "Capital preservation", v: 1 }, { t: "Steady dividend income", v: 3 }, { t: "Aggressive growth", v: 5 }] },
  ];

  switch (id) {
    case 't1': 
      return (
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <InputRow label="Monthly After-Tax Income" value={t1Income} onChange={setT1Income} prefix="$" subtext="Enter your take-home pay." />
            <div className="p-6 rounded-2xl bg-black/5 border border-dashed border-gray-500/30">
              <h4 className="font-bold mb-2 flex items-center gap-2"><PieChart size={16}/> How this rule works</h4>
              <p className="text-sm opacity-70 leading-relaxed">The 50/30/20 rule is a simple budgeting framework. It allocates 50% of your money to Needs (rent, food), 30% to Wants (fun, dining), and 20% to Savings (investments, debt payoff).</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <ResultCard title="Needs (50%)" amount={`$${(t1Income * 0.5).toLocaleString()}`} color="#ef4444" sub="Housing, groceries, utilities, insurance" icon={Target} />
            <ResultCard title="Wants (30%)" amount={`$${(t1Income * 0.3).toLocaleString()}`} color="#f59e0b" sub="Dining out, entertainment, hobbies" icon={Flame} />
            <ResultCard title="Savings (20%)" amount={`$${(t1Income * 0.2).toLocaleString()}`} color="#10b981" sub="Investments, emergency fund, extra debt payments" icon={Banknote} />
          </div>
        </div>
      );

    case 't2': 
      const units = t2Fixed / (t2Price - t2Var);
      const isProfitable = t2Price > t2Var;
      return (
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="flex flex-col gap-2">
            <InputRow label="Total Fixed Costs" value={t2Fixed} onChange={setT2Fixed} prefix="$" subtext="Costs that don't change (Rent, Software subs)" />
            <InputRow label="Sale Price per Unit" value={t2Price} onChange={setT2Price} prefix="$" subtext="How much you sell one item for." />
            <InputRow label="Variable Cost per Unit" value={t2Var} onChange={setT2Var} prefix="$" subtext="Cost to make/buy one item." />
          </div>
          <div>
            {!isProfitable ? (
              <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500 text-red-500">
                <h3 className="font-bold text-xl mb-2">Loss Warning</h3>
                <p>Your variable costs are higher than your sale price. You lose money on every unit sold. You can never break even.</p>
              </div>
            ) : (
              <ResultCard title="Units to Break Even" amount={Math.ceil(units).toLocaleString()} color="#3b82f6" sub={`You must sell ${Math.ceil(units)} units to cover your $${t2Fixed} fixed costs.`} icon={Target} />
            )}
            {isProfitable && (
              <div className="mt-6 p-6 rounded-2xl border" style={{ borderColor: 'var(--border-soft)' }}>
                <h4 className="font-bold mb-4 opacity-50 uppercase text-xs">Revenue at Break-Even</h4>
                <div className="text-3xl font-mono">${(Math.ceil(units) * t2Price).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      );

    case 't3': 
      // Calculate data array for chart simulation
      let currentAmount = t3Princ;
      const chartData = [];
      for(let i=1; i<=t3Years; i++) {
        currentAmount = (currentAmount + (t3Add * 12)) * (1 + (t3Rate/100));
        chartData.push(currentAmount);
      }
      const maxVal = Math.max(...chartData, 1);

      return (
        <div className="flex flex-col gap-10">
          <div className="grid lg:grid-cols-4 gap-4">
            <InputRow label="Initial Deposit" value={t3Princ} onChange={setT3Princ} prefix="$" />
            <InputRow label="Monthly Addition" value={t3Add} onChange={setT3Add} prefix="$" />
            <InputRow label="Annual Return" value={t3Rate} onChange={setT3Rate} suffix="%" />
            <InputRow label="Years to Grow" value={t3Years} onChange={setT3Years} suffix="Yrs" />
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-4">
              <ResultCard title="Future Value" amount={`$${Math.round(currentAmount).toLocaleString()}`} color="#8b5cf6" sub={`After ${t3Years} years`} icon={TrendingUp} />
              <div className="p-6 rounded-2xl border flex flex-col gap-2" style={{ borderColor: 'var(--border-soft)' }}>
                <div className="flex justify-between text-sm"><span className="opacity-60">Total Principal:</span> <span className="font-bold">${(t3Princ + (t3Add*12*t3Years)).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="opacity-60">Interest Earned:</span> <span className="font-bold text-purple-500">${(currentAmount - (t3Princ + (t3Add*12*t3Years))).toLocaleString()}</span></div>
              </div>
            </div>
            
            <div className="lg:col-span-2 p-6 rounded-2xl border flex items-end gap-1 h-64" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-subtle)' }}>
              {chartData.map((val, i) => (
                <div key={i} className="flex-1 bg-purple-500 rounded-t-sm hover:opacity-80 transition-opacity group relative" style={{ height: `${(val / maxVal) * 100}%` }}>
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                     Yr {i+1}: ${Math.round(val).toLocaleString()}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 't4': 
      const t4Rate = t3Rate || 7; // Reuse state
      return (
        <div className="max-w-2xl mx-auto">
          <InputRow label="Expected Annual Return" value={t4Rate} onChange={setT3Rate} suffix="%" />
          <div className="mt-8">
            <ResultCard title="Years to double your money" amount={(72 / (t4Rate || 1)).toFixed(1)} color="#f59e0b" icon={Zap} />
          </div>
          <p className="mt-6 text-sm opacity-60 text-center">The Rule of 72 states that 72 divided by the annual rate of return gives you a rough estimate of how many years it will take for your initial investment to duplicate itself.</p>
        </div>
      );

    case 't5': 
      return (
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <InputRow label="Essential Monthly Expenses" value={t5Exp} onChange={setT5Exp} prefix="$" subtext="Only include absolute needs: Rent, Food, Utilities, Debt minimums." />
          </div>
          <div className="flex flex-col gap-4">
            <ResultCard title="Starter Fund (1 Month)" amount={`$${t5Exp.toLocaleString()}`} color="#64748b" sub="First step: Covers minor unexpected bills." />
            <ResultCard title="Basic Fund (3 Months)" amount={`$${(t5Exp * 3).toLocaleString()}`} color="#f59e0b" sub="Safety net for brief job loss or medical issue." />
            <ResultCard title="Ideal Fund (6 Months)" amount={`$${(t5Exp * 6).toLocaleString()}`} color="#ef4444" sub="Bulletproof: Protects against major life disruptions." icon={ShieldAlert} />
          </div>
        </div>
      );

    case 't6': 
      // Debt Snowball logic simulation
      const totalDebt = debts.reduce((acc, d) => acc + d.balance, 0);
      const totalMin = debts.reduce((acc, d) => acc + d.min, 0);
      return (
        <div>
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <ResultCard title="Total Debt" amount={`$${totalDebt.toLocaleString()}`} color="#ec4899" />
            <ResultCard title="Total Min Payments" amount={`$${totalMin.toLocaleString()}/mo`} color="#f472b6" />
            <div className="p-4 rounded-2xl border bg-[var(--bg-subtle)]" style={{ borderColor: 'var(--border-soft)' }}>
              <InputRow label="Extra Snowball Payment" value={extraPay} onChange={setExtraPay} prefix="$" subtext="Extra cash applied to smallest debt." />
            </div>
          </div>

          <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--border-soft)' }}>
             <h3 className="font-bold mb-4 flex items-center justify-between">
                Your Debts (Smallest to Largest)
                <button onClick={() => setDebts([...debts, {id: Date.now(), name: 'New Loan', balance: 1000, rate: 10, min: 50}])} className="flex items-center gap-1 text-xs font-bold text-pink-500 bg-pink-500/10 px-3 py-1.5 rounded-lg"><Plus size={14}/> Add Debt</button>
             </h3>
             <div className="flex flex-col gap-3">
               {[...debts].sort((a,b) => a.balance - b.balance).map(d => (
                 <div key={d.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-black/5">
                   <div className="flex-1 min-w-[150px]">
                     <span className="text-xs opacity-50 block mb-1">Name</span>
                     <input value={d.name} onChange={e => setDebts(debts.map(x => x.id === d.id ? {...x, name: e.target.value} : x))} className="bg-transparent font-bold outline-none border-b border-transparent focus:border-pink-500 w-full" />
                   </div>
                   <div className="w-24">
                     <span className="text-xs opacity-50 block mb-1">Balance</span>
                     <input type="number" value={d.balance} onChange={e => setDebts(debts.map(x => x.id === d.id ? {...x, balance: Number(e.target.value)} : x))} className="bg-transparent font-mono outline-none w-full" />
                   </div>
                   <div className="w-20">
                     <span className="text-xs opacity-50 block mb-1">APR (%)</span>
                     <input type="number" value={d.rate} onChange={e => setDebts(debts.map(x => x.id === d.id ? {...x, rate: Number(e.target.value)} : x))} className="bg-transparent font-mono outline-none w-full" />
                   </div>
                   <div className="w-24">
                     <span className="text-xs opacity-50 block mb-1">Min Pay</span>
                     <input type="number" value={d.min} onChange={e => setDebts(debts.map(x => x.id === d.id ? {...x, min: Number(e.target.value)} : x))} className="bg-transparent font-mono outline-none w-full" />
                   </div>
                   <button onClick={() => setDebts(debts.filter(x => x.id !== d.id))} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"><Trash2 size={16}/></button>
                 </div>
               ))}
             </div>
          </div>
        </div>
      );

    case 't7': 
      return (
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
             <InputRow label="Desired Annual Retirement Spend" value={t7Spend} onChange={setT7Spend} prefix="$" subtext="How much you want to spend per year in retirement." />
             <p className="text-sm opacity-60 p-4 bg-black/5 rounded-xl border border-dashed border-gray-500/30">
               Based on the 4% Safe Withdrawal Rate rule. If you invest your FIRE number in broadly diversified index funds, historically, you can withdraw 4% per year inflation-adjusted without depleting the principal.
             </p>
          </div>
          <div className="flex flex-col gap-4">
            <ResultCard title="Lean FIRE (Bare bones)" amount={`$${(t7Spend * 0.7 * 25).toLocaleString()}`} color="#fcd34d" sub="Living frugally, covering only necessities." />
            <ResultCard title="Standard FIRE" amount={`$${(t7Spend * 25).toLocaleString()}`} color="#f97316" sub="Maintaining your currently desired lifestyle." icon={Flame} />
            <ResultCard title="Fat FIRE (Luxury)" amount={`$${(t7Spend * 1.5 * 25).toLocaleString()}`} color="#b91c1c" sub="Abundant travel, luxury goods, high lifestyle." />
          </div>
        </div>
      );

    case 't8': 
      return (
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="flex flex-col gap-2">
            <InputRow label="Amount Today" value={t8Amt} onChange={setT8Amt} prefix="$" />
            <InputRow label="Average Inflation Rate" value={t8Inf} onChange={setT8Inf} suffix="%" subtext="Historically around 3% in the US." />
            <InputRow label="Years in the Future" value={t8Yrs} onChange={setT8Yrs} suffix="Yrs" />
          </div>
          <div>
            <ResultCard 
              title="Future Purchasing Power" 
              amount={`$${Math.round(t8Amt / Math.pow(1 + (t8Inf/100), t8Yrs)).toLocaleString()}`} 
              color="#64748b" 
              sub={`In ${t8Yrs} years, your $${t8Amt.toLocaleString()} will only buy what $${Math.round(t8Amt / Math.pow(1 + (t8Inf/100), t8Yrs)).toLocaleString()} buys today.`} 
              icon={AlertCircle} 
            />
          </div>
        </div>
      );

    case 't9': 
      const tAssets = assets.reduce((a,b) => a+b.val, 0);
      const tLiabs = liabilities.reduce((a,b) => a+b.val, 0);
      return (
        <div>
           <div className="mb-8">
              <ResultCard title="Total Net Worth" amount={`$${(tAssets - tLiabs).toLocaleString()}`} color="#06b6d4" icon={Wallet} />
           </div>
           <div className="grid lg:grid-cols-2 gap-8">
              {/* Assets */}
              <div className="p-6 rounded-2xl border bg-green-500/5" style={{ borderColor: 'var(--border-soft)' }}>
                 <h3 className="font-bold text-green-500 mb-4 flex justify-between items-center">
                   Assets (+) <span className="font-mono">${tAssets.toLocaleString()}</span>
                 </h3>
                 <div className="flex flex-col gap-3">
                   {assets.map(a => (
                     <div key={a.id} className="flex gap-2">
                       <input value={a.name} onChange={e => setAssets(assets.map(x => x.id === a.id ? {...x, name: e.target.value} : x))} className="flex-1 bg-white/50 px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ring-green-500" />
                       <input type="number" value={a.val} onChange={e => setAssets(assets.map(x => x.id === a.id ? {...x, val: Number(e.target.value)} : x))} className="w-32 bg-white/50 px-3 py-2 rounded-lg text-sm font-mono outline-none focus:ring-1 ring-green-500" />
                       <button onClick={() => setAssets(assets.filter(x => x.id !== a.id))} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                     </div>
                   ))}
                   <button onClick={() => setAssets([...assets, {id: Date.now(), name: 'New Asset', val: 0}])} className="text-xs font-bold text-green-600 mt-2 flex items-center gap-1"><Plus size={14}/> Add Asset</button>
                 </div>
              </div>
              {/* Liabilities */}
              <div className="p-6 rounded-2xl border bg-red-500/5" style={{ borderColor: 'var(--border-soft)' }}>
                 <h3 className="font-bold text-red-500 mb-4 flex justify-between items-center">
                   Liabilities (-) <span className="font-mono">${tLiabs.toLocaleString()}</span>
                 </h3>
                 <div className="flex flex-col gap-3">
                   {liabilities.map(l => (
                     <div key={l.id} className="flex gap-2">
                       <input value={l.name} onChange={e => setLiabilities(liabilities.map(x => x.id === l.id ? {...x, name: e.target.value} : x))} className="flex-1 bg-white/50 px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 ring-red-500" />
                       <input type="number" value={l.val} onChange={e => setLiabilities(liabilities.map(x => x.id === l.id ? {...x, val: Number(e.target.value)} : x))} className="w-32 bg-white/50 px-3 py-2 rounded-lg text-sm font-mono outline-none focus:ring-1 ring-red-500" />
                       <button onClick={() => setLiabilities(liabilities.filter(x => x.id !== l.id))} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                     </div>
                   ))}
                   <button onClick={() => setLiabilities([...liabilities, {id: Date.now(), name: 'New Debt', val: 0}])} className="text-xs font-bold text-red-600 mt-2 flex items-center gap-1"><Plus size={14}/> Add Liability</button>
                 </div>
              </div>
           </div>
        </div>
      );

    case 't10': 
      if (quizStep >= questions.length) {
        let profile = "Conservative"; let pColor = "#3b82f6";
        if (quizScore > 6) { profile = "Moderate"; pColor = "#f59e0b"; }
        if (quizScore > 10) { profile = "Aggressive"; pColor = "#ef4444"; }
        
        return (
           <div className="max-w-xl mx-auto text-center flex flex-col items-center">
             <CheckCircle2 size={64} className="mb-6" color={pColor} />
             <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-2">Your Risk Profile</h3>
             <h2 className="text-5xl font-black mb-6" style={{ color: pColor }}>{profile}</h2>
             <p className="text-lg opacity-70 mb-8">
               {profile === "Conservative" && "You prioritize protecting your money over high returns. Stick to bonds, HYSAs, and stable blue-chip dividend stocks."}
               {profile === "Moderate" && "You want growth but don't want extreme volatility. A balanced 60/40 mix of stocks and bonds suits you well."}
               {profile === "Aggressive" && "You have a long time horizon and stomach for volatility. Heavy allocation to broad market equities and growth stocks."}
             </p>
             <button onClick={() => {setQuizStep(0); setQuizScore(0);}} className="px-6 py-3 rounded-xl bg-gray-200 text-black font-bold">Retake Assessment</button>
           </div>
        );
      }
      return (
        <div className="max-w-2xl mx-auto">
           <div className="mb-8 flex gap-2">
             {questions.map((_, i) => (
               <div key={i} className={`h-2 flex-1 rounded-full ${i <= quizStep ? 'bg-indigo-500' : 'bg-gray-200'}`} />
             ))}
           </div>
           <h3 className="text-2xl font-bold mb-8">{questions[quizStep].q}</h3>
           <div className="flex flex-col gap-4">
             {questions[quizStep].opts.map((opt, i) => (
               <button 
                 key={i} 
                 onClick={() => { setQuizScore(quizScore + opt.v); setQuizStep(quizStep + 1); }}
                 className="p-6 text-left rounded-2xl border text-lg font-medium hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all"
                 style={{ borderColor: 'var(--border-soft)' }}
               >
                 {opt.t}
               </button>
             ))}
           </div>
        </div>
      );

    default:
      return <div className="py-20 text-center opacity-30">Tool data loading...</div>;
  }
}