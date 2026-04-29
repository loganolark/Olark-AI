import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PersonaTabSwitcher from './PersonaTabSwitcher';

describe('PersonaTabSwitcher — structure', () => {
  it('renders 3 tab buttons with the role-only labels (no first names)', () => {
    render(<PersonaTabSwitcher />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(screen.getByRole('tab', { name: /^SDR$/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^RevOps Director$/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^VP of Sales$/ })).toBeInTheDocument();
  });

  it('does NOT use first names (Dana, Marcus, Priya) anywhere in the rendered copy', () => {
    const { container } = render(<PersonaTabSwitcher />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bDana\b/);
    expect(text).not.toMatch(/\bMarcus\b/);
    expect(text).not.toMatch(/\bPriya\b/);
  });

  it('starts with the SDR persona active by default', () => {
    render(<PersonaTabSwitcher />);
    expect(screen.getByRole('tab', { name: /^SDR$/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByTestId('persona-panel-sdr')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /All You Have to Do Is Eat\./i }),
    ).toBeInTheDocument();
  });
});

describe('PersonaTabSwitcher — switching', () => {
  it('clicking the RevOps tab swaps in the RevOps panel content', async () => {
    const user = userEvent.setup();
    render(<PersonaTabSwitcher />);
    await user.click(screen.getByRole('tab', { name: /RevOps Director/i }));
    expect(screen.getByRole('tab', { name: /RevOps Director/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByTestId('persona-panel-revops')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Every Conversation Logs Itself, Routes Itself, Reports Itself\./i,
      }),
    ).toBeInTheDocument();
    // SDR panel is gone
    expect(screen.queryByTestId('persona-panel-sdr')).toBeNull();
  });

  it('clicking the VP of Sales tab swaps in the VP panel content', async () => {
    const user = userEvent.setup();
    render(<PersonaTabSwitcher />);
    await user.click(screen.getByRole('tab', { name: /VP of Sales/i }));
    expect(screen.getByTestId('persona-panel-vp-sales')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Walk Into Monday Knowing the Pipeline Is Real\./i,
      }),
    ).toBeInTheDocument();
  });

  it('clicking back to SDR restores the SDR panel', async () => {
    const user = userEvent.setup();
    render(<PersonaTabSwitcher />);
    await user.click(screen.getByRole('tab', { name: /VP of Sales/i }));
    await user.click(screen.getByRole('tab', { name: /^SDR$/ }));
    expect(screen.getByTestId('persona-panel-sdr')).toBeInTheDocument();
  });
});

describe('PersonaTabSwitcher — accessibility', () => {
  it('each tab has aria-controls pointing at its panel id', () => {
    render(<PersonaTabSwitcher />);
    const sdrTab = screen.getByRole('tab', { name: /^SDR$/ });
    expect(sdrTab.getAttribute('aria-controls')).toBe('persona-panel-sdr');
    expect(sdrTab.id).toBe('persona-tab-sdr');
  });

  it('only the active tab is in the keyboard tab-order (tabIndex=0)', () => {
    render(<PersonaTabSwitcher />);
    const tabs = screen.getAllByRole('tab');
    const inOrder = tabs.filter((t) => t.tabIndex === 0);
    expect(inOrder).toHaveLength(1);
    expect(inOrder[0]).toHaveAttribute('aria-selected', 'true');
  });
});
