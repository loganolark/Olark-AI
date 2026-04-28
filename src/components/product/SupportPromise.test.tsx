import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SupportPromise from './SupportPromise';

describe('SupportPromise', () => {
  it('renders the section label and headline', () => {
    render(<SupportPromise />);
    expect(screen.getByText(/We.ve Got You/)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /You.re Never on Your Own/i }),
    ).toBeInTheDocument();
  });

  it('renders both intro paragraphs', () => {
    render(<SupportPromise />);
    expect(
      screen.getByText(/Getting started with AI should not feel like a solo expedition/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Whether you are a team of two or a growing business/i),
    ).toBeInTheDocument();
  });

  it('renders all 5 promise list items', () => {
    render(<SupportPromise />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(
      screen.getByText(/Free live onboarding included with every Essentials plan/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ongoing support from the Olark team, not a ticket queue/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Simple enough to train and manage without a developer/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No engineering resources required at any stage/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Go live the same day you get access/i)).toBeInTheDocument();
  });

  it('renders the card sub-headline', () => {
    render(<SupportPromise />);
    expect(
      screen.getByRole('heading', { level: 3, name: /Support That Comes Standard/i }),
    ).toBeInTheDocument();
  });

  it('accepts an optional headline override', () => {
    render(<SupportPromise headline="We're Here For You" />);
    expect(
      screen.getByRole('heading', { level: 2, name: /We.re Here For You/i }),
    ).toBeInTheDocument();
  });
});
