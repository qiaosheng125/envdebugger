# Launch Readiness - Vercel Env Checker

Date: 2026-06-03

## Current Stage

L0 launch is complete on the purchased domain.

Approved:

- Domain purchased: `envdebugger.com`

Complete:

- Vercel deployment.
- Domain binding.
- HTTPS.
- `www` canonical host.
- Apex to `www` 308 redirect.
- Final canonical URL.
- Final sitemap and robots URLs.
- Analytics injection layer.
- GA4 Measurement ID recorded: `G-X2J56STZ57`.
- Clarity Project ID recorded: `x16y28xa3o`.
- GA4 and Clarity env vars set in Vercel production.
- Production redeployed after analytics env vars.
- Production HTML verified for GA4 and Clarity scripts.
- Public support email routing enabled: `support@envdebugger.com` -> `xyf1254519010@gmail.com`.
- Cloudflare Email Routing MX and SPF records resolved.
- GitHub repository created: `https://github.com/qiaosheng125/envdebugger`.
- Local commits pushed to GitHub `master`.
- Google Search Console submitted by user.
- Bing Webmaster submitted by user.

Not yet complete:

- None for L0 launch.

User-owned:

- Google Search Console submitted.
- Bing Webmaster submitted.

## Product Summary

Vercel Env Checker is a guided troubleshooting tool for Next.js and Vercel environment variable issues.

It helps users diagnose:

- `undefined` environment variables.
- stale `NEXT_PUBLIC_` values.
- Production / Preview / Development scope mismatch.
- local `.env.local` and Vercel env sync mismatch.
- server-only secrets read from browser code.
- accidental public exposure of secrets.

## User

- Next.js / Vercel developers.
- v0 / vibe coding users.
- indie hackers deploying small web apps.
- users adding GA4, Clarity, Stripe, Supabase, database URLs, Slack webhooks, or API keys.

## Core Promise

Answer a few deployment questions and get:

- most likely causes;
- a fix checklist;
- safe Vercel commands;
- a debug snippet that does not print secret values;
- official documentation links;
- a copyable Markdown report.

## SEO Target

Primary:

- `vercel environment variables not working`

Secondary:

- `nextjs environment variables not working`
- `vercel env variables not updating`
- `NEXT_PUBLIC environment variable not working`
- `vercel redeploy after environment variable change`
- `vercel env checker`
- `nextjs env checker`

## Differentiation

Existing results are mostly:

- official documentation;
- forum threads;
- blog posts;
- AI answers;
- general env validation libraries.

This MVP is different because it is an interactive debug wizard with a copyable checklist, not another article.

## Launch Blockers

Before public launch:

No remaining L0 blockers.

Next scheduled review:

- Day 7: 2026-06-10.
- Day 14: 2026-06-17.
- Day 30: 2026-07-03.

Responsibility note:

- GA4 and Clarity are handled here.
- GSC and Bing are handled by the user and should not be operated in this project workflow unless the user explicitly asks again.

## Technical QA

Passed:

```powershell
npm run test:rules
npm run build
$env:BASE_URL="http://127.0.0.1:3009"; npm run smoke
```

Production verification:

```powershell
https://envdebugger.com -> 308 https://www.envdebugger.com/
https://www.envdebugger.com -> 200
https://www.envdebugger.com/robots.txt -> 200
https://www.envdebugger.com/sitemap.xml -> 200
https://www.envdebugger.com/contact -> 200
```

Browser QA:

- Desktop screenshot: `qa/desktop-after.png`
- Mobile screenshot before fix: `qa/mobile-after.png`
- Mobile screenshot after fix: `qa/mobile-final-2.png`

Mobile issue fixed:

- H1 and form cards no longer overflow narrow viewports.

## Privacy And Safety

The tool must continue to follow these rules:

- Do not ask for real secret values.
- Do not store user inputs.
- Do not connect to Vercel API in the MVP.
- Do not print raw env values in debug snippets.
- Warn users not to expose secrets with `NEXT_PUBLIC_`.

## Decision

L0 launch complete.
