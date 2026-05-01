'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Reveal from '@/components/ui/Reveal';

/**
 * BoltzChatDemo — interactive scripted-bot demo for the homepage.
 *
 * Lives between the "expensive digital filing cabinets" callout and the URL
 * Demo Widget on the homepage. Two complementary moments:
 *   - This component: "see what good looks like" (curated, snappy demo
 *     with prebuilt industrial conversations)
 *   - URLDemoWidget: "see what your site would look like" (real ingest)
 *
 * Visitor model: clicks one of the suggested chips → bot replies with
 * 1–3 bubbles (with typing dots between them) → optional follow-up chips
 * extend the conversation OR a freeform input takes over. Each scripted
 * path showcases a specific platform capability (technical-spec answer,
 * project qualification, geo / dealer routing, human handoff).
 *
 * The bot is named "Boltz" — Crestline Industrial's white-labelled parts
 * assistant — with a "powered by Aiden" badge in the chat chrome to make
 * the platform-vs-bot distinction explicit. The "Crestline Industrial"
 * brand is fictional but anchored in the Steel King-archetype ICP from
 * the brief.
 *
 * Freeform input: keyword-matches to scripted paths when possible, falls
 * back to a "let me grab a human" message that demonstrates the handoff
 * itself. Real /api/aiden/chat wiring is intentionally deferred — the
 * Aiden upstream needs a Crestline-style training session before freeform
 * answers would be on-brand. Scripting today, real LLM later.
 */

// ─── Conversation data ─────────────────────────────────────────────────────

interface DemoScript {
  /** Stable id used as React key + chip identifier */
  id: string;
  /** What the user "said" — bubble shown on the right after they click */
  userText: string;
  /** Sequence of bot bubbles (each appears with typing dots between) */
  botBubbles: string[];
  /** Small feature-demonstrated tag shown above the user bubble */
  featureTag: string;
  /** Optional next-step chip ids (rendered after bot finishes) */
  followupIds?: string[];
}

const STARTING_CHIP_IDS = [
  'lead-time-pvc',
  'spec-pallet-rack',
  'closest-distributor',
  'custom-install',
];

const SCRIPTS: Record<string, DemoScript> = {
  'lead-time-pvc': {
    id: 'lead-time-pvc',
    userText: "What's the lead time on 4\" PVC pipe?",
    featureTag: 'Spec answer · pulled from your catalog',
    botBubbles: [
      "Crestline carries 4\" Sch 40 and Sch 80 PVC pipe — both in stock and shipping same-day from our Memphis DC.",
      "Lead time on standard quantities (under 5,000 ft) is 1 business day to most of the lower 48. Need a bigger run? I can quote freight + production lead.",
    ],
    followupIds: ['lead-time-quantity'],
  },
  'lead-time-quantity': {
    id: 'lead-time-quantity',
    userText: 'I need ~12,000 ft of Sch 80, delivered to Phoenix.',
    featureTag: 'Quote-ready RFQ',
    botBubbles: [
      "Got it — 12,000 ft of 4\" Sch 80 PVC, delivered Phoenix. That's about 2,400 sticks at 5ft.",
      "I'll get our regional rep Marisol the spec, your timeline, and the delivery point. She'll come back with a freight quote and bulk pricing within the hour. What's the best email for her to reach you?",
    ],
    followupIds: ['email-handoff'],
  },

  'spec-pallet-rack': {
    id: 'spec-pallet-rack',
    userText: "I'm spec'ing 50,000 sqft of pallet racking.",
    featureTag: 'Project qualification · auto-tagged High Value',
    botBubbles: [
      "That's a real project — let me grab the right team for you.",
      "Quick: are you looking at standard selective rack, or do you need drive-in, push-back, or seismic-rated for a high-density layout?",
    ],
    followupIds: ['rack-type-standard', 'rack-type-drivein', 'rack-type-seismic'],
  },
  'rack-type-standard': {
    id: 'rack-type-standard',
    userText: 'Standard selective rack.',
    featureTag: 'Spec captured',
    botBubbles: [
      "Standard selective — easiest to scope. Last thing: where's the facility going up? I want to put you with the right regional manager.",
    ],
    followupIds: ['facility-region'],
  },
  'rack-type-drivein': {
    id: 'rack-type-drivein',
    userText: 'Drive-in for high-density storage.',
    featureTag: 'Spec captured',
    botBubbles: [
      "Drive-in is a specialty config — I'll loop in the engineering desk so you get someone who can model the lane depth + lift heights with you.",
      "What city is the facility going up in?",
    ],
    followupIds: ['facility-region'],
  },
  'rack-type-seismic': {
    id: 'rack-type-seismic',
    userText: 'Seismic-rated.',
    featureTag: 'Spec captured · high-engineering project',
    botBubbles: [
      "Seismic — got it. We'll need to know the seismic zone, anchor type, and beam load capacity to spec it properly.",
      "What city is the facility going up in?",
    ],
    followupIds: ['facility-region'],
  },
  'facility-region': {
    id: 'facility-region',
    userText: 'Sacramento, California.',
    featureTag: 'Geo-routed · paired with regional team',
    botBubbles: [
      "Sacramento puts you in our West Coast territory. Lauren K. owns that region — she's done about 40 warehouse builds in NorCal in the last two years.",
      "I'll send her your project (50K sqft, the rack type you picked, your city) so she lands the call already briefed. What's the best email for her to reach you?",
    ],
    followupIds: ['email-handoff'],
  },

  'closest-distributor': {
    id: 'closest-distributor',
    userText: "Where's my closest distributor?",
    featureTag: 'Geo-routing · live IP + zip lookup',
    botBubbles: [
      "I can find that fast. What's your zip?",
    ],
    followupIds: ['zip-bay-area'],
  },
  'zip-bay-area': {
    id: 'zip-bay-area',
    userText: '94103',
    featureTag: 'Routed to regional manager + premier installer',
    botBubbles: [
      "94103 — Bay Area. Crestline's regional manager Lauren K. covers your territory direct, and our premier installer is Cooke Industrial in Oakland.",
      "Want me to connect you with Lauren first, or set up an install conversation with Cooke?",
    ],
    followupIds: ['route-direct', 'route-installer'],
  },
  'route-direct': {
    id: 'route-direct',
    userText: 'Connect me with Lauren.',
    featureTag: 'Direct handoff to regional rep',
    botBubbles: [
      "Done — Lauren is online right now. Drop your email and a one-liner about the project and I'll route you to her direct line.",
    ],
    followupIds: ['email-handoff'],
  },
  'route-installer': {
    id: 'route-installer',
    userText: 'Set up an install conversation with Cooke.',
    featureTag: 'Routed to dealer · installer notified',
    botBubbles: [
      "Cooke's been our Bay Area installer since 2017. They'll come out for a site walk and tie back to Crestline for parts.",
      "Drop your email and a quick project summary — I'll loop in both teams so the first call is a real conversation, not an intake form.",
    ],
    followupIds: ['email-handoff'],
  },

  'custom-install': {
    id: 'custom-install',
    userText: 'Can someone help with a custom installation?',
    featureTag: 'Human handoff · briefed + email-captured',
    botBubbles: [
      "Custom installs go straight to our specialist desk — they don't sit in a general queue.",
      "Quick so I can brief them properly: what's your email, rough sqft, and timeline? Once I have that, I'll loop in the install engineer with the full context.",
    ],
    followupIds: ['email-handoff'],
  },

  'email-handoff': {
    id: 'email-handoff',
    userText: 'logan@crestline-industrial.com',
    featureTag: 'CRM updated · brief written · human paged',
    botBubbles: [
      "Got it. I've written up the brief — your specs, the regional fit, and the captured project size — and dropped it in front of the right human on our team. They'll be in touch within the hour.",
      "Anything else I can pull up while you wait? Spec sheets, install timelines, similar projects we've shipped?",
    ],
  },

  // Freeform fallback — any typed message we can't keyword-match falls
  // through to this script, which itself demonstrates the handoff feature.
  'freeform-fallback': {
    id: 'freeform-fallback',
    userText: '',
    featureTag: 'Smart escalation · I get a human when it earns it',
    botBubbles: [
      "Good question — that one earns a human. Drop your email and I'll get our team on it with the full chat history attached. No need to re-explain.",
    ],
    followupIds: ['email-handoff'],
  },
};

// Keyword routing for freeform input. Order matters — first hit wins.
const FREEFORM_ROUTES: { pattern: RegExp; scriptId: string }[] = [
  { pattern: /lead\s*time|stock|in\s*stock|when can|how (long|fast)/i, scriptId: 'lead-time-pvc' },
  { pattern: /pallet|rack|warehouse|sqft|sq\s*ft|facility/i, scriptId: 'spec-pallet-rack' },
  { pattern: /distributor|dealer|installer|nearest|near me|local|where (are|is)/i, scriptId: 'closest-distributor' },
  { pattern: /custom|install|installation|specialist/i, scriptId: 'custom-install' },
  { pattern: /pvc|pipe|valve|fitting|flange|bolt|hydraulic|psi|ss\b/i, scriptId: 'lead-time-pvc' },
];

function routeFreeform(text: string): string {
  for (const { pattern, scriptId } of FREEFORM_ROUTES) {
    if (pattern.test(text)) return scriptId;
  }
  return 'freeform-fallback';
}

// ─── Component ─────────────────────────────────────────────────────────────

interface ChatBubble {
  role: 'user' | 'bot' | 'feature-tag' | 'typing';
  text: string;
  scriptId?: string;
}

const TYPING_DELAY_MS = 700;
const BOT_BUBBLE_DELAY_MS = 1000;
const INITIAL_BOT_GREETING =
  "Hey — Boltz here, Crestline's parts assistant. Ask me about specs, stock, lead times, or where to find your local installer. I'll pull a human in when it earns it.";

export default function BoltzChatDemo() {
  const [bubbles, setBubbles] = useState<ChatBubble[]>([
    { role: 'bot', text: INITIAL_BOT_GREETING },
  ]);
  const [activeChipIds, setActiveChipIds] = useState<string[]>(STARTING_CHIP_IDS);
  const [awaitingBot, setAwaitingBot] = useState(false);
  const [freeform, setFreeform] = useState('');

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Track timers so reset/unmount doesn't leave stale setTimeouts firing
  // into a stale state and double-rendering bubbles.
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  }

  useEffect(() => () => clearTimers(), []);

  // Auto-scroll the chat to bottom whenever a new bubble appears.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [bubbles, awaitingBot]);

  function runScript(scriptId: string, userTextOverride?: string) {
    const script = SCRIPTS[scriptId];
    if (!script) return;

    clearTimers();
    setActiveChipIds([]);
    setAwaitingBot(true);

    const userText = userTextOverride ?? script.userText;
    const newBubbles: ChatBubble[] = [];
    if (script.featureTag) {
      newBubbles.push({ role: 'feature-tag', text: script.featureTag });
    }
    if (userText) {
      newBubbles.push({ role: 'user', text: userText });
    }
    setBubbles((prev) => [...prev, ...newBubbles]);

    // Schedule the bot's bubbles with a typing-dots interlude before each.
    let elapsed = 0;
    script.botBubbles.forEach((bubble, i) => {
      const typingDelay = i === 0 ? TYPING_DELAY_MS : BOT_BUBBLE_DELAY_MS;
      // Show typing indicator
      const typingTimer = setTimeout(() => {
        setBubbles((prev) => [...prev, { role: 'typing', text: '' }]);
      }, elapsed);
      timersRef.current.push(typingTimer);
      elapsed += typingDelay;

      // Replace typing with the bot bubble
      const bubbleTimer = setTimeout(() => {
        setBubbles((prev) => {
          const next = [...prev];
          // Remove the trailing typing bubble
          for (let j = next.length - 1; j >= 0; j--) {
            if (next[j]?.role === 'typing') {
              next.splice(j, 1);
              break;
            }
          }
          next.push({ role: 'bot', text: bubble });
          return next;
        });
      }, elapsed);
      timersRef.current.push(bubbleTimer);
    });

    // After the last bot bubble, surface follow-up chips (if any).
    const finalTimer = setTimeout(() => {
      setActiveChipIds(script.followupIds ?? []);
      setAwaitingBot(false);
      // Re-focus the freeform input so keyboard users continue smoothly.
      inputRef.current?.focus({ preventScroll: true });
    }, elapsed);
    timersRef.current.push(finalTimer);
  }

  function handleChipClick(scriptId: string) {
    if (awaitingBot) return;
    runScript(scriptId);
  }

  function handleFreeformSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = freeform.trim();
    if (!trimmed || awaitingBot) return;
    const scriptId = routeFreeform(trimmed);
    setFreeform('');
    // Pass the user's actual text through instead of the canned chip text.
    runScript(scriptId, trimmed);
  }

  function reset() {
    clearTimers();
    setBubbles([{ role: 'bot', text: INITIAL_BOT_GREETING }]);
    setActiveChipIds(STARTING_CHIP_IDS);
    setAwaitingBot(false);
    setFreeform('');
  }

  const visibleChips = useMemo(
    () => activeChipIds.map((id) => SCRIPTS[id]).filter(Boolean) as DemoScript[],
    [activeChipIds],
  );

  return (
    <section
      id="boltz-demo"
      style={{
        backgroundColor: 'var(--od-dark)',
        padding: '5rem 1.5rem',
      }}
    >
      <Reveal style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
        <p
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'var(--od-gold)',
            margin: '0 0 1rem',
          }}
        >
          See What Good Looks Like
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
            fontWeight: 900,
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--od-white)',
            margin: '0 0 1rem',
          }}
        >
          A Real Industrial-Supply Conversation. Try It.
        </h2>
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--od-text)',
            margin: '0 auto 2.5rem',
            maxWidth: '640px',
          }}
        >
          This is &ldquo;Boltz,&rdquo; a parts assistant for fictional
          industrial supplier Crestline — powered by Aiden. Click one of the
          suggested questions or type your own. The chat shows what your
          buyers see; the small tags show what the platform is doing
          underneath.
        </p>
      </Reveal>

      <Reveal
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          background: 'var(--od-card)',
          border: '1px solid var(--od-border)',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.4)',
        }}
        delay={150}
      >
        {/* Browser chrome */}
        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            background: 'var(--od-navy)',
            borderBottom: '1px solid var(--od-border)',
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239, 78, 115, 0.7)' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(250, 201, 23, 0.7)' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(111, 194, 132, 0.7)' }} />
          <div
            style={{
              marginLeft: '0.875rem',
              flex: 1,
              maxWidth: '280px',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              background: 'var(--od-card)',
              fontSize: '0.75rem',
              color: 'var(--od-muted)',
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              textAlign: 'left',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            crestline-industrial.com
          </div>
        </div>

        {/* Chat header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1.125rem',
            background: 'rgba(74, 67, 153, 0.3)',
            borderBottom: '1px solid var(--od-border)',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              flex: '0 0 auto',
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'var(--od-gold)',
              color: 'var(--od-ink, #272d3f)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 800,
              fontSize: '0.9375rem',
            }}
          >
            B
          </span>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <div
              style={{
                color: 'var(--od-white)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              }}
            >
              Boltz · Crestline Industrial
            </div>
            <div
              style={{
                color: 'var(--od-muted)',
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--od-green, #6fc284)',
                  boxShadow: '0 0 8px rgba(111, 194, 132, 0.7)',
                }}
              />
              <span>Online · replies instantly</span>
            </div>
          </div>
          <span
            data-testid="powered-by-aiden"
            style={{
              fontSize: '0.6875rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: 'var(--od-gold)',
              border: '1px solid rgba(250, 201, 23, 0.4)',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              background: 'rgba(250, 201, 23, 0.08)',
            }}
          >
            Powered by Aiden
          </span>
        </header>

        {/* Message list */}
        <div
          ref={scrollRef}
          data-testid="boltz-chat-log"
          aria-live="polite"
          aria-atomic="false"
          style={{
            background: 'var(--od-dark)',
            padding: '1.25rem 1.125rem',
            minHeight: '380px',
            maxHeight: '440px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
          }}
        >
          {bubbles.map((b, i) => (
            <ChatBubbleView key={i} bubble={b} />
          ))}
        </div>

        {/* Chip row */}
        {visibleChips.length > 0 && (
          <div
            data-testid="boltz-chip-row"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              padding: '0.875rem 1.125rem',
              borderTop: '1px solid var(--od-border)',
              background: 'rgba(39, 45, 63, 0.4)',
            }}
          >
            {visibleChips.map((s) => (
              <button
                key={s.id}
                type="button"
                data-testid="boltz-chip"
                data-chip-id={s.id}
                disabled={awaitingBot}
                onClick={() => handleChipClick(s.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'var(--od-card)',
                  border: '1px solid var(--od-border)',
                  borderRadius: '999px',
                  padding: '0.4375rem 0.875rem',
                  fontFamily: 'inherit',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--od-text)',
                  cursor: awaitingBot ? 'wait' : 'pointer',
                  opacity: awaitingBot ? 0.6 : 1,
                  transition: 'background-color 150ms, border-color 150ms, color 150ms',
                }}
                onMouseEnter={(e) => {
                  if (awaitingBot) return;
                  e.currentTarget.style.borderColor = 'var(--od-gold)';
                  e.currentTarget.style.color = 'var(--od-white)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--od-border)';
                  e.currentTarget.style.color = 'var(--od-text)';
                }}
              >
                {s.userText}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <form
          onSubmit={handleFreeformSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1.125rem 1rem',
            borderTop: '1px solid var(--od-border)',
            background: 'var(--od-card)',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={freeform}
            onChange={(e) => setFreeform(e.target.value)}
            disabled={awaitingBot}
            placeholder="Ask about a part, spec, or quantity…"
            aria-label="Ask Boltz a question"
            data-testid="boltz-freeform-input"
            style={{
              flex: 1,
              minWidth: 0,
              padding: '0.625rem 0.875rem',
              background: 'var(--od-dark)',
              color: 'var(--od-white)',
              border: '1px solid var(--od-border)',
              borderRadius: '10px',
              fontSize: '0.9375rem',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={awaitingBot || freeform.trim().length === 0}
            data-testid="boltz-freeform-submit"
            aria-label="Send"
            style={{
              flex: '0 0 auto',
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'var(--od-gold)',
              color: 'var(--od-ink, #272d3f)',
              border: 0,
              cursor:
                awaitingBot || freeform.trim().length === 0 ? 'not-allowed' : 'pointer',
              opacity: awaitingBot || freeform.trim().length === 0 ? 0.5 : 1,
              fontSize: '1.125rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            →
          </button>
          <button
            type="button"
            onClick={reset}
            data-testid="boltz-reset"
            aria-label="Reset conversation"
            style={{
              flex: '0 0 auto',
              padding: '0.5rem 0.625rem',
              background: 'transparent',
              color: 'var(--od-muted)',
              border: '1px solid var(--od-border)',
              borderRadius: '10px',
              fontSize: '0.8125rem',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </form>
      </Reveal>
    </section>
  );
}

// ─── Bubble subcomponent ───────────────────────────────────────────────────

function ChatBubbleView({ bubble }: { bubble: ChatBubble }) {
  if (bubble.role === 'feature-tag') {
    return (
      <div
        data-testid="boltz-feature-tag"
        style={{
          alignSelf: 'center',
          fontSize: '0.6875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: 'var(--od-gold)',
          background: 'rgba(250, 201, 23, 0.08)',
          border: '1px solid rgba(250, 201, 23, 0.3)',
          padding: '0.25rem 0.625rem',
          borderRadius: '999px',
          margin: '0.375rem 0 0.125rem',
          maxWidth: '90%',
          textAlign: 'center',
        }}
      >
        {bubble.text}
      </div>
    );
  }

  if (bubble.role === 'typing') {
    return (
      <div
        data-testid="boltz-typing"
        aria-label="Boltz is typing"
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'var(--od-card)',
          border: '1px solid var(--od-border)',
          borderRadius: '14px 14px 14px 4px',
          padding: '0.625rem 0.875rem',
          maxWidth: '80px',
        }}
      >
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </div>
    );
  }

  const isUser = bubble.role === 'user';
  return (
    <div
      data-testid={isUser ? 'boltz-user-bubble' : 'boltz-bot-bubble'}
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '82%',
        padding: '0.625rem 0.875rem',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser ? 'var(--od-violet, #675ac9)' : 'var(--od-card)',
        border: isUser ? '1px solid rgba(122, 111, 216, 0.6)' : '1px solid var(--od-border)',
        color: isUser ? '#ffffff' : 'var(--od-white)',
        fontSize: '0.9375rem',
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
      }}
    >
      {bubble.text}
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: 'var(--od-muted)',
        animation: `boltz-typing-dot 1.2s ease-in-out ${delay}ms infinite`,
      }}
    />
  );
}
