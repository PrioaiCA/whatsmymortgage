import { fmtMoneyFull, fmtPct } from '../format.js';
import { minDown, insurancePremiumRate } from './core.js';

export const view = 'cmhc';

export const defaultState = { price: 500000, down: 40000, amort: 25 };

export function compute(s) {
  const minDownRequired = minDown(s.price);
  const mortgageBase = Math.max(0, s.price - s.down);
  const ltvFrac = s.price > 0 ? mortgageBase / s.price : 0;
  const required = ltvFrac > 0.8;
  const premRate = required ? insurancePremiumRate(ltvFrac, s.amort) : 0;
  const premiumAmt = mortgageBase * premRate;
  const pst = premiumAmt * 0.08;
  const insuredMortgage = mortgageBase + premiumAmt;
  const downPct = s.price > 0 ? (s.down / s.price) * 100 : 0;

  const notes = [];
  if (!required) {
    notes.push({ tone: 'good', text: `At ${fmtPct(downPct, 1)} down, this is above the 20% line — default insurance isn't required.` });
  } else {
    notes.push({ tone: 'watch', text: `The 8% Ontario sales tax on the premium (${fmtMoneyFull(pst)}) is due in cash on closing — it can't be added to the mortgage, unlike the premium itself.` });
    if (s.amort === 30) notes.push({ tone: 'context', text: 'A 30-year amortization adds 0.2 percentage points to the premium rate versus 25 years, on top of being available only in specific eligibility cases.' });
  }

  return {
    tone: 'neutral', label: 'Default insurance premium', bigValue: required ? fmtMoneyFull(premiumAmt) : '$0',
    subtitle: required ? `At ${fmtPct(ltvFrac * 100, 1)} loan-to-value, over ${s.amort} years.` : `Not required — ${fmtPct(downPct, 1)} down is at or above the 20% threshold.`,
    tiles: [
      { label: 'Premium rate', value: required ? fmtPct(premRate * 100, 2) : '0%' },
      { label: 'PST on premium (cash)', value: fmtMoneyFull(pst) },
      { label: 'Insured mortgage amount', value: fmtMoneyFull(insuredMortgage) },
      { label: 'Minimum down payment', value: fmtMoneyFull(minDownRequired) }
    ],
    notes,
    ledgerGroups: [
      { header: 'The math', rows: [{ label: 'Purchase price', value: fmtMoneyFull(s.price) }, { label: 'Down payment', value: fmtMoneyFull(s.down) + ` (${fmtPct(downPct, 1)})` }, { label: 'Base mortgage', value: fmtMoneyFull(mortgageBase) }, { label: 'Loan-to-value', value: fmtPct(ltvFrac * 100, 1) }, { label: 'Premium rate', value: fmtPct(premRate * 100, 2) }, { label: 'Premium amount', value: fmtMoneyFull(premiumAmt) }, { label: 'PST on premium (cash, not financed)', value: fmtMoneyFull(pst) }, { label: 'Mortgage amount, insurance added', value: fmtMoneyFull(insuredMortgage) }] }
    ],
    assumptions: [
      { label: 'Premium bands', value: '4% above 90% LTV, 3.1% above 85%, 2.8% above 80%' },
      { label: '30-year amortization surcharge', value: '+0.2 points, where eligible' },
      { label: 'Price cap for insured mortgages', value: '$1,500,000' }
    ]
  };
}
