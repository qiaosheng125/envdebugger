"use client";

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, params?: AnalyticsParams) => void;
    clarity?: (command: "event", eventName: string) => void;
  }
}

const allowed = new Set([
  "next-app",
  "next-pages",
  "other",
  "vercel",
  "local",
  "public",
  "no-public",
  "unknown",
  "browser",
  "server",
  "api",
  "middleware",
  "build",
  "preview",
  "production",
  "local-not-vercel",
  "undefined",
  "empty",
  "old",
  "server-only",
  "hardcoded",
  "redeployed",
  "not-redeployed",
  "no",
  "secret",
  "critical",
  "warning",
  "info",
  "none",
  "framework",
  "platform",
  "prefix",
  "location",
  "environment",
  "symptom",
  "changedRecently",
  "secretType",
  "composeText",
  "envText",
  "callerText",
  "calleeText",
  "select_change",
  "sample",
  "report",
  "commands",
  "snippet",
  "clipboard",
  "compose_env",
  "workflow_env",
  "local-cli",
  "ci",
  "pass",
  "warn",
  "fail"
]);

export function safeLabel(value: string | undefined, fallback = "unknown") {
  return value && allowed.has(value) ? value : fallback;
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;

  window.gtag?.("event", eventName, params);
  window.clarity?.("event", eventName);
}

export function trackCoreSubmit(actionId: string, inputType: string) {
  trackEvent("core_submit", {
    action_id: actionId,
    input_type: inputType
  });
}

export function trackCoreSuccess(actionId: string, resultType: string, findingCount: number) {
  trackEvent("core_success", {
    action_id: actionId,
    result_type: safeLabel(resultType),
    finding_count: findingCount
  });
}

export function trackCoreError(actionId: string, errorType: string) {
  trackEvent("core_error", {
    action_id: actionId,
    error_type: errorType
  });
}
