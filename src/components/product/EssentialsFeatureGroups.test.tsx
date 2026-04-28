import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EssentialsFeatureGroups from './EssentialsFeatureGroups';

describe('EssentialsFeatureGroups', () => {
  it('renders the section label and headline', () => {
    render(<EssentialsFeatureGroups />);
    expect(screen.getByText(/What.s Included/)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Everything You Need to Start Smart/i }),
    ).toBeInTheDocument();
  });

  it('renders all 3 group labels', () => {
    render(<EssentialsFeatureGroups />);
    expect(screen.getByText('Training')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Usage & Reporting')).toBeInTheDocument();
  });

  it('renders all 8 feature card titles', () => {
    render(<EssentialsFeatureGroups />);
    expect(
      screen.getByRole('heading', { level: 3, name: /Aiden Chatbot for One Website/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /Live Search — Website Ingest/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /Document Ingest/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /AI Analyst/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Stock Answers/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /Multilingual Chatbot/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /Unlimited Chats & Knowledge Uploads/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /AI Admin Portal & Reporting/i }),
    ).toBeInTheDocument();
  });

  it('renders the intro paragraph', () => {
    render(<EssentialsFeatureGroups />);
    expect(
      screen.getByText(/Aiden Essentials is a complete AI platform/i),
    ).toBeInTheDocument();
  });
});
