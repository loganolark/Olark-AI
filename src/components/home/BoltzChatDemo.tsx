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

/**
 * A single scripted turn from the bot side. `kind` decides which bubble
 * variant is rendered (Boltz speaking vs. a human jumping in vs. a system
 * notice "X has joined the chat"). Strings can use the `${USER_MSG}`
 * placeholder, which is replaced at render time with the visitor's most
 * recent typed/clicked message — that's what makes the human handoff
 * feel context-aware instead of canned.
 */
type ScriptedBubbleKind = 'bot' | 'human' | 'system';

interface ScriptedBubble {
  kind: ScriptedBubbleKind;
  text: string;
  /** Only used when kind === 'human'. Display name for the human agent. */
  humanName?: string;
  /** Only used when kind === 'human'. Initials for the avatar. */
  humanInitials?: string;
}

interface DemoScript {
  /** Stable id used as React key + chip identifier */
  id: string;
  /** What the user "said" — bubble shown on the right after they click */
  userText: string;
  /** Sequence of bubbles (typing dots interleaved between each) */
  scriptedTurns: ScriptedBubble[];
  /** Small feature-demonstrated tag shown above the user bubble */
  featureTag: string;
  /** Optional next-step chip ids (rendered after bot finishes) */
  followupIds?: string[];
  /** When true, the conversation closes with a human in the seat — input
   *  + chip controls disable so the demo lands the handoff moment. */
  endsWithHuman?: boolean;
  /** When the script names a specific human in its copy (e.g.,
   *  "Lauren K. owns that region"), set the agent here so the
   *  downstream email-handoff / human-takeover bubbles substitute the
   *  matching name + initials. Carries forward until another script
   *  promises a different agent — that's how the rack-spec → region
   *  → email path stays Lauren even though `email-handoff` is shared. */
  promisesAgent?: PromisedAgent;
}

/**
 * Named human agents the demo can hand the visitor off to. WHICH agent
 * shows up depends on which script path the visitor walked — Lauren for
 * the West Coast regional path, Jordan for the dealer-installer path,
 * Diego for engineering-grade installs, Marisol as the catch-all sales
 * rep. The script that promises the agent (e.g., "Lauren K. owns that
 * region") sets the agent in state via `promisesAgent`, and the
 * downstream email-handoff / human-takeover bubbles substitute the
 * right name / first name / initials at render time so the demo's
 * conversational continuity holds.
 */
interface PromisedAgent {
  /** Full display name, e.g., "Lauren K." */
  name: string;
  /** First name only, used in bubble openings ("Hey — Lauren here") */
  firstName: string;
  /** Single-letter avatar */
  initials: string;
  /** Short role label that can be referenced in bubble copy */
  role: string;
}

const AGENTS: Record<string, PromisedAgent> = {
  marisol: {
    name: 'Marisol K.',
    firstName: 'Marisol',
    initials: 'M',
    role: 'senior account exec',
  },
  lauren: {
    name: 'Lauren K.',
    firstName: 'Lauren',
    initials: 'L',
    role: 'West Coast regional manager',
  },
  jordan: {
    name: 'Jordan T.',
    firstName: 'Jordan',
    initials: 'J',
    role: 'install lead at Cooke Industrial',
  },
  diego: {
    name: 'Diego R.',
    firstName: 'Diego',
    initials: 'D',
    role: 'install engineer',
  },
};

/** Catch-all agent when no upstream script set a specific one (e.g., the
 *  visitor opened the demo and immediately typed "talk to a human"). */
const DEFAULT_AGENT: PromisedAgent = AGENTS.marisol!;

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
    scriptedTurns: [
      { kind: 'bot', text: "Crestline carries 4\" Sch 40 and Sch 80 PVC pipe — both in stock and shipping same-day from our Memphis DC." },
      { kind: 'bot', text: "Lead time on standard quantities (under 5,000 ft) is 1 business day to most of the lower 48. Need a bigger run? I can quote freight + production lead." },
    ],
    followupIds: ['lead-time-quantity'],
  },
  'lead-time-quantity': {
    id: 'lead-time-quantity',
    userText: 'I need ~12,000 ft of Sch 80, delivered to Phoenix.',
    featureTag: 'Quote-ready RFQ',
    scriptedTurns: [
      { kind: 'bot', text: "Got it — 12,000 ft of 4\" Sch 80 PVC, delivered Phoenix. That's about 2,400 sticks at 5ft." },
      { kind: 'bot', text: "I'll get our regional rep Marisol the spec, your timeline, and the delivery point. She'll come back with a freight quote and bulk pricing within the hour. What's the best email for her to reach you?" },
    ],
    followupIds: ['email-handoff'],
    promisesAgent: AGENTS.marisol,
  },

  'spec-pallet-rack': {
    id: 'spec-pallet-rack',
    userText: "I'm spec'ing 50,000 sqft of pallet racking.",
    featureTag: 'Project qualification · auto-tagged High Value',
    scriptedTurns: [
      { kind: 'bot', text: "That's a real project — let me grab the right team for you." },
      { kind: 'bot', text: "Quick: are you looking at standard selective rack, or do you need drive-in, push-back, or seismic-rated for a high-density layout?" },
    ],
    followupIds: ['rack-type-standard', 'rack-type-drivein', 'rack-type-seismic'],
  },
  'rack-type-standard': {
    id: 'rack-type-standard',
    userText: 'Standard selective rack.',
    featureTag: 'Spec captured',
    scriptedTurns: [
      { kind: 'bot', text: "Standard selective — easiest to scope. Last thing: where's the facility going up? I want to put you with the right regional manager." },
    ],
    followupIds: ['facility-region'],
  },
  'rack-type-drivein': {
    id: 'rack-type-drivein',
    userText: 'Drive-in for high-density storage.',
    featureTag: 'Spec captured',
    scriptedTurns: [
      { kind: 'bot', text: "Drive-in is a specialty config — your regional rep will pull in our engineering desk on lane depth + lift heights when they scope it with you." },
      { kind: 'bot', text: "What city is the facility going up in?" },
    ],
    followupIds: ['facility-region'],
  },
  'rack-type-seismic': {
    id: 'rack-type-seismic',
    userText: 'Seismic-rated.',
    featureTag: 'Spec captured · high-engineering project',
    scriptedTurns: [
      { kind: 'bot', text: "Seismic — got it. Your regional rep will loop in our engineering desk on seismic zone, anchor type, and beam load capacity so it's spec'd properly." },
      { kind: 'bot', text: "What city is the facility going up in?" },
    ],
    followupIds: ['facility-region'],
  },
  'facility-region': {
    id: 'facility-region',
    userText: 'Sacramento, California.',
    featureTag: 'Geo-routed · paired with regional team',
    scriptedTurns: [
      { kind: 'bot', text: "Sacramento puts you in our West Coast territory. Lauren K. owns that region — she's done about 40 warehouse builds in NorCal in the last two years." },
      { kind: 'bot', text: "I'll send her your project (50K sqft, the rack type you picked, your city) so she lands the call already briefed. What's the best email for her to reach you?" },
    ],
    followupIds: ['email-handoff'],
    promisesAgent: AGENTS.lauren,
  },

  'closest-distributor': {
    id: 'closest-distributor',
    userText: "Where's my closest distributor?",
    featureTag: 'Geo-routing · live IP + zip lookup',
    scriptedTurns: [
      { kind: 'bot', text: "I can find that fast. What's your zip?" },
    ],
    followupIds: ['zip-bay-area'],
  },
  'zip-bay-area': {
    id: 'zip-bay-area',
    userText: '94103',
    featureTag: 'Routed to regional manager + premier installer',
    scriptedTurns: [
      { kind: 'bot', text: "94103 — Bay Area. Crestline's regional manager Lauren K. covers your territory direct, and our premier installer is Cooke Industrial in Oakland." },
      { kind: 'bot', text: "Want me to connect you with Lauren first, or set up an install conversation with Cooke?" },
    ],
    followupIds: ['route-direct', 'route-installer'],
  },
  'route-direct': {
    id: 'route-direct',
    userText: 'Connect me with Lauren.',
    featureTag: 'Direct handoff to regional rep',
    scriptedTurns: [
      { kind: 'bot', text: "Done — Lauren is online right now. Drop your email and a one-liner about the project and I'll route you to her direct line." },
    ],
    followupIds: ['email-handoff'],
    promisesAgent: AGENTS.lauren,
  },
  'route-installer': {
    id: 'route-installer',
    userText: 'Set up an install conversation with Cooke.',
    featureTag: 'Routed to dealer · installer notified',
    scriptedTurns: [
      { kind: 'bot', text: "Cooke's been our Bay Area installer since 2017. Jordan T. runs install ops over there — he'll come out for a site walk and tie back to Crestline for parts." },
      { kind: 'bot', text: "Drop your email and a quick project summary and I'll get Jordan looped in so the first call is a real conversation, not an intake form." },
    ],
    followupIds: ['email-handoff'],
    promisesAgent: AGENTS.jordan,
  },

  'custom-install': {
    id: 'custom-install',
    userText: 'Can someone help with a custom installation?',
    featureTag: 'Human handoff · briefed + email-captured',
    scriptedTurns: [
      { kind: 'bot', text: "Custom installs go straight to our specialist desk — Diego R. on engineering owns those, and he doesn't sit in a general queue." },
      { kind: 'bot', text: "Quick so I can brief him properly: what's your email, rough sqft, and timeline? Once I have those, I'll loop Diego in with the full context." },
    ],
    followupIds: ['email-handoff'],
    promisesAgent: AGENTS.diego,
  },

  // ─── Knowledge base ────────────────────────────────────────────────────
  // Boltz answers these directly from a fictional Crestline policy / product
  // doc instead of escalating to a human. Each KB script ends by offering
  // the visitor a choice: "Talk to a product expert" → kb-escalate (which
  // captures email and pages a human) OR "I have another question" →
  // kb-keep-asking (which re-opens the conversation with starting chips).
  // FREEFORM_ROUTES below maps typed questions to these scripts so a real
  // typed question feels answered, not punted.

  'kb-payment-terms': {
    id: 'kb-payment-terms',
    userText: '',
    featureTag: 'KB answer · payment policy',
    scriptedTurns: [
      {
        kind: 'bot',
        text:
          "Crestline offers Net 30 to qualified accounts. New customers fill out a quick credit app — usually 1–2 business days to a decision. Until terms are set we accept ACH, wire, or major credit cards (3% surcharge over $5K).",
      },
      {
        kind: 'bot',
        text:
          "Want to talk to a product expert about your account, or do you have another question?",
      },
    ],
    followupIds: ['kb-escalate', 'kb-keep-asking'],
  },

  'kb-shipping-policy': {
    id: 'kb-shipping-policy',
    userText: '',
    featureTag: 'KB answer · shipping & freight',
    scriptedTurns: [
      {
        kind: 'bot',
        text:
          "We ship from three DCs — Memphis, Reno, and Allentown. Stock items ship same-day on orders placed before 2pm local. Standard freight is LTL via SAIA, R+L, or your preferred carrier; loads over 12K lbs go dedicated truckload (we'll quote it).",
      },
      {
        kind: 'bot',
        text:
          "Want a freight quote on something specific, or have another question?",
      },
    ],
    followupIds: ['kb-escalate', 'kb-keep-asking'],
  },

  'kb-returns': {
    id: 'kb-returns',
    userText: '',
    featureTag: 'KB answer · returns policy',
    scriptedTurns: [
      {
        kind: 'bot',
        text:
          "Stock items are returnable within 30 days — 15% restocking fee, waived if it's our error. Custom-cut, custom-fab, or special-order items are non-returnable once production starts. Your rep sends the RMA form when you're ready.",
      },
      {
        kind: 'bot',
        text: "Want me to start an RMA, or have another question?",
      },
    ],
    followupIds: ['kb-escalate', 'kb-keep-asking'],
  },

  'kb-warranty': {
    id: 'kb-warranty',
    userText: '',
    featureTag: 'KB answer · warranty terms',
    scriptedTurns: [
      {
        kind: 'bot',
        text:
          "Crestline-branded steel and racking carries a 5-year structural warranty. PVC, fittings, and valves carry the manufacturer's warranty (typically 1 year). Custom installs add a 1-year workmanship warranty from the certified installer.",
      },
      {
        kind: 'bot',
        text:
          "Want a warranty PDF for a specific product, or have another question?",
      },
    ],
    followupIds: ['kb-escalate', 'kb-keep-asking'],
  },

  'kb-min-order': {
    id: 'kb-min-order',
    userText: '',
    featureTag: 'KB answer · MOQ',
    scriptedTurns: [
      {
        kind: 'bot',
        text:
          "No hard minimum on stock items — we'll ship a single fitting if that's what you need (small orders just cost more per unit on freight). Custom-fab and cut-to-length work has a $2,500 minimum so the setup time pencils out.",
      },
      {
        kind: 'bot',
        text: "Want to price a specific run, or have another question?",
      },
    ],
    followupIds: ['kb-escalate', 'kb-keep-asking'],
  },

  'kb-hours-locations': {
    id: 'kb-hours-locations',
    userText: '',
    featureTag: 'KB answer · hours & contact',
    scriptedTurns: [
      {
        kind: 'bot',
        text:
          "HQ is Memphis, TN. Phone support runs 7am–7pm Central, Mon–Fri at (901) 555-0142. After hours, this chat routes to our overnight desk for urgent stuff (pages someone within 15 min for a real outage). Regional reps cover 18 territories across the US.",
      },
      {
        kind: 'bot',
        text:
          "Want me to connect you with your regional rep, or have another question?",
      },
    ],
    followupIds: ['kb-escalate', 'kb-keep-asking'],
  },

  'kb-pricing': {
    id: 'kb-pricing',
    userText: '',
    featureTag: 'KB answer · pricing',
    scriptedTurns: [
      {
        kind: 'bot',
        text:
          "Stock pricing lives behind login on the catalog — your account-specific tier (Bronze / Silver / Gold) auto-applies. Volume work over 5,000 ft or 1,000 units gets a custom quote from your rep, usually back within an hour during business hours.",
      },
      {
        kind: 'bot',
        text: "Want to put a quote together now, or have another question?",
      },
    ],
    followupIds: ['kb-escalate', 'kb-keep-asking'],
  },

  'kb-pvc-schedules': {
    id: 'kb-pvc-schedules',
    userText: '',
    featureTag: 'KB answer · PVC product knowledge',
    scriptedTurns: [
      {
        kind: 'bot',
        text:
          "Crestline stocks Sch 40 (general pressure / DWV) and Sch 80 (high-pressure / industrial) PVC in 1/2\" through 12\". We also carry CPVC for hot-water lines and PVC-U electrical conduit (gray). Sch 40 4\" handles ~280 PSI; Sch 80 4\" doubles wall thickness for ~430 PSI.",
      },
      {
        kind: 'bot',
        text: "Want a quote on a specific size and run, or have another question?",
      },
    ],
    followupIds: ['kb-escalate', 'kb-keep-asking'],
  },

  // KB → escalate. Captures email then routes through email-handoff so
  // the visitor sees the same "Marisol joined the chat" beat the scripted
  // paths use. Default agent because no upstream rack-spec / region path
  // ran to promise someone specific.
  'kb-escalate': {
    id: 'kb-escalate',
    userText: 'Connect me with a product expert.',
    featureTag: 'Email captured · human paged',
    scriptedTurns: [
      {
        kind: 'bot',
        text:
          "On it. What's the best email so we can follow up with the full context of what we just covered?",
      },
    ],
    followupIds: ['email-handoff'],
    promisesAgent: AGENTS.marisol,
  },

  // KB → keep talking. Re-opens the conversation with the starting chips
  // so the visitor can either pick a suggestion or type another question.
  'kb-keep-asking': {
    id: 'kb-keep-asking',
    userText: 'I have another question.',
    featureTag: '',
    scriptedTurns: [
      {
        kind: 'bot',
        text:
          "Go for it — ask me anything about specs, stock, lead times, pricing, or our policies.",
      },
    ],
    followupIds: STARTING_CHIP_IDS,
  },

  // Email submission → bot acknowledgement → SYSTEM "X joined" → HUMAN
  // message that references the captured project context. This is the
  // moment the demo lands the "human-in-the-loop" promise — visitors see
  // Aiden hand off to a real teammate (the SAME teammate the upstream
  // script promised them, via the ${HUMAN_*} template substitutions).
  // Only fires when an upstream script set `promisesAgent`; otherwise
  // falls back to the default sales rep.
  'email-handoff': {
    id: 'email-handoff',
    userText: 'logan@crestline-industrial.com',
    featureTag: 'CRM updated · brief written · human paged',
    scriptedTurns: [
      { kind: 'bot', text: "Got it. I've written the brief — your specs, the regional fit, the captured project size — and paged ${HUMAN_FIRST_NAME}." },
      { kind: 'system', text: '${HUMAN_NAME} (${HUMAN_ROLE}, Crestline Industrial) joined the chat' },
      {
        kind: 'human',
        text:
          "Hey — ${HUMAN_FIRST_NAME} here. I just read through what you and Boltz worked on. The brief looks solid; I have your specs and the rest of the context in front of me. Quick one so I can move fast: what timeline are you working with?",
      },
    ],
    endsWithHuman: true,
  },

  // Freeform / chip-triggered direct human handoff. The human's reply
  // ECHOES the visitor's most recent typed text via the ${USER_MSG}
  // placeholder so the takeover feels context-aware, not canned. Uses
  // the default sales rep (Marisol) since this fires before any
  // upstream script could have promised someone specific.
  'human-handoff-direct': {
    id: 'human-handoff-direct',
    userText: '',
    featureTag: 'Human takeover · context preserved',
    scriptedTurns: [
      { kind: 'bot', text: "Got it — pulling someone in for you. One sec." },
      { kind: 'system', text: '${HUMAN_NAME} (${HUMAN_ROLE}, Crestline Industrial) joined the chat' },
      {
        kind: 'human',
        text:
          "Hey — ${HUMAN_FIRST_NAME} here. I just caught up: “${USER_MSG}”. Let me dig in. What kind of timeline are you working with, and is this for a single site or a multi-site rollout?",
      },
    ],
    endsWithHuman: true,
  },

  // Generic freeform fallback — fires only when neither the KB nor the
  // scripted spec/qualification routes match. The visitor's text echoes
  // through the human takeover so the handoff still feels context-aware.
  'freeform-fallback': {
    id: 'freeform-fallback',
    userText: '',
    featureTag: 'Smart escalation · human in the loop',
    scriptedTurns: [
      {
        kind: 'bot',
        text:
          "I don't have that one in my docs yet — let me grab a product expert who does.",
      },
      { kind: 'system', text: '${HUMAN_NAME} (${HUMAN_ROLE}, Crestline Industrial) joined the chat' },
      {
        kind: 'human',
        text:
          "Hi, ${HUMAN_FIRST_NAME} from Crestline. I saw your message: “${USER_MSG}”. Happy to help — give me a sec to pull up your account and I'll come back with specifics.",
      },
    ],
    endsWithHuman: true,
  },
};

// Keyword routing for freeform input. Order matters — first hit wins.
// Routing strategy:
//   1. Explicit "talk to a human" wins over everything.
//   2. Knowledge-base questions (policy / pricing / hours / product
//      knowledge) — Boltz answers these from the fictional Crestline KB
//      instead of escalating, so a real typed question feels answered.
//   3. Scripted spec / qualification paths — these capture project-style
//      questions ("I need 50,000 sqft of pallet racking") and run the
//      multi-turn qualification + geo-routing demos.
//   4. Fall through to freeform-fallback (which still echoes the typed
//      text into the human takeover so even unmatched questions feel
//      personal).
const FREEFORM_ROUTES: { pattern: RegExp; scriptId: string }[] = [
  // 1. Explicit human handoff — always wins.
  {
    pattern:
      /\bhuman\b|real person|live agent|talk to (someone|a person|an agent|sales|support)|speak (to|with) (someone|a person|an agent|sales|support)|customer service rep|get a person/i,
    scriptId: 'human-handoff-direct',
  },

  // 2. Knowledge base — Boltz answers itself, then offers escalation.
  {
    pattern: /\b(payment|net\s*30|net\s*60|terms|invoice|billing|credit (card|app|application)|wire|ach)\b/i,
    scriptId: 'kb-payment-terms',
  },
  {
    pattern: /\b(ship|shipping|shipped|freight|carrier|delivery|deliver|ltl|truckload|tracking)\b/i,
    scriptId: 'kb-shipping-policy',
  },
  {
    pattern: /\b(return|returns|returning|refund|rma|restock(ing)?|exchange)\b|send (it|them) back/i,
    scriptId: 'kb-returns',
  },
  {
    pattern: /\b(warranty|warranties|guarantee|warrantied|warrantee)\b/i,
    scriptId: 'kb-warranty',
  },
  {
    pattern: /\b(minimum|moq|min\s*order|smallest order)\b|how (few|small)/i,
    scriptId: 'kb-min-order',
  },
  {
    pattern: /\b(hours|open|closed|location|address|phone|call you|reach you)\b|where (are|is) you/i,
    scriptId: 'kb-hours-locations',
  },
  {
    pattern: /\b(price|pricing|cost|costs|catalog price|how much)\b/i,
    scriptId: 'kb-pricing',
  },
  {
    pattern: /\b(pvc|sch\s*\d+|schedule\s*\d+|cpvc|conduit)\b/i,
    scriptId: 'kb-pvc-schedules',
  },

  // 3. Scripted spec / qualification paths — multi-turn demos.
  { pattern: /lead\s*time|in\s*stock|stock|when can|how (long|fast)/i, scriptId: 'lead-time-pvc' },
  { pattern: /pallet|rack|warehouse|sqft|sq\s*ft|facility/i, scriptId: 'spec-pallet-rack' },
  { pattern: /distributor|dealer|installer|nearest|near me|local|where (are|is)/i, scriptId: 'closest-distributor' },
  { pattern: /custom|install|installation|specialist/i, scriptId: 'custom-install' },
  { pattern: /pipe|valve|fitting|flange|bolt|hydraulic|psi|ss\b/i, scriptId: 'lead-time-pvc' },
];

function routeFreeform(text: string): string {
  for (const { pattern, scriptId } of FREEFORM_ROUTES) {
    if (pattern.test(text)) return scriptId;
  }
  return 'freeform-fallback';
}

// ─── Component ─────────────────────────────────────────────────────────────

interface ChatBubble {
  role: 'user' | 'bot' | 'human' | 'system' | 'feature-tag' | 'typing';
  text: string;
  /** Only set when role === 'human'. Display name + initials for the
   *  human-takeover bubble's avatar / sender chrome. */
  humanName?: string;
  humanInitials?: string;
  scriptId?: string;
}

const TYPING_DELAY_MS = 700;
const BOT_BUBBLE_DELAY_MS = 1000;
const INITIAL_BOT_GREETING =
  "Hey, Boltz here, Crestline's parts assistant. Ask me about specs, stock, lead times, pricing, or where to find your local installer. I'll pull in one of our product experts once I know a little bit more about how we can help you.";

export default function BoltzChatDemo() {
  const [bubbles, setBubbles] = useState<ChatBubble[]>([
    { role: 'bot', text: INITIAL_BOT_GREETING },
  ]);
  const [activeChipIds, setActiveChipIds] = useState<string[]>(STARTING_CHIP_IDS);
  const [awaitingBot, setAwaitingBot] = useState(false);
  const [freeform, setFreeform] = useState('');
  /** Once a script with `endsWithHuman: true` runs, the chat is "live"
   *  with the promised human — chips disappear and freeform input goes
   *  read-only with a status note so the demo lands the handoff moment. */
  const [humanInSeat, setHumanInSeat] = useState(false);
  /** Tracks WHICH human will jump in if/when the conversation hits an
   *  email-handoff or human-handoff-direct script. Updated each time an
   *  upstream script's `promisesAgent` field is set; persists otherwise
   *  so the rack-spec → region → email path correctly delivers Lauren
   *  even though `email-handoff` is a shared script. */
  const [promisedAgent, setPromisedAgent] = useState<PromisedAgent>(DEFAULT_AGENT);

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

    // Determine which human takes over IF this flow ends with a handoff.
    // If THIS script promises an agent, that wins; otherwise carry forward
    // whoever the prior script promised (so rack-spec → region → email
    // → handoff lands on Lauren even though email-handoff itself doesn't
    // mention her). Captured as a const so the setTimeout closures below
    // see a consistent value even after setPromisedAgent batches.
    const agentForFlow: PromisedAgent = script.promisesAgent ?? promisedAgent;
    if (script.promisesAgent) {
      setPromisedAgent(script.promisesAgent);
    }

    const userText = userTextOverride ?? script.userText;
    const newBubbles: ChatBubble[] = [];
    if (script.featureTag) {
      newBubbles.push({ role: 'feature-tag', text: script.featureTag });
    }
    if (userText) {
      newBubbles.push({ role: 'user', text: userText });
    }
    setBubbles((prev) => [...prev, ...newBubbles]);

    // Substitution targets:
    //   ${USER_MSG}         — visitor's most recent typed/clicked message
    //   ${HUMAN_NAME}       — full name of the agent the upstream flow
    //                         promised (e.g. "Lauren K.")
    //   ${HUMAN_FIRST_NAME} — same agent, first-name only ("Lauren")
    //   ${HUMAN_ROLE}       — short role label for the system bubble
    function fillTemplate(text: string): string {
      const safe = userText && userText.length > 0 ? userText : 'your message';
      return text
        .replace(/\$\{USER_MSG\}/g, safe)
        .replace(/\$\{HUMAN_NAME\}/g, agentForFlow.name)
        .replace(/\$\{HUMAN_FIRST_NAME\}/g, agentForFlow.firstName)
        .replace(/\$\{HUMAN_ROLE\}/g, agentForFlow.role);
    }

    // System bubbles are render-instant; bot + human bubbles each get a
    // typing-dots beat in front of them so the cadence feels human.
    let elapsed = 0;
    script.scriptedTurns.forEach((turn, i) => {
      const isFirst = i === 0;
      const typingDelay = isFirst ? TYPING_DELAY_MS : BOT_BUBBLE_DELAY_MS;

      if (turn.kind === 'system') {
        // System notice — appears with a small beat, no typing dots.
        // Substitute templates so "Lauren K. (West Coast regional manager)
        // joined the chat" matches the upstream-promised agent.
        const filledText = fillTemplate(turn.text);
        const t = setTimeout(() => {
          setBubbles((prev) => [
            ...prev,
            { role: 'system', text: filledText },
          ]);
        }, elapsed + Math.min(typingDelay, 350));
        timersRef.current.push(t);
        elapsed += Math.min(typingDelay, 350);
        return;
      }

      // Bot or human bubble — show typing dots first, then the bubble.
      const typingTimer = setTimeout(() => {
        setBubbles((prev) => [...prev, { role: 'typing', text: '' }]);
      }, elapsed);
      timersRef.current.push(typingTimer);
      elapsed += typingDelay;

      const bubbleTimer = setTimeout(() => {
        setBubbles((prev) => {
          const next = [...prev];
          for (let j = next.length - 1; j >= 0; j--) {
            if (next[j]?.role === 'typing') {
              next.splice(j, 1);
              break;
            }
          }
          if (turn.kind === 'human') {
            // Per-turn override is honoured (lets a script hard-pin a
            // specific person), but in practice the agent comes from
            // the upstream flow's promisesAgent state.
            next.push({
              role: 'human',
              text: fillTemplate(turn.text),
              humanName: turn.humanName ?? agentForFlow.name,
              humanInitials: turn.humanInitials ?? agentForFlow.initials,
            });
          } else {
            next.push({ role: 'bot', text: fillTemplate(turn.text) });
          }
          return next;
        });
      }, elapsed);
      timersRef.current.push(bubbleTimer);
    });

    // After all turns play, either flip into "human is in the seat" mode
    // (closes the demo on the handoff beat) or surface follow-up chips.
    const finalTimer = setTimeout(() => {
      if (script.endsWithHuman) {
        setHumanInSeat(true);
        setActiveChipIds([]);
      } else {
        setActiveChipIds(script.followupIds ?? []);
      }
      setAwaitingBot(false);
      if (!script.endsWithHuman) {
        inputRef.current?.focus({ preventScroll: true });
      }
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
    setHumanInSeat(false);
    setPromisedAgent(DEFAULT_AGENT);
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

        {/* Chip row — hidden once the human is in the seat */}
        {!humanInSeat && visibleChips.length > 0 && (
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

        {/* Type-a-question hint — surfaces the KB topics so visitors
            know the freeform input is real, not just a fallback. Hidden
            once the human is in the seat (input is locked then). */}
        {!humanInSeat && (
          <div
            data-testid="boltz-type-hint"
            style={{
              padding: '0.625rem 1.125rem 0.5rem',
              borderTop: '1px solid var(--od-border)',
              background: 'var(--od-card)',
              fontSize: '0.75rem',
              lineHeight: 1.5,
              color: 'var(--od-muted)',
              textAlign: 'left',
            }}
          >
            Or type a question — try{' '}
            <span style={{ color: 'var(--od-gold)', fontWeight: 600 }}>
              pricing, shipping, returns, warranty, payment terms, MOQs, hours,
              or PVC specs
            </span>
            .
          </div>
        )}

        {/* Input row — locks once Marisol is in the seat (the demo's
            handoff moment); Reset always lets the visitor start over.
            Skips its borderTop when the type-hint is rendered (hint
            already provides the divider) to avoid a doubled rule. */}
        <form
          onSubmit={handleFreeformSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: humanInSeat
              ? '0.875rem 1.125rem 1rem'
              : '0.5rem 1.125rem 1rem',
            borderTop: humanInSeat ? '1px solid var(--od-border)' : 'none',
            background: 'var(--od-card)',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={freeform}
            onChange={(e) => setFreeform(e.target.value)}
            disabled={awaitingBot || humanInSeat}
            placeholder={
              humanInSeat
                ? `${promisedAgent.firstName} is on the chat — try Reset to run the demo again`
                : 'Ask about a part, spec, or quantity…'
            }
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
              opacity: humanInSeat ? 0.6 : 1,
              cursor: humanInSeat ? 'not-allowed' : 'text',
            }}
          />
          <button
            type="submit"
            disabled={awaitingBot || humanInSeat || freeform.trim().length === 0}
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
                awaitingBot || humanInSeat || freeform.trim().length === 0
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                awaitingBot || humanInSeat || freeform.trim().length === 0 ? 0.5 : 1,
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

  if (bubble.role === 'system') {
    return (
      <div
        data-testid="boltz-system-bubble"
        role="status"
        style={{
          alignSelf: 'center',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--od-muted)',
          fontStyle: 'italic',
          margin: '0.5rem 0',
          padding: '0.375rem 0.875rem',
          borderRadius: '999px',
          background: 'rgba(111, 194, 132, 0.08)',
          border: '1px solid rgba(111, 194, 132, 0.3)',
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
            boxShadow: '0 0 6px rgba(111, 194, 132, 0.7)',
          }}
        />
        <span>{bubble.text}</span>
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

  if (bubble.role === 'human') {
    return (
      <div
        data-testid="boltz-human-bubble"
        style={{
          alignSelf: 'flex-start',
          maxWidth: '88%',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-start',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            flex: '0 0 auto',
            width: 28,
            height: 28,
            borderRadius: '8px',
            background: 'var(--od-pink, #ef4e73)',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
            fontWeight: 800,
            fontSize: '0.8125rem',
          }}
        >
          {bubble.humanInitials ?? 'H'}
        </span>
        <div style={{ minWidth: 0 }}>
          {bubble.humanName && (
            <div
              data-testid="boltz-human-name"
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--od-pink, #ef4e73)',
                marginBottom: '0.25rem',
              }}
            >
              {bubble.humanName} · live agent
            </div>
          )}
          <div
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: '14px 14px 14px 4px',
              background: 'rgba(239, 78, 115, 0.10)',
              border: '1px solid rgba(239, 78, 115, 0.35)',
              color: 'var(--od-white)',
              fontSize: '0.9375rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {bubble.text}
          </div>
        </div>
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
