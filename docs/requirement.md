# Requirement - Vercel Env Checker

## User

Next.js and Vercel users whose environment variables are undefined, stale, missing, or only working locally.

## Input

The user selects framework, platform, variable prefix, read location, failing environment, symptom, redeploy status, and whether the variable is a secret.

The user must not paste a real API key, token, password, database URL, or secret value.

## Output

- Most likely causes.
- Fix checklist.
- Copyable commands.
- Safe debug snippet.
- Security warning.
- Official documentation links.
- Copyable Markdown report.

## MVP

Single-page guided diagnostic tool with legal pages, sitemap, robots, canonical metadata, and responsive layout.

Core rules are extracted to `src/app/diagnosis.ts` and covered by `npm run test:rules`.

## Risks

- Search volume may be small.
- Guidance must stay aligned with official Next.js and Vercel docs.
- The tool must avoid encouraging users to expose secrets with `NEXT_PUBLIC_`.

## Current status

Local MVP verified. See `docs/local-mvp-qa.md`.
