// Static copy and reference data for WhatsMyMortgage.ca.

export const DOC_GROUPS = [
  { title: "If you're salaried", items: ['Recent pay stub', 'T4 or T4A, last 2 years', 'Job letter confirming salary'] },
  { title: "If you're self-employed", items: ['T1 Generals, last 2 years', 'Notice of Assessment, last 2 years', 'Business licence or incorporation docs'] },
  { title: 'If you earn commission', items: ['T4, last 2 years', 'Notice of Assessment, last 2 years', 'Letter from employer confirming structure'] }
];

export const PROCESS_STEPS = [
  { n: '01', title: 'First conversation', blurb: 'With a lender or agent, about what you want and what you earn.', timing: 'Day 1' },
  { n: '02', title: 'Pre-approval', blurb: 'A rate hold and a rough number based on your income and debts.', timing: '1 to 3 days' },
  { n: '03', title: 'Shopping and offer', blurb: 'You find a place and make an offer, usually conditional on financing.', timing: 'Varies' },
  { n: '04', title: 'Conditions', blurb: 'The lender confirms the property and your file in full.', timing: '5 to 10 days' },
  { n: '05', title: 'Lawyer', blurb: 'A real estate lawyer handles the title search and closing paperwork.', timing: '2 to 4 weeks' },
  { n: '06', title: 'Closing', blurb: 'Funds transfer, keys change hands, the mortgage begins.', timing: 'Closing day' }
];

export const SOURCE_GROUPS = [
  { title: 'Rates and lending rules', note: 'Benchmark rates, the stress test, and the qualifying rules lenders must follow.', links: ['Bank of Canada: policy rate and bond yields', 'OSFI Guideline B-20: residential mortgage underwriting', 'Department of Finance Canada: mortgage insurance rules'] },
  { title: 'Mortgage insurance', note: 'Premium rates and eligibility for default-insured mortgages.', links: ['CMHC: mortgage loan insurance premiums and rules'] },
  { title: 'Taxes and closing costs', note: 'Land transfer tax brackets, rebates, and closing-cost guidance.', links: ['Ontario Ministry of Finance: land transfer tax', 'City of Toronto: municipal land transfer tax', "Canada Revenue Agency: Home Buyers' Plan, FHSA, GST/HST new housing rebate"] },
  { title: 'Consumer protection', note: "Verify a mortgage agent's licence before sharing financial documents.", links: ['FSRA: public registry of licensed mortgage agents and brokerages'] }
];

export const METHOD_NOTES = [
  { t: 'Semi-annual compounding.', d: 'Canadian mortgages compound twice a year by law, not monthly. Every payment here uses that rate, not the American monthly-compounding formula most calculators default to.' },
  { t: 'The stress test.', d: 'Qualification is tested at your contract rate plus 2%, or 5.25%, whichever is higher, even though your real payment uses your actual rate.' },
  { t: 'Ratio constraints.', d: 'GDS is capped near 39% of gross income and TDS near 44%, including a standard heat allowance and half of any condo fee.' },
  { t: 'Insurance premium handling.', d: 'The premium is added to the mortgage principal, but the 8% Ontario sales tax on that premium is due in cash on closing. It cannot be financed.' },
  { t: 'Why penalties are ranges.', d: "A fair interest rate differential and a big bank's posted-rate differential can differ by thousands of dollars for the same mortgage, so we show both ends." },
  { t: "What's deliberately excluded.", d: 'Appraisal and legal fee variation, cash-back mortgage clawbacks, new-build rebates, portability, and lender cash incentives. All real, all lender- and file-specific, none guessable from a slider.' }
];

// Short-form definitions used by the info-dot tooltip beside form fields.
export const TERMS = {
  amort: ['Amortization', 'The total time to pay the mortgage off completely. Stretching it lowers your monthly payment but means more interest overall.'],
  term: ['Term', "How long your rate and contract are locked in — usually 5 years. At the end you renew the remaining balance. It is not when the mortgage is paid off."],
  stress: ['Stress test', "Lenders must approve you at a higher rate than you'll actually pay: your rate plus 2%, or 5.25%, whichever is higher. A cushion in case rates rise by renewal."],
  gdstds: ['GDS and TDS', 'The two ratios lenders use. GDS is the share of gross income going to housing — capped near 39%. TDS adds every other debt payment — capped near 44%.'],
  ltv: ['Loan-to-value', "Your mortgage divided by the home's value. Above 80% you must buy default insurance; below 80% you don't."],
  cmhc: ['Mortgage default insurance', 'Required when you put down less than 20%. It protects the lender if you stop paying — not you. The premium gets added to your mortgage.'],
  pst: ['PST on the insurance premium', "Ontario charges 8% sales tax on the premium. Unlike the premium itself this can't be added to the mortgage — it's due in cash on closing day."],
  mindown: ['Minimum down payment', '5% on the first $500,000, 10% on the portion between $500,000 and $1.5M, and 20% on anything above $1.5M.'],
  debts: ['What counts as debt', "Credit card minimums, car payments, student loans, lines of credit, support payments. Rent, groceries, and utilities don't count."],
  heat: ['Heat allowance', 'Lenders add a standard heating cost — usually around $100 a month — when testing your ratios, whatever your real bill is.'],
  condo: ['The 50% condo rule', 'Lenders count half your monthly condo fee against your ratios. A $600 fee is treated as $300 of housing cost.'],
  ltt: ['Land transfer tax', 'A tax paid when ownership transfers to you. Ontario charges one; buying inside Toronto means a second, roughly equal one on top.'],
  rebate: ['First-time buyer rebate', 'Up to $4,000 off Ontario land transfer tax, plus $4,475 more in Toronto. Applied by your lawyer at closing.'],
  closing: ['Cash to close', 'Everything due on closing day: down payment, land transfer tax, legal fees, title insurance, adjustments. Always more than the down payment alone.'],
  rate: ['Contract rate', "The rate you actually pay. Different from the rate you're tested at, and different again from a lender's posted rate."],
  compound: ['Semi-annual compounding', 'Canadian mortgage interest compounds twice a year, not monthly. It makes payments slightly lower than an American-style calculator would show.'],
  switch: ['Switch vs refinance', 'A switch moves your existing balance to a new lender at renewal — no penalty, and the new lender usually covers costs. A refinance changes what you owe.'],
  renew: ['Renewal', "When your term ends, the remaining balance rolls into a new term. You're free to move lenders — most people just sign what their bank mails them."],
  equity: ['Equity', "What the home is worth minus what you still owe on it."],
  refi: ['Refinance', "Replacing your mortgage with a larger one to access equity. Capped at 80% of the home's value, and it requires re-qualifying."],
  consol: ['Debt consolidation', 'Rolling high-interest debt into your mortgage at a much lower rate. The payment drops sharply — but the debt now spans decades, so total interest can rise.'],
  penalty: ['Prepayment penalty', "What a lender charges to end a mortgage before the term is up. For fixed mortgages, the greater of three months' interest or the rate differential."],
  ird: ['Interest rate differential', 'A penalty roughly equal to the interest the lender loses by you leaving early. Big banks calculate it against posted rates, making it far larger.'],
  threemo: ["Three months' interest", "The simpler penalty — three months of interest on your balance. The minimum for a fixed mortgage and the only penalty on a variable one."],
  posted: ['Posted rate', "A lender's official advertised rate, usually well above what anyone actually pays. It exists mainly for penalty calculations."],
  blend: ['Blend and extend', 'Mixing your current rate with today\'s rate and starting a fresh term. Usually carries no penalty, so it\'s always worth asking about.'],
  prepay: ['Prepayment privilege', 'How much you can pay down each year without penalty — typically 10% to 20% of the original balance.'],
  fixvar: ['Fixed vs variable', 'Fixed locks your rate for the term. Variable moves with prime. Penalties differ sharply: variable is always just three months\' interest.'],
  appr: ['Appreciation', "How much the home's value grows each year. Ontario's long-run average is roughly 4–5%, but any five-year window can be far higher or negative."],
  invret: ['Investment return', 'What your down payment could earn if invested instead. This assumption drives the rent-vs-buy answer more than the mortgage rate does.'],
  sellcost: ['Selling costs', "Realtor commission plus legal fees when you sell — usually around 5% of the sale price. It's why short ownership periods rarely pay off."],
  principal: ['Principal vs interest', 'Principal is the part of each payment that reduces what you owe. Interest is the cost of borrowing. Early on, most of your payment is interest.'],
  breakeven: ['Break-even point', "How many months of savings it takes to pay back the penalty. Past that point you're ahead; before it, you're behind."],
  hbp: ['Where a down payment can come from', "Savings, gifts from immediate family, an FHSA (up to $40,000 lifetime), or an RRSP under the Home Buyers' Plan (up to $60,000 each)."],
  newbuild: ['New build rebates', 'First-time buyers of newly built homes may qualify for a GST/HST rebate worth up to $50,000, claimed through the CRA rather than your lender.'],
  uninsured: ['Insured vs uninsured', 'Under 20% down means insured — lower rates, but a premium. 20% or more means uninsured — no premium, slightly higher rates, more lender flexibility.'],
  lenders: ['Why lenders differ', 'Banks, credit unions, and monoline lenders each set their own rules on income, credit, property, and penalties. The same file can be approved at one and declined at another.']
};

