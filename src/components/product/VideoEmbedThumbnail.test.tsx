import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VideoEmbedThumbnail from './VideoEmbedThumbnail';
import { VideoLightboxProvider } from '@/components/ui/VideoLightbox';

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

beforeEach(() => {
  document.body.style.overflow = '';
});

function renderThumb(props: {
  mediaId?: string;
  title?: string;
  page?: 'essentials' | 'lead-gen' | 'commercial';
}) {
  return render(
    <VideoLightboxProvider>
      <VideoEmbedThumbnail
        mediaId={props.mediaId ?? 'fgqmk8acw5'}
        title={props.title ?? 'Demo'}
        page={props.page ?? 'essentials'}
      />
    </VideoLightboxProvider>,
  );
}

describe('VideoEmbedThumbnail', () => {
  it('renders a button with an accessible label', () => {
    renderThumb({ title: 'Live Search demo' });
    expect(
      screen.getByRole('button', { name: 'Play video: Live Search demo' }),
    ).toBeInTheDocument();
  });

  it('renders the Wistia swatch poster image', () => {
    const { container } = renderThumb({ mediaId: 'tx6su2gamj' });
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe(
      'https://fast.wistia.com/embed/medias/tx6su2gamj/swatch',
    );
    expect(img?.getAttribute('alt')).toBe('');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  it('opens the lightbox with the correct media id when clicked', async () => {
    const user = userEvent.setup();
    renderThumb({ mediaId: 'ttc5obl4nd', page: 'commercial', title: 'Commercial demo' });
    expect(screen.queryByTestId('video-lightbox-iframe')).toBeNull();
    await user.click(screen.getByRole('button'));
    const iframe = screen.getByTestId('video-lightbox-iframe') as HTMLIFrameElement;
    expect(iframe.src).toContain('/embed/iframe/ttc5obl4nd');
  });

  it('uses 16/9 aspect ratio by default', () => {
    renderThumb({});
    const btn = screen.getByRole('button');
    expect(btn.style.aspectRatio).toContain(String(16 / 9));
  });
});
