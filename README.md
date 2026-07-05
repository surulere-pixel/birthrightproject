# birthright project — cloudflare pages site

four-page standalone site for the birthright project.

## deployment

1. push this folder to github or upload directly to cloudflare pages
2. set build output directory to `/` (no build step needed)
3. connect custom domain: `www.thebirthrightproject.org`
4. ensure `logo.png` is in the root directory

## files

```
/
├── index.html      — homepage
├── about.html      — about, team, where we work
├── labs.html        — venture lab, experiments, platforms
├── give.html        — support the work
├── logo.png         — birthright wordmark
└── README.md        — this file
```

## nav structure

about · platforms · experiments · support · [build with us]

- about → /about
- platforms → /labs#platforms
- experiments → /labs#experiments
- support → /give
- build with us → mailto CTA

## page architecture

### index.html (homepage)
hero → how we work → three lanes → platforms (3 cards) → infrastructure → where we work → impact model → support

### about.html
hero → venture ticker → three lanes + outcome → pulse metrics → distant cousins team (28 members) → CTAs → where we work interactive → roots & oxygen

### labs.html
hero → platforms (3 pilot cards) → labs in motion intro → status legend → filters → community wellbeing (4) → financial autonomy (3) → digital opportunity (3) → partnerships + ecosystem building (3) → shared infrastructure (4) → how we work pipeline → support → CTA

### give.html
hero → give cards (money, tech, time, space, partner, build) → CTA → nonprofit info

## venture roster (labs page)

### pilot platforms
- happy sunday (community wellbeing)
- softerbread cooperative (financial autonomy)
- the mmaadd institute (digital opportunity)

### experiments — prototype
- respira, clean bill direct, space&co. (wellbeing)
- dear helpdesk, baked goods (financial autonomy)
- mmaadd studio, mmaadd haus (digital opportunity)
- distant cousins presents (partnerships)
- pantrytransfer (infrastructure)
- frog ai (infrastructure, co-venture)

### experiments — concept
- cultured care (wellbeing)
- chapter 2 (financial autonomy)
- 54siblings (digital opportunity)
- local circles, cultural spaces (partnerships)
- eden, usedwell (infrastructure)

## status taxonomy
- pilot — operating platforms
- prototype — testing audience, offer, delivery, or operating model
- concept — early model being shaped
- co-venture — built with aligned partners as a shared venture

## design system
- fonts: cormorant garamond (display) + IBM plex mono (body)
- palette: deep warm black (#0f0e0c), bone (#faf8f4), cream (#edeae3), gold (#c9a84c/#b8912a), teal (#5a9a8a)
- all lowercase brand voice
- editorial institutional tone

## architecture
- three lanes: community wellbeing, financial autonomy, digital opportunity
- shared infrastructure is the OUTCOME, not a fourth lane
- eden is the infrastructure engine layer

## nonprofit
birthright project inc. · 501(c)(3) · ein 99-3166732 · incorporated 2025
africa · latin america · the caribbean · the diaspora
