const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";

const pages = [
  {
    path: "/",
    canonical: "/",
    title: "Vercel Env Checker",
    description: "Next.js"
  },
  {
    path: "/docker-compose-env-interpolation",
    canonical: "/docker-compose-env-interpolation",
    title: "Docker Compose Env Interpolation Checker",
    description: "Docker Compose"
  },
  {
    path: "/github-actions-reusable-workflow-env",
    canonical: "/github-actions-reusable-workflow-env",
    title: "GitHub Actions Reusable Workflow Env Checker",
    description: "workflow_call"
  }
];

for (const page of pages) {
  const response = await fetch(`${baseUrl}${page.path}`);
  const html = await response.text();

  if (!response.ok) {
    throw new Error(`${page.path} returned ${response.status}`);
  }

  if (!html.includes(page.title)) {
    throw new Error(`${page.path} missing title marker ${page.title}`);
  }

  if (!html.includes(page.description)) {
    throw new Error(`${page.path} missing description marker ${page.description}`);
  }

  const expectedCanonical = normalizeUrl(`https://www.envdebugger.com${page.canonical}`);
  const pageCanonical = normalizeUrl(html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] || "");
  if (pageCanonical !== expectedCanonical) {
    throw new Error(`${page.path} missing canonical ${page.canonical}`);
  }

  if (/noindex/i.test(html)) {
    throw new Error(`${page.path} unexpectedly contains noindex`);
  }

  console.log(`${page.path} SEO metadata ok`);
}

const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
const sitemap = await sitemapResponse.text();

for (const route of pages.map((page) => page.canonical)) {
  if (!sitemap.includes(`https://www.envdebugger.com${route}`)) {
    throw new Error(`sitemap missing ${route}`);
  }
}

console.log("sitemap metadata ok");

function normalizeUrl(url) {
  return url.replace(/\/$/, "");
}
