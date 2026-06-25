# Pawprints — clickable prototype

A front-end prototype of the Pawprints usability-testing platform (see `../context.md`).
Built with Next.js (App Router) + Tailwind v4 + Fredoka/Nunito. **All data is mocked** — there is no
proxy, database, auth, or AI call. It exists to demonstrate the full experience end to end.

## Run

```bash
npm install   # already done
npm run dev   # http://localhost:3000
```

## What to click

| Route | Screen |
|---|---|
| `/` | Landing — the "numbers, not feeling" thesis |
| `/dashboard` | Creator's tests list |
| `/tests/new` | Create a test — paste URL + add/reorder scenarios |
| `/tests/acme-checkout/record` | Happy-path recorder — click the storefront to capture steps |
| `/tests/acme-checkout/share` | Share / "test is live" confirmation |
| `/tests/acme-checkout/results` | The report — evidence chips, funnel, heatmap, ranked AI fixes |
| `/t/acme-checkout` | **Participant runner** — take the test (try the checkout flow) |

## Design notes

- **Evidence chip** (`components/evidence-chip.tsx`) is the signature element: every number
  ships with its sample size and a to-scale 95% confidence whisker — the product principle made literal.
- **Dark instrument theme.** Warm near-black surfaces with elevation rising in lightness; a signal
  **orange (`#FF6B00`)** brand carries every primary action. All surfaces are driven by semantic
  tokens in `app/globals.css`, so the whole app is themed from one place.
- The data trio (good / warn / bad) is brightened to **glow against the dark**, and `warn` is a
  distinct gold so it never gets confused with the orange brand.
- Geist **Mono** is used for every number, giving the whole UI a measured "instrument" texture.
- The mock storefront (`components/mock-site.tsx`) stays **light on purpose** — it reads as "the
  site under test," framed inside the dark instrument chrome; its cart page reproduces the real flaw
  the report diagnoses (cart icon mistaken for checkout).
