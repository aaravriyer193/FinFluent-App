import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { generateAIResponse } from '../lib/openrouter';

import mascot from '../assets/mascot.gif';
import logo from '../assets/logo.png';

export default function Onboarding() {
  const { user, refreshUserData } = useAppContext();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { role: 'assistant' | 'user'; content: string }[]
  >([
    {
      role: 'assistant',
      content: `Hey ${user?.full_name?.split(' ')[0] || 'there'}! I'm your Finfluent Tutor.\n\nTell me about your financial goals, or jump straight in by clicking **Enter Platform**.`,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userAnswer = input.trim();
    setInput('');

    const updatedHistory = [
      ...chatHistory,
      { role: 'user' as const, content: userAnswer },
    ];
    setChatHistory(updatedHistory);
    setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);
    setIsTyping(true);

    const aiPrompt = `The user says: "${userAnswer}". You are the Finfluent AI Tutor. Give a warm, encouraging 1-to-2 sentence response using markdown. Keep the conversation focused on their financial goals.`;

    await generateAIResponse(aiPrompt, null, updatedHistory.slice(-4), chunkText => {
      setChatHistory(prev => {
        const newH = [...prev];
        newH[newH.length - 1].content = chunkText;
        return newH;
      });
    });

    setIsTyping(false);
  };

  const completeOnboarding = async () => {
    if (!user) return;
    setIsLocking(true);

    try {
      let finalSummary =
        'User skipped onboarding chat. Goals unknown. General financial literacy path recommended.';
      let parsedNotifications = [];

      if (chatHistory.length > 1) {
        const fullConversation = chatHistory
          .map(m => `${m.role.toUpperCase()}: ${m.content}`)
          .join('\n');

        const extractionPrompt = `
          You are an expert data extractor for a financial app. Analyze the following onboarding conversation and extract ONLY the user's specific financial goals, their current experience level, and motivations.
          Format the output as a clean, concise bulleted list of facts. Do not include conversational filler.
          
          CONVERSATION LOG:
          ${fullConversation}
        `;

        let extractedSummary = '';
        await generateAIResponse(extractionPrompt, null, [], chunk => {
          extractedSummary = chunk;
        });
        if (extractedSummary.trim()) finalSummary = extractedSummary.trim();

        const notificationPrompt = `
          Based on the following user profile and goals, generate 10 highly engaging, personalized push notifications for our financial app called "Finfluent".
          
          Constraints:
          1. Exactly 10 notifications.
          2. Max 2 short lines each. Keep them punchy.
          3. Create urgency, motivation, or curiosity directly related to their specific goals.
          4. Output STRICTLY as a valid JSON array of objects. Do not use markdown blocks. Do not include any text outside the JSON array.
          
          Format: [{"notification": "text here"}, {"notification": "text here"}]
          
          USER PROFILE:
          ${finalSummary}
        `;

        let notificationsRaw = '';
        await generateAIResponse(notificationPrompt, null, [], chunk => {
          notificationsRaw = chunk;
        });

        try {
          const cleanedJson = notificationsRaw
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
          parsedNotifications = JSON.parse(cleanedJson);
        } catch {
          parsedNotifications = [
            { notification: 'Time to secure the bag! Open Finfluent and continue your journey.' },
            { notification: "Your daily financial lesson is waiting. Don't lose your streak!" },
          ];
        }
      } else {
        parsedNotifications = [
          { notification: 'Ready to master your money? Jump into your first Finfluent module!' },
          { notification: 'Consistency is key. Secure your daily FinCoins now!' },
        ];
      }

      await supabase
        .from('profiles')
        .update({
          has_completed_onboarding: true,
          ai_context_summary: finalSummary,
          notifications: parsedNotifications,
        })
        .eq('id', user.id);

      await refreshUserData();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error finalizing onboarding:', error);
      setIsLocking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex font-sans"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* ── LEFT PANEL (desktop) ── */}
      <aside
        className="hidden md:flex flex-col justify-between w-72 shrink-0 border-r p-8"
        style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <img src={logo} alt="Finfluent" className="w-8 h-8 object-contain" />
            <span
              className="text-base font-bold"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              Finfluent
            </span>
          </div>

          <h2
            className="text-2xl font-semibold mb-2 leading-tight"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
          >
            Welcome to
            <br />
            <span style={{ color: 'var(--accent)' }}>The Platform.</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            Tell your tutor about your goals to get a personalised wealth journey.
          </p>
        </div>

        <motion.img
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          src={mascot}
          alt=""
          className="w-32 h-32 object-contain opacity-60 self-center"
        />
      </aside>

      {/* ── CHAT PANEL ── */}
      <div className="flex-1 flex flex-col min-h-0">

        {/* Top bar */}
        <div
          className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 border-b"
          style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border-soft)' }}
        >
          <div className="flex items-center gap-2 md:hidden">
            <img src={logo} alt="" className="w-7 h-7 object-contain" />
            <span
              className="text-sm font-bold"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              Finfluent
            </span>
          </div>
          <p
            className="hidden md:block text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Setup your profile
          </p>

          <button
            onClick={completeOnboarding}
            disabled={isLocking}
            className="btn-primary inline-flex items-center gap-1.5 disabled:opacity-60"
            style={{ borderRadius: '8px', height: '34px', padding: '0 14px', fontSize: '0.8125rem' }}
          >
            {isLocking ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                Enter Platform
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 flex flex-col gap-4 min-h-0">
          <AnimatePresence initial={false}>
            {chatHistory.map((msg, i) => {
              const isStreamingPlaceholder = msg.role === 'assistant' && !msg.content;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <img
                      src={mascot}
                      alt="Tutor"
                      className="w-8 h-8 object-contain mr-2.5 self-end shrink-0"
                    />
                  )}

                  <div
                    className="max-w-[80%] md:max-w-[65%] px-3.5 py-2.5 text-sm leading-relaxed"
                    style={
                      msg.role === 'user'
                        ? {
                            background: 'var(--accent)',
                            color: '#fff',
                            borderRadius: '12px 4px 12px 12px',
                          }
                        : {
                            background: 'var(--bg-subtle)',
                            border: '1px solid var(--border-soft)',
                            color: 'var(--text-primary)',
                            borderRadius: '4px 12px 12px 12px',
                          }
                    }
                  >
                    {isStreamingPlaceholder ? (
                      <div className="flex items-center gap-1 py-0.5">
                        {[0, 0.15, 0.3].map((delay, idx) => (
                          <motion.div
                            key={idx}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: 'var(--accent)' }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 0.9, delay }}
                          />
                        ))}
                      </div>
                    ) : msg.role === 'assistant' ? (
                      <ReactMarkdown className="prose prose-sm max-w-none [&_strong]:font-semibold [&_p]:mb-1 last:[&_p]:mb-0">
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-2 shrink-0" />
        </div>

        {/* Input bar */}
        <div
          className="shrink-0 px-4 md:px-6 py-3 border-t"
          style={{
            background: 'var(--bg-subtle)',
            borderColor: 'var(--border-soft)',
            paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
          }}
        >
          <form onSubmit={handleSend} className="flex items-center gap-2 max-w-2xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isTyping || isLocking}
              placeholder="Chat with your tutor…"
              className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border outline-none transition-colors"
              style={{
                background: 'var(--bg-base)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping || isLocking}
              className="p-2.5 rounded-xl transition-colors shrink-0"
              style={{
                background:
                  input.trim() && !isTyping && !isLocking
                    ? 'var(--accent)'
                    : 'var(--bg-overlay)',
                color:
                  input.trim() && !isTyping && !isLocking ? '#fff' : 'var(--text-disabled)',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}