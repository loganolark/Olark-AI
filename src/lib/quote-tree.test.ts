import { describe, it, expect } from 'vitest';
import { firstQuestion, nextQuestion, getPlan, RESULT } from './quote-tree';
import type { QuoteState } from '@/types/quote';

function emptyState(): QuoteState {
  return { answers: {}, history: [], track: null };
}

describe('firstQuestion', () => {
  it('always returns the company text question', () => {
    expect(firstQuestion()).toMatchObject({ id: 'company', type: 'text' });
  });
});

describe('Essentials tree', () => {
  it('company → seats → RESULT', () => {
    const s = emptyState();
    expect(nextQuestion('essentials', 'company', 'Acme', s)).toMatchObject({ id: 'seats', type: 'number' });
    expect(nextQuestion('essentials', 'seats', '5', s)).toBe(RESULT);
    expect(getPlan('essentials', s)).toBe('essentials');
  });
});

describe('Advanced tree', () => {
  it('lead_gen + single team → plan="advanced"', () => {
    const s = emptyState();
    expect(nextQuestion('advanced', 'company', 'Acme', s)).toMatchObject({ id: 'use_case', type: 'options' });
    expect(nextQuestion('advanced', 'use_case', 'lead_gen', s)).toMatchObject({ id: 'multi_team', type: 'options' });
    expect(nextQuestion('advanced', 'multi_team', 'single', s)).toMatchObject({ id: 'seats' });
    expect(nextQuestion('advanced', 'seats', '3', s)).toBe(RESULT);
    expect(s.track).toBe('advanced');
    expect(getPlan('advanced', s)).toBe('advanced');
  });

  it('lead_gen + multiple teams → plan="pro"', () => {
    const s = emptyState();
    nextQuestion('advanced', 'company', 'Acme', s);
    nextQuestion('advanced', 'use_case', 'lead_gen', s);
    nextQuestion('advanced', 'multi_team', 'multiple', s);
    nextQuestion('advanced', 'seats', '3', s);
    expect(s.track).toBe('pro');
    expect(getPlan('advanced', s)).toBe('pro');
  });

  it('lead_support → plan="pro" (skip multi_team)', () => {
    const s = emptyState();
    nextQuestion('advanced', 'company', 'Acme', s);
    expect(nextQuestion('advanced', 'use_case', 'lead_support', s)).toMatchObject({ id: 'seats' });
    expect(s.track).toBe('pro');
    expect(getPlan('advanced', s)).toBe('pro');
  });
});

describe('Commercial tree', () => {
  it('salesforce + no territorial → plan="signature"', () => {
    const s = emptyState();
    nextQuestion('commercial', 'company', 'Acme', s);
    expect(nextQuestion('commercial', 'crm', 'salesforce', s)).toMatchObject({ id: 'territorial' });
    expect(nextQuestion('commercial', 'territorial', 'no', s)).toMatchObject({ id: 'seats' });
    expect(nextQuestion('commercial', 'seats', '4', s)).toBe(RESULT);
    expect(s.track).toBe('signature');
    expect(getPlan('commercial', s)).toBe('signature');
  });

  it('hubspot + territorial="yes" → plan="bespoke" (with other_integrations step)', () => {
    const s = emptyState();
    nextQuestion('commercial', 'company', 'Acme', s);
    nextQuestion('commercial', 'crm', 'hubspot', s);
    expect(nextQuestion('commercial', 'territorial', 'yes', s)).toMatchObject({ id: 'other_integrations' });
    expect(nextQuestion('commercial', 'other_integrations', 'Zendesk', s)).toMatchObject({ id: 'seats' });
    expect(nextQuestion('commercial', 'seats', '6', s)).toBe(RESULT);
    expect(s.track).toBe('bespoke');
    expect(getPlan('commercial', s)).toBe('bespoke');
  });

  it('crm="other" routes through crm_name and lands at bespoke', () => {
    const s = emptyState();
    nextQuestion('commercial', 'company', 'Acme', s);
    expect(nextQuestion('commercial', 'crm', 'other', s)).toMatchObject({ id: 'crm_name', type: 'text' });
    expect(s.track).toBe('bespoke');
    expect(nextQuestion('commercial', 'crm_name', 'Zoho', s)).toMatchObject({ id: 'territorial' });
    expect(nextQuestion('commercial', 'territorial', 'no', s)).toMatchObject({ id: 'other_integrations' });
    expect(nextQuestion('commercial', 'other_integrations', '', s)).toMatchObject({ id: 'seats' });
    expect(nextQuestion('commercial', 'seats', '5', s)).toBe(RESULT);
    expect(getPlan('commercial', s)).toBe('bespoke');
  });
});
