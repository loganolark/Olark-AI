import { describe, it, expect } from 'vitest';
import { selectVariant, parseQuizStateCookie } from './conversion-variant';

describe('selectVariant', () => {
  it('returns "anonymous" when cookie is null', () => {
    expect(selectVariant(null)).toBe('anonymous');
  });

  it('returns "commercial-high-intent" for commercial + demo_run=true', () => {
    expect(
      selectVariant({ tier_signal: 'commercial', demo_run: true, quiz_completed: true }),
    ).toBe('commercial-high-intent');
  });

  it('returns "commercial-quiz-only" for commercial + demo_run=false', () => {
    expect(
      selectVariant({ tier_signal: 'commercial', demo_run: false, quiz_completed: true }),
    ).toBe('commercial-quiz-only');
  });

  it('returns "lead-gen" for tier_signal=lead_gen', () => {
    expect(
      selectVariant({ tier_signal: 'lead_gen', demo_run: false, quiz_completed: true }),
    ).toBe('lead-gen');
  });

  it('returns "essentials" for tier_signal=essentials', () => {
    expect(
      selectVariant({ tier_signal: 'essentials', demo_run: true, quiz_completed: true }),
    ).toBe('essentials');
  });
});

describe('parseQuizStateCookie', () => {
  it('returns null for undefined input', () => {
    expect(parseQuizStateCookie(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseQuizStateCookie('')).toBeNull();
  });

  it('returns null on malformed JSON', () => {
    expect(parseQuizStateCookie('not-json')).toBeNull();
  });

  it('returns null when quiz_completed is missing', () => {
    expect(
      parseQuizStateCookie(
        encodeURIComponent(JSON.stringify({ tier_signal: 'commercial', demo_run: false })),
      ),
    ).toBeNull();
  });

  it('returns null on invalid tier_signal', () => {
    expect(
      parseQuizStateCookie(
        encodeURIComponent(
          JSON.stringify({ tier_signal: 'foo', demo_run: false, quiz_completed: true }),
        ),
      ),
    ).toBeNull();
  });

  it('returns null when demo_run is non-boolean', () => {
    expect(
      parseQuizStateCookie(
        encodeURIComponent(
          JSON.stringify({ tier_signal: 'commercial', demo_run: 'yes', quiz_completed: true }),
        ),
      ),
    ).toBeNull();
  });

  it('parses a valid cookie payload', () => {
    const raw = encodeURIComponent(
      JSON.stringify({ tier_signal: 'commercial', demo_run: true, quiz_completed: true }),
    );
    expect(parseQuizStateCookie(raw)).toEqual({
      tier_signal: 'commercial',
      demo_run: true,
      quiz_completed: true,
    });
  });
});
