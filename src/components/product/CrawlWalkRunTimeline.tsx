'use client';

import React, { useState } from 'react';

export interface TimelinePhase {
  id: 'crawl' | 'walk' | 'run';
  label: string;
  headline: string;
  detail: string;
}

const PHASES: TimelinePhase[] = [
  {
    id: 'crawl',
    label: 'Days 1–2',
    headline: 'Bot live on your site',
    detail:
      'Aiden trains on your site, pricing, and FAQs in under 60 minutes. By end of Day 2 the widget is live, qualifying every visitor.',
  },
  {
    id: 'walk',
    label: 'Weeks 2–3',
    headline: 'Custom conversation flows',
    detail:
      'We layer in role-specific pathways: SDR-handoff, support escalation, demo scheduling. Your reps see the first qualified handoffs within 14 days.',
  },
  {
    id: 'run',
    label: 'Month 1',
    headline: 'Full CRM integration, signal trail active, rep intelligence dashboard live',
    detail:
      'Aiden is wired into your HubSpot pipeline with deal creation, activity logging, and tier-segmented routing. Logan reviews ROI alongside you.',
  },
];

export default function CrawlWalkRunTimeline() {
  const [openPhase, setOpenPhase] = useState<TimelinePhase['id'] | null>(null);

  return (
    <div role="list" className="cwr-timeline">
      {PHASES.map((phase) => {
        const isOpen = openPhase === phase.id;
        const detailId = `cwr-detail-${phase.id}`;
        return (
          <div role="listitem" key={phase.id} className="cwr-phase">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={detailId}
              className="cwr-phase__trigger"
              onClick={() => setOpenPhase(isOpen ? null : phase.id)}
            >
              <span>
                <span className="cwr-phase__label">{phase.label}</span>
                <span className="cwr-phase__headline">{phase.headline}</span>
              </span>
              <span
                aria-hidden="true"
                className="cwr-phase__chevron"
                data-open={isOpen ? 'true' : 'false'}
              >
                ▾
              </span>
            </button>
            <div id={detailId} className="cwr-drawer" hidden={!isOpen}>
              {phase.detail}
            </div>
          </div>
        );
      })}
    </div>
  );
}
