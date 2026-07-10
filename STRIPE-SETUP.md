# stripe setup — three commands

everything is built. the code is tested. these are the only steps
that require *your* account, because they involve your money.

---

## 1 · get your secret key

stripe dashboard → **developers → api keys** → reveal **secret key**
it starts with `sk_live_` (or `sk_test_` while you're testing)

## 2 · store it (never paste it into a file)

```bash
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name=birthrightproject
```

it prompts. paste the key. press enter. it's encrypted — invisible in
the repo, invisible in the browser, invisible to me.

## 3 · create the webhook

stripe dashboard → **developers → webhooks → add endpoint**

- **url:** `https://thebirthrightproject.org/api/stripe-webhook`
- **events:** `checkout.session.completed`, `invoice.paid`, `checkout.session.expired`

click reveal on the **signing secret** (starts `whsec_`), then:

```bash
npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name=birthrightproject
```

## 4 · deploy

```bash
npx wrangler pages deploy .
```

---

## optional — get an email when a gift lands

```bash
npx wrangler pages secret put GIFT_NOTIFY_URL --project-name=birthrightproject
# paste: https://formspree.io/f/mwvdyplz
```

---

## test before going live

use `sk_test_…` keys and card `4242 4242 4242 4242`, any future expiry, any cvc.
when it works, swap in the live keys and redeploy.

---

## two things to do in the dashboard

**apply for the nonprofit rate.** stripe discounts 501(c)(3)s to
**2.2% + 30¢** from 2.9% + 30¢. it is not automatic — email
`nonprofit@stripe.com` with ein 99-3166732 and your determination letter.
on $100k of giving that is a $700 difference.

**turn on apple pay + google pay.** settings → payment methods.
most giving traffic is on a phone; this roughly doubles completion
versus typing a card number.

---

## what got built

| file | does |
|---|---|
| `functions/api/checkout.js` | creates the stripe checkout session. validates the amount server-side. |
| `functions/api/stripe-webhook.js` | records gifts that truly succeeded, even if the donor closed the tab. verifies stripe's signature; rejects forgeries, tampering, and replays. |
| `give.html` | money → stripe. tech / time / space / ideas → formspree, unchanged. |

the secret key lives only in cloudflare's encrypted store. it is never
in the html, never in the repo, never sent to the browser.
