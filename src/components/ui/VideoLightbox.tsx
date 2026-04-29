'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { trackEvent } from '@/lib/analytics';

export type VideoLightboxPage = 'essentials' | 'lead-gen' | 'commercial';

export interface OpenLightboxOptions {
  page?: VideoLightboxPage;
  title?: string;
}

interface VideoLightboxContextValue {
  open: (mediaId: string, opts?: OpenLightboxOptions) => void;
  close: () => void;
  isOpen: boolean;
}

const VideoLightboxContext = createContext<VideoLightboxContextValue | null>(null);

export function useVideoLightbox(): VideoLightboxContextValue {
  const ctx = useContext(VideoLightboxContext);
  if (!ctx) {
    throw new Error('useVideoLightbox must be used inside <VideoLightboxProvider>');
  }
  return ctx;
}

interface ActiveState {
  mediaId: string;
  page?: VideoLightboxPage;
  title?: string;
  openedAt: number;
}

const IFRAME_TEARDOWN_MS = 300;

function buildIframeSrc(mediaId: string): string {
  const params = new URLSearchParams({
    autoPlay: '1',
    endVideoBehavior: 'reset',
    fitStrategy: 'contain',
    fullscreenButton: 'true',
  });
  return `https://fast.wistia.net/embed/iframe/${mediaId}?${params.toString()}`;
}

export function VideoLightboxProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<ActiveState | null>(null);
  const [renderIframe, setRenderIframe] = useState<boolean>(false);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const teardownTimerRef = useRef<number | null>(null);
  const titleId = useId();

  const open = useCallback(
    (mediaId: string, opts?: OpenLightboxOptions) => {
      // If a teardown timer from a previous close is pending, cancel it so the
      // freshly-mounted iframe is not unmounted out from under us.
      if (teardownTimerRef.current !== null) {
        window.clearTimeout(teardownTimerRef.current);
        teardownTimerRef.current = null;
      }
      if (typeof document !== 'undefined') {
        previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      }
      const next: ActiveState = {
        mediaId,
        page: opts?.page,
        title: opts?.title,
        openedAt: Date.now(),
      };
      setActive(next);
      setRenderIframe(true);
      trackEvent('product_video_open', {
        media_id: mediaId,
        page: opts?.page ?? null,
      });
    },
    [],
  );

  const close = useCallback(() => {
    if (!active) return;
    const durationOpenMs = Date.now() - active.openedAt;
    trackEvent('product_video_close', {
      media_id: active.mediaId,
      page: active.page ?? null,
      duration_open_ms: durationOpenMs,
    });
    setActive(null);
    // Tear down iframe after fade-out so audio/video stops cleanly. Track the
    // timer so a rapid re-open can cancel it.
    teardownTimerRef.current = window.setTimeout(() => {
      setRenderIframe(false);
      teardownTimerRef.current = null;
    }, IFRAME_TEARDOWN_MS);
    // Restore focus to the originating element
    if (previouslyFocusedRef.current) {
      try {
        previouslyFocusedRef.current.focus();
      } catch {
        /* noop */
      }
    }
  }, [active]);

  // Body overflow lock
  useEffect(() => {
    if (!active) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);

  // ESC to close + Tab focus trap
  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, iframe, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (activeEl === first || !dialog.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else if (activeEl === last || !dialog.contains(activeEl)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, close]);

  // Focus the close button on open
  useEffect(() => {
    if (!active) return;
    const node = closeButtonRef.current;
    if (node) {
      // Defer to next tick so the dialog is in the DOM
      window.setTimeout(() => node.focus(), 0);
    }
  }, [active]);

  // Auto-close when Wistia signals end
  useEffect(() => {
    if (!active) return undefined;
    function onMessage(event: MessageEvent) {
      try {
        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (
          data &&
          typeof data === 'object' &&
          (data as { type?: string }).type === 'wistia-player-event'
        ) {
          const inner = (data as { data?: { eventType?: string } }).data;
          if (inner && inner.eventType === 'end') close();
        }
      } catch {
        /* swallow non-JSON messages */
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [active, close]);

  const value: VideoLightboxContextValue = {
    open,
    close,
    isOpen: active !== null,
  };

  return (
    <VideoLightboxContext.Provider value={value}>
      {children}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="video-lightbox"
        data-state={active ? 'open' : 'closed'}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: active ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: 'rgba(39, 45, 63, 0.92)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <h2 id={titleId} style={visuallyHidden}>
          {active?.title ?? 'Video player'}
        </h2>
        {active && (
          <div
            data-testid="video-lightbox-shell"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '960px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label="Close video"
                style={{
                  background: 'rgba(250, 201, 23,0.12)',
                  border: '1px solid rgba(250, 201, 23,0.4)',
                  color: 'var(--od-white)',
                  borderRadius: '100px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '44px',
                  minWidth: '44px',
                }}
              >
                Close ✕
              </button>
            </div>
            <div
              data-testid="video-lightbox-frame"
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                background: 'var(--od-card)',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 0 60px rgba(250, 201, 23,0.25)',
              }}
            >
              {renderIframe && (
                <iframe
                  title={active.title ?? 'Wistia video player'}
                  src={buildIframeSrc(active.mediaId)}
                  allow="autoplay; fullscreen"
                  data-testid="video-lightbox-iframe"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </VideoLightboxContext.Provider>
  );
}

const visuallyHidden: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};
