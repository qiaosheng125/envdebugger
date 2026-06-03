# Local MVP QA - 2026-06-03

## Status

Local MVP is created and verified.

Project:

```text
03_网站项目/008_vercel-nextjs-env-checker
```

Local preview:

```text
http://127.0.0.1:3009
```

## Verification

Passed:

```powershell
npm install
npm run test:rules
npm run build
$env:BASE_URL="http://127.0.0.1:3009"; npm run smoke
```

Browser screenshots:

- `qa/desktop-after.png`
- `qa/mobile-final-2.png`

Mobile overflow found and fixed:

- Hero title and lead text now fit narrow screenshots.
- Form card width is constrained on small screens.

Smoke routes:

- `/`
- `/about`
- `/contact`
- `/privacy`
- `/terms`
- `/robots.txt`
- `/sitemap.xml`

## Rule Coverage

`npm run test:rules` covers:

- Browser reading a server-only variable.
- `NEXT_PUBLIC_` old value after env changes.
- Vercel Production / Preview environment mismatch.
- Local and Vercel env sync mismatch.
- Secret mistakenly exposed with `NEXT_PUBLIC_`.
- Safe debug snippet does not print raw value.

## Current Boundaries

- No domain purchased.
- Not deployed.
- No GA4 / Clarity.
- No GSC / Bing submission.
- No Vercel API connection.
- No user accounts.
- No secret values collected.

## Next Gate

Before domain or deployment:

1. User manually tries the local MVP.
2. Decide whether the product name is acceptable.
3. Confirm if this should proceed to domain candidates.
4. If yes, write domain candidate pack and launch checklist.

Launch readiness notes are in `docs/launch-readiness.md`.
