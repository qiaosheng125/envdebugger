export type WorkflowInput = {
  callerText: string;
  calleeText: string;
};

export type WorkflowCallKey = {
  name: string;
  required: boolean;
};

export type WorkflowEnvResult = {
  status: "pass" | "warn" | "fail";
  summary: string;
  declaredInputs: WorkflowCallKey[];
  declaredSecrets: WorkflowCallKey[];
  callerInputs: string[];
  callerSecrets: string[];
  missingInputs: string[];
  missingSecrets: string[];
  unknownInputs: string[];
  unknownSecrets: string[];
  secretLikeWithKeys: string[];
  usesSecretsInherit: boolean;
  warnings: string[];
  checklist: string[];
  report: string;
};

const secretNamePattern =
  /(SECRET|TOKEN|PASSWORD|PASS|PRIVATE|API[_-]?KEY|DATABASE_URL|AUTH|JWT|COOKIE|SESSION)/i;

export function analyzeReusableWorkflowEnv(input: WorkflowInput): WorkflowEnvResult {
  const declaredInputs = extractWorkflowCallKeys(input.calleeText, "inputs");
  const declaredSecrets = extractWorkflowCallKeys(input.calleeText, "secrets");
  const callerInputs = extractCallerMappingKeys(input.callerText, "with");
  const callerSecretBlock = extractCallerSecretBlock(input.callerText);
  const callerSecrets = callerSecretBlock.keys;
  const usesSecretsInherit = callerSecretBlock.inherit;

  const declaredInputNames = declaredInputs.map((item) => item.name);
  const declaredSecretNames = declaredSecrets.map((item) => item.name);
  const requiredInputNames = declaredInputs.filter((item) => item.required).map((item) => item.name);
  const requiredSecretNames = declaredSecrets.filter((item) => item.required).map((item) => item.name);

  const missingInputs = difference(requiredInputNames, callerInputs);
  const missingSecrets = usesSecretsInherit ? [] : difference(requiredSecretNames, callerSecrets);
  const unknownInputs = difference(callerInputs, declaredInputNames);
  const unknownSecrets = usesSecretsInherit ? [] : difference(callerSecrets, declaredSecretNames);
  const secretLikeWithKeys = callerInputs.filter((name) => secretNamePattern.test(name));
  const warnings = buildWarnings({
    input,
    declaredInputs,
    declaredSecrets,
    callerInputs,
    callerSecrets,
    usesSecretsInherit,
    unknownInputs,
    unknownSecrets,
    secretLikeWithKeys
  });
  const status =
    missingInputs.length > 0 || missingSecrets.length > 0
      ? "fail"
      : warnings.length > 0
        ? "warn"
        : "pass";
  const summary =
    status === "fail"
      ? "Required reusable workflow inputs or secrets are not mapped by the caller."
      : status === "warn"
        ? "Required mappings are present, but boundaries should be reviewed."
        : "Caller mappings line up with the declared workflow_call contract.";
  const checklist = [
    "Keep non-sensitive configuration under workflow_call inputs.",
    "Keep tokens and credentials under workflow_call secrets.",
    "Avoid secrets: inherit unless the reusable workflow is trusted for every secret in scope.",
    "Do not paste GitHub tokens or secret values; compare only YAML keys and mapping names."
  ];

  return {
    status,
    summary,
    declaredInputs,
    declaredSecrets,
    callerInputs,
    callerSecrets,
    missingInputs,
    missingSecrets,
    unknownInputs,
    unknownSecrets,
    secretLikeWithKeys,
    usesSecretsInherit,
    warnings,
    checklist,
    report: buildWorkflowReport({
      status,
      summary,
      declaredInputs,
      declaredSecrets,
      callerInputs,
      callerSecrets,
      missingInputs,
      missingSecrets,
      unknownInputs,
      unknownSecrets,
      secretLikeWithKeys,
      usesSecretsInherit,
      warnings,
      checklist
    })
  };
}

export function extractWorkflowCallKeys(text: string, section: "inputs" | "secrets"): WorkflowCallKey[] {
  const lines = text.split(/\r?\n/);
  const workflowCallIndex = lines.findIndex((line) => /^\s*workflow_call\s*:/.test(line));

  if (workflowCallIndex === -1) return [];

  const workflowIndent = indentation(lines[workflowCallIndex]);
  let sectionIndex = -1;
  let sectionIndent = -1;

  for (let index = workflowCallIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;
    const lineIndent = indentation(line);

    if (lineIndent <= workflowIndent) break;

    if (new RegExp(`^${section}\\s*:`).test(trimmed)) {
      sectionIndex = index;
      sectionIndent = lineIndent;
      break;
    }
  }

  if (sectionIndex === -1) return [];

  const keys: WorkflowCallKey[] = [];
  let activeKey: { name: string; indent: number; required: boolean } | null = null;

  for (let index = sectionIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const lineIndent = indentation(line);
    if (lineIndent <= sectionIndent) break;

    const keyMatch = trimmed.match(/^["']?([A-Za-z_][A-Za-z0-9_-]*)["']?\s*:/);

    if (keyMatch && lineIndent === sectionIndent + 2) {
      if (activeKey) keys.push({ name: activeKey.name, required: activeKey.required });
      activeKey = { name: keyMatch[1], indent: lineIndent, required: /required\s*:\s*true\b/i.test(trimmed) };
      continue;
    }

    if (activeKey && lineIndent > activeKey.indent && /required\s*:\s*true\b/i.test(trimmed)) {
      activeKey.required = true;
    }
  }

  if (activeKey) keys.push({ name: activeKey.name, required: activeKey.required });

  return keys.sort((a, b) => a.name.localeCompare(b.name));
}

export function extractCallerMappingKeys(text: string, section: "with" | "secrets") {
  const keys = new Set<string>();
  const lines = text.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!new RegExp(`^${section}\\s*:`).test(trimmed)) continue;

    const sectionIndent = indentation(line);

    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const child = lines[cursor];
      const childTrimmed = child.trim();

      if (!childTrimmed || childTrimmed.startsWith("#")) continue;

      const childIndent = indentation(child);
      if (childIndent <= sectionIndent) break;

      const keyMatch = childTrimmed.match(/^["']?([A-Za-z_][A-Za-z0-9_-]*)["']?\s*:/);
      if (keyMatch && childIndent === sectionIndent + 2) keys.add(keyMatch[1]);
    }
  }

  return [...keys].sort((a, b) => a.localeCompare(b));
}

function extractCallerSecretBlock(text: string) {
  const lines = text.split(/\r?\n/);
  let inherit = false;
  const keys = new Set<string>();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (/^secrets\s*:\s*inherit\s*$/i.test(trimmed)) {
      inherit = true;
      continue;
    }

    if (!/^secrets\s*:/.test(trimmed)) continue;

    for (const key of extractCallerMappingKeys(lines.slice(index).join("\n"), "secrets")) {
      keys.add(key);
    }
  }

  return {
    inherit,
    keys: [...keys].sort((a, b) => a.localeCompare(b))
  };
}

function buildWarnings({
  input,
  declaredInputs,
  declaredSecrets,
  callerInputs,
  callerSecrets,
  usesSecretsInherit,
  unknownInputs,
  unknownSecrets,
  secretLikeWithKeys
}: {
  input: WorkflowInput;
  declaredInputs: WorkflowCallKey[];
  declaredSecrets: WorkflowCallKey[];
  callerInputs: string[];
  callerSecrets: string[];
  usesSecretsInherit: boolean;
  unknownInputs: string[];
  unknownSecrets: string[];
  secretLikeWithKeys: string[];
}) {
  const warnings: string[] = [];

  if (!input.callerText.trim() || !input.calleeText.trim()) {
    warnings.push("Paste both the caller job and the reusable workflow_call contract before relying on the result.");
  }

  if (declaredInputs.length === 0 && declaredSecrets.length === 0 && input.calleeText.trim()) {
    warnings.push("No workflow_call inputs or secrets were detected in the reusable workflow snippet.");
  }

  if (callerInputs.length === 0 && callerSecrets.length === 0 && !usesSecretsInherit && input.callerText.trim()) {
    warnings.push("No caller with: or secrets: mappings were detected.");
  }

  if (unknownInputs.length > 0 || unknownSecrets.length > 0) {
    warnings.push("The caller maps keys that are not declared by the reusable workflow contract.");
  }

  if (secretLikeWithKeys.length > 0) {
    warnings.push("Secret-like names appear under with:. Move sensitive values to workflow_call secrets.");
  }

  if (usesSecretsInherit) {
    warnings.push("secrets: inherit can expose more secrets than the reusable workflow actually needs.");
  }

  return warnings;
}

function difference(required: string[], provided: string[]) {
  const providedSet = new Set(provided);
  return required.filter((name) => !providedSet.has(name)).sort((a, b) => a.localeCompare(b));
}

function indentation(line: string) {
  return line.match(/^\s*/)?.[0].length ?? 0;
}

function buildWorkflowReport(result: Omit<WorkflowEnvResult, "report">) {
  const lines = [
    "GitHub Actions reusable workflow env check",
    `Status: ${result.status}`,
    `Summary: ${result.summary}`,
    "",
    `Declared inputs: ${formatKeys(result.declaredInputs)}`,
    `Declared secrets: ${formatKeys(result.declaredSecrets)}`,
    `Caller with keys: ${formatList(result.callerInputs)}`,
    `Caller secrets keys: ${result.usesSecretsInherit ? "inherit" : formatList(result.callerSecrets)}`,
    `Missing required inputs: ${formatList(result.missingInputs)}`,
    `Missing required secrets: ${formatList(result.missingSecrets)}`,
    `Unknown inputs: ${formatList(result.unknownInputs)}`,
    `Unknown secrets: ${formatList(result.unknownSecrets)}`,
    `Secret-like with keys: ${formatList(result.secretLikeWithKeys)}`,
    "",
    "Warnings:",
    ...formatBullets(result.warnings),
    "",
    "Checklist:",
    ...formatBullets(result.checklist)
  ];

  return lines.join("\n");
}

function formatKeys(values: WorkflowCallKey[]) {
  if (values.length === 0) return "none";
  return values.map((item) => `${item.name}${item.required ? " (required)" : ""}`).join(", ");
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

function formatBullets(values: string[]) {
  return values.length > 0 ? values.map((value) => `- ${value}`) : ["- none"];
}
