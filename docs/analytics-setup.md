# Analytics Setup - Env Debugger

Date: 2026-06-03

## Scope

Only these two analytics tasks are owned in this workflow:

- GA4 property / web stream creation.
- Microsoft Clarity project creation.

Out of scope unless the user explicitly asks again:

- Google Search Console.
- Bing Webmaster Tools.

## Site

- Site name: `Vercel Env Checker`
- Domain: `envdebugger.com`
- Canonical URL: `https://www.envdebugger.com`
- GA4 property name: `Vercel Env Checker - envdebugger.com`
- GA4 stream name: `Vercel Env Checker - www.envdebugger.com`
- Clarity project name: `Vercel Env Checker - envdebugger.com`
- Clarity website URL: `https://www.envdebugger.com`

## Code Status

Analytics injection is implemented in:

- `src/app/analytics.tsx`
- `src/app/layout.tsx`

The app reads:

- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` as fallback
- `NEXT_PUBLIC_CLARITY_ID`

If these env vars are empty, no GA4 or Clarity scripts are injected.

## Current Status

GA4:

- Status: installed and verified on production.
- Measurement ID: `G-X2J56STZ57`.

Clarity:

- Status: installed and verified on production.
- Project ID: `x16y28xa3o`.

## Vercel

Production env vars are set:

```text
NEXT_PUBLIC_GA_ID=G-X2J56STZ57
NEXT_PUBLIC_CLARITY_ID=x16y28xa3o
```

Production was redeployed after setting the env vars.

## Verification

Production HTML contains:

- `G-X2J56STZ57`
- `x16y28xa3o`
- `googletagmanager.com/gtag/js`
- `clarity.ms/tag`
