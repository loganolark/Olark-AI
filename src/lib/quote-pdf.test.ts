import { describe, it, expect, vi, beforeEach } from 'vitest';

const saveSpy = vi.fn();

vi.mock('jspdf', () => {
  class FakeJsPDF {
    setFillColor = vi.fn();
    setDrawColor = vi.fn();
    setLineWidth = vi.fn();
    setFont = vi.fn();
    setFontSize = vi.fn();
    setTextColor = vi.fn();
    rect = vi.fn();
    roundedRect = vi.fn();
    text = vi.fn();
    getTextWidth = vi.fn(() => 30);
    splitTextToSize = vi.fn((t: string) => [t]);
    save = saveSpy;
  }
  return { jsPDF: FakeJsPDF };
});

beforeEach(() => {
  saveSpy.mockClear();
});

describe('downloadQuotePDF', () => {
  it('saves a PDF with a filename including the plan + company name', async () => {
    const { downloadQuotePDF } = await import('./quote-pdf');
    await downloadQuotePDF({ plan: 'essentials', company: 'Acme Co.', seats: 5 });
    expect(saveSpy).toHaveBeenCalledTimes(1);
    const filename = saveSpy.mock.calls[0][0] as string;
    expect(filename).toMatch(/^Olark_Aiden_Essentials_Quote_Acme_Co_\.pdf$/);
  });

  it('falls back to "Your Company" when company is empty', async () => {
    const { downloadQuotePDF } = await import('./quote-pdf');
    await downloadQuotePDF({ plan: 'pro', company: '', seats: 3 });
    const filename = saveSpy.mock.calls[0][0] as string;
    expect(filename).toContain('Your_Company');
  });

  it('handles each plan variant', async () => {
    const { downloadQuotePDF } = await import('./quote-pdf');
    for (const plan of ['essentials', 'advanced', 'pro', 'signature', 'bespoke'] as const) {
      saveSpy.mockClear();
      await downloadQuotePDF({ plan, company: 'X', seats: 2 });
      expect(saveSpy).toHaveBeenCalledTimes(1);
    }
  });
});
