import { fmtMoney, fmtMoneyFull, fmtPct } from '../format.js';
import { pmt, minDown, insurancePremiumRate, ontarioLTT } from './core.js';

export const view = 'afford';

export const defaultState = { income: 96000, down: 60000, debt: 400, condo: 0, rate: 4.44, city: 'toronto', amort: 25 };

export function compute(s) {
  const monthlyIncome = s.income / 12;
  const feasible = (price, gdsLim, tdsLim) => {
    if (s.down < minDown(price)) return false;
    const mortgageBase = Math.max(0, price - s.down);
    if (mortgageBase <= 0) return true;
    const ltvFrac = mortgageBase / price;
    const premRate = ltvFrac > 0.8 ? insurancePremiumRate(ltvFrac, s.amort) : 0;
    const mortgageInsured = mortgageBase * (1 + premRate);
    const stressRate = Math.max(s.rate + 2, 5.25);
    const testPmt = pmt(mortgageInsured, stressRate, s.amort);
    const taxRate = s.city === 'toronto' ? 0.006 : 0.007;
    const propTax = price * taxRate / 12;
    const gds = (testPmt + propTax + 100 + s.condo * 0.5) / monthlyIncome;
    const tds = gds + s.debt / monthlyIncome;
    return gds <= gdsLim && tds <= tdsLim;
  };
  const solve = (gdsLim, tdsLim) => {
    let lo = 50000, hi = 3000000;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (feasible(mid, gdsLim, tdsLim)) lo = mid; else hi = mid;
    }
    return lo;
  };
  const maxPrice = solve(0.39, 0.44);
  const comfyPrice = solve(0.32, 0.36);
  const price = maxPrice;
  const mortgageBase = Math.max(0, price - s.down);
  const ltvFrac = price > 0 ? mortgageBase / price : 0;
  const premRate = ltvFrac > 0.8 ? insurancePremiumRate(ltvFrac, s.amort) : 0;
  const premiumAmt = mortgageBase * premRate;
  const mortgageInsured = mortgageBase + premiumAmt;
  const realPayment = pmt(mortgageInsured, s.rate, s.amort);
  const taxRate = s.city === 'toronto' ? 0.006 : 0.007;
  const propTax = price * taxRate / 12;
  const totalMonthly = realPayment + propTax + 100 + s.condo * 0.5;
  const ontarioTax = ontarioLTT(price);
  const torontoTax = s.city === 'toronto' ? ontarioLTT(price) : 0; // municipal mirrors provincial brackets
  const rebateOntario = Math.min(4000, ontarioTax);
  const rebateToronto = s.city === 'toronto' ? Math.min(4475, torontoTax) : 0;
  const pst = premiumAmt * 0.08;
  const legal = 1800, title = 300;
  const cashToClose = s.down + ontarioTax - rebateOntario + torontoTax - rebateToronto + pst + legal + title;
  const downPct = price > 0 ? s.down / price * 100 : 0;
  const debtImpact = s.debt * 195;
  const notes = [];
  if (price < 300000) notes.push({ tone: 'watch', text: 'This number is a diagnosis, not a price. Nothing in Ontario trades this low. The monthly debt payments are the limiting factor, not the down payment.' });
  notes.push({ tone: 'context', text: `A comfortable price, one that leaves more room in the budget, would be closer to ${fmtMoney(comfyPrice)}.` });
  notes.push({ tone: 'watch', text: `Cash needed on closing day (${fmtMoneyFull(cashToClose)}) is more than the down payment alone. It includes land transfer tax, legal fees, and tax on the insurance premium.` });
  if (s.debt > 0) notes.push({ tone: 'good', text: `Clearing that $${s.debt}/month in debt would add roughly ${fmtMoney(debtImpact)} to what you could qualify for.` });
  return {
    tone: 'neutral', label: 'Maximum purchase price', bigValue: fmtMoney(price),
    subtitle: `At ${fmtPct(s.rate)} over ${s.amort} years, tested at ${fmtPct(Math.max(s.rate + 2, 5.25))}.`,
    tiles: [
      { label: 'Total monthly cost', value: fmtMoneyFull(totalMonthly) },
      { label: 'Cash to close', value: fmtMoneyFull(cashToClose) },
      { label: 'Mortgage amount', value: fmtMoneyFull(mortgageInsured) },
      { label: 'Down payment', value: fmtPct(downPct, 1) }
    ],
    notes,
    ledgerGroups: [
      { header: 'The purchase', rows: [{ label: 'Purchase price', value: fmtMoneyFull(price) }, { label: 'Down payment', value: fmtMoneyFull(s.down) }, { label: 'Base mortgage', value: fmtMoneyFull(mortgageBase) }, { label: 'Default insurance premium', value: fmtMoneyFull(premiumAmt) }, { label: 'Insured mortgage', value: fmtMoneyFull(mortgageInsured) }] },
      { header: 'Monthly costs', rows: [{ label: 'Mortgage payment', value: fmtMoneyFull(realPayment) }, { label: 'Property tax (est.)', value: fmtMoneyFull(propTax) }, { label: 'Heat allowance', value: '$100' }, { label: 'Condo fee counted', value: fmtMoneyFull(s.condo * 0.5) }, { label: 'Total', value: fmtMoneyFull(totalMonthly) }] },
      { header: 'Closing day', rows: [{ label: 'Ontario land transfer tax', value: fmtMoneyFull(ontarioTax) }, { label: 'Ontario first-time rebate', value: '-' + fmtMoneyFull(rebateOntario) }].concat(s.city === 'toronto' ? [{ label: 'Toronto municipal tax', value: fmtMoneyFull(torontoTax) }, { label: 'Toronto first-time rebate', value: '-' + fmtMoneyFull(rebateToronto) }] : []).concat([{ label: 'PST on insurance premium (cash)', value: fmtMoneyFull(pst) }, { label: 'Legal fees (est.)', value: fmtMoneyFull(legal) }, { label: 'Title insurance (est.)', value: fmtMoneyFull(title) }, { label: 'Total cash to close', value: fmtMoneyFull(cashToClose) }]) }
    ],
    assumptions: [{ label: 'Stress test rate', value: fmtPct(Math.max(s.rate + 2, 5.25)) }, { label: 'GDS / TDS limit', value: '39% / 44%' }, { label: 'Property tax rate (assumed)', value: fmtPct(taxRate * 100, 2) }, { label: 'First-time buyer rebates applied', value: 'Yes' }]
  };
}
