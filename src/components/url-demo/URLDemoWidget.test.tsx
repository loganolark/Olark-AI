import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import URLDemoWidget from './URLDemoWidget';
import { trackEvent } from '@/lib/analytics';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

vi.mock('@/components/url-demo/TrainingStateDisplay', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => (
    <button onClick={onComplete} data-testid="training-complete-btn">
      Training done
    </button>
  ),
}));

vi.mock('@/lib/analytics', () => ({ trackEvent: vi.fn() }));

vi.mock('@/components/url-demo/ChatMessage', () => ({
  default: ({
    role,
    content,
    isTyping,
  }: {
    role: string;
    content: string;
    isTyping?: boolean;
  }) => (
    <div data-testid={`chat-msg-${role}`} data-typing={String(!!isTyping)}>
      {isTyping ? 'typing...' : content}
    </div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeTrainFetch() {
  return vi.fn().mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ data: { sessionId: 'sess-1', status: 'training' }, error: null }),
  });
}

function makeChatFetch(content = 'Answer from Aiden') {
  return {
    ok: true,
    headers: { get: () => 'application/json' },
    json: () => Promise.resolve({ data: { content }, error: null }),
  };
}

async function renderToReady(fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubGlobal('fetch', fetchMock);
  render(<URLDemoWidget />);
  await userEvent.type(screen.getByRole('textbox', { name: /Enter your company website URL/i }), 'example.com');
  await userEvent.click(screen.getByRole('button', { name: /See Aiden on Your Site/i }));
  await screen.findByTestId('training-complete-btn');
  await userEvent.click(screen.getByTestId('training-complete-btn'));
}

// ─── Existing tests ──────────────────────────────────────────────────────────

describe('URLDemoWidget — idle state', () => {
  it('renders URL input with correct placeholder and aria-label', () => {
    render(<URLDemoWidget />);
    const input = screen.getByRole('textbox', { name: /Enter your company website URL/i });
    expect(input).toHaveAttribute('placeholder', 'yourcompany.com');
  });

  it('renders primary CTA button', () => {
    render(<URLDemoWidget />);
    expect(screen.getByRole('button', { name: /See Aiden on Your Site/i })).toBeInTheDocument();
  });
});

describe('URLDemoWidget — validation', () => {
  it('shows error and does not call fetch on malformed URL', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    render(<URLDemoWidget />);
    await userEvent.type(screen.getByRole('textbox'), 'not a url');
    await userEvent.click(screen.getByRole('button', { name: /See Aiden on Your Site/i }));
    expect(screen.getByText(/Enter a URL like acme\.com/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('URLDemoWidget — submitting → training', () => {
  it('calls /api/aiden/train with normalized URL and transitions to training', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ data: { sessionId: 'sess-1', status: 'training' }, error: null }),
      })
    );
    render(<URLDemoWidget />);
    await userEvent.type(screen.getByRole('textbox'), 'https://example.com/');
    await userEvent.click(screen.getByRole('button', { name: /See Aiden on Your Site/i }));
    await screen.findByTestId('training-complete-btn');
    const [, opts] = (vi.mocked(global.fetch) as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(JSON.parse(opts.body as string)).toEqual({ url: 'example.com' });
  });
});

describe('URLDemoWidget — fallback state', () => {
  it('shows fallback message on AIDEN_TIMEOUT error, not raw error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            data: null,
            error: { code: 'AIDEN_TIMEOUT', message: 'Training timed out' },
          }),
      })
    );
    render(<URLDemoWidget />);
    await userEvent.type(screen.getByRole('textbox'), 'example.com');
    await userEvent.click(screen.getByRole('button', { name: /See Aiden on Your Site/i }));
    await screen.findByText(/We'll set up your custom demo within 24 hours/i);
    expect(screen.queryByText(/AIDEN_TIMEOUT/i)).not.toBeInTheDocument();
  });
});

// ─── New Story 3.3 tests ──────────────────────────────────────────────────────

describe('URLDemoWidget — ready state (after training)', () => {
  it('shows Aiden opening message after training completes', async () => {
    await renderToReady(makeTrainFetch());
    const aidenMsg = screen.getByTestId('chat-msg-aiden');
    expect(aidenMsg).toHaveTextContent(/I've reviewed/i);
  });

  it('shows three starter chips', async () => {
    await renderToReady(makeTrainFetch());
    expect(screen.getByRole('button', { name: /How does pricing work/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /What makes you different/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /How long does implementation/i })).toBeInTheDocument();
  });

  it('shows chat textarea and Send button', async () => {
    await renderToReady(makeTrainFetch());
    expect(screen.getByRole('textbox', { name: /Chat with Aiden/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
  });

  it('fires url_demo_training_complete GA4 event', async () => {
    await renderToReady(makeTrainFetch());
    expect(vi.mocked(trackEvent)).toHaveBeenCalledWith('url_demo_training_complete');
  });

  it('fires url_demo_submitted GA4 event on form submit', async () => {
    await renderToReady(makeTrainFetch());
    expect(vi.mocked(trackEvent)).toHaveBeenCalledWith('url_demo_submitted', { url: 'example.com' });
  });
});

describe('URLDemoWidget — active state (chat)', () => {
  it('chip click sends message and shows Aiden response', async () => {
    const fetchMock = makeTrainFetch();
    fetchMock.mockResolvedValueOnce(makeChatFetch('Pricing starts at $X/mo.'));
    await renderToReady(fetchMock);
    await userEvent.click(screen.getByRole('button', { name: /How does pricing work/i }));
    await screen.findByText('Pricing starts at $X/mo.');
  });

  it('user message appears in thread after chip click', async () => {
    const fetchMock = makeTrainFetch();
    fetchMock.mockResolvedValueOnce(makeChatFetch('Answer'));
    await renderToReady(fetchMock);
    await userEvent.click(screen.getByRole('button', { name: /How does pricing work/i }));
    await screen.findByText('Answer');
    expect(screen.getByTestId('chat-msg-user')).toHaveTextContent('How does pricing work?');
  });

  it('fires url_demo_first_message GA4 event on first send', async () => {
    const fetchMock = makeTrainFetch();
    fetchMock.mockResolvedValueOnce(makeChatFetch());
    await renderToReady(fetchMock);
    await userEvent.click(screen.getByRole('button', { name: /How does pricing work/i }));
    await screen.findByText('Answer from Aiden');
    expect(vi.mocked(trackEvent)).toHaveBeenCalledWith('url_demo_first_message');
  });

  it('fires url_demo_message_count GA4 event after Aiden responds', async () => {
    const fetchMock = makeTrainFetch();
    fetchMock.mockResolvedValueOnce(makeChatFetch());
    await renderToReady(fetchMock);
    await userEvent.click(screen.getByRole('button', { name: /How does pricing work/i }));
    await screen.findByText('Answer from Aiden');
    expect(vi.mocked(trackEvent)).toHaveBeenCalledWith('url_demo_message_count', { count: 1 });
  });

  it('hides starter chips after transitioning to active', async () => {
    const fetchMock = makeTrainFetch();
    fetchMock.mockResolvedValueOnce(makeChatFetch());
    await renderToReady(fetchMock);
    await userEvent.click(screen.getByRole('button', { name: /How does pricing work/i }));
    await screen.findByText('Answer from Aiden');
    expect(screen.queryByRole('button', { name: /How does pricing work/i })).not.toBeInTheDocument();
  });
});

describe('URLDemoWidget — post-demo prompt', () => {
  async function renderTo2Exchanges() {
    const fetchMock = makeTrainFetch();
    fetchMock.mockResolvedValue(makeChatFetch('Answer'));
    await renderToReady(fetchMock);

    // Exchange 1 — chip
    await userEvent.click(screen.getByRole('button', { name: /How does pricing work/i }));
    await screen.findByText('Answer');

    // Exchange 2 — textarea
    const textarea = screen.getByRole('textbox', { name: /Chat with Aiden/i });
    await userEvent.type(textarea, 'Follow-up question');
    await userEvent.keyboard('{Enter}');
    await screen.findAllByText('Answer');
  }

  it('shows post-demo prompt after 2 exchanges', async () => {
    await renderTo2Exchanges();
    expect(screen.getByText(/Want to see what Aiden does/i)).toBeInTheDocument();
  });

  it('does not show post-demo prompt after only 1 exchange', async () => {
    const fetchMock = makeTrainFetch();
    fetchMock.mockResolvedValueOnce(makeChatFetch());
    await renderToReady(fetchMock);
    await userEvent.click(screen.getByRole('button', { name: /How does pricing work/i }));
    await screen.findByText('Answer from Aiden');
    expect(screen.queryByText(/Want to see what Aiden does/i)).not.toBeInTheDocument();
  });

  it('fires url_demo_unlock_more GA4 event when get-started link clicked', async () => {
    await renderTo2Exchanges();
    await userEvent.click(screen.getByRole('link', { name: /See the full platform/i }));
    expect(vi.mocked(trackEvent)).toHaveBeenCalledWith('url_demo_unlock_more');
  });

  it('calls onUnlockMore callback when get-started link clicked', async () => {
    const onUnlockMore = vi.fn();
    const fetchMock = makeTrainFetch();
    fetchMock.mockResolvedValue(makeChatFetch('A'));
    vi.stubGlobal('fetch', fetchMock);
    render(<URLDemoWidget onUnlockMore={onUnlockMore} />);
    await userEvent.type(screen.getByRole('textbox', { name: /Enter your company website URL/i }), 'example.com');
    await userEvent.click(screen.getByRole('button', { name: /See Aiden on Your Site/i }));
    await screen.findByTestId('training-complete-btn');
    await userEvent.click(screen.getByTestId('training-complete-btn'));
    await userEvent.click(screen.getByRole('button', { name: /How does pricing work/i }));
    await screen.findByText('A');
    const textarea = screen.getByRole('textbox', { name: /Chat with Aiden/i });
    await userEvent.type(textarea, 'q2');
    await userEvent.keyboard('{Enter}');
    await screen.findAllByText('A');
    await userEvent.click(screen.getByRole('link', { name: /See the full platform/i }));
    expect(onUnlockMore).toHaveBeenCalled();
  });
});
