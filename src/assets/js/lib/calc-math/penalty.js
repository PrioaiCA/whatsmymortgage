import { fmtMoney, fmtMoneyFull, fmtPct } from '../format.js';
import { pmt } from './core.js';

export const view = 'penalty';

export const defaultState = { balance: 400000, currentRate: 5.5, monthsLeft: 24, yearsLeft: 20, newRate: 4.44, type: 'fixed', lender: 'broker' };

export function compute(s) {
  const threeMonths = s.balance * (s.currentRate / 100) / 12 * 3;
  let low = threeMonths, high = threeMonths;
  if (s.type === 'fixed') {
    const diffLow = Math.max(0, s.currentRate - s.newRate);
    const irdLow = s.balance * (diffLow / 100) * (s.monthsLeft / 12);
    low = Math.max(threeMonths, irdLow);
    if (s.lender === 'bigbank') {
      const diffHigh = Math.max(0, (s.currentRate + 1.6) - s.newRate);
      const irdHigh = s.balance * (diffHigh / 100) * (s.monthsLeft / 12);
      high = Math.max(threeMonths, irdHigh);
    } else {
      high = low;
    }
  }
  const monthlySavings = pmt(s.balance, s.currentRate, s.yearsLeft) - pmt(s.balance, s.newRate, s.yearsLeft);
  const savingsOverTerm = monthlySavings * s.monthsLeft;
  const netLow = savingsOverTerm - high;
  const netHigh = savingsOverTerm - low;
  const collapsed = Math.abs(high - low) < 1;
  const label = collapsed ? 'Net position' : 'Net position (range)';
  const bigValue = collapsed ? fmtMoney(netLow) : `${fmtMoney(netLow)} to ${fmtMoney(netHigh)}`;
  return {
    tone: (netHigh <= 0) ? 'bad' : 'neutral', label, bigValue,
    subtitle: collapsed ? 'Savings over the remaining term minus the penalty.' : 'Low estimate assumes a fair differential; high assumes posted-rate pricing.',
    tiles: [{ label: "Three months' interest", value: fmtMoneyFull(threeMonths) }, { label: 'Penalty (low to high)', value: `${fmtMoneyFull(low)} to ${fmtMoneyFull(high)}` }, { label: 'Monthly savings, new rate', value: fmtMoneyFull(Math.max(0, monthlySavings)) }, { label: 'Savings over remaining term', value: fmtMoneyFull(savingsOverTerm) }],
    notes: [
      { tone: 'watch', text: 'A fairly calculated rate differential is designed to leave the lender indifferent to you leaving, which is exactly why breaking for rate alone often cancels itself out.' },
      { tone: 'context', text: 'Only your lender can supply the exact penalty figure. This is an estimate built from the public formula.' },
      { tone: 'good', text: 'Ask about a blend-and-extend, mixing your current rate with today\'s into a fresh term. It usually carries no penalty at all.' },
      { tone: 'good', text: 'Using your annual prepayment privilege before breaking shrinks the balance the penalty is calculated on.' }
    ],
    ledgerGroups: [{ header: 'The penalty', rows: [{ label: "Three months' interest", value: fmtMoneyFull(threeMonths) }, { label: 'Interest rate differential (low)', value: fmtMoneyFull(low) }, { label: 'Interest rate differential (high)', value: fmtMoneyFull(high) }] }, { header: 'The trade-off', rows: [{ label: 'Monthly savings at new rate', value: fmtMoneyFull(Math.max(0, monthlySavings)) }, { label: 'Months left in term', value: String(s.monthsLeft) }, { label: 'Savings over remaining term', value: fmtMoneyFull(savingsOverTerm) }] }],
    assumptions: [{ label: 'Mortgage type', value: s.type === 'fixed' ? 'Fixed' : 'Variable' }, { label: 'Lender type', value: s.lender === 'bigbank' ? 'Big bank' : 'Credit union / broker lender' }, { label: 'Posted-rate premium modeled', value: '+1.60% over contract rate' }]
  };
}
