import { PLAN_DATA, type Plan } from '@/types/quote';

export interface PricingResult {
  base: number;
  seats: number;
  includedSeats: number;
  additional: number;
  seatCost: number;
  seatPrice: number;
  total: number;
}

export function calcPricing(plan: Plan, seatsInput: number | string): PricingResult {
  const d = PLAN_DATA[plan];
  const parsed = typeof seatsInput === 'number' ? seatsInput : parseInt(seatsInput, 10);
  const seats = Math.max(1, Number.isFinite(parsed) ? Math.floor(parsed) : 1);
  const additional = Math.max(0, seats - d.includedSeats);
  const seatCost = additional * d.seatPrice;
  return {
    base: d.base,
    seats,
    includedSeats: d.includedSeats,
    additional,
    seatCost,
    seatPrice: d.seatPrice,
    total: d.base + seatCost,
  };
}

export function formatUSD(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}
