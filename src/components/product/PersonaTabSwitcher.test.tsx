import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PersonaTabSwitcher from './PersonaTabSwitcher';

describe('PersonaTabSwitcher — structure', () => {
  it('renders 3 industrial-role tab buttons', () => {
    render(<PersonaTabSwitcher />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(
      screen.getByRole('tab', { name: /^Sales Engineer$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /Inside Sales/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /^VP of Sales$/ }),
    ).toBeInTheDocument();
  });

  it('does NOT use first names in the rendered copy', () => {
    const { container } = render(<PersonaTabSwitcher />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bDana\b/);
    expect(text).not.toMatch(/\bMarcus\b/);
    expect(text).not.toMatch(/\bPriya\b/);
  });

  it('starts with the Sales Engineer persona active by default', () => {
    render(<PersonaTabSwitcher />);
    expect(
      screen.getByRole('tab', { name: /^Sales Engineer$/ }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('persona-panel-sales-engineer')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Stop Being the Search Bar for Your Own Catalog\./i,
      }),
    ).toBeInTheDocument();
  });
});

describe('PersonaTabSwitcher — switching', () => {
  it('clicking the Inside Sales tab swaps in the Inside Sales panel content', async () => {
    const user = userEvent.setup();
    render(<PersonaTabSwitcher />);
    await user.click(screen.getByRole('tab', { name: /Inside Sales/i }));
    expect(
      screen.getByRole('tab', { name: /Inside Sales/i }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('persona-panel-inside-sales')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Every Lead Lands on the Right Desk Before It Goes Cold\./i,
      }),
    ).toBeInTheDocument();
    // Sales Engineer panel is gone
    expect(screen.queryByTestId('persona-panel-sales-engineer')).toBeNull();
  });

  it('clicking the VP of Sales tab swaps in the VP panel content', async () => {
    const user = userEvent.setup();
    render(<PersonaTabSwitcher />);
    await user.click(screen.getByRole('tab', { name: /VP of Sales/i }));
    expect(screen.getByTestId('persona-panel-vp-sales')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Walk Into the Forecast Meeting With Pipeline You Can Defend\./i,
      }),
    ).toBeInTheDocument();
  });

  it('clicking back to Sales Engineer restores the SE panel', async () => {
    const user = userEvent.setup();
    render(<PersonaTabSwitcher />);
    await user.click(screen.getByRole('tab', { name: /VP of Sales/i }));
    await user.click(screen.getByRole('tab', { name: /^Sales Engineer$/ }));
    expect(screen.getByTestId('persona-panel-sales-engineer')).toBeInTheDocument();
  });
});

describe('PersonaTabSwitcher — accessibility', () => {
  it('each tab has aria-controls pointing at its panel id', () => {
    render(<PersonaTabSwitcher />);
    const seTab = screen.getByRole('tab', { name: /^Sales Engineer$/ });
    expect(seTab.getAttribute('aria-controls')).toBe(
      'persona-panel-sales-engineer',
    );
    expect(seTab.id).toBe('persona-tab-sales-engineer');
  });

  it('only the active tab is in the keyboard tab-order (tabIndex=0)', () => {
    render(<PersonaTabSwitcher />);
    const tabs = screen.getAllByRole('tab');
    const inOrder = tabs.filter((t) => t.tabIndex === 0);
    expect(inOrder).toHaveLength(1);
    expect(inOrder[0]).toHaveAttribute('aria-selected', 'true');
  });
});
