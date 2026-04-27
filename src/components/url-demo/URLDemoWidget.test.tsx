import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import URLDemoWidget from './URLDemoWidget';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

vi.mock('@/components/url-demo/TrainingStateDisplay', () => ({
  default: ({ onComplete }: { onComplete: () => void }) => (
    <button onClick={onComplete} data-testid="training-complete-btn">
      Training done
    </button>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

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
