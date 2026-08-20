// Single source of truth for the five calculator pages: routing, SEO
// metadata, intent tier (drives the CTA in partials/cta.njk), and which
// client-side math module the page loads. Cross-referenced by the home
// page, footer, and every internal "next calculator" link.
export default [
  {
    slug: 'mortgage-affordability-calculator',
    view: 'afford',
    glyph: '$',
    navTitle: 'What you can afford',
    h1: 'How much mortgage can you afford?',
    cardDesc: 'Your maximum purchase price, tested the way a lender tests it.',
    metaTitle: 'How Much Mortgage Can I Afford? | Ontario Calculator',
    metaDescription: 'See your maximum purchase price using the real stress test, GDS/TDS ratios, and closing costs — not a rough guess. Free, no signup.',
    intent: 'medium',
    relatedLearn: ['what-a-mortgage-actually-is', 'down-payment-and-loan-to-value'],
    nextPage: { href: '/what-youll-need/', label: "See what you'll need to apply" }
  },
  {
    slug: 'mortgage-renewal-calculator',
    view: 'renew',
    glyph: '↻',
    navTitle: 'Your renewal options',
    h1: 'Is your mortgage renewal offer fair?',
    cardDesc: "What signing your bank's offer actually costs versus shopping around.",
    metaTitle: 'Mortgage Renewal Calculator: Is Your Offer Fair?',
    metaDescription: "Compare your bank's renewal offer against today's best rate and see exactly what signing it costs you over the term.",
    intent: 'high',
    intentQualifier: { key: 'renewalTiming', label: 'When does your term end?', options: ['Within 30 days', '1–3 months', '3–6 months', 'More than 6 months'] },
    relatedLearn: ['term-vs-amortization'],
    nextPage: { href: '/what-happens-next/', label: 'See what happens next' }
  },
  {
    slug: 'mortgage-refinance-calculator',
    view: 'equity',
    glyph: '△',
    navTitle: 'Using your home equity',
    h1: 'How much of your home equity can you use?',
    cardDesc: 'How much cash a refinance frees up, and what it really costs.',
    metaTitle: 'Mortgage Refinance & Equity Calculator | Ontario',
    metaDescription: 'See how much equity you can access, what a new payment looks like, and whether consolidating debt actually saves you money.',
    intent: 'high',
    intentQualifier: { key: 'equityPurpose', label: 'What would the money be for?', options: ['Paying off high-interest debt', 'Renovation', 'A large purchase', 'Investing', 'Not sure yet'] },
    relatedLearn: ['down-payment-and-loan-to-value'],
    nextPage: { href: '/what-youll-need/', label: "See what you'll need to apply" }
  },
  {
    slug: 'mortgage-penalty-calculator',
    view: 'penalty',
    glyph: '✕',
    navTitle: 'Leaving a mortgage early',
    h1: 'What would it cost to break your mortgage early?',
    cardDesc: 'The real penalty for breaking your term, as a range.',
    metaTitle: 'Mortgage Break Penalty Calculator | IRD Estimate',
    metaDescription: "Estimate the real cost of breaking your mortgage early — three months' interest or the rate differential, whichever applies.",
    intent: 'high',
    intentQualifier: { key: 'breakReason', label: 'Why are you considering breaking it?', options: ['Rate elsewhere is lower', 'Selling the home', 'Refinancing to consolidate debt', 'Just checking the number'] },
    relatedLearn: ['the-rate-you-pay-vs-the-rate-youre-tested-at'],
    nextPage: { href: '/mortgage-refinance-calculator/', label: 'See what a refinance would look like instead' }
  },
  {
    slug: 'rent-vs-buy-calculator',
    view: 'rent',
    glyph: '⇄',
    navTitle: 'Renting compared to buying',
    h1: 'Is it better to rent or buy right now?',
    cardDesc: 'A five-year, side-by-side comparison of both paths.',
    metaTitle: 'Rent vs. Buy Calculator | Ontario, 5-Year View',
    metaDescription: 'A five-year, side-by-side comparison of renting and buying, including selling costs and what your down payment could earn invested.',
    intent: 'low',
    relatedLearn: ['what-a-mortgage-actually-is', 'closing-costs-are-more-than-the-down-payment'],
    nextPage: { href: '/mortgage-affordability-calculator/', label: 'See what you could actually afford' }
  }
];
