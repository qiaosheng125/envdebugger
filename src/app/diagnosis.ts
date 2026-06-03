export type FormState = {
  framework: string;
  platform: string;
  prefix: string;
  location: string;
  environment: string;
  symptom: string;
  changedRecently: string;
  secretType: string;
};

export type Finding = {
  title: string;
  severity: "critical" | "warning" | "info";
  why: string;
  fixes: string[];
};

export const initialForm: FormState = {
  framework: "next-app",
  platform: "vercel",
  prefix: "no-public",
  location: "browser",
  environment: "production",
  symptom: "undefined",
  changedRecently: "not-redeployed",
  secretType: "secret"
};

export const options = {
  framework: [
    ["next-app", "Next.js App Router"],
    ["next-pages", "Next.js Pages Router"],
    ["other", "Other / not sure"]
  ],
  platform: [
    ["vercel", "Vercel"],
    ["local", "Local only"],
    ["other", "Other"]
  ],
  prefix: [
    ["public", "Starts with NEXT_PUBLIC_"],
    ["no-public", "Does not start with NEXT_PUBLIC_"],
    ["unknown", "Not sure"]
  ],
  location: [
    ["browser", "Browser / Client Component"],
    ["server", "Server Component"],
    ["api", "API Route / Route Handler"],
    ["middleware", "Middleware"],
    ["build", "Build script / config"],
    ["unknown", "Not sure"]
  ],
  environment: [
    ["local", "Local development"],
    ["preview", "Preview deployment"],
    ["production", "Production deployment"],
    ["local-not-vercel", "Works locally, fails on Vercel"]
  ],
  symptom: [
    ["undefined", "undefined"],
    ["empty", "Empty string"],
    ["old", "Old value"],
    ["server-only", "Works on server, not browser"],
    ["hardcoded", "Works only after hardcoding"],
    ["unknown", "Not sure"]
  ],
  changedRecently: [
    ["redeployed", "Changed and redeployed production"],
    ["not-redeployed", "Changed but did not redeploy"],
    ["no", "No recent change"],
    ["unknown", "Not sure"]
  ],
  secretType: [
    ["secret", "Secret key, token, password, database URL"],
    ["public", "Public analytics ID or public config"],
    ["unknown", "Not sure"]
  ]
};

export function getFindings(form: FormState): Finding[] {
  const findings: Finding[] = [];

  if (form.location === "browser" && form.prefix !== "public") {
    findings.push({
      severity: form.secretType === "secret" ? "critical" : "warning",
      title: "The browser cannot read a server-only variable",
      why:
        "Next.js does not expose non-public environment variables to browser code.",
      fixes: [
        form.secretType === "secret"
          ? "Do not add NEXT_PUBLIC_ to a secret. Move the read to an API route, route handler, server component, or backend service."
          : "If the value is safe to expose, rename it with NEXT_PUBLIC_ and redeploy.",
        "Confirm the failing code is really running in the browser."
      ]
    });
  }

  if (
    form.prefix === "public" &&
    (form.symptom === "old" || form.changedRecently === "not-redeployed")
  ) {
    findings.push({
      severity: "critical",
      title: "The client bundle may still contain the old value",
      why:
        "NEXT_PUBLIC_ values are bundled into browser code at build time. Changing a Vercel variable does not rewrite an already-built client bundle.",
      fixes: [
        "Trigger a new production deployment after changing the variable.",
        "Confirm the production domain points to the latest deployment.",
        "Clear any stale preview URL from your test notes."
      ]
    });
  }

  if (form.platform === "vercel" && ["preview", "production"].includes(form.environment)) {
    findings.push({
      severity: "warning",
      title: "The value may be configured in the wrong Vercel environment",
      why:
        "Vercel has separate Production, Preview, and Development environment scopes.",
      fixes: [
        "Open Vercel Project Settings > Environment Variables.",
        `Confirm the value exists for ${labelFor(form.environment, options.environment)}.`,
        "If the value was added after the deployment, redeploy the target environment."
      ]
    });
  }

  if (form.environment === "local" || form.environment === "local-not-vercel") {
    findings.push({
      severity: "warning",
      title: "Local and Vercel values may be out of sync",
      why:
        "Your local .env.local file can differ from the values stored in the Vercel project.",
      fixes: [
        "Run vercel env pull .env.local.",
        "Restart next dev after pulling or editing env files.",
        "Check that the variable name is spelled exactly the same."
      ]
    });
  }

  if (form.location === "middleware") {
    findings.push({
      severity: "info",
      title: "Middleware and edge runtime need a separate check",
      why:
        "Middleware can run in an edge runtime where assumptions from server code may not hold.",
      fixes: [
        "Check whether the variable is available in the runtime used by middleware.",
        "Avoid logging secret values from edge or middleware code."
      ]
    });
  }

  if (form.secretType === "secret" && form.prefix === "public") {
    findings.push({
      severity: "critical",
      title: "A secret must not use NEXT_PUBLIC_",
      why:
        "NEXT_PUBLIC_ values are exposed to browser code. API keys, tokens, passwords, and database URLs should stay server-side.",
      fixes: [
        "Remove NEXT_PUBLIC_ from the secret variable.",
        "Read it only in server-side code.",
        "Rotate the secret if it was already exposed."
      ]
    });
  }

  if (!findings.length) {
    findings.push({
      severity: "info",
      title: "Start with environment scope, redeploy timing, and spelling",
      why:
        "The selected inputs do not match a single high-confidence failure pattern.",
      fixes: [
        "Check spelling and case.",
        "Check the target Vercel environment.",
        "Redeploy after changes.",
        "Use a safe existence-only debug log."
      ]
    });
  }

  return findings;
}

export function commandBlock(form: FormState) {
  const commands = ["vercel env ls", "vercel env pull .env.local"];

  if (form.platform === "vercel" && form.environment === "production") {
    commands.push("vercel --prod");
  }

  return commands.join("\n");
}

export function debugSnippet(form: FormState) {
  const envName = form.prefix === "public" ? "NEXT_PUBLIC_EXAMPLE_ID" : "MY_ENV_VAR";

  return [
    `const value = process.env.${envName};`,
    "",
    "console.log({",
    `  name: \"${envName}\",`,
    "  exists: Boolean(value),",
    "  length: value?.length ?? 0,",
    "});",
    "",
    "// Do not log the raw value."
  ].join("\n");
}

export function buildReport(form: FormState, findings: Finding[]) {
  return [
    "# Vercel Env Checker report",
    "",
    `- Framework: ${labelFor(form.framework, options.framework)}`,
    `- Platform: ${labelFor(form.platform, options.platform)}`,
    `- Variable pattern: ${labelFor(form.prefix, options.prefix)}`,
    `- Read location: ${labelFor(form.location, options.location)}`,
    `- Failing environment: ${labelFor(form.environment, options.environment)}`,
    `- Symptom: ${labelFor(form.symptom, options.symptom)}`,
    "",
    "## Most likely causes",
    ...findings.map((finding, index) => `${index + 1}. ${finding.title} - ${finding.why}`),
    "",
    "## Safe commands",
    "```bash",
    commandBlock(form),
    "```",
    "",
    "## Safe debug snippet",
    "```ts",
    debugSnippet(form),
    "```"
  ].join("\n");
}

export function labelFor(value: string, list: string[][]) {
  return list.find(([key]) => key === value)?.[1] ?? value;
}
