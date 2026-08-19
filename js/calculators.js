// Mortgage math engine — Canadian semi-annual compounding, OSFI stress test,
// Ontario/Toronto land transfer tax, CMHC default-insurance premiums.
import { fmtMoney, fmtMoneyFull, fmtPct } from './format.js';

export function defaultCalcState() {
  return {
    afford: { income: 96000, down: 60000, debt: 400, condo: 0, rate: 4.44, city: '905', amort: 25 },
    renew: { balance: 350000, yearsLeft: 20, rateOffered: 4.69, rateElsewhere: 4.04, term: 5 },
    equity: { homeValue: 750000, balance: 400000, currentPayment: 2200, debtBalance: 25000, debtRate: 19.99, debtPayment: 650, newRate: 4.44, amort: 25 },
    penalty: { balance: 400000, currentRate: 5.5, monthsLeft: 24, yearsLeft: 20, newRate: 4.44, type: 'fixed', lender: 'broker' },
    rent: { rent: 2600, price: 750000, down: 75000, rate: 4.44, carrying: 500, appr: 4.5, invret: 6, city: '905' }
  };
}

function monthlyRate(pct) { return Math.pow(1 + pct / 200, 1 / 6) - 1; }

function pmt(P, ratePct, years) {
  if (P <= 0) return 0;
  const r = monthlyRate(ratePct);
  const n = years * 12;
  return P * r / (1 - Math.pow(1 + r, -n));
}

function remBal(P, ratePct, totalYears, monthsPaid) {
  const r = monthlyRate(ratePct);
  const n = totalYears * 12;
  const payment = pmt(P, ratePct, totalYears);
  const k = Math.min(monthsPaid, n);
  return Math.max(0, P * Math.pow(1 + r, k) - payment * ((Math.pow(1 + r, k) - 1) / r));
}

export function minDown(price) {
  if (price <= 500000) return price * 0.05;
  if (price <= 1500000) return 25000 + (price - 500000) * 0.10;
  return price * 0.20;
}

function insurancePremiumRate(ltvFrac, amortYears) {
  let r = 0;
  const p = ltvFrac * 100;
  if (p > 90) r = 0.04;
  else if (p > 85) r = 0.031;
  else if (p > 80) r = 0.028;
  if (r > 0 && amortYears === 30) r += 0.002;
  return r;
}

function ontarioLTT(price) {
  const b = [[55000, .005], [250000, .01], [400000, .015], [2000000, .02], [Infinity, .025]];
  let tax = 0, prev = 0;
  for (const [cap, rate] of b) {
    const slice = Math.min(price, cap) - prev;
    if (slice > 0) tax += slice * rate;
    prev = cap;
    if (price <= cap) break;
  }
  return tax;
}

function torontoLTT(price) {
  const b = [[55000, .005], [250000, .01], [400000, .015], [2000000, .02], [3000000, .025], [4000000, .035], [5000000, .045], [10000000, .055], [Infinity, .065]];
  let tax = 0, prev = 0;
  for (const [cap, rate] of b) {
    const slice = Math.min(price, cap) - prev;
    if (slice > 0) tax += slice * rate;
    prev = cap;
    if (price <= cap) break;
  }
  return tax;
}

export function computeAfford(s) {
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

export function computeRenew(s) {
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

export function computeEquity(s) {
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

export function computePenalty(s) {
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

export function computeRentBuy(s) {
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

export const computers = {
  afford: computeAfford,
  renew: computeRenew,
  equity: computeEquity,
  penalty: computePenalty,
  rent: computeRentBuy
};
