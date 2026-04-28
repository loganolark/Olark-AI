import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import AutomationVisual from './AutomationVisual';

describe('AutomationVisual', () => {
  it('renders all 4 row labels', () => {
    render(<AutomationVisual />);
    expect(screen.getByText('FAQ Responses')).toBeInTheDocument();
    expect(screen.getByText('Pricing & Plans')).toBeInTheDocument();
    expect(screen.getByText('Order & Account Lookups')).toBeInTheDocument();
    expect(screen.getByText('Support Backlog')).toBeInTheDocument();
  });

  it('renders correct badge labels for each row', () => {
    render(<AutomationVisual />);
    expect(screen.getAllByText('Automated')).toHaveLength(2);
    expect(screen.getByText('Hours Saved')).toBeInTheDocument();
    expect(screen.getByText('Eliminated')).toBeInTheDocument();
  });

  it('renders the closing summary block', () => {
    render(<AutomationVisual />);
    const summary = screen.getByTestId('automation-summary');
    expect(summary).toBeInTheDocument();
    expect(summary.textContent).toContain('Your team handles');
    expect(summary.textContent).toContain('complex, high-value conversations');
    expect(summary.textContent).toContain('24/7');
  });

  it('marks itself as in-view after IntersectionObserver fires', () => {
    render(<AutomationVisual />);
    expect(screen.getByTestId('automation-visual').getAttribute('data-in-view')).toBe('true');
  });
});
