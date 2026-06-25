import assert from "node:assert/strict";
import { analyzeComposeEnv } from "../src/app/lib/compose-env-interpolation.ts";
import { analyzeReusableWorkflowEnv } from "../src/app/lib/reusable-workflow-env.ts";
import { analyzeTerraformTfvars } from "../src/app/lib/terraform-tfvars-preflight.ts";

const compose = analyzeComposeEnv({
  context: "ci",
  composeText: `services:
  web:
    environment:
      DATABASE_URL: \${DATABASE_URL:?required}
      LOG_LEVEL: \${LOG_LEVEL:-info}
      NEXT_PUBLIC_SITE_URL: \${NEXT_PUBLIC_SITE_URL}`,
  envText: "NEXT_PUBLIC_SITE_URL=https://example.test"
});

assert.equal(compose.status, "fail");
assert.deepEqual(compose.missingNames, ["DATABASE_URL"]);
assert.deepEqual(compose.defaultedNames, ["LOG_LEVEL"]);
assert.ok(compose.secretLikeNames.includes("DATABASE_URL"));
assert.ok(!compose.report.includes("https://example.test"));

const workflow = analyzeReusableWorkflowEnv({
  calleeText: `on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
    secrets:
      VERCEL_TOKEN:
        required: true`,
  callerText: `jobs:
  deploy:
    uses: org/repo/.github/workflows/deploy.yml@main
    with:
      environment: production
      api_token: \${{ secrets.VERCEL_TOKEN }}`
});

assert.equal(workflow.status, "fail");
assert.deepEqual(workflow.missingSecrets, ["VERCEL_TOKEN"]);
assert.deepEqual(workflow.secretLikeWithKeys, ["api_token"]);
assert.ok(!workflow.report.includes("${{ secrets.VERCEL_TOKEN }}"));

const inherit = analyzeReusableWorkflowEnv({
  calleeText: workflowInputWithSecret(),
  callerText: `jobs:
  deploy:
    uses: org/repo/.github/workflows/deploy.yml@main
    with:
      environment: preview
    secrets: inherit`
});

assert.equal(inherit.status, "warn");
assert.equal(inherit.usesSecretsInherit, true);
assert.deepEqual(inherit.missingSecrets, []);

const tfvars = analyzeTerraformTfvars({
  variablesText: `variable "environment" {
  type = string
}

variable "region" {
  type = string
}

variable "service_token" {
  type      = string
  sensitive = true
}`,
  tfvarsText: `environment = "production"
service_token = "do-not-copy"
legacy_name = "unused"`
});

assert.equal(tfvars.status, "fail");
assert.deepEqual(tfvars.missingRequired, ["region"]);
assert.deepEqual(tfvars.unknownAssignments, ["legacy_name"]);
assert.ok(tfvars.sensitiveNames.includes("service_token"));
assert.ok(!tfvars.report.includes("do-not-copy"));

const tfvarsClean = analyzeTerraformTfvars({
  variablesText: `variable "environment" {
  type = string
}

variable "instance_count" {
  type    = number
  default = 2
}`,
  tfvarsText: `environment = "preview"`
});

assert.equal(tfvarsClean.status, "pass");
assert.deepEqual(tfvarsClean.missingRequired, []);

console.log("Inner page rules tests passed");

function workflowInputWithSecret() {
  return `on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
    secrets:
      VERCEL_TOKEN:
        required: true`;
}
