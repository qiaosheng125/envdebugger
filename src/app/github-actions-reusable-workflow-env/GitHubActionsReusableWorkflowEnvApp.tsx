"use client";

import { useMemo, useState } from "react";
import { analyzeReusableWorkflowEnv, type WorkflowInput } from "../lib/reusable-workflow-env";
import {
  safeLabel,
  trackCoreError,
  trackCoreSubmit,
  trackCoreSuccess,
  trackEvent
} from "../analytics-events";

const samples: Record<string, WorkflowInput> = {
  missingSecret: {
    calleeText: `on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      node-version:
        required: false
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
  },
  inherit: {
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
      environment: preview
    secrets: inherit`
  },
  clean: {
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
    secrets:
      VERCEL_TOKEN: \${{ secrets.VERCEL_TOKEN }}`
  }
};

export default function GitHubActionsReusableWorkflowEnvApp() {
  const [input, setInput] = useState<WorkflowInput>(samples.missingSecret);
  const [copied, setCopied] = useState("");
  const result = useMemo(() => analyzeReusableWorkflowEnv(input), [input]);

  function updateField<Key extends keyof WorkflowInput>(field: Key, value: WorkflowInput[Key]) {
    const nextInput = { ...input, [field]: value };
    const nextResult = analyzeReusableWorkflowEnv(nextInput);

    setInput(nextInput);
    setCopied("");
    trackEvent("workflow_env_update", {
      field: safeLabel(String(field)),
      status: safeLabel(nextResult.status),
      missing_input_count: nextResult.missingInputs.length,
      missing_secret_count: nextResult.missingSecrets.length
    });
  }

  function loadSample(sampleKey: keyof typeof samples) {
    const nextInput = samples[sampleKey];
    const nextResult = analyzeReusableWorkflowEnv(nextInput);

    setInput(nextInput);
    setCopied("");
    trackCoreSubmit("workflow_env", "sample");
    trackCoreSuccess("workflow_env", nextResult.status, nextResult.warnings.length);
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(result.report);
      setCopied("Report copied");
      trackEvent("copy_report", {
        action_id: "workflow_env",
        status: safeLabel(result.status),
        warning_count: result.warnings.length
      });
    } catch {
      setCopied("Copy failed. Select the report manually.");
      trackCoreError("workflow_env", "clipboard");
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
          <a href="/privacy">Privacy</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>

      <section className="workspace toolPage">
        <div className="intro">
          <p className="eyebrow">GitHub Actions reusable workflow env</p>
          <h1>Compare caller mappings with a workflow_call contract.</h1>
          <p>
            Paste the reusable workflow declaration and the caller job. The
            checker flags missing required inputs, missing secrets, unknown keys,
            secret-like values under with, and the boundary around secrets: inherit.
          </p>
        </div>

        <div className="toolGrid" id="checker">
          <section className="formPanel" aria-label="Reusable workflow mapping inputs">
            <div className="panelHeader">
              <h2>Workflow snippets</h2>
              <span>No GitHub token</span>
            </div>

            <div className="sampleRow" aria-label="Load samples">
              <button type="button" onClick={() => loadSample("missingSecret")}>
                Missing secret
              </button>
              <button type="button" onClick={() => loadSample("inherit")}>
                Inherit boundary
              </button>
              <button type="button" onClick={() => loadSample("clean")}>
                Clean mapping
              </button>
            </div>

            <label className="field">
              <span>Reusable workflow_call snippet</span>
              <textarea
                className="textField tall"
                value={input.calleeText}
                spellCheck={false}
                onChange={(event) => updateField("calleeText", event.target.value)}
              />
            </label>

            <label className="field">
              <span>Caller job snippet</span>
              <textarea
                className="textField tall"
                value={input.callerText}
                spellCheck={false}
                onChange={(event) => updateField("callerText", event.target.value)}
              />
            </label>

            <div className="warningBox">
              Do not paste GitHub tokens, repository secrets, or live credential
              values. This page compares YAML keys and mapping names only.
            </div>
          </section>

          <section className="resultPanel" aria-live="polite">
            <div className="panelHeader">
              <h2>Mapping result</h2>
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
              <Metric label="Declared inputs" value={String(result.declaredInputs.length)} />
              <Metric label="Declared secrets" value={String(result.declaredSecrets.length)} />
              <Metric label="Missing inputs" value={String(result.missingInputs.length)} />
              <Metric label="Missing secrets" value={String(result.missingSecrets.length)} />
            </div>

            <section className="findingList">
              {result.missingInputs.length > 0 ? (
                <article className="finding critical">
                  <span>fail</span>
                  <h3>Missing required inputs</h3>
                  <p>{result.missingInputs.join(", ")}</p>
                </article>
              ) : null}
              {result.missingSecrets.length > 0 ? (
                <article className="finding critical">
                  <span>fail</span>
                  <h3>Missing required secrets</h3>
                  <p>{result.missingSecrets.join(", ")}</p>
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
                  <h3>Contract and caller line up</h3>
                  <p>Continue with a GitHub Actions dry run or pull request check.</p>
                </article>
              ) : null}
            </section>

            <section className="nameGroup" aria-label="Detected workflow keys">
              <h3>Detected keys</h3>
              <div className="twoColumnList">
                <NameColumn
                  title="Caller with"
                  names={result.callerInputs}
                />
                <NameColumn
                  title="Caller secrets"
                  names={result.usesSecretsInherit ? ["inherit"] : result.callerSecrets}
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
        <span>GitHub Actions reusable workflow env checker</span>
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
