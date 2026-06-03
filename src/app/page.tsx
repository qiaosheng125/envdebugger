"use client";

import { useMemo, useState } from "react";
import {
  buildReport,
  commandBlock,
  debugSnippet,
  getFindings,
  initialForm,
  options,
  type FormState
} from "./diagnosis";

const docs = [
  {
    label: "Next.js environment variables",
    href: "https://nextjs.org/docs/pages/guides/environment-variables"
  },
  {
    label: "Vercel environment variables",
    href: "https://vercel.com/docs/environment-variables"
  }
];

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [copied, setCopied] = useState("");

  const findings = useMemo(() => getFindings(form), [form]);
  const report = useMemo(() => buildReport(form, findings), [form, findings]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
    setCopied("");
  }

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(`${label} copied`);
    } catch {
      setCopied("Copy failed. Select the text manually.");
    }
  }

  return (
    <main>
      <header className="topBar">
        <a className="brand" href="#top" aria-label="Vercel Env Checker home">
          <span className="brandMark" aria-hidden="true" />
          Vercel Env Checker
        </a>
        <nav className="navLinks" aria-label="Primary navigation">
          <a href="#checker">Checker</a>
          <a href="#rules">Rules</a>
          <a href="#faq">FAQ</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>

      <section className="workspace" id="top">
        <div className="intro">
          <p className="eyebrow">Next.js / Vercel env debug wizard</p>
          <h1>Debug missing Vercel environment variables.</h1>
          <p>
            Find why a Next.js env variable is undefined, stale, or missing in
            production. Get a prioritized checklist, safe commands, and a debug
            snippet that does not print secret values.
          </p>
        </div>

        <div className="toolGrid" id="checker">
          <section className="formPanel" aria-label="Environment variable diagnostic form">
            <div className="panelHeader">
              <h2>Describe the failure</h2>
              <span>No secrets needed</span>
            </div>

            <SelectField
              label="Framework"
              value={form.framework}
              options={options.framework}
              onChange={(value) => updateField("framework", value)}
            />
            <SelectField
              label="Platform"
              value={form.platform}
              options={options.platform}
              onChange={(value) => updateField("platform", value)}
            />
            <SelectField
              label="Variable name pattern"
              value={form.prefix}
              options={options.prefix}
              onChange={(value) => updateField("prefix", value)}
            />
            <SelectField
              label="Where is it read?"
              value={form.location}
              options={options.location}
              onChange={(value) => updateField("location", value)}
            />
            <SelectField
              label="Where does it fail?"
              value={form.environment}
              options={options.environment}
              onChange={(value) => updateField("environment", value)}
            />
            <SelectField
              label="Symptom"
              value={form.symptom}
              options={options.symptom}
              onChange={(value) => updateField("symptom", value)}
            />
            <SelectField
              label="Changed recently?"
              value={form.changedRecently}
              options={options.changedRecently}
              onChange={(value) => updateField("changedRecently", value)}
            />
            <SelectField
              label="Is this value a secret?"
              value={form.secretType}
              options={options.secretType}
              onChange={(value) => updateField("secretType", value)}
            />

            <div className="warningBox">
              Do not paste API keys, tokens, passwords, database URLs, or real
              environment variable values into this tool.
            </div>
          </section>

          <section className="resultPanel" aria-live="polite">
            <div className="panelHeader">
              <h2>Most likely causes</h2>
              <button type="button" onClick={() => copyText("Report", report)}>
                Copy report
              </button>
            </div>
            {copied ? <p className="copyNotice">{copied}</p> : null}

            <div className="findingList">
              {findings.map((finding) => (
                <article className={`finding ${finding.severity}`} key={finding.title}>
                  <span>{finding.severity}</span>
                  <h3>{finding.title}</h3>
                  <p>{finding.why}</p>
                  <ul>
                    {finding.fixes.map((fix) => (
                      <li key={fix}>{fix}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className="copyGrid">
              <CopyBlock
                title="Safe commands"
                text={commandBlock(form)}
                onCopy={(text) => copyText("Commands", text)}
              />
              <CopyBlock
                title="Safe debug snippet"
                text={debugSnippet(form)}
                onCopy={(text) => copyText("Snippet", text)}
              />
            </div>
          </section>
        </div>
      </section>

      <section className="contentBand" id="rules">
        <div>
          <h2>What this checks</h2>
          <p>
            The checker covers common Next.js and Vercel environment variable
            mistakes: browser access, `NEXT_PUBLIC_`, production versus preview
            scope, redeploy timing, local sync, and safe debugging.
          </p>
        </div>
        <div>
          <h2>What this does not do</h2>
          <p>
            It does not connect to your Vercel account, inspect your repository,
            read secret values, or guarantee that a deployment is production-ready.
          </p>
        </div>
      </section>

      <section className="guideBand">
        <h2>Official references</h2>
        <div className="docLinks">
          {docs.map((doc) => (
            <a key={doc.href} href={doc.href} target="_blank" rel="noreferrer">
              {doc.label}
            </a>
          ))}
        </div>
      </section>

      <section className="faqBand" id="faq">
        <h2>Common cases</h2>
        <div className="faqGrid">
          <article>
            <h3>Why is my variable undefined in the browser?</h3>
            <p>
              In Next.js, browser-exposed values need the `NEXT_PUBLIC_` prefix.
              Do not use that prefix for secrets.
            </p>
          </article>
          <article>
            <h3>Why do I still see the old value?</h3>
            <p>
              Public client values are bundled at build time. Change the value,
              create a new deployment, and confirm production points to it.
            </p>
          </article>
          <article>
            <h3>Why does local work but Vercel fails?</h3>
            <p>
              Your local `.env.local` and Vercel project environments may not
              match. Pull Vercel env values locally and restart the dev server.
            </p>
          </article>
        </div>
      </section>

      <footer className="footer">
        <span>Vercel Env Checker MVP</span>
        <span>
          <a href="/about">About</a> / <a href="/privacy">Privacy</a> /{" "}
          <a href="/terms">Terms</a> / <a href="/contact">Contact</a>
        </span>
      </footer>
    </main>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[][];
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([key, text]) => (
          <option value={key} key={key}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

function CopyBlock({
  title,
  text,
  onCopy
}: {
  title: string;
  text: string;
  onCopy: (text: string) => void;
}) {
  return (
    <section className="copyBlock">
      <div>
        <h3>{title}</h3>
        <button type="button" onClick={() => onCopy(text)}>
          Copy
        </button>
      </div>
      <pre>{text}</pre>
    </section>
  );
}
