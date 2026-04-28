import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuoteBuilder from './QuoteBuilder';

describe('QuoteBuilder — initial render', () => {
  it('shows the company text question first', () => {
    render(<QuoteBuilder tier="essentials" />);
    expect(screen.getByRole('textbox', { name: /What is your company name/i })).toBeInTheDocument();
    expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
  });

  it('Continue button is present and clickable', () => {
    render(<QuoteBuilder tier="essentials" />);
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
  });
});

describe('QuoteBuilder — text validation', () => {
  it('shakes the input and does not advance on empty submit', async () => {
    const user = userEvent.setup();
    const { container } = render(<QuoteBuilder tier="essentials" />);
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    expect(container.querySelector('.quote-input.shake')).not.toBeNull();
    expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
  });
});

async function answerCompany(user: ReturnType<typeof userEvent.setup>, name = 'Acme') {
  await user.type(screen.getByRole('textbox', { name: /company name/i }), name);
  await user.click(screen.getByRole('button', { name: /Continue/i }));
}

async function answerSeats(user: ReturnType<typeof userEvent.setup>, n: string) {
  const seatsInput = await screen.findByRole(
    'spinbutton',
    { name: /How many user seats/i },
    { timeout: 1500 },
  );
  await user.clear(seatsInput);
  await user.type(seatsInput, n);
  await user.click(screen.getByRole('button', { name: /Continue/i }));
}

describe('QuoteBuilder — Essentials happy path', () => {
  it('completes essentials tier with 5 seats and shows total $4,704', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="essentials" />);
    await answerCompany(user, 'Acme');
    await answerSeats(user, '5');
    expect(await screen.findByTestId('quote-result', undefined, { timeout: 1500 })).toBeInTheDocument();
    expect(screen.getByTestId('quote-total')).toHaveTextContent('$4,704');
    expect(screen.getByTestId('quote-plan-name')).toHaveTextContent('Aiden Essentials');
    expect(screen.getByText(/Custom quote prepared for/i)).toHaveTextContent('Acme');
  });
});

describe('QuoteBuilder — Advanced tree', () => {
  it('lead_support routes to Aiden Pro', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="advanced" />);
    await answerCompany(user, 'Acme');
    await user.click(screen.getByRole('button', { name: /Lead Generation \+ Customer Support/i }));
    // 220ms auto-advance — wait for the seats question to appear
    await answerSeats(user, '4');
    expect(await screen.findByTestId('quote-result', undefined, { timeout: 1500 })).toBeInTheDocument();
    expect(screen.getByTestId('quote-plan-name')).toHaveTextContent('Aiden Pro');
    // Pro: 7200 + max(0, 4-3) × 276 = 7476
    expect(screen.getByTestId('quote-total')).toHaveTextContent('$7,476');
  });

  it('lead_gen + single team routes to Aiden Advanced', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="advanced" />);
    await answerCompany(user, 'Acme');
    await user.click(screen.getByRole('button', { name: /^Lead Generation$/i }));
    const singleBtn = await screen.findByRole(
      'button',
      { name: /Single team/i },
      { timeout: 1500 },
    );
    await user.click(singleBtn);
    await answerSeats(user, '2');
    expect(await screen.findByTestId('quote-result', undefined, { timeout: 1500 })).toBeInTheDocument();
    expect(screen.getByTestId('quote-plan-name')).toHaveTextContent('Aiden Advanced');
    expect(screen.getByTestId('quote-total')).toHaveTextContent('$4,800');
  });
});

describe('QuoteBuilder — Commercial tree', () => {
  it('hubspot + territorial=yes routes to Aiden Bespoke with other_integrations step', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="commercial" />);
    await answerCompany(user, 'Acme');
    await user.click(screen.getByRole('button', { name: /^HubSpot$/i }));
    const territorialYes = await screen.findByRole(
      'button',
      { name: /Yes, we have regional teams/i },
      { timeout: 1500 },
    );
    await user.click(territorialYes);
    // other_integrations input
    const integrationsInput = await screen.findByRole(
      'textbox',
      { name: /additional integrations/i },
      { timeout: 1500 },
    );
    await user.type(integrationsInput, 'Zendesk');
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    await answerSeats(user, '6');
    expect(await screen.findByTestId('quote-result', undefined, { timeout: 1500 })).toBeInTheDocument();
    expect(screen.getByTestId('quote-plan-name')).toHaveTextContent('Aiden Bespoke');
    // Bespoke: 16500 + max(0, 6-5) × 600 = 17100
    expect(screen.getByTestId('quote-total')).toHaveTextContent('$17,100');
  });
});

describe('QuoteBuilder — restart', () => {
  it('Start over resets state to question 1', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="essentials" />);
    await answerCompany(user, 'Acme');
    await answerSeats(user, '1');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });

    await user.click(screen.getByRole('button', { name: /Start over/i }));
    expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
    const companyInput = screen.getByRole('textbox', { name: /What is your company name/i }) as HTMLInputElement;
    expect(companyInput.value).toBe('');
  });
});

describe('QuoteBuilder — inheritance toggle', () => {
  it('Pro plan exposes a clickable inheritance toggle', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="advanced" />);
    await answerCompany(user, 'Acme');
    await user.click(screen.getByRole('button', { name: /Lead Generation \+ Customer Support/i }));
    await answerSeats(user, '3');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });

    const toggle = screen.getByRole('button', { name: /All Advanced features included/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('QuoteBuilder — onComplete callback', () => {
  it('fires onComplete with derived plan + answers on result', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<QuoteBuilder tier="essentials" onComplete={onComplete} />);
    await answerCompany(user, 'Acme');
    await answerSeats(user, '2');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('essentials', { company: 'Acme', seats: '2' });
  });
});
