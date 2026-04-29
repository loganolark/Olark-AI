import { PLAN_DATA, type Plan } from '@/types/quote';
import { calcPricing, formatUSD } from './quote-pricing';

export interface DownloadQuotePDFArgs {
  plan: Plan;
  company: string;
  seats: number | string;
}

/**
 * Generates a branded PDF quote and triggers a download.
 *
 * Loaded via dynamic import in the consuming component so jsPDF (~190KB
 * gzipped) doesn't ship in the main bundle.
 */
export async function downloadQuotePDF({
  plan,
  company,
  seats,
}: DownloadQuotePDFArgs): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const data = PLAN_DATA[plan];
  const pricing = calcPricing(plan, seats);
  const safeCompany = company || 'Your Company';

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const ml = 18;
  const mr = 18;
  const cw = W - ml - mr;

  // Olark brand palette (Visual Style Guide, Feb 2022)
  const purple: [number, number, number] = [61, 54, 131]; // Brand Purple #3d3683
  const darkPurp: [number, number, number] = [39, 45, 63]; // Brand Navy #272d3f
  const gold: [number, number, number] = [250, 201, 23]; // Brand Yellow #fac917
  const white: [number, number, number] = [255, 255, 255];
  const offWhite: [number, number, number] = [240, 238, 255];
  const textDark: [number, number, number] = [25, 22, 65];
  const textMid: [number, number, number] = [90, 85, 160];
  const lightBg: [number, number, number] = [250, 249, 255];

  // ─── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(...darkPurp);
  doc.roundedRect(ml, 12, 36, 30, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...gold);
  doc.text('Aiden', ml + 18, 23, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(...offWhite);
  doc.text('by Olark', ml + 18, 30, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(34);
  doc.setTextColor(...textDark);
  doc.text('Quote', W - mr, 26, { align: 'right' });

  doc.setFontSize(13);
  const cw2 = doc.getTextWidth(safeCompany) + 10;
  doc.setFillColor(...gold);
  doc.rect(W - mr - cw2, 30, cw2, 10, 'F');
  doc.setTextColor(...textDark);
  doc.text(safeCompany, W - mr - 5, 38, { align: 'right' });

  let y = 55;

  function sectionHeader(title: string, price?: string) {
    const rh = 10;
    doc.setFillColor(...purple);
    doc.rect(ml, y, cw, rh, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...white);
    doc.text(title, ml + cw / 2, y + 7, { align: 'center' });
    if (price !== undefined) {
      doc.text(price, W - mr - 4, y + 7, { align: 'right' });
    }
    y += rh;
  }

  function tableRow(
    label: string,
    value: string,
    bg: [number, number, number],
    color: [number, number, number],
    bold: boolean,
  ) {
    const rh = 9;
    doc.setFillColor(...bg);
    doc.rect(ml, y, cw, rh, 'F');
    doc.setDrawColor(...purple);
    doc.setLineWidth(0.4);
    doc.rect(ml, y, cw, rh, 'S');
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...color);
    doc.text(label, ml + 4, y + 6.2);
    if (value) doc.text(value, W - mr - 4, y + 6.2, { align: 'right' });
    y += rh;
  }

  function featureLine(text: string) {
    const lh = 6.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textMid);
    const lines = doc.splitTextToSize(`• ${text}`, cw - 10);
    lines.forEach((line: string) => {
      doc.text(line, ml + 6, y + 5);
      y += lh;
    });
  }

  // ─── Platform Fee ─────────────────────────────────────────────────────────
  sectionHeader(`${data.name} Platform Fee`, `${formatUSD(pricing.base)}`);
  const featStart = y;
  doc.setFillColor(...lightBg);
  data.features.forEach((f) => featureLine(f));
  doc.setDrawColor(...purple);
  doc.setLineWidth(0.4);
  doc.rect(ml, featStart, cw, y - featStart, 'S');

  y += 3;

  // ─── Agent Seats ──────────────────────────────────────────────────────────
  sectionHeader(`${data.name} Agent Seats`, formatUSD(pricing.seatCost));
  tableRow(
    `Included Seats (${formatUSD(data.seatPrice)} value per year)`,
    String(data.includedSeats),
    lightBg,
    textMid,
    false,
  );
  tableRow(
    `Additional Seats (${formatUSD(data.seatPrice)}/year)`,
    String(pricing.additional),
    lightBg,
    textMid,
    false,
  );
  tableRow('Total Seats', String(pricing.seats), white, textDark, true);

  y += 4;

  // ─── Managed Service ──────────────────────────────────────────────────────
  sectionHeader('Managed Service', 'Included');
  data.managed.forEach((m) => featureLine(m));

  y += 4;

  // ─── Total ───────────────────────────────────────────────────────────────
  const totalH = 13;
  doc.setFillColor(...darkPurp);
  doc.rect(ml, y, cw, totalH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...white);
  doc.text('Total Annual Cost', W - mr - 50, y + 9);
  doc.setFillColor(...purple);
  doc.rect(W - mr - 38, y, 38, totalH, 'F');
  doc.setFontSize(14);
  doc.text(formatUSD(pricing.total), W - mr - 4, y + 9.5, { align: 'right' });

  y += totalH + 10;

  // ─── Footer ──────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(160, 155, 200);
  doc.text(
    'Generated by Olark Aiden  |  olark.com  |  Quote valid for 30 days from generation.',
    W / 2,
    y,
    { align: 'center' },
  );

  const safePlan = data.name.replace(/\s/g, '_');
  const safeCompanyName = safeCompany.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Olark_${safePlan}_Quote_${safeCompanyName}.pdf`;
  doc.save(filename);
}
