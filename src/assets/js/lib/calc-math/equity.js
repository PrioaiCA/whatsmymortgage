import { fmtMoney, fmtMoneyFull, fmtPct } from '../format.js';
import { pmt } from './core.js';

export const view = 'equity';

export const defaultState = { homeValue: 750000, balance: 400000, currentPayment: 2200, debtBalance: 25000, debtRate: 19.99, debtPayment: 650, newRate: 4.44, amort: 25 };

export function compute(s) {
  const ltv = s.balance / s.homeValue;
  if (ltv > 0.8) {
    const maxMortgage = s.homeValue * 0.8;
    const shortfall = s.balance - maxMortgage;
    return {
      tone: 'bad', label: 'No equity available yet', bigValue: fmtMoney(shortfall),
      subtitle: "How far above the 80% refinance ceiling this mortgage sits.",
      tiles: [{ label: 'Current LTV', value: fmtPct(ltv * 100, 1) }, { label: 'Refinance ceiling (80%)', value: fmtMoneyFull(maxMortgage) }, { label: 'Current balance', value: fmtMoneyFull(s.balance) }, { label: 'Shortfall', value: fmtMoneyFull(shortfall) }],
      notes: [{ tone: 'watch', text: "Refinancing is capped at 80% of your home's value. This mortgage is already above that line, so there's no equity to draw on right now." }],
      ledgerGroups: [{ header: 'The ceiling', rows: [{ label: 'Home value', value: fmtMoneyFull(s.homeValue) }, { label: '80% of value', value: fmtMoneyFull(maxMortgage) }, { label: 'Current balance', value: fmtMoneyFull(s.balance) }] }],
      assumptions: [{ label: 'Refinance LTV cap', value: '80%' }]
    };
  }
  const maxMortgage = s.homeValue * 0.8;
  const availableEquity = maxMortgage - s.balance;
  const consolidated = Math.min(s.debtBalance, availableEquity);
  const newMortgage = s.balance + consolidated;
  const newPayment = pmt(newMortgage, s.newRate, s.amort);
  const freedCash = (s.currentPayment + s.debtPayment) - newPayment;
  const debtMonthlyInterest = s.debtBalance * (s.debtRate / 100 / 12);
  const permanent = s.debtPayment <= debtMonthlyInterest * 1.02;
  const rMonthly = s.debtRate / 100 / 12;
  let payoffMonths = permanent ? Infinity : -Math.log(1 - rMonthly * s.debtBalance / s.debtPayment) / Math.log(1 + rMonthly);
  if (!isFinite(payoffMonths) || payoffMonths > 600) payoffMonths = 600;
  const interestIfLeftAlone = permanent ? s.debtBalance * 5 : Math.max(0, s.debtPayment * payoffMonths - s.debtBalance);
  const totalInterestNew = newPayment * s.amort * 12 - newMortgage;
  const totalInterestExistingOnly = pmt(s.balance, s.newRate, s.amort) * s.amort * 12 - s.balance;
  const addedInterestFromDebt = Math.max(0, totalInterestNew - totalInterestExistingOnly);
  const notes = [{ tone: 'watch', text: `Rolling that debt into your mortgage stretches it across ${s.amort} years. Even at a lower rate, the total interest on that portion comes to roughly ${fmtMoney(addedInterestFromDebt)}, versus ${fmtMoney(interestIfLeftAlone)} if left on its current terms.` }];
  if (permanent) notes.push({ tone: 'watch', text: 'The current payment on that debt barely covers its own interest. At this rate, the balance is effectively permanent unless something changes.' });
  return {
    tone: 'neutral', label: 'Monthly cash freed up', bigValue: fmtMoneyFull(freedCash) + '/mo',
    subtitle: `Consolidating ${fmtMoney(consolidated)} of debt into a new ${s.amort}-year mortgage at ${fmtPct(s.newRate)}.`,
    tiles: [{ label: 'New mortgage payment', value: fmtMoneyFull(newPayment) + '/mo' }, { label: 'Old combined payments', value: fmtMoneyFull(s.currentPayment + s.debtPayment) + '/mo' }, { label: 'Equity used', value: fmtMoneyFull(consolidated) }, { label: 'New LTV', value: fmtPct(newMortgage / s.homeValue * 100, 1) }],
    notes,
    ledgerGroups: [{ header: 'The new mortgage', rows: [{ label: 'Existing balance', value: fmtMoneyFull(s.balance) }, { label: 'Debt consolidated', value: fmtMoneyFull(consolidated) }, { label: 'New mortgage amount', value: fmtMoneyFull(newMortgage) }, { label: 'New monthly payment', value: fmtMoneyFull(newPayment) }] }],
    assumptions: [{ label: 'Available equity to 80% LTV', value: fmtMoneyFull(Math.max(0, availableEquity)) }, { label: 'New amortization', value: s.amort + ' years' }]
  };
}
