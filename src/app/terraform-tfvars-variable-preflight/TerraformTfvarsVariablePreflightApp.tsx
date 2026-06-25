"use client";

import { useMemo, useState } from "react";
import {
  analyzeTerraformTfvars,
  type TerraformTfvarsInput
} from "../lib/terraform-tfvars-preflight";
import {
  safeLabel,
  trackCoreError,
  trackCoreSubmit,
  trackCoreSuccess,
  trackEvent
} from "../analytics-events";

const samples: Record<string, TerraformTfvarsInput> = {
  missingRequired: {
    variablesText: `variable "environment" {
  type = string
}

variable "region" {
  type = string
}

variable "instance_count" {
  type    = number
  default = 2
}

variable "service_token" {
  type      = string
  sensitive = true
}`,
    tfvarsText: `environment = "production"
instance_count = 2
legacy_name = "unused"`
  },
  duplicateAndSecret: {
    variablesText: `variable "environment" {
  type = string
}

variable "api_token" {
  type      = string
  sensitive = true
}`,
    tfvarsText: `environment = "preview"
api_token = "value-not-needed"
environment = "staging"`
  },
  clean: {
    variablesText: `variable "environment" {
  type = string
}

variable "region" {
  type = string
}

variable "instance_count" {
  type    = number
  default = 2
}`,
    tfvarsText: `environment = "production"
region = "us-east-1"`
  }
};

export default function TerraformTfvarsVariablePreflightApp() {
  const [input, setInput] = useState<TerraformTfvarsInput>(samples.missingRequired);
  const [copied, setCopied] = useState("");
  const result = useMemo(() => analyzeTerraformTfvars(input), [input]);

  function updateField<Key extends keyof TerraformTfvarsInput>(
    field: Key,
    value: TerraformTfvarsInput[Key]
  ) {
    const nextInput = { ...input, [field]: value };
    const nextResult = analyzeTerraformTfvars(nextInput);

    setInput(nextInput);
    setCopied("");
    trackEvent("terraform_tfvars_update", {
      field: safeLabel(String(field)),
      status: safeLabel(nextResult.status),
      missing_count: nextResult.missingRequired.length,
      warning_count: nextResult.warnings.length
    });
  }

  function loadSample(sampleKey: keyof typeof samples) {
    const nextInput = samples[sampleKey];
    const nextResult = analyzeTerraformTfvars(nextInput);

    setInput(nextInput);
    setCopied("");
    trackCoreSubmit("terraform_tfvars", "sample");
    trackCoreSuccess("terraform_tfvars", nextResult.status, nextResult.warnings.length);
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(result.report);
      setCopied("Report copied");
      trackEvent("copy_report", {
        action_id: "terraform_tfvars",
        status: safeLabel(result.status),
        warning_count: result.warnings.length
      });
    } catch {
      setCopied("Copy failed. Select the report manually.");
      trackCoreError("terraform_tfvars", "clipboard");
    }
  }

  return (
    <main>
      <header className="topBar">
        <a className="brand" href="/" aria-label="Vercel Env Checker home">
          <span className="brandMark" aria-hidden="true" />
          Vercel Env Checker
        </a>
        <nav className="navLinks" aria-label="Tool navigation">
          <a href="/">Home</a>
          <a href="/docker-compose-env-interpolation">Compose env</a>
          <a href="/github-actions-reusable-workflow-env">Workflow env</a>
          <a href="/privacy">Privacy</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>

      <section className="workspace toolPage">
        <div className="intro">
          <p className="eyebrow">Terraform tfvars variable preflight</p>
          <h1>Compare tfvars keys with variable declarations.</h1>
          <p>
            Paste variable blocks and tfvars assignments. The checker reports
            names only: missing required variables, unknown keys, duplicate
            assignments, and secret-like boundaries before a plan run.
          </p>
        </div>

        <div className="toolGrid" id="checker">
          <section className="formPanel" aria-label="Terraform tfvars inputs">
            <div className="panelHeader">
              <h2>Terraform snippets</h2>
              <span>Names only</span>
            </div>

            <div className="sampleRow" aria-label="Load samples">
              <button type="button" onClick={() => loadSample("missingRequired")}>
                Missing required
              </button>
              <button type="button" onClick={() => loadSample("duplicateAndSecret")}>
                Duplicate key
              </button>
              <button type="button" onClick={() => loadSample("clean")}>
                Clean names
              </button>
            </div>

            <label className="field">
              <span>variables.tf variable blocks</span>
              <textarea
                className="textField tall clarity-mask"
                data-clarity-mask="true"
                value={input.variablesText}
                spellCheck={false}
                onChange={(event) => updateField("variablesText", event.target.value)}
              />
            </label>

            <label className="field">
              <span>terraform.tfvars assignment names</span>
              <textarea
                className="textField tall clarity-mask"
                data-clarity-mask="true"
                value={input.tfvarsText}
                spellCheck={false}
                onChange={(event) => updateField("tfvarsText", event.target.value)}
              />
            </label>

            <div className="warningBox">
              Do not paste Terraform state, cloud credentials, API tokens, or
              secret values. This page compares static variable names and key
              boundaries only.
            </div>
          </section>

          <section className="resultPanel" aria-live="polite">
            <div className="panelHeader">
              <h2>Preflight result</h2>
              <button type="button" onClick={copyReport}>
                Copy report
              </button>
            </div>
            {copied ? <p className="copyNotice">{copied}</p> : null}

            <div className={`statusSummary ${result.status}`}>
              <strong>{result.status}</strong>
              <p>{result.summary}</p>
            </div>

            <div className="metricGrid">
              <Metric label="Variables" value={String(result.declaredVariables.length)} />
              <Metric label="tfvars keys" value={String(result.tfvarsAssignments.length)} />
              <Metric label="Missing" value={String(result.missingRequired.length)} />
              <Metric label="Unknown" value={String(result.unknownAssignments.length)} />
            </div>

            <section className="findingList">
              {result.missingRequired.length > 0 ? (
                <article className="finding critical">
                  <span>fail</span>
                  <h3>Missing required variables</h3>
                  <p>{result.missingRequired.join(", ")}</p>
                </article>
              ) : null}
              {result.unknownAssignments.length > 0 ? (
                <article className="finding warning">
                  <span>warn</span>
                  <h3>Unknown tfvars keys</h3>
                  <p>{result.unknownAssignments.join(", ")}</p>
                </article>
              ) : null}
              {result.duplicateAssignments.length > 0 ? (
                <article className="finding warning">
                  <span>warn</span>
                  <h3>Duplicate assignment names</h3>
                  <p>{result.duplicateAssignments.join(", ")}</p>
                </article>
              ) : null}
              {result.warnings.map((warning) => (
                <article className="finding warning" key={warning}>
                  <span>warn</span>
                  <h3>Boundary to review</h3>
                  <p>{warning}</p>
                </article>
              ))}
              {result.status === "pass" ? (
                <article className="finding info">
                  <span>pass</span>
                  <h3>Names line up</h3>
                  <p>Continue with terraform validate and a real plan in your workspace.</p>
                </article>
              ) : null}
            </section>

            <section className="nameGroup" aria-label="Detected Terraform names">
              <h3>Detected names</h3>
              <div className="twoColumnList">
                <NameColumn
                  title="Required variables"
                  names={result.declaredVariables.filter((item) => item.required).map((item) => item.name)}
                />
                <NameColumn
                  title="Secret-like names"
                  names={result.sensitiveNames}
                />
              </div>
            </section>

            <section className="copyBlock">
              <div>
                <h3>Safe report</h3>
              </div>
              <pre>{result.report}</pre>
            </section>
          </section>
        </div>
      </section>

      <footer className="footer">
        <span>Terraform tfvars variable preflight</span>
        <span>
          <a href="/">Home</a> / <a href="/privacy">Privacy</a> /{" "}
          <a href="/terms">Terms</a> / <a href="/contact">Contact</a>
        </span>
      </footer>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metricCard">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function NameColumn({ title, names }: { title: string; names: string[] }) {
  return (
    <div>
      <h4>{title}</h4>
      {names.length > 0 ? (
        <div className="chipList">
          {names.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      ) : (
        <p className="mutedText">None detected.</p>
      )}
    </div>
  );
}
