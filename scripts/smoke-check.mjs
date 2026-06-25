const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const checks = [
  { path: "/", text: "Debug missing Vercel environment variables" },
  {
    path: "/docker-compose-env-interpolation",
    text: "Docker Compose env interpolation"
  },
  {
    path: "/github-actions-reusable-workflow-env",
    text: "GitHub Actions reusable workflow env"
  },
  {
    path: "/terraform-tfvars-variable-preflight",
    text: "Terraform tfvars variable preflight"
  },
  { path: "/about", text: "About" },
  { path: "/contact", text: "Contact" },
  { path: "/privacy", text: "Privacy" },
  { path: "/terms", text: "Terms" },
  { path: "/robots.txt" },
  { path: "/sitemap.xml", text: "/terraform-tfvars-variable-preflight" }
];

for (const check of checks) {
  const path = check.path;
  const response = await fetch(`${baseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  if (check.text) {
    const body = await response.text();
    if (!body.includes(check.text)) {
      throw new Error(`${path} did not include expected text: ${check.text}`);
    }
  }

  console.log(`${path} ${response.status}`);
}
