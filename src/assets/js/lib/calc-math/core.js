// Shared primitives for the mortgage math engine. Canadian semi-annual
// compounding, CMHC default-insurance premiums, Ontario/Toronto land
// transfer tax. Do not change these formulas — every calculator depends on
// them producing the same numbers a lender would.
export function monthlyRate(pct) { return Math.pow(1 + pct / 200, 1 / 6) - 1; }

export function pmt(P, ratePct, years) {
  if (P <= 0) return 0;
  const r = monthlyRate(ratePct);
  const n = years * 12;
  return P * r / (1 - Math.pow(1 + r, -n));
}

export function remBal(P, ratePct, totalYears, monthsPaid) {
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

export function insurancePremiumRate(ltvFrac, amortYears) {
  let r = 0;
  const p = ltvFrac * 100;
  if (p > 90) r = 0.04;
  else if (p > 85) r = 0.031;
  else if (p > 80) r = 0.028;
  if (r > 0 && amortYears === 30) r += 0.002;
  return r;
}

export function ontarioLTT(price) {
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

export function torontoLTT(price) {
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
