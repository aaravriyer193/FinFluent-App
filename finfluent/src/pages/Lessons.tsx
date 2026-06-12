import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Check,
  Book, Wallet, PiggyBank, TrendingUp, Landmark,
  LineChart, Coins, CreditCard, Gem, ShieldCheck,
  Briefcase, BarChart, PieChart, Target, Rocket, Crown,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import mascot from '../assets/mascot.gif';

// ── config ────────────────────────────────────────────────────────────────────

const MODULE_CONFIG = [
  { icon: Book,        color: '#6366f1', bg: '#eef2ff', shadow: '#c7d2fe', label: 'Basics'     },
  { icon: Wallet,      color: '#14b8a6', bg: '#f0fdfa', shadow: '#99f6e4', label: 'Budgeting'  },
  { icon: PiggyBank,   color: '#22c55e', bg: '#f0fdf4', shadow: '#bbf7d0', label: 'Saving'     },
  { icon: TrendingUp,  color: '#f59e0b', bg: '#fffbeb', shadow: '#fde68a', label: 'Growth'     },
  { icon: Landmark,    color: '#a855f7', bg: '#faf5ff', shadow: '#e9d5ff', label: 'Banking'    },
  { icon: LineChart,   color: '#ec4899', bg: '#fdf2f8', shadow: '#fbcfe8', label: 'Markets'    },
  { icon: Coins,       color: '#f97316', bg: '#fff7ed', shadow: '#fed7aa', label: 'Crypto'     },
  { icon: CreditCard,  color: '#ef4444', bg: '#fef2f2', shadow: '#fecaca', label: 'Credit'     },
  { icon: Gem,         color: '#8b5cf6', bg: '#f5f3ff', shadow: '#ddd6fe', label: 'Assets'     },
  { icon: ShieldCheck, color: '#0ea5e9', bg: '#f0f9ff', shadow: '#bae6fd', label: 'Insurance'  },
  { icon: Briefcase,   color: '#10b981', bg: '#ecfdf5', shadow: '#a7f3d0', label: 'Career'     },
  { icon: BarChart,    color: '#d946ef', bg: '#fdf4ff', shadow: '#f5d0fe', label: 'Analysis'   },
  { icon: PieChart,    color: '#06b6d4', bg: '#ecfeff', shadow: '#a5f3fc', label: 'Portfolio'  },
  { icon: Target,      color: '#3b82f6', bg: '#eff6ff', shadow: '#bfdbfe', label: 'Goals'      },
  { icon: Rocket,      color: '#f43f5e', bg: '#fff1f2', shadow: '#fecdd3', label: 'Advanced'   },
  { icon: Crown,       color: '#eab308', bg: '#fefce8', shadow: '#fef08a', label: 'Mastery'    },
];

// sine-wave path: nodes alternate left / center / right in a smooth S-curve
const WAVE = [0, 0.6, 1, 0.6, 0, -0.6, -1, -0.6, 0, 0.6, 1, 0.6, 0, -0.6, -1, -0.6];

const NODE_R   = 36;   // node radius
const SPACING  = 108;  // vertical gap between node centres
const CX       = 160;  // horizontal centre of the SVG
const SWAY     = 68;   // max horizontal offset from centre
const SVG_W    = 320;

// ── helpers ───────────────────────────────────────────────────────────────────

function nodeX(i)  { return CX + WAVE[i % WAVE.length] * SWAY; }
function nodeY(i)  { return NODE_R + 24 + i * SPACING; }

// cubic bezier control points for a smooth winding path
function pathD(ax, ay, bx, by) {
  const cy1 = ay + SPACING * 0.5;
  const cy2 = by - SPACING * 0.5;
  return `M ${ax} ${ay} C ${ax} ${cy1}, ${bx} ${cy2}, ${bx} ${by}`;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function Lessons() {
  const { user }   = useAppContext();
  const navigate   = useNavigate();

  const [progress,  setProgress]  = useState([]);
  const [modules,   setModules]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hovered,   setHovered]   = useState(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [pRes, mRes] = await Promise.all([
          supabase.from('user_progress').select('*').eq('user_id', user.id),
          supabase.from('modules').select('*').order('id', { ascending: true }),
        ]);
        if (pRes.data) setProgress(pRes.data);
        if (mRes.data) setModules(mRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  const status = (n) => {
    if (n === 1) return progress.find(p => p.module_id === 1)?.status === 'completed' ? 'completed' : 'unlocked';
    const prev = progress.find(p => p.module_id === n - 1);
    const curr = progress.find(p => p.module_id === n);
    if (curr?.status === 'completed') return 'completed';
    if (prev?.status === 'completed') return 'unlocked';
    return 'locked';
  };

  const completedCount = MODULE_CONFIG.filter((_, i) => status(i + 1) === 'completed').length;
  const pct            = Math.round((completedCount / MODULE_CONFIG.length) * 100);

  const SVG_H = nodeY(MODULE_CONFIG.length - 1) + NODE_R + 40;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3" style={{ color: 'var(--text-tertiary)' }}>
        <img src={mascot} className="w-10 h-10 object-contain opacity-40" alt="" />
        <span className="text-xs">Loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col items-center pb-28" style={{ color: 'var(--text-primary)' }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xs px-4 pt-6 pb-4"
      >
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
              Your path
            </p>
            <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.035em', color: 'var(--text-primary)' }}>
              Roadmap
            </h1>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--accent)', letterSpacing: '-0.04em' }}>{pct}%</p>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {completedCount}/{MODULE_CONFIG.length} done
            </p>
          </div>
        </div>

        {/* progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--accent)' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
        </div>
      </motion.div>

      {/* ── Map ── */}
      <div style={{ width: '100%', maxWidth: 360, position: 'relative' }}>
        <svg
          width="100%"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="xMidYMin meet"
          style={{ overflow: 'visible' }}
        >
          {/* ── trail segments ── */}
          {MODULE_CONFIG.slice(0, -1).map((_, i) => {
            const ax = nodeX(i),   ay = nodeY(i);
            const bx = nodeX(i+1), by = nodeY(i+1);
            const st = status(i + 1);
            const done = st === 'completed';

            return (
              <g key={`trail-${i}`}>
                {/* base track */}
                <path
                  d={pathD(ax, ay, bx, by)}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* filled if done */}
                {done && (
                  <path
                    d={pathD(ax, ay, bx, by)}
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                )}
                {/* dashed if next is current */}
                {!done && status(i + 2) === 'unlocked' && (
                  <path
                    d={pathD(ax, ay, bx, by)}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="6 7"
                  />
                )}
              </g>
            );
          })}

          {/* ── nodes ── */}
          {MODULE_CONFIG.map((cfg, i) => {
            const modNum   = i + 1;
            const st       = status(modNum);
            const isCompleted = st === 'completed';
            const isUnlocked  = st === 'unlocked';
            const isLocked    = st === 'locked';
            const clickable   = isCompleted || isUnlocked;
            const modData  = modules.find(m => m.id === modNum);
            const Icon     = cfg.icon;
            const cx       = nodeX(i);
            const cy       = nodeY(i);
            const labelRight = WAVE[i % WAVE.length] <= 0; // label on right if node is left-ish

            // colors
            const ringColor  = isCompleted ? '#22c55e' : isUnlocked ? cfg.color : '#e2e8f0';
            const fillColor  = isCompleted ? '#f0fdf4' : isUnlocked ? cfg.bg    : '#f8fafc';
            const iconColor  = isCompleted ? '#16a34a' : isUnlocked ? cfg.color : '#94a3b8';
            const shadowColor= isCompleted ? '#bbf7d0' : isUnlocked ? cfg.shadow: '#f1f5f9';

            return (
              <g key={modNum}>
                {/* pulse ring for current */}
                {isUnlocked && (
                  <motion.circle
                    cx={cx} cy={cy}
                    r={NODE_R + 6}
                    fill="none"
                    stroke={cfg.color}
                    strokeWidth="2"
                    animate={{ r: [NODE_R + 4, NODE_R + 14], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}

                {/* shadow */}
                <circle cx={cx} cy={cy + 5} r={NODE_R} fill={shadowColor} opacity={0.7} />

                {/* main circle */}
                <motion.circle
                  cx={cx} cy={cy}
                  r={NODE_R}
                  fill={fillColor}
                  stroke={ringColor}
                  strokeWidth={isUnlocked ? 3 : 2.5}
                  style={{ cursor: clickable ? 'pointer' : 'default' }}
                  onClick={() => clickable && navigate(`/module/${modNum}`)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  whileHover={clickable ? { scale: 1.1 } : {}}
                  whileTap={clickable ? { scale: 0.93 } : {}}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                />

                {/* completed crown ring */}
                {isCompleted && (
                  <circle
                    cx={cx} cy={cy}
                    r={NODE_R - 7}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="1.5"
                    strokeDasharray="3 4"
                    opacity={0.6}
                  />
                )}

                {/* icon via foreignObject */}
                <foreignObject
                  x={cx - 14} y={cy - 14}
                  width={28} height={28}
                  style={{ pointerEvents: 'none', overflow: 'visible' }}
                >
                  <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>
                    {isCompleted
                      ? <Check size={18} strokeWidth={3} />
                      : isLocked
                      ? <Lock size={14} strokeWidth={2} />
                      : <Icon size={18} strokeWidth={1.7} />
                    }
                  </div>
                </foreignObject>

                {/* module number above node */}
                <text
                  x={cx}
                  y={cy - NODE_R - 6}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill={isLocked ? '#cbd5e1' : isCompleted ? '#22c55e' : cfg.color}
                  style={{ userSelect: 'none', letterSpacing: '0.04em' }}
                >
                  {isCompleted ? '✓' : `${modNum}`}
                </text>

                {/* inline label pill — always visible, to the side */}
                <foreignObject
                  x={labelRight ? cx + NODE_R + 8 : cx - NODE_R - 8 - 110}
                  y={cy - 18}
                  width={110}
                  height={36}
                  style={{ pointerEvents: 'none', overflow: 'visible' }}
                >
                  <div style={{
                    height: 36,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: labelRight ? 'flex-start' : 'flex-end',
                  }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isLocked ? '#94a3b8' : isCompleted ? '#15803d' : cfg.color,
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                    }}>
                      {isLocked ? 'Locked' : (modData?.title || cfg.label)}
                    </span>
                    <span style={{
                      fontSize: 9,
                      fontWeight: 500,
                      color: '#94a3b8',
                      lineHeight: 1.2,
                      letterSpacing: '0.03em',
                      whiteSpace: 'nowrap',
                    }}>
                      Module {modNum}
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}