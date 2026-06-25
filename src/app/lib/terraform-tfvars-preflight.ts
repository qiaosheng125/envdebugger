export type TerraformTfvarsInput = {
  variablesText: string;
  tfvarsText: string;
};

export type TerraformVariable = {
  name: string;
  required: boolean;
  sensitive: boolean;
  hasDefault: boolean;
};

export type TerraformTfvarsAssignment = {
  name: string;
  duplicate: boolean;
};

export type TerraformTfvarsResult = {
  status: "pass" | "warn" | "fail";
  summary: string;
  declaredVariables: TerraformVariable[];
  tfvarsAssignments: TerraformTfvarsAssignment[];
  missingRequired: string[];
  unknownAssignments: string[];
  duplicateAssignments: string[];
  sensitiveNames: string[];
  warnings: string[];
  checklist: string[];
  report: string;
};

const sensitiveNamePattern =
  /(SECRET|TOKEN|PASSWORD|PASS|PRIVATE|API[_-]?KEY|DATABASE|AUTH|JWT|COOKIE|SESSION|CREDENTIAL|CLIENT_SECRET)/i;

export function analyzeTerraformTfvars(input: TerraformTfvarsInput): TerraformTfvarsResult {
  const declaredVariables = extractVariables(input.variablesText);
  const tfvarsAssignments = extractTfvarsAssignments(input.tfvarsText);
  const declaredNames = declaredVariables.map((variable) => variable.name);
  const assignmentNames = tfvarsAssignments.map((assignment) => assignment.name);
  const requiredNames = declaredVariables
    .filter((variable) => variable.required)
    .map((variable) => variable.name);
  const missingRequired = difference(requiredNames, assignmentNames);
  const unknownAssignments = difference(assignmentNames, declaredNames);
  const duplicateAssignments = tfvarsAssignments
    .filter((assignment) => assignment.duplicate)
    .map((assignment) => assignment.name);
  const sensitiveNames = unique([
    ...declaredVariables
      .filter((variable) => variable.sensitive || sensitiveNamePattern.test(variable.name))
      .map((variable) => variable.name),
    ...assignmentNames.filter((name) => sensitiveNamePattern.test(name))
  ]);
  const warnings = buildWarnings({
    input,
    declaredVariables,
    tfvarsAssignments,
    unknownAssignments,
    duplicateAssignments,
    sensitiveNames
  });
  const status =
    missingRequired.length > 0
      ? "fail"
      : warnings.length > 0
        ? "warn"
        : "pass";
  const summary =
    status === "fail"
      ? "Required Terraform variables are not present in the tfvars assignment names."
      : status === "warn"
        ? "Required variable names are present, but the tfvars boundary needs review."
        : "The tfvars assignment names line up with the declared Terraform variables.";
  const checklist = [
    "Compare only variable names and static keys; keep actual values out of reports.",
    "Keep secret values in your approved secret manager or secure CI variable store.",
    "Run terraform validate and a plan in your real workspace before applying.",
    "Review module defaults because this page does not evaluate HCL expressions or providers."
  ];

  return {
    status,
    summary,
    declaredVariables,
    tfvarsAssignments,
    missingRequired,
    unknownAssignments,
    duplicateAssignments,
    sensitiveNames,
    warnings,
    checklist,
    report: buildTfvarsReport({
      status,
      summary,
      declaredVariables,
      tfvarsAssignments,
      missingRequired,
      unknownAssignments,
      duplicateAssignments,
      sensitiveNames,
      warnings,
      checklist
    })
  };
}

export function extractVariables(text: string): TerraformVariable[] {
  const variables: TerraformVariable[] = [];
  const variablePattern = /variable\s+"([^"]+)"\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = variablePattern.exec(text)) !== null) {
    const start = match.index + match[0].length;
    const body = readBlockBody(text, start);
    const name = match[1];
    const hasDefault = /^\s*default\s*=/m.test(body);
    const sensitive = /^\s*sensitive\s*=\s*true\b/im.test(body);

    variables.push({
      name,
      hasDefault,
      sensitive,
      required: !hasDefault
    });
  }

  return variables.sort((a, b) => a.name.localeCompare(b.name));
}

export function extractTfvarsAssignments(text: string): TerraformTfvarsAssignment[] {
  const counts = new Map<string, number>();
  const lines = stripBlockComments(text).split(/\r?\n/);

  for (const line of lines) {
    const withoutComment = stripLineComment(line).trim();
    const match = withoutComment.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*=/);
    if (!match) continue;
    counts.set(match[1], (counts.get(match[1]) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      duplicate: count > 1
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function readBlockBody(text: string, startIndex: number) {
  let depth = 1;

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(startIndex, index);
    }
  }

  return text.slice(startIndex);
}

function stripBlockComments(text: string) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "");
}

function stripLineComment(line: string) {
  return line.replace(/\s+#.*$/, "").replace(/\s+\/\/.*$/, "");
}

function buildWarnings({
  input,
  declaredVariables,
  tfvarsAssignments,
  unknownAssignments,
  duplicateAssignments,
  sensitiveNames
}: {
  input: TerraformTfvarsInput;
  declaredVariables: TerraformVariable[];
  tfvarsAssignments: TerraformTfvarsAssignment[];
  unknownAssignments: string[];
  duplicateAssignments: string[];
  sensitiveNames: string[];
}) {
  const warnings: string[] = [];

  if (!input.variablesText.trim() || !input.tfvarsText.trim()) {
    warnings.push("Paste both variable declarations and tfvars assignments before relying on the result.");
  }

  if (input.variablesText.trim() && declaredVariables.length === 0) {
    warnings.push("No variable blocks were detected in the declarations snippet.");
  }

  if (input.tfvarsText.trim() && tfvarsAssignments.length === 0) {
    warnings.push("No tfvars key assignments were detected.");
  }

  if (unknownAssignments.length > 0) {
    warnings.push("The tfvars file assigns names that are not declared in the pasted variable blocks.");
  }

  if (duplicateAssignments.length > 0) {
    warnings.push("The tfvars snippet repeats at least one assignment name.");
  }

  if (sensitiveNames.length > 0) {
    warnings.push("Secret-like variable names were detected; keep values out of this page and out of copied reports.");
  }

  return warnings;
}

function buildTfvarsReport(result: Omit<TerraformTfvarsResult, "report">) {
  return [
    "Terraform tfvars variable preflight",
    `Status: ${result.status}`,
    `Summary: ${result.summary}`,
    "",
    `Declared variables: ${formatVariables(result.declaredVariables)}`,
    `tfvars assignment names: ${formatList(result.tfvarsAssignments.map((assignment) => assignment.name))}`,
    `Missing required variables: ${formatList(result.missingRequired)}`,
    `Unknown tfvars names: ${formatList(result.unknownAssignments)}`,
    `Duplicate tfvars names: ${formatList(result.duplicateAssignments)}`,
    `Secret-like names: ${formatList(result.sensitiveNames)}`,
    "",
    "Warnings:",
    ...formatBullets(result.warnings),
    "",
    "Checklist:",
    ...formatBullets(result.checklist),
    "",
    "Scope: static variable-name check only. This report never includes tfvars values, Terraform state, cloud credentials, or provider validation."
  ].join("\n");
}

function difference(required: string[], provided: string[]) {
  const providedSet = new Set(provided);
  return required.filter((name) => !providedSet.has(name)).sort((a, b) => a.localeCompare(b));
}

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function formatVariables(values: TerraformVariable[]) {
  if (values.length === 0) return "none";
  return values
    .map((variable) => {
      const markers = [
        variable.required ? "required" : "defaulted",
        variable.sensitive ? "sensitive" : ""
      ].filter(Boolean);
      return `${variable.name} (${markers.join(", ")})`;
    })
    .join(", ");
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

function formatBullets(values: string[]) {
  return values.length > 0 ? values.map((value) => `- ${value}`) : ["- none"];
}
