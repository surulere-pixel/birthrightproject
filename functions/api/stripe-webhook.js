/**
 * POST /api/stripe-webhook
 * Stripe calls this when a payment truly succeeds — even if the donor
 * closed the tab before the redirect. This is the only reliable record.
 *
 * Verifies Stripe's signature using Web Crypto (no node deps, runs on the edge).
 */

export async function onRequestPost({ request, env }) {
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response('not configured', { status: 500 });

  const sig = request.headers.get('stripe-signature') || '';
  const raw = await request.text();

  const ok = await verify(raw, sig, secret);
  if (!ok) {
    console.error('webhook signature failed');
    return new Response('invalid signature', { status: 400 });
  }

  const event = JSON.parse(raw);

  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object;
      const anonymous = s.metadata?.anonymous === 'yes';
      const gift = {
        amount: (s.amount_total || 0) / 100,
        currency: s.currency,
        email: s.customer_details?.email || null,
        // an anonymous gift never carries the donor's name into our own
        // records or notifications. stripe's own dashboard still shows it —
        // that's an unavoidable part of processing a card payment.
        name: anonymous ? 'anonymous' : (s.customer_details?.name || null),
        anonymous,
        recurring: s.mode === 'subscription',
        fund: s.metadata?.fund || 'oxygen',
        session: s.id,
        at: new Date().toISOString(),
      };
      console.log('gift received', JSON.stringify(gift));
      await notify(env, gift);
      break;
    }
    case 'invoice.paid':
      console.log('recurring gift renewed', event.data.object.id);
      break;
    case 'checkout.session.expired':
      console.log('checkout abandoned', event.data.object.id);
      break;
  }

  // always 200 quickly, or Stripe retries
  return new Response('ok', { status: 200 });
}

/** email yourself when a gift lands (optional — set GIFT_NOTIFY_URL to a Formspree endpoint) */
async function notify(env, gift) {
  if (!env.GIFT_NOTIFY_URL) return;
  try {
    await fetch(env.GIFT_NOTIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `gift received — $${gift.amount}${gift.recurring ? '/mo' : ''}`,
        ...gift,
      }),
    });
  } catch (e) {
    console.error('notify failed', e);
  }
}

/** Stripe signature verification, constant-time, Web Crypto only */
async function verify(payload, header, secret) {
  const parts = Object.fromEntries(
    header.split(',').map((p) => p.split('=').map((x) => x.trim()))
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;

  // reject anything older than 5 minutes (replay protection)
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${t}.${payload}`)
  );
  const expected = [...new Uint8Array(mac)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return timingSafeEqual(expected, v1);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
