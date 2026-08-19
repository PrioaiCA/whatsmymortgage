export function fmtMoney(n) {
  n = Math.round(n || 0);
  const sign = n < 0 ? '-' : '';
  n = Math.abs(n);
  if (n >= 1000000) return sign + '$' + (n / 1000000).toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + 'M';
  return sign + '$' + n.toLocaleString('en-CA');
}

export function fmtMoneyFull(n) {
  const sign = n < 0 ? '-' : '';
  return sign + '$' + Math.round(Math.abs(n || 0)).toLocaleString('en-CA');
}

export function fmtPct(n, d) {
  return (n || 0).toFixed(d == null ? 2 : d) + '%';
}

export function formatDisplay(format, value) {
  switch (format) {
    case 'moneyFull': return fmtMoneyFull(value);
    case 'moneyFullPerMo': return fmtMoneyFull(value) + '/mo';
    case 'pct2': return fmtPct(value);
    case 'pct1': return fmtPct(value, 1);
    case 'years': return value + ' yrs';
    case 'months': return value + ' mo';
    default: return String(value);
  }
}
