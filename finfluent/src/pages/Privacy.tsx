import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import logo from '../assets/logo.png';

const LAST_UPDATED = 'May 2026';

const SECTIONS = [
  {
    title: '1. Information we collect',
    body: `When you create an account we collect your name and email address via Google OAuth — we never see your Google password. As you use the platform we store your learning progress (which modules and steps you have completed), your FinCoin balance, your streak data, and any responses you share with the AI tutor. We do not collect payment information because Finfluent is free.`,
  },
  {
    title: '2. How we use your information',
    body: `Your data is used exclusively to operate and improve Finfluent. Specifically: to save your learning progress across sessions, to personalise your AI tutor conversations, to calculate your position on the global leaderboard (using only your display name and coin balance), and to send you occasional product updates if you have opted in. We do not sell your data. We do not use your data for advertising.`,
  },
  {
    title: '3. Data storage and security',
    body: `Your data is stored in Supabase, a SOC 2 Type II certified cloud database provider. All data is encrypted in transit (TLS 1.2+) and at rest (AES-256). We use row-level security policies so that your data is only accessible to your own authenticated session. Our AI features are powered by third-party language model providers; prompts are sent with strict data retention restrictions — messages are not used to train external models.`,
  },
  {
    title: '4. Data sharing',
    body: `We share data with the following categories of service provider only as needed to operate the platform: authentication (Google OAuth), database hosting (Supabase), AI inference (OpenRouter/Anthropic), and analytics (anonymised, aggregated usage only). We do not share personally identifiable information with advertisers, brokers, or third parties for commercial purposes.`,
  },
  {
    title: '5. Leaderboard and public data',
    body: `The global leaderboard displays your display name (as set in your Google account), your current title, and your lifetime FinCoin total. This information is visible to all logged-in Finfluent users. If you would prefer not to appear on the leaderboard, you can request removal by emailing finfluent-app@gmail.com.`,
  },
  {
    title: '6. Your rights',
    body: `You have the right to access, correct, export, or delete your personal data at any time. To exercise any of these rights, email finfluent-app@gmail.com from the address associated with your account. We will respond within 30 days. You may also delete your account from your Profile settings page, which will permanently erase all data we hold about you.`,
  },
  {
    title: '7. Cookies',
    body: `We use a single session cookie to keep you logged in between visits. We do not use third-party tracking cookies, advertising cookies, or analytics cookies that identify you personally. If you disable cookies entirely, you will need to log in on every visit.`,
  },
  {
    title: '8. Children',
    body: `Finfluent is intended for users aged 16 and over. We do not knowingly collect data from children under 16. If you believe a child has created an account, please contact us at finfluent-app@gmail.com and we will delete the account promptly.`,
  },
  {
    title: '9. Changes to this policy',
    body: `We may update this policy occasionally. When we do, we will update the "Last updated" date at the top of this page and, for material changes, notify users by email. Continued use of Finfluent after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '10. Contact',
    body: `For any questions about this policy or your data, contact us at finfluent-app@gmail.com. We are happy to help.`,
  },
];

export default function Privacy() {
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
            <Shield size={18} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Privacy policy</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2" style={{ letterSpacing: '-0.03em' }}>Your privacy matters.</h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Last updated: {LAST_UPDATED}</p>
          <div className="mt-5 p-4 rounded-xl border" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Short version:</strong>{' '}
              We collect only what we need to run Finfluent, we never sell your data, we never use it for advertising,
              and you can delete everything at any time. The full version is below.
            </p>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="flex flex-col gap-8">
          {SECTIONS.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: i * 0.03 }}>
              <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Contact box */}
        <div className="mt-12 p-5 rounded-2xl border" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Questions about your data?</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Email us at{' '}
            <a href="mailto:finfluent-app@gmail.com" style={{ color: 'var(--accent)' }}>finfluent-app@gmail.com</a>.
            {' '}We are a small team and will respond within 48 hours on weekdays.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 border-t" style={{ borderColor: 'var(--border-soft)' }}>
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>© 2026 Finfluent. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {[{ label: 'About', href: '/about' }, { label: 'Terms', href: '/terms' }, { label: 'Contact', href: '/contact' }].map(l => (
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