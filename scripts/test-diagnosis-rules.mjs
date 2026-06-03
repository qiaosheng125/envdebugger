import assert from "node:assert/strict";
import {
  debugSnippet,
  getFindings,
  initialForm
} from "../src/app/diagnosis.ts";

function titles(form) {
  return getFindings({ ...initialForm, ...form }).map((finding) => finding.title);
}

function includesTitle(form, title) {
  assert.ok(
    titles(form).includes(title),
    `Expected "${title}" for ${JSON.stringify(form)}`
  );
}

includesTitle(
  {
    prefix: "no-public",
    location: "browser",
    symptom: "undefined",
    secretType: "secret"
  },
  "The browser cannot read a server-only variable"
);

includesTitle(
  {
    prefix: "public",
    location: "browser",
    symptom: "old",
    changedRecently: "not-redeployed",
    secretType: "public"
  },
  "The client bundle may still contain the old value"
);

includesTitle(
  {
    prefix: "no-public",
    location: "server",
    environment: "preview",
    symptom: "undefined"
  },
  "The value may be configured in the wrong Vercel environment"
);

includesTitle(
  {
    environment: "local-not-vercel",
    location: "server",
    symptom: "undefined"
  },
  "Local and Vercel values may be out of sync"
);

includesTitle(
  {
    prefix: "public",
    location: "browser",
    secretType: "secret"
  },
  "A secret must not use NEXT_PUBLIC_"
);

const snippet = debugSnippet({ ...initialForm, prefix: "no-public" });
assert.ok(snippet.includes("exists: Boolean(value)"));
assert.ok(snippet.includes("length: value?.length ?? 0"));
assert.ok(!snippet.includes("console.log(value)"));

console.log("diagnosis rules ok");
