'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

/**
 * ProblemAnimation — the visual partner to the "expensive digital filing
 * cabinets" callout on the homepage. Tells the same story the copy tells,
 * in three beats:
 *
 *   1. A complicated Contact Us form is visible and crisp — the way most
 *      industrial-supply sites still capture interest.
 *   2. The form blurs and dims; a Crestline-style chat widget slides in
 *      and plays a 4-bubble lead-capture conversation (visitor question
 *      → bot ask for email → visitor email → bot routes to regional rep).
 *   3. A CRM card slides into the corner showing the captured contact,
 *      deal, and owner — the "info deposited into a CRM" beat that closes
 *      the narrative.
 *
 * Then it loops. Triggered when scrolled into view; respects
 * prefers-reduced-motion (renders the final composite state, no
 * animation). Visual language matches BoltzChatDemo so it reads as
 * "what good looks like" right next to "what most sites have."
 */

// Phase timeline. Times are absolute ms from when the animation starts.
const PHASES = [
  { name: 'form-crisp', at: 0 },
  { name: 'form-blur', at: 1500 },
  { name: 'chat-enter', at: 2400 },
  { name: 'user-msg-1', at: 3300 },
  { name: 'bot-typing-1', at: 4100 },
  { name: 'bot-msg-1', at: 4900 },
  { name: 'user-msg-2', at: 5900 },
  { name: 'bot-typing-2', at: 6500 },
  { name: 'bot-msg-2', at: 7100 },
  { name: 'crm-enter', at: 8000 },
  { name: 'crm-flash', at: 8700 },
  { name: 'hold', at: 9300 },
  { name: 'restart', at: 13500 },
] as const;

type PhaseName = (typeof PHASES)[number]['name'];

const PHASE_INDEX: Record<PhaseName, number> = PHASES.reduce(
  (acc, p, i) => {
    acc[p.name] = i;
    return acc;
  },
  {} as Record<PhaseName, number>,
);

const HOLD_INDEX = PHASE_INDEX['hold'];
const RESTART_INDEX = PHASE_INDEX['restart'];

export default function ProblemAnimation() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(containerRef, { threshold: 0.3, once: true });
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [loopKey, setLoopKey] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];

    // Reduced motion → freeze on the final composite (form dim, chat
    // resolved, CRM landed) so the visual still reads correctly.
    if (reducedMotion) {
      setStep(HOLD_INDEX);
      return;
    }
    if (!inView) return;

    setStep(0);
    timersRef.current = PHASES.map((p, i) =>
      setTimeout(() => setStep(i), p.at),
    );

    return () => {
      for (const t of timersRef.current) clearTimeout(t);
      timersRef.current = [];
    };
  }, [inView, reducedMotion, loopKey]);

  // When the timeline reaches `restart`, increment loopKey so the effect
  // above re-runs and re-schedules the whole sequence from the top.
  useEffect(() => {
    if (reducedMotion || !inView) return;
    if (step === RESTART_INDEX) {
      const t = setTimeout(() => setLoopKey((k) => k + 1), 50);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [step, reducedMotion, inView]);

  const reached = (n: PhaseName) => step >= PHASE_INDEX[n];
  const isCurrent = (n: PhaseName) => step === PHASE_INDEX[n];

  const formDim = reached('form-blur');
  const chatVisible = reached('chat-enter');
  const userMsg1 = reached('user-msg-1');
  const botTyping1 = isCurrent('bot-typing-1');
  const botMsg1 = reached('bot-msg-1');
  const userMsg2 = reached('user-msg-2');
  const botTyping2 = isCurrent('bot-typing-2');
  const botMsg2 = reached('bot-msg-2');
  const crmVisible = reached('crm-enter');
  const crmFlash = isCurrent('crm-flash');

  return (
    <div
      ref={containerRef}
      data-testid="problem-animation"
      role="img"
      aria-label="Animation: a complicated contact form blurs out, a Crestline-style chat widget captures a buyer's question and email, then deposits the lead into a CRM."
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        height: '500px',
        borderRadius: '18px',
        overflow: 'hidden',
        background: 'var(--od-dark)',
        border: '1px solid var(--od-border)',
        boxShadow: '0 32px 80px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Browser chrome — frames the whole thing as a website */}
      <BrowserChrome />

      <div style={{ position: 'relative', height: 'calc(100% - 38px)' }}>
        <ContactFormLayer dimmed={formDim} />

        <ChatWidgetLayer
          visible={chatVisible}
          userMsg1={userMsg1}
          botTyping1={botTyping1}
          botMsg1={botMsg1}
          userMsg2={userMsg2}
          botTyping2={botTyping2}
          botMsg2={botMsg2}
        />

        <CRMCardLayer visible={crmVisible} flash={crmFlash} />
      </div>
    </div>
  );
}

// ─── Browser chrome ────────────────────────────────────────────────────────

function BrowserChrome() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.5rem 0.875rem',
        background: 'var(--od-navy)',
        borderBottom: '1px solid var(--od-border)',
        height: 38,
        boxSizing: 'border-box',
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(239, 78, 115, 0.7)' }} />
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(250, 201, 23, 0.7)' }} />
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(111, 194, 132, 0.7)' }} />
      <div
        style={{
          marginLeft: '0.625rem',
          flex: 1,
          maxWidth: '260px',
          padding: '0.2rem 0.625rem',
          borderRadius: '999px',
          background: 'var(--od-card)',
          fontSize: '0.6875rem',
          color: 'var(--od-muted)',
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          textAlign: 'left',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        your-supplier.com/contact
      </div>
    </div>
  );
}

// ─── Layer 1: contact form (back) ──────────────────────────────────────────

function ContactFormLayer({ dimmed }: { dimmed: boolean }) {
  return (
    <div
      data-testid="problem-form-layer"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        padding: '1.25rem 1.25rem 1rem',
        background: 'var(--od-card)',
        opacity: dimmed ? 0.18 : 1,
        filter: dimmed ? 'blur(6px)' : 'blur(0)',
        transition: 'opacity 800ms ease, filter 800ms ease',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
          fontWeight: 800,
          fontSize: '1rem',
          color: 'var(--od-white)',
          marginBottom: '0.875rem',
          letterSpacing: '-0.01em',
        }}
      >
        Contact Us
      </div>

      {/* Lots of fields — this is the "complicated form" beat */}
      {(
        [
          'First name',
          'Last name',
          'Work email',
          'Company',
          'Job title',
          'Company size',
          'Industry',
          'Phone',
          'How did you hear about us?',
          'Tell us about your project',
        ] as const
      ).map((label, i) => (
        <FormField key={label} label={label} tall={i === 9} />
      ))}

      <div
        style={{
          marginTop: '0.625rem',
          padding: '0.5rem 0.75rem',
          background: 'var(--od-violet, #675ac9)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.75rem',
          textAlign: 'center',
          borderRadius: '6px',
          width: '90px',
        }}
      >
        Submit
      </div>
    </div>
  );
}

function FormField({ label, tall }: { label: string; tall?: boolean }) {
  return (
    <div style={{ marginBottom: '0.4rem' }}>
      <div
        style={{
          fontSize: '0.625rem',
          color: 'var(--od-muted)',
          marginBottom: '0.15rem',
          fontWeight: 500,
        }}
      >
        {label}
        <span style={{ color: 'var(--od-pink, #ef4e73)', marginLeft: 2 }}>
          *
        </span>
      </div>
      <div
        style={{
          height: tall ? 36 : 22,
          background: 'var(--od-dark)',
          border: '1px solid var(--od-border)',
          borderRadius: 4,
        }}
      />
    </div>
  );
}

// ─── Layer 2: chat widget (mid) ────────────────────────────────────────────

interface ChatProps {
  visible: boolean;
  userMsg1: boolean;
  botTyping1: boolean;
  botMsg1: boolean;
  userMsg2: boolean;
  botTyping2: boolean;
  botMsg2: boolean;
}

function ChatWidgetLayer({
  visible,
  userMsg1,
  botTyping1,
  botMsg1,
  userMsg2,
  botTyping2,
  botMsg2,
}: ChatProps) {
  return (
    <div
      data-testid="problem-chat-layer"
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 14,
        transform: visible
          ? 'translateX(-50%) translateY(0) scale(1)'
          : 'translateX(-50%) translateY(20px) scale(0.96)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 500ms ease, transform 500ms ease',
        width: 'calc(100% - 28px)',
        maxWidth: 380,
        background: 'var(--od-card)',
        border: '1px solid var(--od-border)',
        borderRadius: 14,
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Mini chat header — Crestline / powered by Aiden */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: 'rgba(74, 67, 153, 0.35)',
          borderBottom: '1px solid var(--od-border)',
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: 'var(--od-gold)',
            color: 'var(--od-ink, #272d3f)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
            fontWeight: 800,
            fontSize: '0.75rem',
          }}
        >
          B
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: 'var(--od-white)',
              fontWeight: 700,
              fontSize: '0.75rem',
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
            }}
          >
            Boltz
          </div>
          <div
            style={{
              color: 'var(--od-muted)',
              fontSize: '0.625rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--od-green, #6fc284)',
              }}
            />
            Online
          </div>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            border: '1px solid rgba(250, 201, 23, 0.4)',
            padding: '0.2rem 0.4rem',
            borderRadius: 4,
            background: 'rgba(250, 201, 23, 0.08)',
            lineHeight: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/aiden-logo-96.png"
            alt="Aiden by Olark"
            width={96}
            height={49}
            style={{ display: 'block', height: 12, width: 'auto' }}
          />
        </span>
      </div>

      {/* Mini message log */}
      <div
        style={{
          background: 'var(--od-dark)',
          padding: '0.625rem 0.625rem 0.75rem',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}
      >
        <BotBubble>
          Hey, Boltz here — Crestline&apos;s parts assistant. What can I help
          you find?
        </BotBubble>

        {userMsg1 && (
          <UserBubble>
            Need 12,000 ft of 4&quot; Sch 80 PVC delivered to Phoenix.
          </UserBubble>
        )}

        {botTyping1 && <TypingBubble />}

        {botMsg1 && (
          <BotBubble>
            Got it — that&apos;s a real run. What&apos;s the best email so I
            can route this to your regional rep?
          </BotBubble>
        )}

        {userMsg2 && <UserBubble>buyer@acmebuilders.com</UserBubble>}

        {botTyping2 && <TypingBubble />}

        {botMsg2 && (
          <BotBubble>
            Done — Lauren K. (West Coast) will reach out within the hour with
            a freight quote.
          </BotBubble>
        )}
      </div>
    </div>
  );
}

function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        maxWidth: '86%',
        padding: '0.4375rem 0.625rem',
        borderRadius: '10px 10px 10px 3px',
        background: 'var(--od-card)',
        border: '1px solid var(--od-border)',
        color: 'var(--od-white)',
        fontSize: '0.6875rem',
        lineHeight: 1.45,
        animation: 'problem-bubble-in 240ms ease-out both',
      }}
    >
      {children}
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        alignSelf: 'flex-end',
        maxWidth: '82%',
        padding: '0.4375rem 0.625rem',
        borderRadius: '10px 10px 3px 10px',
        background: 'var(--od-violet, #675ac9)',
        border: '1px solid rgba(122, 111, 216, 0.6)',
        color: '#ffffff',
        fontSize: '0.6875rem',
        lineHeight: 1.45,
        animation: 'problem-bubble-in 240ms ease-out both',
      }}
    >
      {children}
    </div>
  );
}

function TypingBubble() {
  return (
    <div
      aria-hidden="true"
      style={{
        alignSelf: 'flex-start',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.2rem',
        background: 'var(--od-card)',
        border: '1px solid var(--od-border)',
        borderRadius: '10px 10px 10px 3px',
        padding: '0.4rem 0.625rem',
        maxWidth: 60,
      }}
    >
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: 'var(--od-muted)',
        animation: `boltz-typing-dot 1.2s ease-in-out ${delay}ms infinite`,
      }}
    />
  );
}

// ─── Layer 3: CRM card (top-right corner) ──────────────────────────────────

function CRMCardLayer({ visible, flash }: { visible: boolean; flash: boolean }) {
  return (
    <div
      data-testid="problem-crm-layer"
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        width: 188,
        background: 'var(--od-navy)',
        border: '1px solid rgba(250, 201, 23, 0.3)',
        borderRadius: 10,
        padding: '0.625rem 0.75rem',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(20px)',
        transition: 'opacity 400ms ease, transform 400ms ease',
        boxShadow: flash
          ? '0 0 0 2px var(--od-gold), 0 12px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(250, 201, 23, 0.5)'
          : '0 12px 32px rgba(0, 0, 0, 0.6)',
        pointerEvents: 'none',
      }}
    >
      {/* CRM header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          marginBottom: '0.5rem',
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            background: '#ff7a59',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.6875rem',
          }}
        >
          H
        </span>
        <div
          style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            color: 'var(--od-white)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          HubSpot · New Lead
        </div>
      </div>

      <KVRow label="Contact" value="buyer@acmebuilders.com" />
      <KVRow label="Company" value="Acme Builders" />
      <KVRow label="Deal" value="12,000 ft Sch 80 PVC" />
      <KVRow label="Region" value="West Coast" />
      <KVRow label="Owner" value="Lauren K." />

      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
        <Tag color="gold">Hot lead</Tag>
        <Tag color="green">Routed</Tag>
      </div>
    </div>
  );
}

function KVRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '0.375rem',
        fontSize: '0.625rem',
        lineHeight: 1.4,
        marginBottom: '0.15rem',
      }}
    >
      <span style={{ color: 'var(--od-muted)' }}>{label}</span>
      <span
        style={{
          color: 'var(--od-white)',
          fontWeight: 600,
          maxWidth: '60%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Tag({ color, children }: { color: 'gold' | 'green'; children: React.ReactNode }) {
  const palette =
    color === 'gold'
      ? { bg: 'rgba(250, 201, 23, 0.12)', border: 'rgba(250, 201, 23, 0.5)', fg: 'var(--od-gold)' }
      : { bg: 'rgba(111, 194, 132, 0.12)', border: 'rgba(111, 194, 132, 0.5)', fg: 'var(--od-green, #6fc284)' };
  return (
    <span
      style={{
        fontSize: '0.5625rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        padding: '0.15rem 0.4rem',
        borderRadius: 4,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        color: palette.fg,
      }}
    >
      {children}
    </span>
  );
}
