# Launch Readiness - Vercel Env Checker

Date: 2026-06-03

## Current Stage

Local MVP is ready for user review.

Approved:

- Domain purchased: `envdebugger.com`

Not yet complete:

- GitHub repository.
- Vercel deployment.
- GA4 / Clarity.
- GSC / Bing submission.
- Public support email.

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

1. Connect domain to Cloudflare.
2. Create GitHub repository.
3. Deploy to Vercel.
4. Set final `NEXT_PUBLIC_SITE_URL=https://www.envdebugger.com`.
5. Set final `NEXT_PUBLIC_SUPPORT_EMAIL=support@envdebugger.com`.
6. Bind `www.envdebugger.com` and apex redirect.
7. Configure support email routing.
8. Add GA4 and Clarity.
9. Verify final domain HTTPS, canonical, sitemap, robots.
10. Submit GSC and Bing.

## Technical QA

Passed:

```powershell
npm run test:rules
npm run build
$env:BASE_URL="http://127.0.0.1:3009"; npm run smoke
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

Ready for user review.

Not ready for public launch until domain, support email, analytics, canonical URL, deployment, and webmaster submissions are approved and configured.
