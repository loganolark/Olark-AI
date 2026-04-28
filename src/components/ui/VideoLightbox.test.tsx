import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  VideoLightboxProvider,
  useVideoLightbox,
} from './VideoLightbox';

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

import { trackEvent } from '@/lib/analytics';

function ConsumerButton({
  mediaId = 'abc12345',
  page,
  title,
}: {
  mediaId?: string;
  page?: 'essentials' | 'lead-gen' | 'commercial';
  title?: string;
}) {
  const { open } = useVideoLightbox();
  return (
    <button type="button" onClick={() => open(mediaId, { page, title })}>
      open-trigger
    </button>
  );
}

beforeEach(() => {
  vi.mocked(trackEvent).mockReset();
  document.body.style.overflow = '';
});

afterEach(() => {
  document.body.style.overflow = '';
});

describe('VideoLightbox', () => {
  it('does not render the iframe before open', () => {
    render(
      <VideoLightboxProvider>
        <ConsumerButton />
      </VideoLightboxProvider>,
    );
    expect(screen.queryByTestId('video-lightbox-iframe')).toBeNull();
  });

  it('opens, mounts the iframe with correct Wistia src, and locks body overflow', async () => {
    const user = userEvent.setup();
    render(
      <VideoLightboxProvider>
        <ConsumerButton mediaId="fgqmk8acw5" page="essentials" title="Live Search" />
      </VideoLightboxProvider>,
    );

    await user.click(screen.getByText('open-trigger'));

    const iframe = screen.getByTestId('video-lightbox-iframe') as HTMLIFrameElement;
    expect(iframe.src).toContain('https://fast.wistia.net/embed/iframe/fgqmk8acw5');
    expect(iframe.src).toContain('autoPlay=1');
    expect(iframe.src).toContain('fitStrategy=contain');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('fires product_video_open with media_id + page on open', async () => {
    const user = userEvent.setup();
    render(
      <VideoLightboxProvider>
        <ConsumerButton mediaId="654bn7hwb5" page="lead-gen" />
      </VideoLightboxProvider>,
    );
    await user.click(screen.getByText('open-trigger'));
    expect(trackEvent).toHaveBeenCalledWith('product_video_open', {
      media_id: '654bn7hwb5',
      page: 'lead-gen',
    });
  });

  it('closes on close-button click and restores body overflow', async () => {
    const user = userEvent.setup();
    render(
      <VideoLightboxProvider>
        <ConsumerButton mediaId="x" page="commercial" />
      </VideoLightboxProvider>,
    );
    await user.click(screen.getByText('open-trigger'));
    expect(document.body.style.overflow).toBe('hidden');
    await user.click(screen.getByLabelText('Close video'));
    expect(document.body.style.overflow).toBe('');
  });

  it('closes on backdrop click', async () => {
    const user = userEvent.setup();
    render(
      <VideoLightboxProvider>
        <ConsumerButton />
      </VideoLightboxProvider>,
    );
    await user.click(screen.getByText('open-trigger'));
    const dialog = screen.getByTestId('video-lightbox');
    await user.click(dialog);
    await waitFor(() => {
      expect(dialog.getAttribute('data-state')).toBe('closed');
    });
  });

  it('closes on ESC key', async () => {
    const user = userEvent.setup();
    render(
      <VideoLightboxProvider>
        <ConsumerButton />
      </VideoLightboxProvider>,
    );
    await user.click(screen.getByText('open-trigger'));
    const dialog = screen.getByTestId('video-lightbox');
    expect(dialog.getAttribute('data-state')).toBe('open');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(dialog.getAttribute('data-state')).toBe('closed');
    });
  });

  it('fires product_video_close with duration_open_ms on close', async () => {
    const user = userEvent.setup();
    render(
      <VideoLightboxProvider>
        <ConsumerButton mediaId="m" page="essentials" />
      </VideoLightboxProvider>,
    );
    await user.click(screen.getByText('open-trigger'));
    await user.click(screen.getByLabelText('Close video'));
    const closeCall = vi
      .mocked(trackEvent)
      .mock.calls.find(([name]) => name === 'product_video_close');
    expect(closeCall).toBeDefined();
    expect(closeCall?.[1]).toMatchObject({
      media_id: 'm',
      page: 'essentials',
    });
    expect(typeof closeCall?.[1]?.duration_open_ms).toBe('number');
  });

  it('auto-closes when Wistia posts an "end" event', async () => {
    const user = userEvent.setup();
    render(
      <VideoLightboxProvider>
        <ConsumerButton />
      </VideoLightboxProvider>,
    );
    await user.click(screen.getByText('open-trigger'));
    const dialog = screen.getByTestId('video-lightbox');
    expect(dialog.getAttribute('data-state')).toBe('open');

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'wistia-player-event', data: { eventType: 'end' } },
        }),
      );
    });

    await waitFor(() => {
      expect(dialog.getAttribute('data-state')).toBe('closed');
    });
  });

  it('throws when useVideoLightbox is used outside the provider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Bad() {
      useVideoLightbox();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(/useVideoLightbox/);
    errorSpy.mockRestore();
  });

  it('traps focus: Tab from the iframe wraps back to the close button', async () => {
    const user = userEvent.setup();
    render(
      <VideoLightboxProvider>
        <ConsumerButton />
      </VideoLightboxProvider>,
    );
    await user.click(screen.getByText('open-trigger'));
    const closeBtn = screen.getByLabelText('Close video') as HTMLButtonElement;
    const iframe = screen.getByTestId('video-lightbox-iframe') as HTMLIFrameElement;

    // Move focus to the iframe (last focusable inside the dialog)
    iframe.focus();
    expect(document.activeElement).toBe(iframe);

    // Forward Tab from the last focusable should wrap back to the close button
    await user.tab();
    expect(document.activeElement).toBe(closeBtn);
  });

  it('traps focus: Shift+Tab from the close button wraps to the iframe', async () => {
    const user = userEvent.setup();
    render(
      <VideoLightboxProvider>
        <ConsumerButton />
      </VideoLightboxProvider>,
    );
    await user.click(screen.getByText('open-trigger'));
    const closeBtn = screen.getByLabelText('Close video') as HTMLButtonElement;
    const iframe = screen.getByTestId('video-lightbox-iframe') as HTMLIFrameElement;

    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(iframe);
  });

  it('cancels pending iframe teardown when re-opened during the close animation window', async () => {
    vi.useFakeTimers();
    try {
      function MultiTrigger() {
        const { open, close } = useVideoLightbox();
        return (
          <>
            <button type="button" onClick={() => open('first-id', { page: 'essentials' })}>
              open-first
            </button>
            <button type="button" onClick={() => open('second-id', { page: 'essentials' })}>
              open-second
            </button>
            <button type="button" onClick={() => close()}>
              programmatic-close
            </button>
          </>
        );
      }
      render(
        <VideoLightboxProvider>
          <MultiTrigger />
        </VideoLightboxProvider>,
      );

      // Open, then programmatically close, then re-open within the 300ms teardown window
      act(() => {
        screen.getByText('open-first').click();
      });
      expect(screen.getByTestId('video-lightbox-iframe')).toBeInTheDocument();

      act(() => {
        screen.getByText('programmatic-close').click();
      });
      // 100ms into the 300ms teardown window
      act(() => {
        vi.advanceTimersByTime(100);
      });

      act(() => {
        screen.getByText('open-second').click();
      });
      // The pending teardown timer would fire here without the cancel
      act(() => {
        vi.advanceTimersByTime(400);
      });

      const iframe = screen.getByTestId('video-lightbox-iframe') as HTMLIFrameElement;
      expect(iframe.src).toContain('/embed/iframe/second-id');
    } finally {
      vi.useRealTimers();
    }
  });
});
