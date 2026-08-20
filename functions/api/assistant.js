// Cloudflare Pages Function — POST /api/assistant
//
// Backs the "talk to our mortgage assistant" widget. If ASSISTANT_WEBHOOK_URL
// is set (Cloudflare Pages dashboard, never in the repo), the visitor's
// message and short conversation history are forwarded there and whatever
// that service replies with is passed straight back to the widget — that's
// the hook point for wiring up a real conversational AI later.
//
// Until that's configured, this still answers for real: a small keyword
// router reads the message for the same signals the five calculators are
// named after and points to the right one. It never invents a rate, a
// number, or advice — only ever "here's the calculator for that" — which
// keeps it consistent with the rest of the site (not a broker, doesn't
// advise on mortgages).

const MAX_LEN = 2000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

function clean(value) {
  return typeof value === 'string' ? value.slice(0, MAX_LEN).trim() : '';
}

const ROUTES = [
  { re: /break|penalt|leave my mortgage|get out of|exit/i, href: '/mortgage-penalty-calculator/', label: 'the penalty calculator', reply: "If you're thinking about breaking your mortgage early, the penalty calculator will estimate what that actually costs." },
  { re: /renew/i, href: '/mortgage-renewal-calculator/', label: 'the renewal calculator', reply: "Sounds like a renewal question. The renewal calculator checks whether your bank's offer is actually fair against today's rate." },
  { re: /equity|refinanc|consolidat|cash out|heloc/i, href: '/mortgage-refinance-calculator/', label: 'the equity calculator', reply: 'For tapping into your home equity or refinancing, the equity calculator shows what that would free up and what it costs.' },
  { re: /rent|renting/i, href: '/rent-vs-buy-calculator/', label: 'the rent-vs-buy calculator', reply: 'If you\'re weighing renting against buying, the rent-vs-buy calculator lays out both over five years, side by side.' },
  { re: /afford|buy|purchase|how much (can|could)|pre-?approv/i, href: '/mortgage-affordability-calculator/', label: 'the affordability calculator', reply: "For figuring out what you could afford, start with the affordability calculator — it uses the same stress test a lender would." },
  { re: /term|amortiz|stress test|gds|tds|down payment|loan.to.value|ltv|closing cost/i, href: '/mortgage-glossary/', label: 'the glossary', reply: "That sounds like a term worth looking up — the glossary has plain-language definitions for exactly that." }
];

function routeReply(message) {
  for (const r of ROUTES) {
    if (r.re.test(message)) return { reply: r.reply, suggestion: { href: r.href, label: r.label } };
  }
  return {
    reply: "Tell me a bit more — are you buying, renewing, refinancing, thinking about breaking your mortgage, or weighing renting versus buying?",
    suggestion: null
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const message = clean(body.message);
  const mode = body.mode === 'voice' ? 'voice' : 'text';
  const history = Array.isArray(body.history) ? body.history.slice(-20).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    text: clean(m.text)
  })) : [];

  if (!message) {
    return json({ ok: false, error: 'empty_message' }, 400);
  }

  const webhookUrl = env.ASSISTANT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message,
          mode,
          history,
          pageUrl: clean(body.pageUrl),
          timestamp: new Date().toISOString()
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        return json({ ok: true, reply: clean(data.reply) || "I didn't get a response — try again?", suggestion: data.suggestion || null, source: 'webhook' });
      }
      console.error('assistant webhook responded', resp.status);
    } catch (e) {
      console.error('assistant webhook error', e.message);
    }
    // Fall through to the built-in router rather than dead-ending the visitor.
  }

  const routed = routeReply(message);
  return json({ ok: true, ...routed, source: 'router' });
}

export async function onRequestGet() {
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
