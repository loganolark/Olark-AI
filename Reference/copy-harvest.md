# Copy Harvest — `/essentials` + `/lead-gen`

Lines worth mining for the new home + product narrative. Pulled before deletion.
Each line is tagged with a rough category and a one-line note on where it might
re-land in the industrial-supplier rewrite.

---

## From `/essentials`

### Setup-speed framings (reusable for "drop the widget on your site" moment)

- **"Live in 48 hours. Every visitor qualified, routed, and ready for your rep."**
  → Strong opener for product-page implementation timeline. Industrial buyers
  appreciate fast time-to-value.

- **"Paste your website URL and your bot is live and trained. No file downloads.
  No scraping tools. No setup calls with IT."**
  → "Plays with your stack" pillar. The IT-friction angle resonates harder for
  industrial supply (where IT is gatekeeper).

- **"Aiden continuously learns from your website as it changes. Updates happen
  automatically. You won't even have to remember."**
  → Maps to the new "Scans your site continuously — no quarterly retraining
  cycles" pillar. Reuse near-verbatim.

- **"Most platforms make you wait an hour or more after setup. With Live Search,
  your bot is ready to test the moment you hit save."**
  → Counter-positioning line. Could go in product page next to the "Plays with
  your stack" feature.

### Catalog/document-ingestion framings

- **"Your Bot Is Ready Before Your First Customer Arrives"** (section title)
  → Could become a chat-demo intro line.

- **"trained on your transcripts, your website, and your business — delivering
  real-time intelligence that is entirely specific to you"**
  → Industrial framing: "trained on your spec sheets, your catalog, your
  installation manuals — speaks PSI, not vibes."

### Intelligence/analytics framings (still relevant for product page)

- **"Your Chat History Has Been Sitting on a Goldmine"** (h2)
  → Could become the lead-in to the dashboard screenshots section.

- **"Aiden Analyst surfaces your highest-intent visitors, ranks them by purchase
  likelihood, and generates content ideas directly from what your customers are
  actually asking about."**
  → Reframe for industrial: "ranks RFQs by lead score, surfaces which spec
  questions your buyers ask most often, generates account briefs."

---

## From `/lead-gen`

### The "extra SDR" / handoff framing (CORE for new narrative)

- **"Your Team Just Got an Extra SDR"** (hero h1)
  → Don't reuse verbatim — too generic — but the IDEA (Aiden as the always-on
  qualifier upstream of the human) is the engine of the new narrative.

- **"Every visitor pre-qualified. Every handoff context-loaded. Your reps walk
  into conversations already briefed."**
  → Strong. Reuse near-verbatim somewhere in the product page's "human
  handoff" section. Industrial twist: "Your reps walk into the call already
  knowing the buyer's payload, voltage, NEMA rating, and timeline."

### Routing / self-selection framings

- **"With routing buttons at the beginning of every chat, Aiden helps customers
  self-select the right path: sales, support, or product details. Every
  interaction starts in the right place."**
  → Industrial reframe: "self-select to RFQ, technical support, dealer locator,
  or installation help — every interaction starts in the right place."

- **"That reduces friction, boosts engagement, and means your team never fields
  a conversation that was never theirs to begin with."**
  → Reuse for the Distributor Routing pillar.

### Pipeline / qualification framings

- **"Aiden doesn't just deflect tickets. It captures lead info, qualifies
  prospects, and passes hot opportunities straight to your sales team,
  automatically and without a single manual step."**
  → Direct reuse with one swap: "deflect tickets" → "answer FAQs."

### Automation / human-elevation framings (CORE — maps to "We still believe in humans" pillar)

- **"Automate the Routine. Elevate the Human."** (h2)
  → Strong. Reuse, possibly as the lead-in to the "We enhance the human
  moment" centerpiece block.

- **"Repetitive questions don't need your team's time. Aiden provides instant,
  accurate answers from your own content, freeing your staff to focus on
  complex issues and meaningful connections."**
  → Industrial reframe: "Routine spec lookups don't need your team's time.
  Aiden answers from your own catalog, freeing your engineers to close the
  six-figure projects."

- **"Customers get quick help. Your team gets their time back. Everyone wins.
  Except the support backlog."**
  → Punchy ending. Reuse the construction with industrial nouns: "Buyers get
  answers immediately. Your team gets their time back. Everyone wins. Except
  the inquiry queue."

### Sample chat lines from /lead-gen video section (the chat-style checklist)

- **"I have a few questions about pricing." → Aiden routes to Sales with full
  context and a qualified handoff brief.**
  → Industrial swap: "Do you carry 2" SS ball valves in stock?" → bot answers
  + flags as in-stock RFQ.

- **"Where can I find docs on the API?" → Aiden serves the right help article
  instantly — no agent needed.**
  → Industrial swap: "What's the load capacity on a Series 5000 rack?" → bot
  pulls the spec sheet and answers inline.

- **"I'm looking for an enterprise demo." → Aiden qualifies the visitor and
  books the meeting on the spot.**
  → Industrial swap: "We're spec'ing out a new 50,000sqft facility." → bot
  qualifies (timeline, square footage, weight loads) and books the meeting
  with the regional manager.

---

## Components used ONLY by the deleted pages (kill list)

Verify before delete:

- `EssentialsFeatureGroups` — only `/essentials` imports it
- `RoutingVisual`, `PipelineVisual`, `AutomationVisual` — only `/lead-gen`
  imports them (probably — verify via grep before delete)
- `SupportPromise` — verify (might be used elsewhere)
- `VideoSection`, `VideoEmbedThumbnail`, `FeatureSpotlight` — KEEP (likely
  reused on /commercial)
- `QuoteSection`, `QuoteBuilder`, `QuizResumeBanner` — KEEP (re-used on
  /commercial + survives into the new product page)

---

## Narrative threads that did NOT exist on these two pages but should land in the
## new build (per the brief)

- The "expensive digital filing cabinet" / "Contact Us form goes into a black
  hole" framing — *threading line* for hero + chat-demo intro.
- "We speak PSI, SKU, and Human. Fluently."
- "17 years of live chat, now AI-first" — already in the homepage hero badge.
- "Engineered to order, sold by relationship — your chat should match."
