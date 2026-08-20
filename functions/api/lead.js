// Cloudflare Pages Function — POST /api/lead
//
// Validates and forwards a lead to the intake webhook. The webhook URL
// lives only in the LEAD_WEBHOOK_URL environment variable (set in the
// Cloudflare Pages dashboard), never in the repo. Server-side validation
// and the honeypot check are authoritative — the client-side checks in
// contact-controller.js are just UX, never trusted here.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LEN = 500;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

function clean(value) {
  return typeof value === 'string' ? value.slice(0, MAX_FIELD_LEN).trim() : '';
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  // Honeypot: a real visitor never fills this hidden field.
  if (clean(body.company)) {
    return json({ ok: true }); // pretend success, drop silently
  }

  const firstName = clean(body.firstName);
  const email = clean(body.email);
  const consent = body.consent === true;

  if (!firstName || !email || !EMAIL_RE.test(email) || !consent) {
    return json({ ok: false, error: 'invalid_input' }, 400);
  }

  const record = {
    firstName,
    city: clean(body.city),
    email,
    phone: clean(body.phone),
    consent: true,
    consentText: clean(body.consentText),
    intentQualifier: clean(body.intentQualifier) || null,
    calculator: clean(body.calculator) || 'unknown',
    urgency: clean(body.urgency) || 'unspecified',
    calculatorInputs: body.calculatorInputs && typeof body.calculatorInputs === 'object' ? body.calculatorInputs : null,
    calculatorResult: body.calculatorResult && typeof body.calculatorResult === 'object' ? body.calculatorResult : null,
    pageUrl: clean(body.pageUrl),
    referrer: clean(body.referrer),
    firstTouch: body.firstTouch && typeof body.firstTouch === 'object' ? body.firstTouch : null,
    lastTouch: body.lastTouch && typeof body.lastTouch === 'object' ? body.lastTouch : null,
    submittedAt: new Date().toISOString(),
    ip: request.headers.get('CF-Connecting-IP') || '',
    userAgent: request.headers.get('User-Agent') || ''
  };

  const webhookUrl = env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    // Not configured yet — don't fail the visitor's submission over it,
    // but make the misconfiguration visible in the Functions log.
    console.error('LEAD_WEBHOOK_URL is not set');
    return json({ ok: true, warning: 'not_configured' });
  }

  try {
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!resp.ok) {
      console.error('lead webhook responded', resp.status);
      return json({ ok: false, error: 'webhook_failed' }, 502);
    }
  } catch (e) {
    console.error('lead webhook error', e.message);
    return json({ ok: false, error: 'webhook_unreachable' }, 502);
  }

  return json({ ok: true });
}

export async function onRequestGet() {
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
