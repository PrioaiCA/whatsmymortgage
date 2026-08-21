import { fmtMoney, fmtMoneyFull, fmtPct } from '../format.js';
import { pmt } from './core.js';

export const view = 'stress';

export const defaultState = { mortgage: 500000, rate: 4.44, amort: 25, income: 96000, debt: 400 };

export function compute(s) {
  const monthlyIncome = s.income / 12;
  const stressRate = Math.max(s.rate + 2, 5.25);
  const realPayment = pmt(s.mortgage, s.rate, s.amort);
  const testPayment = pmt(s.mortgage, stressRate, s.amort);

  // No property-specific tax/heat/condo figures exist for a standalone
  // "am I tested at a rate I can afford" question, so this uses the same
  // flat heat allowance as the other calculators and folds property tax
  // into "other housing costs" the visitor can adjust via debt — the
  // qualifying math (stress rate, GDS/TDS caps) is exact either way.
  const gds = (testPayment + 100) / monthlyIncome;
  const tds = gds + s.debt / monthlyIncome;
  const gdsLimit = 0.39, tdsLimit = 0.44;
  const passes = gds <= gdsLimit && tds <= tdsLimit;

  const gdsRoomIncome = passes ? 0 : Math.max(0, (testPayment + 100) / gdsLimit * 12 - s.income);
  const tdsRoomIncome = passes ? 0 : Math.max(0, (testPayment + 100 + s.debt) / tdsLimit * 12 - s.income);
  const incomeNeeded = Math.max(gdsRoomIncome, tdsRoomIncome);

  const notes = [];
  notes.push({ tone: 'context', text: `You'd pay ${fmtMoneyFull(realPayment)}/mo at your actual rate, but lenders test you as if the payment were ${fmtMoneyFull(testPayment)}/mo — the difference is the cushion in case rates rise by renewal.` });
  if (passes) {
    notes.push({ tone: 'good', text: 'This mortgage amount passes both ratios at the tested rate.' });
  } else {
    notes.push({ tone: 'watch', text: `To pass at this mortgage amount, income would need to be roughly ${fmtMoney(s.income + incomeNeeded)} — about ${fmtMoney(incomeNeeded)} more than entered.` });
  }

  return {
    tone: 'neutral', label: passes ? 'Passes the stress test' : "Doesn't pass the stress test", bigValue: passes ? 'Pass' : 'Fail',
    subtitle: `Tested at ${fmtPct(stressRate)} on a ${fmtMoneyFull(s.mortgage)} mortgage.`,
    tiles: [
      { label: 'GDS ratio', value: fmtPct(gds * 100, 1) + ` (cap ${fmtPct(gdsLimit * 100, 0)})` },
      { label: 'TDS ratio', value: fmtPct(tds * 100, 1) + ` (cap ${fmtPct(tdsLimit * 100, 0)})` },
      { label: 'Payment at your rate', value: fmtMoneyFull(realPayment) + '/mo' },
      { label: 'Payment at tested rate', value: fmtMoneyFull(testPayment) + '/mo' }
    ],
    notes,
    ledgerGroups: [
      { header: 'Ratios at the tested rate', rows: [{ label: 'GDS (housing only)', value: fmtPct(gds * 100, 1) }, { label: 'GDS cap', value: fmtPct(gdsLimit * 100, 0) }, { label: 'TDS (housing + debts)', value: fmtPct(tds * 100, 1) }, { label: 'TDS cap', value: fmtPct(tdsLimit * 100, 0) }] },
      { header: 'The two payments', rows: [{ label: 'At your contract rate', value: fmtMoneyFull(realPayment) + '/mo' }, { label: 'At the stress-tested rate', value: fmtMoneyFull(testPayment) + '/mo' }, { label: 'Difference', value: fmtMoneyFull(testPayment - realPayment) + '/mo' }] }
    ],
    assumptions: [{ label: 'Stress test rate', value: fmtPct(stressRate) + ' (your rate + 2%, or 5.25%, whichever is higher)' }, { label: 'Heat allowance', value: '$100/mo, flat' }, { label: 'Property tax and condo fees', value: 'Not entered here — fold into monthly debts if they apply' }]
  };
}
