import React from 'react';
import ProductIcon, { type ProductIconName } from '@/components/ui/ProductIcon';
import Reveal from '@/components/ui/Reveal';

type FeatureGroup = 'training' | 'features' | 'usage';

interface FeatureCard {
  icon: ProductIconName;
  title: string;
  body: string;
  group: FeatureGroup;
}

const CARDS: FeatureCard[] = [
  {
    icon: 'bot',
    title: 'Aiden Chatbot for One Website',
    body: 'Your dedicated AI, trained on your business and answering customer questions 24 hours a day, 7 days a week.',
    group: 'training',
  },
  {
    icon: 'bolt',
    title: 'Live Search — Website Ingest',
    body: 'Paste your URL and Aiden learns your entire site instantly. It stays current automatically. No manual updates, ever.',
    group: 'training',
  },
  {
    icon: 'document',
    title: 'Document Ingest',
    body: 'Upload product docs, FAQs, guides, or knowledge bases. Your bot learns from everything you give it.',
    group: 'training',
  },
  {
    icon: 'brain',
    title: 'AI Analyst',
    body: 'Your chat history is untapped intelligence. Aiden surfaces your highest-intent visitors, ranks them by purchase likelihood, and generates content ideas from what your customers are actually asking about — trained on your transcripts, your website, and your business.',
    group: 'features',
  },
  {
    icon: 'chat',
    title: 'Stock Answers',
    body: 'Pre-set instant responses to your most common questions, delivered consistently, every single time, without fail.',
    group: 'features',
  },
  {
    icon: 'globe',
    title: 'Multilingual Chatbot',
    body: 'Serve customers in their own language, automatically. No extra setup. No translation tools required.',
    group: 'features',
  },
  {
    icon: 'unlock',
    title: 'Unlimited Chats & Knowledge Uploads',
    body: 'No caps. No throttling. No surprise overage fees. Use Aiden as much as your business demands.',
    group: 'usage',
  },
  {
    icon: 'chart',
    title: 'AI Admin Portal & Reporting',
    body: 'Manage your AI and track performance from one clean, intuitive dashboard. No training required to get started.',
    group: 'usage',
  },
];

const GROUP_LABELS: Record<FeatureGroup, string> = {
  training: 'Training',
  features: 'Features',
  usage: 'Usage & Reporting',
};

const GROUP_ORDER: FeatureGroup[] = ['training', 'features', 'usage'];

export default function EssentialsFeatureGroups() {
  return (
    <section
      id="essentials-features"
      className="product-section"
      style={{ backgroundColor: 'var(--od-card)' }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <p
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'var(--od-gold)',
            textAlign: 'center',
            margin: '0 0 1rem',
          }}
        >
          What&rsquo;s Included
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
            fontWeight: 900,
            fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--od-white)',
            textAlign: 'center',
            margin: '0 0 1.25rem',
          }}
        >
          Everything You Need to Start Smart
        </h2>
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--od-text)',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '0 auto 3rem',
          }}
        >
          Aiden Essentials is a complete AI platform, not a stripped-down starter. Every feature you need to deploy, train,
          and run a high-quality chatbot comes included from day one.
        </p>

        {GROUP_ORDER.map((group) => {
          const groupCards = CARDS.filter((c) => c.group === group);
          return (
            <div key={group} style={{ marginBottom: '2.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: 'var(--od-gold)',
                    flexShrink: 0,
                  }}
                >
                  {GROUP_LABELS[group]}
                </span>
                <span
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    height: '1px',
                    background: 'linear-gradient(90deg, rgba(245,194,0,0.4), rgba(245,194,0,0))',
                  }}
                />
              </div>
              <div className="efg-grid">
                {groupCards.map((card, cardIdx) => (
                  <Reveal
                    key={card.title}
                    threshold={0.15}
                    delay={cardIdx * 80}
                    offset={10}
                    style={{
                      backgroundColor: 'var(--od-navy)',
                      border: '1px solid var(--od-border)',
                      borderRadius: '0.75rem',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '9px',
                        background: 'rgba(245,194,0,0.12)',
                        color: 'var(--od-gold)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <ProductIcon name={card.icon} size={20} />
                    </span>
                    <h3
                      style={{
                        fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                        fontWeight: 700,
                        fontSize: '1.0625rem',
                        letterSpacing: '-0.01em',
                        color: 'var(--od-white)',
                        margin: 0,
                      }}
                    >
                      {card.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.9375rem',
                        lineHeight: 1.6,
                        color: 'var(--od-text)',
                        margin: 0,
                      }}
                    >
                      {card.body}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
