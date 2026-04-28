import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PipelineVisual from './PipelineVisual';

describe('PipelineVisual', () => {
  it('renders the 4 stages with correct names', () => {
    render(<PipelineVisual />);
    expect(screen.getByText('Aiden Qualified')).toBeInTheDocument();
    expect(screen.getByText('Passed to Sales')).toBeInTheDocument();
    expect(screen.getByText('Active Conversations')).toBeInTheDocument();
    expect(screen.getByText('Closed / Won')).toBeInTheDocument();
  });

  it('animates counts up to the target values (88, 61, 34, 19)', async () => {
    render(<PipelineVisual />);
    await waitFor(
      () => {
        expect(screen.getByTestId('pipeline-count-0').textContent).toBe('88 leads');
        expect(screen.getByTestId('pipeline-count-1').textContent).toBe('61 leads');
        expect(screen.getByTestId('pipeline-count-2').textContent).toBe('34 leads');
        expect(screen.getByTestId('pipeline-count-3').textContent).toBe('19 leads');
      },
      { timeout: 2500 },
    );
  });

  it('marks the "Passed to Sales" stage as active', () => {
    render(<PipelineVisual />);
    const activeStage = screen
      .getByTestId('pipeline-visual')
      .querySelector('[data-stage-name="Passed to Sales"]');
    expect(activeStage?.getAttribute('data-active')).toBe('true');
  });

  it('renders the hot-prospects callout', async () => {
    render(<PipelineVisual />);
    await waitFor(() => {
      expect(
        screen.getByText(/3 hot prospects waiting for rep assignment/),
      ).toBeInTheDocument();
    });
  });

  it('renders header label "Live Pipeline — Today"', () => {
    render(<PipelineVisual />);
    expect(screen.getByText(/Live Pipeline — Today/)).toBeInTheDocument();
  });
});
