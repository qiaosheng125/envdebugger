const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";

const pages = [
  {
    path: "/",
    mustInclude: ["No secrets needed", "Do not paste API keys"]
  },
  {
    path: "/docker-compose-env-interpolation",
    mustInclude: ["Names only", "The report prints names only"]
  },
  {
    path: "/github-actions-reusable-workflow-env",
    mustInclude: ["No GitHub token", "compares YAML keys and mapping names only"]
  },
  {
    path: "/terraform-tfvars-variable-preflight",
    mustInclude: ["Names only", "compares static variable names and key boundaries only"]
  }
];

const forbiddenPatterns = [
  /ghp_[A-Za-z0-9_]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{10,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /BEGIN PRIVATE KEY/,
  /DATABASE_URL=.*:\/\/.+:.+@/
];

for (const page of pages) {
  const response = await fetch(`${baseUrl}${page.path}`);
  const html = await response.text();

  if (!response.ok) {
    throw new Error(`${page.path} returned ${response.status}`);
  }

  for (const text of page.mustInclude) {
    if (!html.includes(text)) {
      throw new Error(`${page.path} missing privacy boundary text: ${text}`);
    }
  }

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(html)) {
      throw new Error(`${page.path} contains a forbidden secret-like fixture`);
    }
  }

  console.log(`${page.path} privacy boundary ok`);
}
