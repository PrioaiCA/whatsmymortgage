import { fmtMoney, fmtMoneyFull, fmtPct } from '../format.js';
import { pmt, remBal } from './core.js';

export const view = 'renew';

export const defaultState = { balance: 350000, yearsLeft: 20, rateOffered: 4.69, rateElsewhere: 4.04, term: 5 };

export function compute(s) {
  const pOffered = pmt(s.balance, s.rateOffered, s.yearsLeft);
  const pElsewhere = pmt(s.balance, s.rateElsewhere, s.yearsLeft);
  const termMonths = s.term * 12;
  const extraPaid = (pOffered - pElsewhere) * termMonths;
  const remOffered = remBal(s.balance, s.rateOffered, s.yearsLeft, termMonths);
  const remElsewhere = remBal(s.balance, s.rateElsewhere, s.yearsLeft, termMonths);
  const extraBalance = remOffered - remElsewhere;
  const totalCost = extraPaid + extraBalance;
  const tone = totalCost > 50 ? 'bad' : 'neutral';
  return {
    tone, label: 'Cost of signing this offer', bigValue: fmtMoney(totalCost),
    subtitle: `Compared with ${fmtPct(s.rateElsewhere)} elsewhere, over a ${s.term}-year term.`,
    tiles: [
      { label: 'Payment offered', value: fmtMoneyFull(pOffered) + '/mo' },
      { label: 'Payment elsewhere', value: fmtMoneyFull(pElsewhere) + '/mo' },
      { label: 'Extra interest paid', value: fmtMoneyFull(extraPaid) },
      { label: 'Extra balance at renewal', value: fmtMoneyFull(extraBalance) }
    ],
    notes: [
      { tone: 'context', text: "A switch to a new lender at renewal is not a refinance. It carries no penalty, and the new lender usually covers the switch costs." },
      { tone: 'watch', text: "Lenders will typically hold a rate for you up to 120 days ahead of your renewal date, worth locking in early if you're shopping around." }
    ],
    ledgerGroups: [{ header: `Over the ${s.term}-year term`, rows: [{ label: 'Monthly payment, offer', value: fmtMoneyFull(pOffered) }, { label: 'Monthly payment, elsewhere', value: fmtMoneyFull(pElsewhere) }, { label: 'Extra interest paid', value: fmtMoneyFull(extraPaid) }, { label: 'Balance remaining, offer', value: fmtMoneyFull(remOffered) }, { label: 'Balance remaining, elsewhere', value: fmtMoneyFull(remElsewhere) }, { label: 'Total cost of the offer', value: fmtMoneyFull(totalCost) }] }],
    assumptions: [{ label: 'Remaining amortization', value: s.yearsLeft + ' years' }, { label: 'Term compared', value: s.term + ' years' }]
  };
}
