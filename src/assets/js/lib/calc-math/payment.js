import { fmtMoney, fmtMoneyFull, fmtPct } from '../format.js';
import { pmt, minDown, insurancePremiumRate } from './core.js';

export const view = 'payment';

export const defaultState = { price: 650000, down: 130000, rate: 4.44, amort: 25 };

export function compute(s) {
  const mortgageBase = Math.max(0, s.price - s.down);
  const ltvFrac = s.price > 0 ? mortgageBase / s.price : 0;
  const insured = ltvFrac > 0.8;
  const premRate = insured ? insurancePremiumRate(ltvFrac, s.amort) : 0;
  const premiumAmt = mortgageBase * premRate;
  const mortgageAmount = mortgageBase + premiumAmt;

  const monthly = pmt(mortgageAmount, s.rate, s.amort);
  const biweekly = monthly / 2;
  const weekly = monthly / 4;

  const totalPaid = monthly * s.amort * 12;
  const totalInterest = totalPaid - mortgageAmount;

  // Accelerated biweekly/weekly pay the equivalent of one extra monthly
  // payment a year (26 biweekly or 52 weekly payments vs. 24/48 on a
  // plain schedule) — a well-known rule of thumb, not a full re-amortized
  // schedule. The amortization & prepayment calculator models the real
  // payoff-time impact if someone wants the exact number.
  const extraPerYear = monthly;
  const roughInterestSavings = extraPerYear * 0.35 * (s.amort / 25);

  const minDownRequired = minDown(s.price);
  const notes = [];
  if (s.down < minDownRequired) notes.push({ tone: 'watch', text: `Ontario's minimum down payment on a ${fmtMoney(s.price)} home is ${fmtMoneyFull(minDownRequired)} — this down payment is below that.` });
  if (insured) notes.push({ tone: 'watch', text: `Putting down less than 20% means default insurance is required, adding ${fmtMoneyFull(premiumAmt)} to the mortgage.` });
  notes.push({ tone: 'good', text: `Paying biweekly or weekly on an accelerated schedule works out to one extra monthly payment a year — roughly ${fmtMoney(roughInterestSavings)} less interest over the full amortization.` });

  return {
    tone: 'neutral', label: 'Monthly mortgage payment', bigValue: fmtMoneyFull(monthly),
    subtitle: `On ${fmtMoneyFull(mortgageAmount)} at ${fmtPct(s.rate)} over ${s.amort} years.`,
    tiles: [
      { label: 'Accelerated biweekly', value: fmtMoneyFull(biweekly) },
      { label: 'Accelerated weekly', value: fmtMoneyFull(weekly) },
      { label: 'Total interest paid', value: fmtMoneyFull(totalInterest) },
      { label: 'Mortgage amount', value: fmtMoneyFull(mortgageAmount) }
    ],
    notes,
    ledgerGroups: [
      { header: 'The mortgage', rows: [{ label: 'Purchase price', value: fmtMoneyFull(s.price) }, { label: 'Down payment', value: fmtMoneyFull(s.down) }, { label: 'Base mortgage', value: fmtMoneyFull(mortgageBase) }].concat(insured ? [{ label: 'Default insurance premium', value: fmtMoneyFull(premiumAmt) }] : []).concat([{ label: 'Mortgage amount', value: fmtMoneyFull(mortgageAmount) }]) },
      { header: 'Payment by frequency', rows: [{ label: 'Monthly', value: fmtMoneyFull(monthly) }, { label: 'Accelerated biweekly', value: fmtMoneyFull(biweekly) }, { label: 'Accelerated weekly', value: fmtMoneyFull(weekly) }] },
      { header: 'Over the full amortization', rows: [{ label: 'Total paid', value: fmtMoneyFull(totalPaid) }, { label: 'Total interest', value: fmtMoneyFull(totalInterest) }] }
    ],
    assumptions: [{ label: 'Compounding', value: 'Semi-annual, not in advance (the Canadian standard)' }, { label: 'Minimum down payment', value: fmtMoneyFull(minDownRequired) }]
  };
}
