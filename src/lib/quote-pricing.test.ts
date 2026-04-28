import { describe, it, expect } from 'vitest';
import { calcPricing, formatUSD } from './quote-pricing';

describe('calcPricing', () => {
  it('essentials with 1 seat: 1 included, no additional cost', () => {
    const r = calcPricing('essentials', 1);
    expect(r).toMatchObject({
      base: 3600,
      includedSeats: 1,
      seatPrice: 276,
      additional: 0,
      seatCost: 0,
      total: 3600,
    });
  });

  it('essentials with 5 seats: 1 included + 4 additional × $276', () => {
    const r = calcPricing('essentials', 5);
    expect(r.additional).toBe(4);
    expect(r.seatCost).toBe(1104);
    expect(r.total).toBe(4704);
  });

  it('advanced with 2 seats: all included', () => {
    const r = calcPricing('advanced', 2);
    expect(r.additional).toBe(0);
    expect(r.total).toBe(4800);
  });

  it('pro with 5 seats: 3 included + 2 additional × $276', () => {
    const r = calcPricing('pro', 5);
    expect(r.additional).toBe(2);
    expect(r.seatCost).toBe(552);
    expect(r.total).toBe(7752);
  });

  it('signature with 6 seats: 3 included + 3 additional × $600', () => {
    const r = calcPricing('signature', 6);
    expect(r.additional).toBe(3);
    expect(r.seatCost).toBe(1800);
    expect(r.total).toBe(11700);
  });

  it('bespoke with 8 seats: 5 included + 3 additional × $600', () => {
    const r = calcPricing('bespoke', 8);
    expect(r.additional).toBe(3);
    expect(r.total).toBe(18300);
  });

  it('clamps seats=0 to 1', () => {
    const r = calcPricing('essentials', 0);
    expect(r.seats).toBe(1);
    expect(r.additional).toBe(0);
  });

  it('clamps negative seats to 1', () => {
    const r = calcPricing('essentials', -3);
    expect(r.seats).toBe(1);
  });

  it('parses string seats input', () => {
    const r = calcPricing('essentials', '4');
    expect(r.seats).toBe(4);
    expect(r.additional).toBe(3);
  });

  it('falls back to 1 for non-numeric string', () => {
    const r = calcPricing('essentials', 'abc');
    expect(r.seats).toBe(1);
  });

  it('floors decimal seat counts', () => {
    const r = calcPricing('essentials', 3.7);
    expect(r.seats).toBe(3);
  });
});

describe('formatUSD', () => {
  it('formats integers with commas', () => {
    expect(formatUSD(3600)).toBe('$3,600');
    expect(formatUSD(16500)).toBe('$16,500');
  });

  it('formats small numbers without commas', () => {
    expect(formatUSD(276)).toBe('$276');
  });
});
