import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const trackEventMock = vi.fn();

vi.mock('@/lib/analytics', () => ({
  trackEvent: (name: string, params?: Record<string, unknown>) => trackEventMock(name, params),
}));

import MidPageMeetingCTA from './MidPageMeetingCTA';

beforeEach(() => {
  trackEventMock.mockClear();
});

describe('MidPageMeetingCTA', () => {
  it('renders the Essentials title for page="essentials"', () => {
    render(<MidPageMeetingCTA page="essentials" />);
    expect(
      screen.getByRole('heading', { level: 2, name: /The Smartest First Step in AI Starts Here/i }),
    ).toBeInTheDocument();
  });

  it('renders the Lead-Gen title for page="lead-gen"', () => {
    render(<MidPageMeetingCTA page="lead-gen" />);
    expect(
      screen.getByRole('heading', { level: 2, name: /Put Aiden to Work as Your New Sales/i }),
    ).toBeInTheDocument();
  });

  it('renders the Commercial title for page="commercial"', () => {
    render(<MidPageMeetingCTA page="commercial" />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Ready to Put Aiden to Work as Your Commercial Sales Engine/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders all 3 trust items', () => {
    render(<MidPageMeetingCTA page="essentials" />);
    expect(
      screen.getByText(/Free live onboarding included with every plan/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/No commitment required/i)).toBeInTheDocument();
    expect(screen.getByText(/No technical setup required/i)).toBeInTheDocument();
  });

  it('renders the "Start Today" pill badge', () => {
    render(<MidPageMeetingCTA page="essentials" />);
    expect(screen.getByText(/Start Today/i)).toBeInTheDocument();
  });

  it('CTA links to /get-started', () => {
    render(<MidPageMeetingCTA page="essentials" />);
    const cta = screen.getByRole('link', { name: /Schedule to Learn More About Aiden/i });
    expect(cta).toHaveAttribute('href', '/get-started');
  });

  it('fires trackEvent with the right page-key on click for essentials', async () => {
    const user = userEvent.setup();
    render(<MidPageMeetingCTA page="essentials" />);
    const cta = screen.getByRole('link', { name: /Schedule to Learn More About Aiden/i });
    await user.click(cta);
    expect(trackEventMock).toHaveBeenCalledWith('product_page_meeting_cta_click', {
      page: 'essentials',
    });
  });

  it('fires trackEvent with page="lead-gen" on lead-gen page click', async () => {
    const user = userEvent.setup();
    render(<MidPageMeetingCTA page="lead-gen" />);
    const cta = screen.getByRole('link', { name: /Schedule to Learn More About Aiden/i });
    await user.click(cta);
    expect(trackEventMock).toHaveBeenCalledWith('product_page_meeting_cta_click', {
      page: 'lead-gen',
    });
  });

  it('fires trackEvent with page="commercial" on commercial page click', async () => {
    const user = userEvent.setup();
    render(<MidPageMeetingCTA page="commercial" />);
    const cta = screen.getByRole('link', { name: /Schedule to Learn More About Aiden/i });
    await user.click(cta);
    expect(trackEventMock).toHaveBeenCalledWith('product_page_meeting_cta_click', {
      page: 'commercial',
    });
  });
});
