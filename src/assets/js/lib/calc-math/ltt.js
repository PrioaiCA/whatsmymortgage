import { fmtMoneyFull } from '../format.js';
import { ontarioLTT } from './core.js';

export const view = 'ltt';

export const defaultState = { price: 650000, city: 'toronto', firstTime: 'yes' };

export function compute(s) {
  const isToronto = s.city === 'toronto';
  const isFirstTime = s.firstTime === 'yes';

  const ontarioTax = ontarioLTT(s.price);
  // Toronto's municipal land transfer tax mirrors the provincial brackets
  // almost exactly, so it's calculated the same way and simply added again
  // — the same approach used in the affordability and rent-vs-buy
  // calculators, kept consistent here rather than introduced fresh.
  const torontoTax = isToronto ? ontarioLTT(s.price) : 0;
  const totalBeforeRebate = ontarioTax + torontoTax;

  const rebateOntario = isFirstTime ? Math.min(4000, ontarioTax) : 0;
  const rebateToronto = isFirstTime && isToronto ? Math.min(4475, torontoTax) : 0;
  const totalRebate = rebateOntario + rebateToronto;
  const totalDue = totalBeforeRebate - totalRebate;

  const notes = [];
  if (isFirstTime) notes.push({ tone: 'good', text: `As a first-time buyer, the rebate brings this down from ${fmtMoneyFull(totalBeforeRebate)} to ${fmtMoneyFull(totalDue)}.` });
  if (isToronto) notes.push({ tone: 'context', text: 'Toronto is the only Ontario municipality that charges its own land transfer tax on top of the provincial one — everywhere else in Ontario, only the provincial tax applies.' });
  notes.push({ tone: 'watch', text: 'This is due in cash on closing day, on top of the down payment — it cannot be added to the mortgage.' });

  return {
    tone: 'neutral', label: 'Land transfer tax due on closing', bigValue: fmtMoneyFull(totalDue),
    subtitle: `On a ${fmtMoneyFull(s.price)} home${isToronto ? ' in Toronto' : ' outside Toronto'}${isFirstTime ? ', after the first-time buyer rebate' : ''}.`,
    tiles: [
      { label: 'Ontario tax', value: fmtMoneyFull(ontarioTax) },
      { label: 'Toronto municipal tax', value: isToronto ? fmtMoneyFull(torontoTax) : 'Not applicable' },
      { label: 'Rebate applied', value: fmtMoneyFull(totalRebate) },
      { label: 'Total before rebate', value: fmtMoneyFull(totalBeforeRebate) }
    ],
    notes,
    ledgerGroups: [
      { header: 'Provincial tax', rows: [{ label: 'Ontario land transfer tax', value: fmtMoneyFull(ontarioTax) }, { label: 'First-time buyer rebate', value: '-' + fmtMoneyFull(rebateOntario) }] }
    ].concat(isToronto ? [{ header: 'Municipal tax', rows: [{ label: 'Toronto land transfer tax', value: fmtMoneyFull(torontoTax) }, { label: 'First-time buyer rebate', value: '-' + fmtMoneyFull(rebateToronto) }] }] : []).concat([
      { header: 'Total', rows: [{ label: 'Before rebate', value: fmtMoneyFull(totalBeforeRebate) }, { label: 'Rebate', value: '-' + fmtMoneyFull(totalRebate) }, { label: 'Due on closing', value: fmtMoneyFull(totalDue) }] }
    ]),
    assumptions: [
      { label: 'Ontario rebate cap', value: '$4,000' },
      { label: 'Toronto rebate cap', value: '$4,475 (Toronto only)' },
      { label: 'First-time buyer eligibility', value: 'Never owned a home anywhere, Canadian citizen or permanent resident' }
    ]
  };
}
