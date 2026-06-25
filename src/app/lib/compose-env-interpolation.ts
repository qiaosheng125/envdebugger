export type ComposeContext = "local-cli" | "ci" | "vercel" | "unknown";

export type ComposeEnvInput = {
  composeText: string;
  envText: string;
  context: ComposeContext;
};

export type ComposeVariable = {
  name: string;
  marker: "plain" | "default" | "required";
  count: number;
  hasEnvName: boolean;
  secretLike: boolean;
};

export type ComposeEnvResult = {
  status: "pass" | "warn" | "fail";
  summary: string;
  variables: ComposeVariable[];
  envNames: string[];
  missingNames: string[];
  defaultedNames: string[];
  requiredNames: string[];
  secretLikeNames: string[];
  warnings: string[];
  checklist: string[];
  report: string;
};

const secretNamePattern =
  /(SECRET|TOKEN|PASSWORD|PASS|PRIVATE|API[_-]?KEY|DATABASE_URL|AUTH|JWT|COOKIE|SESSION)/i;

const interpolationPattern = /\$\{([A-Za-z_][A-Za-z0-9_]*)(?:(:?[-?])([^}]*))?\}/g;
const bareVariablePattern = /(^|[^$])\$([A-Za-z_][A-Za-z0-9_]*)\b/g;

export function analyzeComposeEnv(input: ComposeEnvInput): ComposeEnvResult {
  const envNames = parseEnvNames(input.envText);
  const envNameSet = new Set(envNames);
  const variableMap = new Map<string, ComposeVariable>();

  for (const match of input.composeText.matchAll(interpolationPattern)) {
    const name = match[1];
    const operator = match[2] ?? "";
    const marker = operator.includes("?")
      ? "required"
      : operator.includes("-")
        ? "default"
        : "plain";

    mergeVariable(variableMap, name, marker, envNameSet);
  }

  for (const match of input.composeText.matchAll(bareVariablePattern)) {
    mergeVariable(variableMap, match[2], "plain", envNameSet);
  }

  const variables = [...variableMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  const missingNames = variables
    .filter((item) => !item.hasEnvName && item.marker !== "default")
    .map((item) => item.name);
  const defaultedNames = variables.filter((item) => item.marker === "default").map((item) => item.name);
  const requiredNames = variables.filter((item) => item.marker === "required").map((item) => item.name);
  const secretLikeNames = variables.filter((item) => item.secretLike).map((item) => item.name);
  const warnings = buildWarnings(input, variables, missingNames, secretLikeNames);
  const status = missingNames.length > 0 ? "fail" : warnings.length > 0 ? "warn" : "pass";
  const summary =
    status === "fail"
      ? `${missingNames.length} referenced env name${missingNames.length === 1 ? "" : "s"} need a local source or a default.`
      : status === "warn"
        ? "No blocking missing names, but interpolation boundaries need review."
        : "Referenced env names have a matching name or a safe default marker.";
  const checklist = [
    "Confirm Docker Compose interpolation reads from the shell environment or the project .env file.",
    "Keep env_file entries for container runtime values, not Compose interpolation assumptions.",
    "Use ${VAR:?message} for required settings that should fail fast.",
    "Do not print secret values while debugging; log only whether a name is present."
  ];

  return {
    status,
    summary,
    variables,
    envNames,
    missingNames,
    defaultedNames,
    requiredNames,
    secretLikeNames,
    warnings,
    checklist,
    report: buildComposeReport({
      status,
      summary,
      variables,
      envNames,
      missingNames,
      defaultedNames,
      requiredNames,
      secretLikeNames,
      warnings,
      checklist
    })
  };
}

export function parseEnvNames(envText: string): string[] {
  const names = new Set<string>();

  for (const rawLine of envText.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#") || line.startsWith("export ")) {
      const exportLine = line.startsWith("export ") ? line.slice("export ".length).trim() : "";

      if (!exportLine) continue;
      const exportMatch = exportLine.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
      if (exportMatch) names.add(exportMatch[1]);
      continue;
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (match) names.add(match[1]);
  }

  return [...names].sort((a, b) => a.localeCompare(b));
}

function mergeVariable(
  variableMap: Map<string, ComposeVariable>,
  name: string,
  marker: ComposeVariable["marker"],
  envNameSet: Set<string>
) {
  const current = variableMap.get(name);
  const nextMarker = rankMarker(marker) > rankMarker(current?.marker ?? "plain")
    ? marker
    : current?.marker ?? marker;

  variableMap.set(name, {
    name,
    marker: nextMarker,
    count: (current?.count ?? 0) + 1,
    hasEnvName: envNameSet.has(name),
    secretLike: secretNamePattern.test(name)
  });
}

function rankMarker(marker: ComposeVariable["marker"]) {
  if (marker === "required") return 3;
  if (marker === "default") return 2;
  return 1;
}

function buildWarnings(
  input: ComposeEnvInput,
  variables: ComposeVariable[],
  missingNames: string[],
  secretLikeNames: string[]
) {
  const warnings: string[] = [];

  if (!input.composeText.trim()) {
    warnings.push("Paste a Compose service, environment, or command snippet before relying on the result.");
  }

  if (variables.length === 0 && input.composeText.trim()) {
    warnings.push("No ${VAR} or $VAR references were found in the Compose snippet.");
  }

  if (/^\s*env_file\s*:/m.test(input.composeText)) {
    warnings.push("env_file loads container runtime values; it does not automatically satisfy Compose interpolation.");
  }

  if (missingNames.length > 0 && input.context === "ci") {
    warnings.push("CI runners often miss local .env files; pass required names through CI variables or job env.");
  }

  if (secretLikeNames.length > 0) {
    warnings.push("Secret-like names were detected. Check presence only and avoid copying real values into tools.");
  }

  return warnings;
}

function buildComposeReport(result: Omit<ComposeEnvResult, "report">) {
  const lines = [
    "Docker Compose env interpolation check",
    `Status: ${result.status}`,
    `Summary: ${result.summary}`,
    "",
    `Referenced names (${result.variables.length}): ${formatList(result.variables.map((item) => item.name))}`,
    `Names present in pasted .env list (${result.envNames.length}): ${formatList(result.envNames)}`,
    `Missing names: ${formatList(result.missingNames)}`,
    `Defaulted names: ${formatList(result.defaultedNames)}`,
    `Required names: ${formatList(result.requiredNames)}`,
    `Secret-like names: ${formatList(result.secretLikeNames)}`,
    "",
    "Warnings:",
    ...formatBullets(result.warnings),
    "",
    "Checklist:",
    ...formatBullets(result.checklist)
  ];

  return lines.join("\n");
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

function formatBullets(values: string[]) {
  return values.length > 0 ? values.map((value) => `- ${value}`) : ["- none"];
}
