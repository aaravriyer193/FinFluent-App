import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';

// ─── DATA (abbreviated for clarity — same arrays as original) ────────────────

const CATS = [
  { id: 'all',         label: 'All'              },
  { id: 'balance',     label: 'Balance Sheet'    },
  { id: 'income',      label: 'Income Statement' },
  { id: 'cashflow',    label: 'Cash Flow'        },
  { id: 'valuation',   label: 'Valuation'        },
  { id: 'market',      label: 'Markets'          },
  { id: 'ratios',      label: 'Ratios'           },
  { id: 'instruments', label: 'Instruments'      },
  { id: 'risk',        label: 'Risk'             },
  { id: 'macro',       label: 'Macro'            },
  { id: 'banking',     label: 'IB / Banking'     },
];

type Term = { name: string; cat: string; def: string; formula?: string };

// ── Paste your full TERMS array here (unchanged) ──
const TERMS: Term[] = [
  { name: 'Assets', cat: 'balance', def: 'Items of monetary value owned by a business — cash, inventory, real estate. Split into current (convertible within a year) and non-current (long-term).' },
  { name: 'Current Assets', cat: 'balance', def: 'Assets convertible to cash within one year: cash, accounts receivable, short-term investments, finished goods inventory.' },
  { name: 'Liabilities', cat: 'balance', def: 'Obligations or debts owed to other parties. Includes bank debt, wages payable, and outstanding invoices.' },
  { name: "Equity / Shareholders' Equity", cat: 'balance', def: 'The residual interest in assets after deducting all liabilities. Calculated as Assets − Liabilities.' },
  { name: 'Working Capital', cat: 'balance', def: 'Current Assets minus Current Liabilities. Measures short-term operational liquidity.', formula: 'Working Capital = Current Assets − Current Liabilities' },
  { name: 'Balance Sheet', cat: 'balance', def: "A financial statement snapshot showing a company's assets, liabilities, and equity at a specific point in time.", formula: 'Assets = Liabilities + Equity' },
  { name: 'Revenue / Net Sales', cat: 'income', def: "The total income generated from selling goods or services before any expenses are deducted. The 'top line.'" },
  { name: 'Gross Profit', cat: 'income', def: 'Revenue minus the Cost of Goods Sold (COGS). Measures production efficiency.', formula: 'Gross Profit = Revenue − COGS' },
  { name: 'EBITDA', cat: 'income', def: 'Earnings Before Interest, Taxes, Depreciation, and Amortization. The most common metric for valuation multiples in M&A.', formula: 'EBITDA = Net Income + Interest + Taxes + D&A' },
  { name: 'Net Income', cat: 'income', def: "The 'bottom line.' Total profit after all expenses including COGS, operating costs, interest, and taxes." },
  { name: 'EPS (Earnings Per Share)', cat: 'income', def: 'Net income divided by shares outstanding.', formula: 'EPS = Net Income ÷ Shares Outstanding' },
  { name: 'EBITDA Margin', cat: 'income', def: 'EBITDA as a percentage of revenue. The most widely quoted profitability metric in M&A and PE.', formula: 'EBITDA Margin % = EBITDA ÷ Revenue × 100' },
  { name: 'Free Cash Flow (FCF)', cat: 'cashflow', def: "Cash remaining after capital expenditures. The most important metric for equity valuation and LBO modeling.", formula: 'FCF = Operating Cash Flow − CapEx' },
  { name: 'CapEx', cat: 'cashflow', def: 'Cash spent on acquiring or upgrading physical assets — buildings, equipment, machinery.' },
  { name: 'DCF (Discounted Cash Flow)', cat: 'valuation', def: 'A valuation method projecting future free cash flows and discounting them back to present value using WACC.', formula: 'DCF Value = Σ FCFt ÷ (1 + WACC)^t + Terminal Value' },
  { name: 'Enterprise Value (EV)', cat: 'valuation', def: 'Total value of a company — equity plus net debt. Represents what an acquirer would pay for the entire business.', formula: 'EV = Market Cap + Debt − Cash' },
  { name: 'EV/EBITDA', cat: 'valuation', def: 'The most common M&A and PE valuation multiple. Allows comparison across different capital structures.' },
  { name: 'P/E Ratio', cat: 'valuation', def: 'Market price per share divided by earnings per share.', formula: 'P/E = Share Price ÷ EPS' },
  { name: 'WACC', cat: 'valuation', def: 'Weighted Average Cost of Capital — the blended required return for all capital providers.', formula: 'WACC = (E/V × Re) + (D/V × Rd × (1−Tax))' },
  { name: 'LBO (Leveraged Buyout)', cat: 'valuation', def: 'An acquisition financed primarily with debt, where target cash flows service the debt. The core PE transaction structure.' },
  { name: 'IRR (Internal Rate of Return)', cat: 'valuation', def: 'The discount rate that makes NPV of cash flows equal zero. Top funds target 20-30%+ IRR.', formula: '0 = Σ CFt ÷ (1 + IRR)^t' },
  { name: 'Market Capitalization', cat: 'market', def: "The total market value of a company's outstanding shares.", formula: 'Market Cap = Share Price × Shares Outstanding' },
  { name: 'Hedge Fund', cat: 'market', def: 'An alternative investment fund using leverage, short selling, and derivatives to generate absolute returns.' },
  { name: 'IPO (Initial Public Offering)', cat: 'market', def: 'The first time a private company sells shares to the public. Investment banks underwrite, price, and allocate shares.' },
  { name: 'Leverage', cat: 'market', def: 'Using borrowed capital to amplify potential returns. Increases both upside and downside risk.', formula: 'Leverage Ratio = Total Debt ÷ Equity' },
  { name: 'Return on Equity (ROE)', cat: 'ratios', def: "Net income as a percentage of shareholders' equity.", formula: "ROE = Net Income ÷ Shareholders' Equity" },
  { name: 'Debt-to-Equity (D/E)', cat: 'ratios', def: "Total debt divided by shareholders' equity. Measures financial leverage." },
  { name: 'Current Ratio', cat: 'ratios', def: 'Current assets divided by current liabilities. A ratio below 1 signals potential liquidity stress.', formula: 'Current Ratio = Current Assets ÷ Current Liabilities' },
  { name: 'Net Profit Margin', cat: 'ratios', def: 'Net income as a percentage of revenue.', formula: 'Net Margin = Net Income ÷ Revenue' },
  { name: 'Stocks / Equities', cat: 'instruments', def: 'A share of ownership in a company. Shareholders receive dividends and benefit from capital appreciation.' },
  { name: 'Options', cat: 'instruments', def: 'Derivatives giving the holder the right (but not obligation) to buy (call) or sell (put) an asset at a specified strike price.' },
  { name: 'ETF (Exchange-Traded Fund)', cat: 'instruments', def: 'A basket of securities traded on an exchange like a stock. Combines diversification with intraday tradability.' },
  { name: 'Beta (β)', cat: 'risk', def: "Measures a stock's volatility relative to the overall market. β=1 moves with market; β>1 is more volatile.", formula: 'β = Cov(ri, rm) ÷ Var(rm)' },
  { name: 'Sharpe Ratio', cat: 'risk', def: 'Return per unit of total risk. A higher Sharpe ratio means better risk-adjusted returns.', formula: 'Sharpe = (Rp − Rf) ÷ σ' },
  { name: 'VaR (Value at Risk)', cat: 'risk', def: 'The maximum expected loss over a given time horizon at a specified confidence level.' },
  { name: 'Inflation', cat: 'macro', def: 'The rate at which the general price level rises over time. Measured by CPI and PCE in the US.' },
  { name: 'Yield Curve', cat: 'macro', def: 'A graph of bond yields across different maturities. Inverted yield curve (short > long) predicts recession.' },
  { name: 'WACC', cat: 'macro', def: 'Weighted Average Cost of Capital — the blended required return for all capital providers.' },
  { name: 'Compound Interest', cat: 'macro', def: 'Interest calculated on both principal and accumulated interest over time.', formula: 'FV = PV × (1 + r)^n' },
  { name: 'M&A (Mergers & Acquisitions)', cat: 'banking', def: 'Transactions where companies combine or one acquires another. Banks advise on structure, valuation, and negotiation.' },
  { name: 'Bulge Bracket', cat: 'banking', def: 'The largest global investment banks — Goldman Sachs, Morgan Stanley, JPMorgan, Bank of America, Citi, Barclays, Deutsche Bank.' },
  { name: 'Pitch Book', cat: 'banking', def: 'A presentation prepared by investment banks to win mandates or present deal ideas to clients.' },
  { name: 'Accretion/Dilution', cat: 'banking', def: "In M&A, whether a deal increases (accretive) or decreases (dilutive) the acquirer's EPS." },
];

const CAT_ACCENT: Record<string, { bg: string; text: string }> = {
  balance:     { bg: '#eff6ff', text: '#1d4ed8' },
  income:      { bg: '#f0fdf4', text: '#15803d' },
  cashflow:    { bg: '#ecfdf5', text: '#047857' },
  valuation:   { bg: '#f5f3ff', text: '#6d28d9' },
  market:      { bg: '#fffbeb', text: '#b45309' },
  ratios:      { bg: '#fff7ed', text: '#c2410c' },
  instruments: { bg: '#fdf2f8', text: '#a21caf' },
  risk:        { bg: '#f8fafc', text: '#475569' },
  macro:       { bg: '#f0fdf4', text: '#166534' },
  banking:     { bg: '#eff6ff', text: '#1e40af' },
};

const REGIONS  = ['All', 'USA', 'UK', 'Canada', 'Europe', 'Asia-Pacific', 'Middle East'];
const STATUSES = ['All', 'Target', 'Semi-Target', 'Non-Target'];

type University = {
  university: string; region: string; status: 'target' | 'semi' | 'non-target';
  rank: string; network: 'elite' | 'strong' | 'moderate'; gpa: string; clubs: string;
};

const UNIS: University[] = [
  { university: 'Harvard University',    region: 'USA',    status: 'target',     rank: 'Top 3',          network: 'elite',    gpa: '3.9+', clubs: 'Harvard Finance Club; Harvard Investment Association; Harvard PE & VC Club' },
  { university: 'Wharton (UPenn)',        region: 'USA',    status: 'target',     rank: '#1',             network: 'elite',    gpa: '3.7+', clubs: 'Wharton Investment & Trading Group; Wharton PE/VC Club' },
  { university: 'Stanford University',    region: 'USA',    status: 'target',     rank: 'Top 5',          network: 'elite',    gpa: '3.9+', clubs: 'Stanford Finance Club; Stanford Investment Group' },
  { university: 'MIT (Sloan)',            region: 'USA',    status: 'target',     rank: 'Top 5 (Quant)',  network: 'elite',    gpa: '3.9+', clubs: 'MIT Finance Club; MIT Trading Club; Quantitative Finance Club' },
  { university: 'Columbia University',    region: 'USA',    status: 'target',     rank: 'Top 5',          network: 'elite',    gpa: '3.7+', clubs: 'Columbia IB Club (CIBC); Columbia Finance Society' },
  { university: 'NYU Stern',             region: 'USA',    status: 'target',     rank: 'Top 7',          network: 'strong',   gpa: '3.5+', clubs: 'Stern Finance Club; SIMR; PE/VC Club' },
  { university: 'Cornell University',    region: 'USA',    status: 'target',     rank: 'Top 15',         network: 'strong',   gpa: '3.6+', clubs: 'Cornell IB Club; Cornell PE/VC' },
  { university: 'Indiana Univ. (Kelley)',region: 'USA',    status: 'semi',       rank: 'Top 20',         network: 'strong',   gpa: '3.3+', clubs: 'Investment Banking Workshop (IBW)' },
  { university: 'USC (Marshall)',        region: 'USA',    status: 'semi',       rank: 'Top 25',         network: 'moderate', gpa: '3.4+', clubs: 'USC Finance Club; Marshall Investment Group' },
  { university: 'LSE',                   region: 'UK',     status: 'target',     rank: 'Top 3 (UK)',     network: 'elite',    gpa: '3.7+', clubs: 'LSE Finance Society; LSE Alternative Investments' },
  { university: 'University of Oxford',  region: 'UK',     status: 'target',     rank: 'Top 5 (UK)',     network: 'elite',    gpa: '3.8+', clubs: 'Oxford Finance Society; Oxford Investment Group' },
  { university: 'University of Cambridge',region:'UK',     status: 'target',     rank: 'Top 5 (UK)',     network: 'elite',    gpa: '3.8+', clubs: 'Cambridge University Finance Society (CUFS)' },
  { university: 'Imperial College London',region:'UK',     status: 'target',     rank: 'Top 10 (UK)',    network: 'strong',   gpa: '3.6+', clubs: 'Imperial Finance Society; Imperial Trading Society' },
  { university: 'UCL',                   region: 'UK',     status: 'semi',       rank: 'Top 10 (UK)',    network: 'strong',   gpa: '3.5+', clubs: 'UCL Finance Society; UCL Investment Group' },
  { university: 'Warwick University',    region: 'UK',     status: 'semi',       rank: 'Top 10 (UK)',    network: 'strong',   gpa: '3.5+', clubs: 'Warwick Finance Society; Warwick Investment Group' },
  { university: 'Univ. of Toronto (Rotman)',region:'Canada',status:'target',     rank: 'Top 3 (CA)',     network: 'strong',   gpa: '3.5+', clubs: 'Rotman Finance Association' },
  { university: 'McGill (Desautels)',    region: 'Canada', status: 'target',     rank: 'Top 5 (CA)',     network: 'strong',   gpa: '3.4+', clubs: 'McGill Finance Association' },
  { university: 'HEC Paris',            region: 'Europe', status: 'target',     rank: 'Top 3 (EU)',     network: 'elite',    gpa: '3.8+', clubs: 'HEC Finance Club; HEC Investment Society' },
  { university: 'Bocconi University',   region: 'Europe', status: 'target',     rank: 'Top 5 (EU)',     network: 'strong',   gpa: '3.6+', clubs: 'Bocconi Finance Society; Bocconi Investment Club' },
  { university: 'NUS',                  region: 'Asia-Pacific', status: 'target', rank: 'Top 3 (APAC)', network: 'strong',   gpa: '3.6+', clubs: 'NUS Finance Society; NUS Investment Group' },
  { university: 'HKU',                  region: 'Asia-Pacific', status: 'target', rank: 'Top 5 (APAC)', network: 'strong',   gpa: '3.5+', clubs: 'HKU Finance Society; HKU Investment Club' },
  { university: 'AUB',                  region: 'Middle East',  status: 'semi',  rank: 'Top 5 (ME)',    network: 'moderate', gpa: '3.2+', clubs: 'AUB Finance Club; AUB Investment Society' },
  { university: 'SP Jain',              region: 'Middle East',  status: 'non-target', rank: 'Top 10 (ME)', network: 'moderate', gpa: '2.9+', clubs: 'SPJAIN Finance Club' },
];

// ── Term card ────────────────────────────────────────────────────────────────

function TermCard({ term }: { term: Term }) {
  const [open, setOpen] = useState(false);
  const label   = CATS.find(c => c.id === term.cat)?.label ?? term.cat;
  const accent  = CAT_ACCENT[term.cat] ?? { bg: 'var(--bg-muted)', text: 'var(--text-secondary)' };

  return (
    <div
      onClick={() => setOpen(o => !o)}
      className="cursor-pointer rounded-xl border transition-all duration-150 p-4"
      style={{
        background: open ? 'var(--bg-subtle)' : 'var(--bg-base)',
        borderColor: open ? 'var(--border-default)' : 'var(--border-soft)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{term.name}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: accent.bg, color: accent.text }}
          >
            {label}
          </span>
          <ChevronDown
            size={13}
            style={{ color: 'var(--text-disabled)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-soft)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{term.def}</p>
              {term.formula && (
                <div
                  className="mt-2.5 font-mono text-xs px-3 py-2 rounded-lg border"
                  style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-soft)', color: 'var(--accent)' }}
                >
                  {term.formula}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Vocab tab ────────────────────────────────────────────────────────────────

function VocabTab() {
  const [query, setQuery]       = useState('');
  const [activeCat, setActiveCat] = useState('all');

  const filtered = TERMS.filter(t => {
    const catOk = activeCat === 'all' || t.cat === activeCat;
    const q = query.toLowerCase();
    return catOk && (!q || t.name.toLowerCase().includes(q) || t.def.toLowerCase().includes(q));
  });

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-disabled)' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search any finance term…"
          className="w-full text-sm pl-9 pr-4 py-2.5 rounded-lg border focus:outline-none transition-all"
          style={{
            background: 'var(--bg-base)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-primary)',
          }}
          onFocus={e => (e.target as HTMLElement).style.borderColor = 'var(--accent)'}
          onBlur={e  => (e.target as HTMLElement).style.borderColor = 'var(--border-default)'}
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {CATS.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all"
            style={{
              background: activeCat === c.id ? 'var(--accent)' : 'var(--bg-subtle)',
              borderColor: activeCat === c.id ? 'var(--accent)' : 'var(--border-soft)',
              color: activeCat === c.id ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
        {filtered.length} term{filtered.length !== 1 ? 's' : ''} · tap to expand
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--text-tertiary)' }}>No terms found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filtered.map(t => <TermCard key={t.name} term={t} />)}
        </div>
      )}
    </div>
  );
}

// ── University card ──────────────────────────────────────────────────────────

function UniCard({ uni }: { uni: University }) {
  const statusStyle = {
    target:      { bg: '#f0fdf4', text: '#15803d', label: 'Target'      },
    semi:        { bg: '#fffbeb', text: '#b45309', label: 'Semi-Target' },
    'non-target':{ bg: '#f8fafc', text: '#64748b', label: 'Non-Target' },
  }[uni.status];

  const networkColor = { elite: '#eab308', strong: '#22c55e', moderate: 'var(--text-tertiary)' }[uni.network];
  const clubs = uni.clubs.split(';').map(c => c.trim()).filter(Boolean);

  return (
    <div
      className="rounded-xl border p-5 transition-all"
      style={{ background: 'var(--bg-base)', borderColor: 'var(--border-soft)' }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{uni.university}</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: 'var(--bg-muted)', color: 'var(--text-tertiary)' }}>
              {uni.region}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{uni.rank}</span>
          </div>
        </div>
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0"
          style={{ background: statusStyle.bg, color: statusStyle.text }}
        >
          {statusStyle.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Network', value: uni.network, color: networkColor },
          { label: 'Min GPA', value: uni.gpa,     color: 'var(--accent)' },
          { label: 'Rank',    value: uni.rank,     color: 'var(--text-secondary)' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-lg px-3 py-2.5"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)' }}
          >
            <p className="text-[9px] font-medium uppercase mb-0.5" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>{label}</p>
            <p className="text-xs font-semibold capitalize" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[9px] font-medium uppercase mb-2" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>Key Finance Clubs</p>
        <div className="flex flex-wrap gap-1.5">
          {clubs.map(club => (
            <span
              key={club}
              className="text-[10px] font-medium px-2 py-1 rounded-md border"
              style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)', color: 'var(--text-secondary)' }}
            >
              {club}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Universities tab ─────────────────────────────────────────────────────────

function UniversitiesTab() {
  const [query, setQuery]           = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');

  const statusMap: Record<string, University['status']> = { Target: 'target', 'Semi-Target': 'semi', 'Non-Target': 'non-target' };

  const unis = UNIS.filter(u => {
    const regOk  = activeRegion === 'All' || u.region === activeRegion;
    const statOk = activeStatus === 'All' || u.status === statusMap[activeStatus];
    const q = query.toLowerCase();
    return regOk && statOk && (!q || u.university.toLowerCase().includes(q) || u.region.toLowerCase().includes(q));
  });

  const FilterPills = ({ items, active, onSelect }: { items: string[]; active: string; onSelect: (v: string) => void }) => (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className="text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all"
          style={{
            background: active === item ? 'var(--accent)' : 'var(--bg-subtle)',
            borderColor: active === item ? 'var(--accent)' : 'var(--border-soft)',
            color: active === item ? '#fff' : 'var(--text-secondary)',
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-disabled)' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search university or country…"
          className="w-full text-sm pl-9 pr-4 py-2.5 rounded-lg border focus:outline-none transition-all"
          style={{ background: 'var(--bg-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          onFocus={e => (e.target as HTMLElement).style.borderColor = 'var(--accent)'}
          onBlur={e  => (e.target as HTMLElement).style.borderColor = 'var(--border-default)'}
        />
      </div>

      <div className="flex flex-col gap-2.5 mb-5">
        <FilterPills items={REGIONS}  active={activeRegion} onSelect={setActiveRegion} />
        <FilterPills items={STATUSES} active={activeStatus} onSelect={setActiveStatus} />
      </div>

      <p className="text-[11px] mb-4" style={{ color: 'var(--text-tertiary)' }}>
        {unis.length} universit{unis.length === 1 ? 'y' : 'ies'}
      </p>

      {unis.length === 0 ? (
        <div className="text-center py-20 text-sm" style={{ color: 'var(--text-tertiary)' }}>No universities found.</div>
      ) : (
        <div className="flex flex-col gap-3 pb-20">
          {unis.map(u => <UniCard key={u.university} uni={u} />)}
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Resources() {
  const [activeTab, setActiveTab] = useState<'vocab' | 'universities'>('vocab');

  const TABS = [
    { key: 'vocab',        label: 'Vocabulary'   },
    { key: 'universities', label: 'Universities' },
  ] as const;

  return (
    <div className="min-h-full max-w-4xl mx-auto py-6 px-4 animate-fade-in" style={{ color: 'var(--text-primary)' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-xl font-semibold mb-1" style={{ letterSpacing: '-0.025em' }}>Resources</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Your finance reference hub — vocabulary and top universities worldwide.
        </p>
      </motion.div>

      {/* Tab bar */}
      <div
        className="flex gap-0.5 p-0.5 rounded-lg mb-6 w-fit"
        style={{ background: 'var(--bg-muted)' }}
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              background: activeTab === key ? 'var(--bg-base)' : 'transparent',
              color: activeTab === key ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: activeTab === key ? 'var(--shadow-xs)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'vocab' ? <VocabTab /> : <UniversitiesTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}