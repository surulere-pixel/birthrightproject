/**
 * POST /api/checkout
 * Creates a Stripe Checkout session and returns its hosted URL.
 * The secret key never reaches the browser — it lives in env.STRIPE_SECRET_KEY.
 */

const ALLOWED = new Set([25, 60, 150, 500, 1000, 2500, 5000]);
const MIN = 5;
const MAX = 100000;

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'payments are not configured yet.' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid request.' }, 400);
  }

  // ── validate the amount server-side. never trust the browser. ──
  const amount = Math.round(Number(body.amount));
  const recurring = body.recurring === true;
  const anonymous = body.anonymous === true;

  if (!Number.isFinite(amount) || amount < MIN || amount > MAX) {
    return json({ error: `enter an amount between $${MIN} and $${MAX.toLocaleString()}.` }, 400);
  }
  // custom amounts are allowed, but flag anything outside the preset ladder
  const preset = ALLOWED.has(amount);

  const origin = new URL(request.url).origin;

  const params = new URLSearchParams({
    mode: recurring ? 'subscription' : 'payment',
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][unit_amount]': String(amount * 100),
    'line_items[0][price_data][product_data][name]':
      recurring ? 'the oxygen fund — monthly' : 'the oxygen fund',
    'line_items[0][price_data][product_data][description]':
      'supports pilots, fellowships, tools, and community infrastructure.',
    success_url: `${origin}/give?given=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/give`,
    'metadata[fund]': 'oxygen',
    'metadata[preset]': preset ? 'yes' : 'custom',
    'metadata[source]': 'thebirthrightproject.org/give',
    'metadata[anonymous]': anonymous ? 'yes' : 'no',
    billing_address_collection: 'required',   // needed for tax receipts
    'payment_intent_data[description]': 'birthright project — oxygen fund',
  });

  if (recurring) {
    params.set('line_items[0][price_data][recurring][interval]', 'month');
    params.delete('payment_intent_data[description]');
  }
  if (body.email && /\S+@\S+\.\S+/.test(body.email)) {
    params.set('customer_email', body.email);
  }

  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const session = await res.json();

    if (!res.ok) {
      console.error('stripe error', session?.error?.message);
      return json({ error: 'could not start checkout. please try again.' }, 502);
    }
    return json({ url: session.url });
  } catch (err) {
    console.error('checkout failed', err);
    return json({ error: 'network error. please try again.' }, 502);
  }
}

// block everything that isn't POST
export async function onRequest({ request }) {
  if (request.method !== 'POST') {
    return new Response('method not allowed', { status: 405, headers: { Allow: 'POST' } });
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
