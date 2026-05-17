import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MessageSquare, HelpCircle, Briefcase, Send, CheckCircle2 } from 'lucide-react';

import logo from '../assets/logo.png';

const reveal = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};

const TOPICS = [
  { icon: <HelpCircle size={15} />, label: 'General question' },
  { icon: <MessageSquare size={15} />, label: 'Feedback or suggestion' },
  { icon: <Briefcase size={15} />, label: 'Partnership or sponsorship' },
  { icon: <Mail size={15} />, label: 'Press or media' },
];

const FAQS = [
  { q: 'How quickly will you respond?', a: 'We aim to respond to all messages within 48 hours on weekdays.' },
  { q: 'I found a bug. What should I do?', a: 'Email us at finfluent-app@gmail.com with a description and your device/browser, and we will fix it as soon as possible.' },
  { q: 'Can I partner with Finfluent?', a: 'Yes — select "Partnership or sponsorship" above and tell us about your organisation. We love collaborating with universities, financial institutions, and student groups.' },
  { q: 'Is Finfluent available internationally?', a: 'The platform is available globally in English. We are working on additional languages and region-specific content.' },
];

export default function Contact() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent]   = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    // Compose mailto — since there is no backend, open the default mail client
    const subject = encodeURIComponent(`[Finfluent] ${topic || 'Contact form'} — ${name}`);
    const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nTopic: ${topic || 'Not specified'}\n\n${message}`);
    window.location.href = `mailto:finfluent-app@gmail.com?subject=${subject}&body=${body}`;
    setTimeout(() => { setSending(false); setSent(true); }, 800);
  };

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

      <div className="pt-20 pb-24 px-6 max-w-3xl mx-auto">

        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 mb-10 text-xs font-medium"
          style={{ color: 'var(--text-tertiary)', background: 'transparent', border: 'none', height: 'auto', padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}>
          <ArrowLeft size={13} /> Back to home
        </motion.button>

        {/* Header */}
        <motion.div {...reveal} className="mb-12">
          <h1 className="text-4xl font-semibold mb-3" style={{ letterSpacing: '-0.04em' }}>Get in touch</h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Have a question, idea, or want to work with us? Send us a message and we will get back to you within 48 hours.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Mail size={13} style={{ color: 'var(--accent)' }} />
            <a href="mailto:finfluent-app@gmail.com" className="text-sm font-medium"
              style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              finfluent-app@gmail.com
            </a>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-8">

          {/* Form */}
          <motion.div {...reveal} className="md:col-span-3">
            {sent ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <CheckCircle2 size={40} style={{ color: 'var(--success)' }} />
                <h3 className="text-lg font-semibold" style={{ letterSpacing: '-0.02em' }}>Message sent</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Your email client should have opened. If not, email us directly at{' '}
                  <a href="mailto:finfluent-app@gmail.com" style={{ color: 'var(--accent)' }}>finfluent-app@gmail.com</a>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Topic pills */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Topic</label>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map(t => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => setTopic(t.label)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                        style={{
                          background: topic === t.label ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
                          borderColor: topic === t.label ? 'var(--accent)' : 'var(--border-default)',
                          color: topic === t.label ? 'var(--accent)' : 'var(--text-secondary)',
                          height: 'auto',
                        }}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" style={{ color: 'var(--text-secondary)' }}>Your name</label>
                    <input id="name" type="text" placeholder="Alex Chen"
                      value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label htmlFor="email" style={{ color: 'var(--text-secondary)' }}>Email address</label>
                    <input id="email" type="email" placeholder="alex@university.edu"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" style={{ color: 'var(--text-secondary)' }}>Message</label>
                  <textarea id="message" rows={6} placeholder="Tell us what's on your mind…"
                    value={message} onChange={e => setMessage(e.target.value)} required
                    style={{ resize: 'vertical' }} />
                </div>

                <button type="submit" disabled={sending}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--accent)', color: '#fff', height: 'auto', border: 'none' }}>
                  {sending ? 'Opening mail client…' : <><Send size={14} /> Send message</>}
                </button>
              </form>
            )}
          </motion.div>

          {/* FAQ sidebar */}
          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="md:col-span-2 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-disabled)' }}>
              Quick answers
            </p>
            {FAQS.map((faq, i) => (
              <div key={i} className="p-4 rounded-xl border"
                style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}>
                <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{faq.q}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{faq.a}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 border-t" style={{ borderColor: 'var(--border-soft)' }}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>© 2026 Finfluent. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {[{ label: 'About', href: '/about' }, { label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }].map(l => (
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