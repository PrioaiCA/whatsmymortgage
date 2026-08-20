import { fmtMoney, fmtMoneyFull, fmtPct } from '../format.js';
import { pmt, remBal, insurancePremiumRate, ontarioLTT } from './core.js';

export const view = 'rent';

export const defaultState = { rent: 2600, price: 750000, down: 75000, rate: 4.44, carrying: 500, appr: 4.5, invret: 6, city: '905' };

export function compute(s) {
  const amort = 25;
  const legal = 1800, title = 300;
  const mortgageBase = Math.max(0, s.price - s.down);
  const ltvFrac = mortgageBase / s.price;
  const premRate = ltvFrac > 0.8 ? insurancePremiumRate(ltvFrac, amort) : 0;
  const mortgage = mortgageBase * (1 + premRate);
  const ltt = s.city === 'toronto' ? ontarioLTT(s.price) * 2 : ontarioLTT(s.price);
  const closingCash = s.down + ltt + legal + title + mortgageBase * premRate * 0.08;
  const payment = pmt(mortgage, s.rate, amort);
  const months = 60;
  const remBalance = remBal(mortgage, s.rate, amort, months);
  const principalPaid = mortgage - remBalance;
  const totalPaidMortgage = payment * months;
  const interestPaid = totalPaidMortgage - principalPaid;
  let carryingTotal = 0;
  for (let y = 0; y < 5; y++) carryingTotal += s.carrying * 12 * Math.pow(1.02, y);
  const year5Value = s.price * Math.pow(1 + s.appr / 100, 5);
  const sellingCosts = year5Value * 0.05;
  const buyEquityNet = year5Value - remBalance - sellingCosts;
  let rentTotal = 0;
  for (let y = 0; y < 5; y++) rentTotal += s.rent * 12 * Math.pow(1.03, y);
  const avgSurplus = (totalPaidMortgage + carryingTotal - rentTotal) / months;
  const rMonthly = s.invret / 100 / 12;
  const fvInitial = closingCash * Math.pow(1 + s.invret / 100, 5);
  const fvAnnuity = avgSurplus > 0 ? avgSurplus * ((Math.pow(1 + rMonthly, months) - 1) / (rMonthly || 1)) : 0;
  const rentNetWorth = fvInitial + fvAnnuity;
  const advantage = buyEquityNet - rentNetWorth;
  return {
    tone: 'neutral', label: advantage >= 0 ? 'Buying comes out ahead by' : 'Renting comes out ahead by', bigValue: fmtMoney(Math.abs(advantage)),
    subtitle: 'Net position after 5 years, buying vs. renting and investing the difference.',
    tiles: [{ label: 'Home equity, year 5 (net)', value: fmtMoneyFull(buyEquityNet) }, { label: 'Rent + invest, year 5', value: fmtMoneyFull(rentNetWorth) }, { label: 'Cash to close, buying', value: fmtMoneyFull(closingCash) }, { label: 'Interest paid, 5 years', value: fmtMoneyFull(interestPaid) }],
    notes: [
      { tone: 'watch', text: 'Under about three years of ownership, renting almost always wins. Selling costs alone can erase several years of appreciation.' },
      { tone: 'context', text: "The rent case assumes every dollar of the monthly difference gets invested, every month, for 5 years. Most people don't actually do that." }
    ],
    ledgerGroups: [
      { header: 'Buying', rows: [{ label: 'Closing cash', value: fmtMoneyFull(closingCash) }, { label: 'Principal paid', value: fmtMoneyFull(principalPaid) }, { label: 'Interest paid', value: fmtMoneyFull(interestPaid) }, { label: 'Carrying costs (5yr, grown 2%/yr)', value: fmtMoneyFull(carryingTotal) }, { label: 'Value, year 5', value: fmtMoneyFull(year5Value) }, { label: 'Balance owing, year 5', value: fmtMoneyFull(remBalance) }, { label: 'Selling costs (5%)', value: fmtMoneyFull(sellingCosts) }] },
      { header: 'Renting', rows: [{ label: 'Rent paid (5yr, grown 3%/yr)', value: fmtMoneyFull(rentTotal) }, { label: 'Upfront cash invested', value: fmtMoneyFull(closingCash) }, { label: 'Monthly difference invested', value: fmtMoneyFull(Math.max(0, avgSurplus)) + '/mo avg' }, { label: 'Net worth, year 5', value: fmtMoneyFull(rentNetWorth) }] }
    ],
    assumptions: [{ label: 'Amortization', value: amort + ' years' }, { label: 'Appreciation', value: fmtPct(s.appr) + '/yr' }, { label: 'Investment return', value: fmtPct(s.invret) + '/yr' }, { label: 'Selling costs', value: '5% of sale price' }]
  };
}
