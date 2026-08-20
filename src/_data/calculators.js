// Single source of truth for the five calculator pages: routing, SEO
// metadata, intent tier (drives the CTA placement), and which client-side
// math module the page loads. Cross-referenced by the home page, footer,
// and every internal "next calculator" link.
export default [
  {
    slug: 'mortgage-affordability-calculator',
    view: 'afford',
    icon: 'home',
    navTitle: 'What you can afford',
    ctaLabel: 'Have someone check what I can afford',
    h1: 'How much mortgage can you afford?',
    cardDesc: 'Your maximum purchase price, tested the way a lender tests it.',
    metaTitle: 'How Much Mortgage Can I Afford? | Ontario Calculator',
    metaDescription: 'See your maximum purchase price using the real stress test, GDS/TDS ratios, and closing costs — not a rough guess. Free, no signup.',
    explainer: "This number comes from two tests a lender actually runs: whether the payment fits within about 39% of your income, and whether you'd still qualify if rates rose two points. Your down payment, existing debt, and where you're buying all move it.",
    intent: 'medium',
    relatedArticle: 'what-a-mortgage-actually-is',
    nextPage: { href: '/what-youll-need/', label: "See what you'll need to apply" }
  },
  {
    slug: 'mortgage-renewal-calculator',
    view: 'renew',
    icon: 'refresh',
    navTitle: 'Your renewal options',
    ctaLabel: 'Have someone check this renewal offer',
    h1: 'Is your mortgage renewal offer fair?',
    cardDesc: "What signing your bank's offer actually costs versus shopping around.",
    metaTitle: 'Mortgage Renewal Calculator: Is Your Offer Fair?',
    metaDescription: "Compare your bank's renewal offer against today's best rate and see exactly what signing it costs you over the term.",
    explainer: "This compares the payment and remaining balance under your bank's offer against the same numbers at the rate available elsewhere, over the same term. The gap between the offered rate and the market rate drives almost all of it.",
    intent: 'high',
    intentQualifier: { key: 'renewalTiming', label: 'When does your term end?', options: ['Within 30 days', '1–3 months', '3–6 months', 'More than 6 months'] },
    relatedArticle: 'term-vs-amortization',
    nextPage: { href: '/what-happens-next/', label: 'See what happens next' }
  },
  {
    slug: 'mortgage-refinance-calculator',
    view: 'equity',
    icon: 'trending-up',
    navTitle: 'Using your home equity',
    ctaLabel: 'Have someone check this refinance',
    h1: 'How much of your home equity can you use?',
    cardDesc: 'How much cash a refinance frees up, and what it really costs.',
    metaTitle: 'Mortgage Refinance & Equity Calculator | Ontario',
    metaDescription: 'See how much equity you can access, what a new payment looks like, and whether consolidating debt actually saves you money.',
    explainer: "This is what a new mortgage payment would look like if your highest-interest debt were rolled into it at today's rate, capped at 80% of your home's value. The rate gap between that debt and your new mortgage is what creates the savings.",
    intent: 'high',
    intentQualifier: { key: 'equityPurpose', label: 'What would the money be for?', options: ['Paying off high-interest debt', 'Renovation', 'A large purchase', 'Investing', 'Not sure yet'] },
    relatedArticle: 'down-payment-and-loan-to-value',
    nextPage: { href: '/what-youll-need/', label: "See what you'll need to apply" }
  },
  {
    slug: 'mortgage-penalty-calculator',
    view: 'penalty',
    icon: 'scissors',
    navTitle: 'Leaving a mortgage early',
    ctaLabel: 'Have someone check this penalty estimate',
    h1: 'What would it cost to break your mortgage early?',
    cardDesc: 'The real penalty for breaking your term, as a range.',
    metaTitle: 'Mortgage Break Penalty Calculator | IRD Estimate',
    metaDescription: "Estimate the real cost of breaking your mortgage early — three months' interest or the rate differential, whichever applies.",
    explainer: "Fixed mortgages are charged the greater of three months' interest or the rate differential; variable mortgages only ever pay three months' interest. The gap between your rate and today's rate is what makes the penalty rise or fall.",
    intent: 'high',
    intentQualifier: { key: 'breakReason', label: 'Why are you considering breaking it?', options: ['Rate elsewhere is lower', 'Selling the home', 'Refinancing to consolidate debt', 'Just checking the number'] },
    relatedArticle: 'the-rate-you-pay-vs-the-rate-youre-tested-at',
    nextPage: { href: '/mortgage-refinance-calculator/', label: 'See what a refinance would look like instead' }
  },
  {
    slug: 'rent-vs-buy-calculator',
    view: 'rent',
    icon: 'swap',
    navTitle: 'Renting compared to buying',
    h1: 'Is it better to rent or buy right now?',
    cardDesc: 'A five-year, side-by-side comparison of both paths.',
    metaTitle: 'Rent vs. Buy Calculator | Ontario, 5-Year View',
    metaDescription: 'A five-year, side-by-side comparison of renting and buying, including selling costs and what your down payment could earn invested.',
    explainer: "This weighs five years of home equity — price growth minus what's still owed minus selling costs — against five years of rent plus investing everything you would have spent on a down payment. Appreciation and investment return move it most.",
    intent: 'low',
    relatedArticle: 'what-a-mortgage-actually-is',
    nextPage: { href: '/mortgage-affordability-calculator/', label: 'See what you could actually afford' }
  }
];
