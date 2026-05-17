import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Target, Heart, Zap } from 'lucide-react';

import logo   from '../assets/logo.png';
import mascot from '../assets/mascot.gif';
import logo1  from '../assets/logo1.png';
import logo2  from '../assets/logo2.png';
import logo3  from '../assets/logo3.png';

const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
};

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Courses',  href: '/#courses'  },
  { label: 'Reviews',  href: '/#testimonials' },
];

const VALUES = [
  {
    icon: <BookOpen size={18} />,
    title: 'Accessible education',
    desc: 'Financial literacy should not be gated behind expensive courses or confusing jargon. We strip it down to what actually matters for students.',
  },
  {
    icon: <Target size={18} />,
    title: 'Built for consistency',
    desc: 'Real understanding comes from showing up daily. Every feature — streaks, FinCoins, leaderboards — is designed to make that easy and rewarding.',
  },
  {
    icon: <Zap size={18} />,
    title: 'Practical first',
    desc: 'We focus on the skills you can apply immediately: budgeting your semester, understanding your first pay stub, knowing what a credit score actually is.',
  },
  {
    icon: <Heart size={18} />,
    title: 'Student-centred',
    desc: 'Everything on this platform was shaped by feedback from real college students. If it does not help you in your actual life, we cut it.',
  },
];

const TEAM = [
  { name: 'Kabir',  role: 'Co founder',        initial: 'K' },
  { name: 'Sparsh Sultania',    role: 'Co founder',    initial: 'S' },
  { name: 'Artem Khuzin',   role: 'Socials',         initial: 'A' },
  { name: 'Aarav Iyer',  role: 'Technology',  initial: 'A' },
  { name: 'Ashvik Mandhani',   role: 'Community',    initial: 'A' },
  { name: 'Vivaan',   role: 'Operations',    initial: 'A' },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-10"
        style={{ height: 56, background: 'var(--bg-base)', borderBottom: '1px solid var(--border-soft)' }}
      >
        <a href="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Finfluent" className="w-7 h-7 object-contain" />
          <span className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Finfluent</span>
        </a>
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
              {l.label}
            </a>
          ))}
        </div>
        <a href="/login"
          className="text-xs font-semibold px-3.5 py-1.5 rounded-lg"
          style={{ background: 'var(--accent)', color: '#fff', textDecoration: 'none' }}>
          Start free
        </a>
      </nav>

      <div className="pt-20 pb-24 px-6 max-w-3xl mx-auto">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 mb-10 text-xs font-medium"
          style={{ color: 'var(--text-tertiary)', background: 'transparent', border: 'none', height: 'auto', padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          <ArrowLeft size={13} /> Back to home
        </motion.button>

        {/* Hero */}
        <motion.div {...reveal} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <img src={mascot} alt="" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold mb-5" style={{ letterSpacing: '-0.04em' }}>
            We believe everyone<br />deserves financial clarity.
          </h1>
          <p className="text-base leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            Finfluent was started because financial literacy is treated as a privilege.
            Most students leave university having never opened an investment account, filed their own taxes,
            or understood what compound interest actually does to their savings. We are here to change that —
            one lesson at a time, completely free.
          </p>
        </motion.div>

        {/* Divider */}
        <div className="border-t mb-16" style={{ borderColor: 'var(--border-soft)' }} />

        {/* Story */}
        <motion.div {...reveal} className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>Our story</p>
          <h2 className="text-2xl font-semibold mb-4" style={{ letterSpacing: '-0.03em' }}>Built in a dorm room, for dorm rooms.</h2>
          <div className="flex flex-col gap-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <p>
              Finfluent began when our founder, realised he had no idea
              what to do with his first internship salary. The university offered no course on personal finance.
              The internet was full of conflicting advice, paywalled content, and influencers selling courses.
              There was nothing built for students that was actually free, structured, and honest.
            </p>
            <p>
              We built the first version in three weeks. The idea was simple: what if learning to manage money
              felt like a game? Daily lessons, streaks, a leaderboard, real feedback — the same mechanics that
              make language-learning apps sticky, applied to financial literacy.
            </p>
            <p>
              Today Finfluent covers budgeting, investing, taxes, credit, real estate, and crypto —
              across 16 structured modules with video lessons, interactive simulations, and an AI tutor
              available anytime. It is still completely free. It always will be.
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div {...reveal} className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: 'var(--accent)' }}>What we believe</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {VALUES.map((v, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.35 }}
                className="p-5 rounded-2xl border"
                style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                  {v.icon}
                </div>
                <p className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{v.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div {...reveal} className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: 'var(--accent)' }}>The team</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TEAM.map((member, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-4 rounded-xl border"
                style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                  {member.initial}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sponsors */}
        <motion.div {...reveal} className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: 'var(--text-disabled)' }}>Sponsored by</p>
          <div className="flex items-center">
            {[logo1, logo2, logo3].map((src, i) => (
              <div key={i} className="flex items-center justify-center flex-1"
                style={{ borderLeft: i > 0 ? '1px solid var(--border-soft)' : 'none', padding: '0 24px' }}>
                <img src={src} alt={`Sponsor ${i + 1}`}
                  style={{ height: 26, width: 'auto', objectFit: 'contain', filter: 'grayscale(1)', opacity: 0.4 }} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...reveal}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border"
          style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}>
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Ready to start learning?</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Free for all students. No credit card needed.</p>
          </div>
          <a href="/login"
            className="shrink-0 text-sm font-semibold px-5 py-2.5 rounded-xl"
            style={{ background: 'var(--accent)', color: '#fff', textDecoration: 'none' }}>
            Get started free
          </a>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 border-t" style={{ borderColor: 'var(--border-soft)' }}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>© 2026 Finfluent. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {[{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }, { label: 'Contact', href: '/contact' }].map(l => (
              <a key={l.label} href={l.href} className="text-xs" style={{ color: 'var(--text-disabled)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-disabled)')}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}