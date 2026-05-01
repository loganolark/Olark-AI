import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BoltzChatDemo from './BoltzChatDemo';

describe('BoltzChatDemo — initial render', () => {
  it('shows the bot greeting + 4 starting chips + Aiden chrome', () => {
    render(<BoltzChatDemo />);
    expect(screen.getByText(/Boltz here, Crestline/i)).toBeInTheDocument();
    expect(screen.getAllByTestId('boltz-chip')).toHaveLength(4);
    expect(screen.getByTestId('powered-by-aiden')).toBeInTheDocument();
    expect(screen.getByText(/crestline-industrial\.com/i)).toBeInTheDocument();
  });
});

describe('BoltzChatDemo — chip click flow', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('clicking the lead-time chip adds the user bubble + a feature tag, then a bot response, then follow-up chips', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<BoltzChatDemo />);

    const leadTimeChip = screen
      .getAllByTestId('boltz-chip')
      .find((c) => c.getAttribute('data-chip-id') === 'lead-time-pvc');
    expect(leadTimeChip).toBeTruthy();
    await user.click(leadTimeChip!);

    // User bubble + feature tag appear immediately
    expect(screen.getByTestId('boltz-user-bubble').textContent).toMatch(
      /What's the lead time on 4" PVC pipe\?/i,
    );
    expect(screen.getByTestId('boltz-feature-tag').textContent).toMatch(
      /Spec answer · pulled from your catalog/i,
    );

    // Advance through both bot bubbles + final follow-up settle
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    const botBubbles = screen.getAllByTestId('boltz-bot-bubble');
    // Initial greeting + 2 scripted bot bubbles for this path
    expect(botBubbles.length).toBeGreaterThanOrEqual(3);
    expect(botBubbles[1].textContent).toMatch(/Sch 40 and Sch 80/i);

    // Follow-up chip surfaces
    await waitFor(() => {
      expect(
        screen.getByTestId('boltz-chip').getAttribute('data-chip-id'),
      ).toBe('lead-time-quantity');
    });
  });
});

describe('BoltzChatDemo — freeform input', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keyword-routes "where is my installer?" → closest-distributor script', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<BoltzChatDemo />);

    const input = screen.getByTestId('boltz-freeform-input');
    await user.type(input, 'where is my closest installer');
    await user.click(screen.getByTestId('boltz-freeform-submit'));

    expect(screen.getByTestId('boltz-user-bubble').textContent).toMatch(
      /where is my closest installer/i,
    );

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    const botBubbles = screen.getAllByTestId('boltz-bot-bubble');
    expect(botBubbles[botBubbles.length - 1].textContent).toMatch(
      /What's your zip\?/i,
    );
  });

  it('un-matched freeform falls back to the human-handoff script', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<BoltzChatDemo />);

    const input = screen.getByTestId('boltz-freeform-input');
    await user.type(input, 'something completely unrelated to the script');
    await user.click(screen.getByTestId('boltz-freeform-submit'));

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    const botBubbles = screen.getAllByTestId('boltz-bot-bubble');
    expect(botBubbles[botBubbles.length - 1].textContent).toMatch(
      /that one earns a human/i,
    );
  });
});

describe('BoltzChatDemo — reset', () => {
  it('clicking Reset restores the initial greeting + starting chips', async () => {
    const user = userEvent.setup();
    render(<BoltzChatDemo />);

    const customInstallChip = screen
      .getAllByTestId('boltz-chip')
      .find((c) => c.getAttribute('data-chip-id') === 'custom-install');
    await user.click(customInstallChip!);

    // After clicking, starting chips have been replaced (or temporarily
    // emptied) — assert the user bubble exists, then reset.
    expect(screen.getByTestId('boltz-user-bubble')).toBeInTheDocument();

    await user.click(screen.getByTestId('boltz-reset'));

    // Back to a clean slate: 4 starting chips, no user bubbles.
    expect(screen.getAllByTestId('boltz-chip')).toHaveLength(4);
    expect(screen.queryByTestId('boltz-user-bubble')).toBeNull();
  });
});
