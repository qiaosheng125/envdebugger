# Domain - Env Debugger

Date: 2026-06-03

## Purchased Domain

```text
envdebugger.com
```

## Canonical URL

```text
https://www.envdebugger.com
```

## Support Email

```text
support@envdebugger.com
```

## Required Before L0

- Connect domain to Cloudflare.
- Bind `www.envdebugger.com` to Vercel production deployment.
- Redirect apex `envdebugger.com` to `www.envdebugger.com`.
- Set production env vars:

```text
NEXT_PUBLIC_SITE_URL=https://www.envdebugger.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@envdebugger.com
```

- Verify:
  - `https://www.envdebugger.com`
  - `https://envdebugger.com`
  - `/robots.txt`
  - `/sitemap.xml`
  - canonical metadata
  - support email routing
