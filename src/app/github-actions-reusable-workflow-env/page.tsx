import type { Metadata } from "next";
import GitHubActionsReusableWorkflowEnvApp from "./GitHubActionsReusableWorkflowEnvApp";
import { siteUrl } from "../site";

export const metadata: Metadata = {
  title: "GitHub Actions Reusable Workflow Env Checker | Vercel Env Checker",
  description:
    "Compare a reusable workflow_call contract with caller with and secrets mappings without connecting to GitHub or collecting tokens.",
  alternates: {
    canonical: `${siteUrl}/github-actions-reusable-workflow-env`
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function Page() {
  return <GitHubActionsReusableWorkflowEnvApp />;
}
