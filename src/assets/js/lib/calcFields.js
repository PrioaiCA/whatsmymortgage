// Every Ontario location the math actually distinguishes between is just
// "Toronto" or "not Toronto" — Toronto is the only municipality with its
// own land transfer tax on top of the provincial one. Listing recognizable
// cities instead of a generic "905 area" label is purely about a visitor
// seeing their own city, not a change in what gets calculated: every
// non-Toronto option below still resolves to the same '905' value.
export const ONTARIO_LOCATIONS = [
  { value: 'toronto', label: 'Toronto' },
  { value: '905', label: 'Elsewhere in Ontario' },
  { value: '905', label: 'Barrie' },
  { value: '905', label: 'Brampton' },
  { value: '905', label: 'Burlington' },
  { value: '905', label: 'Guelph' },
  { value: '905', label: 'Hamilton' },
  { value: '905', label: 'Kingston' },
  { value: '905', label: 'Kitchener' },
  { value: '905', label: 'London' },
  { value: '905', label: 'Markham' },
  { value: '905', label: 'Milton' },
  { value: '905', label: 'Mississauga' },
  { value: '905', label: 'Oakville' },
  { value: '905', label: 'Oshawa' },
  { value: '905', label: 'Ottawa' },
  { value: '905', label: 'Richmond Hill' },
  { value: '905', label: 'St. Catharines' },
  { value: '905', label: 'Vaughan' },
  { value: '905', label: 'Waterloo' },
  { value: '905', label: 'Windsor' }
];

// Slider/toggle field definitions for each calculator, driving both the
// form UI and the generic live-update logic in app.js.
export function getCalcFields(view, s) {
  if (view === 'afford') {
    return {
      sliders: [
        { key: 'income', label: 'Household income (annual)', term: '', min: 30000, max: 400000, step: 2000, format: 'moneyFull' },
        { key: 'down', label: 'Down payment available', term: 'mindown', min: 0, max: 500000, step: 5000, format: 'moneyFull' },
        { key: 'debt', label: 'Monthly debt payments', term: 'debts', min: 0, max: 3000, step: 50, format: 'moneyFullPerMo' },
        { key: 'condo', label: 'Monthly condo fees', term: 'condo', min: 0, max: 1200, step: 25, format: 'moneyFullPerMo' },
        { key: 'rate', label: 'Interest rate', term: 'rate', min: 3, max: 7, step: 0.01, format: 'pct2' }
      ],
      toggles: [
        { key: 'city', label: 'Location', term: '', select: true, options: ONTARIO_LOCATIONS },
        { key: 'amort', label: 'Amortization', term: 'amort', numeric: true, options: [{ value: 25, label: '25 years' }, { value: 30, label: '30 years' }] }
      ]
    };
  }
  if (view === 'renew') {
    return {
      sliders: [
        { key: 'balance', label: 'Remaining balance', term: '', min: 50000, max: 1500000, step: 5000, format: 'moneyFull' },
        { key: 'yearsLeft', label: 'Years left to pay off', term: 'amort', min: 1, max: 30, step: 1, format: 'years' },
        { key: 'rateOffered', label: 'Rate your lender offered', term: 'renew', min: 3, max: 7, step: 0.01, format: 'pct2' },
        { key: 'rateElsewhere', label: 'Rate available elsewhere', term: 'switch', min: 3, max: 7, step: 0.01, format: 'pct2' }
      ],
      toggles: [
        { key: 'term', label: 'Term', term: 'term', numeric: true, options: [{ value: 3, label: '3 years' }, { value: 5, label: '5 years' }] }
      ]
    };
  }
  if (view === 'equity') {
    return {
      sliders: [
        { key: 'homeValue', label: 'Home value', term: 'equity', min: 200000, max: 3000000, step: 10000, format: 'moneyFull' },
        { key: 'balance', label: 'Mortgage balance', term: 'ltv', min: 0, max: 2000000, step: 5000, format: 'moneyFull' },
        { key: 'currentPayment', label: 'Current mortgage payment', term: '', min: 0, max: 8000, step: 50, format: 'moneyFullPerMo' },
        { key: 'debtBalance', label: 'High-interest debt balance', term: 'consol', min: 0, max: 150000, step: 1000, format: 'moneyFull' },
        { key: 'debtRate', label: "That debt's rate", term: '', min: 3, max: 30, step: 0.5, format: 'pct1' },
        { key: 'debtPayment', label: "That debt's monthly payment", term: '', min: 0, max: 3000, step: 25, format: 'moneyFullPerMo' },
        { key: 'newRate', label: 'New mortgage rate', term: 'refi', min: 3, max: 7, step: 0.01, format: 'pct2' }
      ],
      toggles: [
        { key: 'amort', label: 'New amortization', term: 'amort', numeric: true, options: [{ value: 20, label: '20 years' }, { value: 25, label: '25 years' }] }
      ]
    };
  }
  if (view === 'penalty') {
    return {
      sliders: [
        { key: 'balance', label: 'Balance', term: '', min: 50000, max: 1500000, step: 5000, format: 'moneyFull' },
        { key: 'currentRate', label: 'Current rate', term: 'rate', min: 2, max: 8, step: 0.01, format: 'pct2' },
        { key: 'monthsLeft', label: 'Months left in term', term: 'term', min: 1, max: 60, step: 1, format: 'months' },
        { key: 'yearsLeft', label: 'Years left to pay off', term: 'amort', min: 1, max: 30, step: 1, format: 'years' },
        { key: 'newRate', label: 'New rate available', term: '', min: 2, max: 8, step: 0.01, format: 'pct2' }
      ],
      toggles: [
        { key: 'type', label: 'Mortgage type', term: 'fixvar', options: [{ value: 'fixed', label: 'Fixed' }, { value: 'variable', label: 'Variable' }] },
        { key: 'lender', label: 'Lender type', term: 'posted', options: [{ value: 'broker', label: 'Credit union / broker' }, { value: 'bigbank', label: 'Big bank' }] }
      ]
    };
  }
  if (view === 'rent') {
    return {
      sliders: [
        { key: 'rent', label: 'Monthly rent', term: '', min: 1200, max: 5000, step: 50, format: 'moneyFullPerMo' },
        { key: 'price', label: 'Purchase price', term: '', min: 300000, max: 2000000, step: 10000, format: 'moneyFull' },
        { key: 'down', label: 'Down payment', term: 'mindown', min: 0, max: 500000, step: 5000, format: 'moneyFull' },
        { key: 'rate', label: 'Interest rate', term: 'rate', min: 3, max: 7, step: 0.01, format: 'pct2' },
        { key: 'carrying', label: 'Monthly carrying costs', term: '', min: 0, max: 2000, step: 25, format: 'moneyFullPerMo' },
        { key: 'appr', label: 'Annual appreciation', term: 'appr', min: -2, max: 10, step: 0.5, format: 'pct2' },
        { key: 'invret', label: 'Annual investment return', term: 'invret', min: 0, max: 12, step: 0.5, format: 'pct2' }
      ],
      toggles: [
        { key: 'city', label: 'Location', term: '', select: true, options: ONTARIO_LOCATIONS }
      ]
    };
  }
  if (view === 'payment') {
    return {
      sliders: [
        { key: 'price', label: 'Purchase price', term: '', min: 200000, max: 2000000, step: 10000, format: 'moneyFull' },
        { key: 'down', label: 'Down payment', term: 'mindown', min: 0, max: 500000, step: 5000, format: 'moneyFull' },
        { key: 'rate', label: 'Interest rate', term: 'rate', min: 3, max: 7, step: 0.01, format: 'pct2' }
      ],
      toggles: [
        { key: 'amort', label: 'Amortization', term: 'amort', numeric: true, options: [{ value: 25, label: '25 years' }, { value: 30, label: '30 years' }] }
      ]
    };
  }
  if (view === 'ltt') {
    return {
      sliders: [
        { key: 'price', label: 'Purchase price', term: '', min: 200000, max: 2000000, step: 10000, format: 'moneyFull' }
      ],
      toggles: [
        { key: 'city', label: 'Location', term: '', select: true, options: ONTARIO_LOCATIONS },
        { key: 'firstTime', label: 'First-time buyer', term: 'rebate', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] }
      ]
    };
  }
  if (view === 'cmhc') {
    return {
      sliders: [
        { key: 'price', label: 'Purchase price', term: '', min: 200000, max: 2000000, step: 10000, format: 'moneyFull' },
        { key: 'down', label: 'Down payment', term: 'mindown', min: 0, max: 500000, step: 5000, format: 'moneyFull' }
      ],
      toggles: [
        { key: 'amort', label: 'Amortization', term: 'amort', numeric: true, options: [{ value: 25, label: '25 years' }, { value: 30, label: '30 years' }] }
      ]
    };
  }
  if (view === 'stress') {
    return {
      sliders: [
        { key: 'mortgage', label: 'Mortgage amount', term: '', min: 50000, max: 1500000, step: 5000, format: 'moneyFull' },
        { key: 'rate', label: 'Your contract rate', term: 'rate', min: 3, max: 7, step: 0.01, format: 'pct2' },
        { key: 'income', label: 'Household income (annual)', term: '', min: 30000, max: 400000, step: 2000, format: 'moneyFull' },
        { key: 'debt', label: 'Monthly debt payments', term: 'debts', min: 0, max: 3000, step: 50, format: 'moneyFullPerMo' }
      ],
      toggles: [
        { key: 'amort', label: 'Amortization', term: 'amort', numeric: true, options: [{ value: 25, label: '25 years' }, { value: 30, label: '30 years' }] }
      ]
    };
  }
  if (view === 'gdstds') {
    return {
      sliders: [
        { key: 'income', label: 'Household income (annual)', term: '', min: 30000, max: 400000, step: 2000, format: 'moneyFull' },
        { key: 'mortgagePayment', label: 'Mortgage payment', term: '', min: 0, max: 8000, step: 50, format: 'moneyFullPerMo' },
        { key: 'propertyTax', label: 'Property tax (annual)', term: '', min: 0, max: 20000, step: 100, format: 'moneyFull' },
        { key: 'condo', label: 'Monthly condo fees', term: 'condo', min: 0, max: 1200, step: 25, format: 'moneyFullPerMo' },
        { key: 'debt', label: 'Other monthly debts', term: 'debts', min: 0, max: 3000, step: 50, format: 'moneyFullPerMo' }
      ],
      toggles: []
    };
  }
  if (view === 'amortization') {
    return {
      sliders: [
        { key: 'mortgage', label: 'Mortgage amount', term: '', min: 50000, max: 1500000, step: 5000, format: 'moneyFull' },
        { key: 'rate', label: 'Interest rate', term: 'rate', min: 3, max: 7, step: 0.01, format: 'pct2' },
        { key: 'amort', label: 'Amortization', term: 'amort', min: 5, max: 30, step: 1, format: 'years' },
        { key: 'extra', label: 'Extra payment, every month', term: 'prepay', min: 0, max: 1500, step: 25, format: 'moneyFullPerMo' },
        { key: 'lumpSum', label: 'One-time lump sum', term: '', min: 0, max: 50000, step: 1000, format: 'moneyFull' }
      ],
      toggles: []
    };
  }
  return { sliders: [], toggles: [] };
}
