import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import logo from '../assets/logo.png';

const LAST_UPDATED = 'May 2026';

const SECTIONS = [
  {
    title: '1. Acceptance of terms',
    body: `By creating an account or using Finfluent ("the platform", "we", "us"), you agree to these Terms of Service. If you do not agree, please do not use the platform. We reserve the right to update these terms; continued use after changes constitutes acceptance.`,
  },
  {
    title: '2. Eligibility',
    body: `You must be at least 16 years old to use Finfluent. By creating an account you confirm that you meet this requirement. We make no representation that the platform is appropriate or available outside the regions where we operate.`,
  },
  {
    title: '3. Account registration',
    body: `You register using Google OAuth. You are responsible for keeping your account secure and for all activity that occurs under your account. Do not share your login with others. Notify us immediately at finfluent-app@gmail.com if you suspect unauthorised access.`,
  },
  {
    title: '4. Free access and FinCoins',
    body: `Finfluent is free to use. FinCoins are a virtual in-platform reward currency earned through completing lessons and maintaining streaks. FinCoins have no monetary value, cannot be transferred to other users, cannot be exchanged for cash, and are not redeemable outside the platform. We reserve the right to modify, suspend, or discontinue the FinCoin system at any time without liability.`,
  },
  {
    title: '5. Acceptable use',
    body: `You agree not to: attempt to reverse-engineer, scrape, or automate interactions with the platform; use the platform to distribute spam or malicious content; impersonate other users or Finfluent staff; circumvent any rate limits or security measures; or use automated means to artificially inflate your FinCoin balance or streak. Violation may result in immediate account suspension.`,
  },
  {
    title: '6. AI tutor',
    body: `The Finfluent AI tutor is powered by third-party language models and is provided for educational guidance only. It does not constitute professional financial, investment, legal, or tax advice. You should not rely on AI tutor output for making actual financial decisions. Always verify important financial information with a qualified professional.`,
  },
  {
    title: '7. Educational content',
    body: `All content on Finfluent — including module lessons, videos, simulations, and written material — is intended for general educational purposes only. Nothing on this platform constitutes personalised financial advice. Investment involves risk and past performance is not a guide to future results. We are not regulated by any financial authority.`,
  },
  {
    title: '8. Intellectual property',
    body: `All platform content, design, code, and branding is owned by Finfluent or its licensors. You may not copy, reproduce, distribute, or create derivative works from platform content without express written permission. User-generated content (e.g. messages to the AI tutor) remains yours; by submitting it you grant us a limited licence to process it to deliver the service.`,
  },
  {
    title: '9. Third-party services',
    body: `Finfluent integrates with third-party services including Google (authentication), Supabase (database), and AI providers. Your use of these integrations is also subject to their respective terms and privacy policies. We are not responsible for third-party service outages or changes.`,
  },
  {
    title: '10. Disclaimers and limitation of liability',
    body: `The platform is provided "as is" without warranties of any kind. To the fullest extent permitted by law, Finfluent shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the platform. Our total liability to you for any claim shall not exceed £100.`,
  },
  {
    title: '11. Termination',
    body: `You may delete your account at any time from your Profile settings. We may suspend or terminate your account if you violate these terms, engage in fraudulent activity, or if we discontinue the service. On termination, your data will be deleted in accordance with our Privacy Policy.`,
  },
  {
    title: '12. Governing law',
    body: `These terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
  },
  {
    title: '13. Contact',
    body: `If you have questions about these terms, contact us at finfluent-app@gmail.com.`,
  },
];

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-10"
        style={{ height: 56, background: 'var(--bg-base)', borderBottom: '1px solid var(--border-soft)' }}>
        <a href="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Finfluent" className="w-7 h-7 object-contain" />
          <span className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Finfluent</span>
        </a>
        <a href="/login" className="text-xs font-semibold px-3.5 py-1.5 rounded-lg"
          style={{ background: 'var(--accent)', color: '#fff', textDecoration: 'none' }}>
          Start free
        </a>
      </nav>

      <div className="pt-20 pb-24 px-6 max-w-2xl mx-auto">

        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 mb-10 text-xs font-medium"
          style={{ color: 'var(--text-tertiary)', background: 'transparent', border: 'none', height: 'auto', padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
          <ArrowLeft size={13} /> Back to home
        </motion.button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Terms of service</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2" style={{ letterSpacing: '-0.03em' }}>Terms of service</h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Last updated: {LAST_UPDATED}</p>
          <div className="mt-5 p-4 rounded-xl border" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Short version:</strong>{' '}
              Use Finfluent for learning, not for abuse. FinCoins are virtual and have no cash value.
              The AI tutor is for education only — not professional financial advice. You can delete your account anytime.
            </p>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="flex flex-col gap-7">
          {SECTIONS.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: i * 0.025 }}>
              <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Contact box */}
        <div className="mt-12 p-5 rounded-2xl border" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Questions about these terms?</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Reach us at{' '}
            <a href="mailto:finfluent-app@gmail.com" style={{ color: 'var(--accent)' }}>finfluent-app@gmail.com</a>.
            {' '}We will do our best to answer clearly and promptly.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 border-t" style={{ borderColor: 'var(--border-soft)' }}>
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>© 2026 Finfluent. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {[{ label: 'About', href: '/about' }, { label: 'Privacy', href: '/privacy' }, { label: 'Contact', href: '/contact' }].map(l => (
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