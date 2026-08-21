import { fmtMoneyFull, fmtPct } from '../format.js';

export const view = 'gdstds';

export const defaultState = { income: 96000, mortgagePayment: 2200, propertyTax: 4200, condo: 0, debt: 400 };

export function compute(s) {
  const monthlyIncome = s.income / 12;
  const propTaxMonthly = s.propertyTax / 12;
  const housingCost = s.mortgagePayment + propTaxMonthly + 100 + s.condo * 0.5;

  const gds = housingCost / monthlyIncome;
  const tds = (housingCost + s.debt) / monthlyIncome;
  const gdsLimit = 0.39, tdsLimit = 0.44;
  const gdsOk = gds <= gdsLimit;
  const tdsOk = tds <= tdsLimit;
  const gdsRoom = (gdsLimit - gds) * monthlyIncome;
  const tdsRoom = (tdsLimit - tds) * monthlyIncome;

  const notes = [];
  notes.push({ tone: gdsOk ? 'good' : 'watch', text: `GDS covers housing costs alone: mortgage, property tax, heat, and half of any condo fee. ${gdsOk ? `There's ${fmtMoneyFull(gdsRoom)}/mo of room left under the cap.` : `This is ${fmtMoneyFull(-gdsRoom)}/mo over the cap.`}` });
  notes.push({ tone: tdsOk ? 'good' : 'watch', text: `TDS adds every other debt payment on top. ${tdsOk ? `There's ${fmtMoneyFull(tdsRoom)}/mo of room left under the cap.` : `This is ${fmtMoneyFull(-tdsRoom)}/mo over the cap.`}` });
  if (gdsOk && !tdsOk) notes.push({ tone: 'context', text: "Housing alone is fine — it's the other debt payments pushing this over." });

  return {
    tone: 'neutral', label: 'Your GDS and TDS ratios', bigValue: fmtPct(Math.max(gds, tds) * 100, 1),
    subtitle: `GDS ${fmtPct(gds * 100, 1)}, TDS ${fmtPct(tds * 100, 1)} — caps are ${fmtPct(gdsLimit * 100, 0)} and ${fmtPct(tdsLimit * 100, 0)}.`,
    tiles: [
      { label: 'GDS', value: fmtPct(gds * 100, 1) },
      { label: 'TDS', value: fmtPct(tds * 100, 1) },
      { label: 'Total housing cost', value: fmtMoneyFull(housingCost) + '/mo' },
      { label: 'Room under TDS cap', value: fmtMoneyFull(Math.max(0, tdsRoom)) + '/mo' }
    ],
    notes,
    ledgerGroups: [
      { header: 'What counts as housing (GDS)', rows: [{ label: 'Mortgage payment', value: fmtMoneyFull(s.mortgagePayment) }, { label: 'Property tax', value: fmtMoneyFull(propTaxMonthly) }, { label: 'Heat allowance', value: '$100' }, { label: 'Condo fee counted (50%)', value: fmtMoneyFull(s.condo * 0.5) }, { label: 'Total housing cost', value: fmtMoneyFull(housingCost) }] },
      { header: 'What TDS adds', rows: [{ label: 'Housing cost (from above)', value: fmtMoneyFull(housingCost) }, { label: 'Other monthly debts', value: fmtMoneyFull(s.debt) }, { label: 'Total', value: fmtMoneyFull(housingCost + s.debt) }] }
    ],
    assumptions: [{ label: 'GDS cap', value: fmtPct(gdsLimit * 100, 0) }, { label: 'TDS cap', value: fmtPct(tdsLimit * 100, 0) }, { label: 'Heat allowance', value: '$100/mo, flat, regardless of your real bill' }, { label: 'Condo fee treatment', value: 'Half the monthly fee counts against your ratios' }]
  };
}
