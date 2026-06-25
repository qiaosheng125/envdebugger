import type { Metadata } from "next";
import { siteUrl } from "../site";
import TerraformTfvarsVariablePreflightApp from "./TerraformTfvarsVariablePreflightApp";

export const metadata: Metadata = {
  title: "Terraform Tfvars Variable Preflight | Vercel Env Checker",
  description:
    "Compare Terraform variable declarations with tfvars assignment names, missing required variables, unknown keys, duplicate names, and secret-like boundaries without pasting values.",
  alternates: {
    canonical: `${siteUrl}/terraform-tfvars-variable-preflight`
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function Page() {
  return <TerraformTfvarsVariablePreflightApp />;
}
