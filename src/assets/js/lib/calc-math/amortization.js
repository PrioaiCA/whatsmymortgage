import { fmtMoney, fmtMoneyFull, fmtPct } from '../format.js';
import { monthlyRate, pmt } from './core.js';

export const view = 'amortization';

export const defaultState = { mortgage: 500000, rate: 4.44, amort: 25, extra: 200, lumpSum: 0 };

// Runs the actual month-by-month payoff, not a closed-form approximation
// — extra payments change the payoff date, so there's no shortcut that
// stays exact once a lump sum or recurring extra payment is in the mix.
function runSchedule(principal, ratePct, amortYears, extraMonthly, lumpSum) {
  const r = monthlyRate(ratePct);
  const basePayment = pmt(principal, ratePct, amortYears);
  let balance = Math.max(0, principal - (lumpSum || 0));
  let totalInterest = 0;
  let months = 0;
  const cap = amortYears * 12 * 2; // safety stop, extra payments only ever shorten this
  while (balance > 0.5 && months < cap) {
    const interest = balance * r;
    const principalPortion = Math.min(balance, basePayment - interest + (extraMonthly || 0));
    balance -= principalPortion;
    totalInterest += interest;
    months++;
  }
  return { months, totalInterest, basePayment };
}

export function compute(s) {
  const baseline = runSchedule(s.mortgage, s.rate, s.amort, 0, 0);
  const withExtra = runSchedule(s.mortgage, s.rate, s.amort, s.extra, s.lumpSum);

  const interestSaved = baseline.totalInterest - withExtra.totalInterest;
  const monthsSaved = baseline.months - withExtra.months;
  const yearsSaved = monthsSaved / 12;
  const newPayoffYears = withExtra.months / 12;

  const hasExtra = s.extra > 0 || s.lumpSum > 0;
  const notes = [];
  if (hasExtra) {
    notes.push({ tone: 'good', text: `Paying it off ${yearsSaved.toFixed(1)} years sooner saves ${fmtMoney(interestSaved)} in interest, without changing what you'd pay if you stopped the extra payments.` });
    notes.push({ tone: 'watch', text: 'Most lenders cap prepayments without penalty at 10-20% of the original balance per year — check yours before committing to an ongoing extra payment.' });
  } else {
    notes.push({ tone: 'context', text: 'Add an extra monthly amount or a lump sum to see how much sooner this would be paid off.' });
  }

  return {
    tone: 'neutral', label: hasExtra ? 'Interest you would save' : 'Payoff time, no extra payments', bigValue: hasExtra ? fmtMoney(interestSaved) : `${s.amort} years`,
    subtitle: hasExtra ? `Paid off in ${newPayoffYears.toFixed(1)} years instead of ${s.amort} — ${yearsSaved.toFixed(1)} years sooner.` : `${fmtMoneyFull(baseline.basePayment)}/mo at ${fmtPct(s.rate)}.`,
    tiles: [
      { label: 'New payoff time', value: `${newPayoffYears.toFixed(1)} yrs` },
      { label: 'Time saved', value: `${yearsSaved.toFixed(1)} yrs` },
      { label: 'Regular payment', value: fmtMoneyFull(withExtra.basePayment) + '/mo' },
      { label: 'Total interest, with extra payments', value: fmtMoneyFull(withExtra.totalInterest) }
    ],
    notes,
    ledgerGroups: [
      { header: 'No extra payments', rows: [{ label: 'Payoff time', value: `${(baseline.months / 12).toFixed(1)} years` }, { label: 'Total interest paid', value: fmtMoneyFull(baseline.totalInterest) }, { label: 'Total paid', value: fmtMoneyFull(s.mortgage + baseline.totalInterest) }] },
      { header: 'With your extra payments', rows: [{ label: 'Payoff time', value: `${newPayoffYears.toFixed(1)} years` }, { label: 'Total interest paid', value: fmtMoneyFull(withExtra.totalInterest) }, { label: 'Total paid', value: fmtMoneyFull(s.mortgage + withExtra.totalInterest) }] },
      { header: 'The difference', rows: [{ label: 'Time saved', value: `${yearsSaved.toFixed(1)} years` }, { label: 'Interest saved', value: fmtMoneyFull(interestSaved) }] }
    ],
    assumptions: [{ label: 'Extra monthly payment', value: fmtMoneyFull(s.extra) }, { label: 'One-time lump sum, applied at the start', value: fmtMoneyFull(s.lumpSum) }, { label: 'Rate held constant for the full amortization', value: 'Real mortgages renew every term — this assumes the same rate throughout' }]
  };
}
