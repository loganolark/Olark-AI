import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import VideoSection from './VideoSection';
import { VideoLightboxProvider } from '@/components/ui/VideoLightbox';

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

function renderSection(
  override: Partial<React.ComponentProps<typeof VideoSection>> = {},
) {
  return render(
    <VideoLightboxProvider>
      <VideoSection
        label="Live Search"
        title="Your Bot Is Ready Before Your First Customer Arrives"
        intro="See how Aiden goes from blank to live in 60 seconds."
        mediaId="fgqmk8acw5"
        page="essentials"
        {...override}
      />
    </VideoLightboxProvider>,
  );
}

describe('VideoSection', () => {
  it('renders the label, headline, intro, and an embedded thumbnail', () => {
    renderSection();
    expect(screen.getByText('Live Search')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Your Bot Is Ready Before Your First Customer Arrives/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/See how Aiden goes from blank/)).toBeInTheDocument();
    expect(screen.getByTestId('video-embed-thumbnail')).toBeInTheDocument();
  });

  it('renders a checklist when provided', () => {
    renderSection({
      checklist: [
        { title: 'One-Step Setup', body: 'Paste URL — live.' },
        { title: 'Always Current', body: 'Auto-updates.' },
        { title: 'Test It Immediately', body: 'No waiting.' },
      ],
    });
    const list = screen.getByTestId('video-section-checklist');
    expect(list).toBeInTheDocument();
    expect(list.querySelectorAll('li')).toHaveLength(3);
    expect(screen.getByText('One-Step Setup')).toBeInTheDocument();
    expect(screen.getByText('Always Current')).toBeInTheDocument();
  });

  it('hides the checklist when variant is solo', () => {
    renderSection({
      variant: 'solo',
      checklist: [{ title: 'Should not show', body: 'nope' }],
    });
    expect(screen.queryByTestId('video-section-checklist')).toBeNull();
    expect(screen.getByTestId('video-section').getAttribute('data-variant')).toBe('solo');
  });

  it('passes the media id to the thumbnail', () => {
    renderSection({ mediaId: 'ttc5obl4nd' });
    const thumb = screen.getByTestId('video-embed-thumbnail');
    expect(thumb.getAttribute('data-media-id')).toBe('ttc5obl4nd');
  });
});
