# Vercel Env Checker

Guided troubleshooting for Next.js and Vercel environment variable issues.

## Local development

```powershell
npm install
npm run dev
```

## Validation

```powershell
npm run build
```

Run smoke checks against a running server:

```powershell
$env:BASE_URL="http://127.0.0.1:3000"; npm run smoke
```
