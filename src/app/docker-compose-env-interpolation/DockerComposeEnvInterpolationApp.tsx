"use client";

import { useMemo, useState } from "react";
import {
  analyzeComposeEnv,
  type ComposeContext,
  type ComposeEnvInput
} from "../lib/compose-env-interpolation";
import {
  safeLabel,
  trackCoreError,
  trackCoreSubmit,
  trackCoreSuccess,
  trackEvent
} from "../analytics-events";

const samples: Record<string, ComposeEnvInput> = {
  missing: {
    context: "local-cli",
    composeText: `services:
  web:
    image: my-app
    command: npm run start
    environment:
      NEXT_PUBLIC_SITE_URL: \${NEXT_PUBLIC_SITE_URL}
      DATABASE_URL: \${DATABASE_URL:?database url required}
      LOG_LEVEL: \${LOG_LEVEL:-info}
    env_file:
      - .env.production`,
    envText: `NEXT_PUBLIC_SITE_URL=https://example.test
LOG_LEVEL=info`
  },
  ci: {
    context: "ci",
    composeText: `services:
  worker:
    build: .
    environment:
      API_TOKEN: \${API_TOKEN}
      QUEUE_NAME: \${QUEUE_NAME:-default}`,
    envText: `QUEUE_NAME=default`
  },
  clean: {
    context: "vercel",
    composeText: `services:
  preview:
    image: node:22
    environment:
      NEXT_PUBLIC_APP_ENV: \${NEXT_PUBLIC_APP_ENV:-preview}
      FEATURE_FLAG: \${FEATURE_FLAG}`,
    envText: `FEATURE_FLAG=on`
  }
};

const contextOptions: { value: ComposeContext; label: string }[] = [
  { value: "local-cli", label: "Local Docker CLI" },
  { value: "ci", label: "CI runner" },
  { value: "vercel", label: "Vercel build/helper" },
  { value: "unknown", label: "Not sure" }
];

export default function DockerComposeEnvInterpolationApp() {
  const [input, setInput] = useState<ComposeEnvInput>(samples.missing);
  const [copied, setCopied] = useState("");
  const result = useMemo(() => analyzeComposeEnv(input), [input]);

  function updateField<Key extends keyof ComposeEnvInput>(field: Key, value: ComposeEnvInput[Key]) {
    const nextInput = { ...input, [field]: value };
    const nextResult = analyzeComposeEnv(nextInput);

    setInput(nextInput);
    setCopied("");
    trackEvent("compose_env_update", {
      field: safeLabel(String(field)),
      status: safeLabel(nextResult.status),
      variable_count: nextResult.variables.length,
      missing_count: nextResult.missingNames.length
    });
  }

  function loadSample(sampleKey: keyof typeof samples) {
    const nextInput = samples[sampleKey];
    const nextResult = analyzeComposeEnv(nextInput);

    setInput(nextInput);
    setCopied("");
    trackCoreSubmit("compose_env", "sample");
    trackCoreSuccess("compose_env", nextResult.status, nextResult.variables.length);
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(result.report);
      setCopied("Report copied");
      trackEvent("copy_report", {
        action_id: "compose_env",
        status: safeLabel(result.status),
        variable_count: result.variables.length,
        warning_count: result.warnings.length
      });
    } catch {
      setCopied("Copy failed. Select the report manually.");
      trackCoreError("compose_env", "clipboard");
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
          <a href="/github-actions-reusable-workflow-env">Workflow env</a>
          <a href="/privacy">Privacy</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>

      <section className="workspace toolPage">
        <div className="intro">
          <p className="eyebrow">Docker Compose env interpolation</p>
          <h1>Check Compose variables before a missing env name breaks a run.</h1>
          <p>
            Paste a Compose snippet and a list of .env names. This local checker
            reports referenced names, defaults, required markers, env_file
            boundaries, and secret-like variable names without storing values.
          </p>
        </div>

        <div className="toolGrid" id="checker">
          <section className="formPanel" aria-label="Docker Compose env interpolation inputs">
            <div className="panelHeader">
              <h2>Compose inputs</h2>
              <span>Names only</span>
            </div>

            <div className="sampleRow" aria-label="Load samples">
              <button type="button" onClick={() => loadSample("missing")}>
                Missing required
              </button>
              <button type="button" onClick={() => loadSample("ci")}>
                CI runner
              </button>
              <button type="button" onClick={() => loadSample("clean")}>
                Clean default
              </button>
            </div>

            <label className="field">
              <span>Run context</span>
              <select
                value={input.context}
                onChange={(event) => updateField("context", event.target.value as ComposeContext)}
              >
                {contextOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Compose snippet</span>
              <textarea
                className="textField tall"
                value={input.composeText}
                spellCheck={false}
                onChange={(event) => updateField("composeText", event.target.value)}
              />
            </label>

            <label className="field">
              <span>.env names or lines</span>
              <textarea
                className="textField short"
                value={input.envText}
                spellCheck={false}
                onChange={(event) => updateField("envText", event.target.value)}
              />
            </label>

            <div className="warningBox">
              Do not paste API keys, tokens, passwords, database URLs, or real
              environment variable values. The report prints names only.
            </div>
          </section>

          <section className="resultPanel" aria-live="polite">
            <div className="panelHeader">
              <h2>Interpolation result</h2>
              <button type="button" onClick={copyReport}>
                Copy report
              </button>
            </div>
            {copied ? <p className="copyNotice">{copied}</p> : null}

            <StatusSummary status={result.status} summary={result.summary} />

            <div className="metricGrid">
              <Metric label="Referenced names" value={String(result.variables.length)} />
              <Metric label="Missing names" value={String(result.missingNames.length)} />
              <Metric label="Defaults" value={String(result.defaultedNames.length)} />
              <Metric label="Required" value={String(result.requiredNames.length)} />
            </div>

            <section className="nameGroup" aria-label="Referenced variable names">
              <h3>Names found</h3>
              <NameList names={result.variables.map((item) => item.name)} />
            </section>

            <section className="findingList">
              {result.missingNames.length > 0 ? (
                <article className="finding critical">
                  <span>fail</span>
                  <h3>Missing interpolation names</h3>
                  <p>{result.missingNames.join(", ")} need a matching local source or default.</p>
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
                  <h3>No blocking mismatch detected</h3>
                  <p>Continue with a local Compose run that logs only key presence.</p>
                </article>
              ) : null}
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

      <FooterLinks />
    </main>
  );
}

function StatusSummary({ status, summary }: { status: string; summary: string }) {
  return (
    <div className={`statusSummary ${status}`}>
      <strong>{status}</strong>
      <p>{summary}</p>
    </div>
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

function NameList({ names }: { names: string[] }) {
  if (names.length === 0) return <p className="mutedText">No names detected yet.</p>;

  return (
    <div className="chipList">
      {names.map((name) => (
        <span key={name}>{name}</span>
      ))}
    </div>
  );
}

function FooterLinks() {
  return (
    <footer className="footer">
      <span>Docker Compose env interpolation checker</span>
      <span>
        <a href="/">Home</a> / <a href="/privacy">Privacy</a> /{" "}
        <a href="/terms">Terms</a> / <a href="/contact">Contact</a>
      </span>
    </footer>
  );
}
