import type { Metadata } from "next";
import DockerComposeEnvInterpolationApp from "./DockerComposeEnvInterpolationApp";
import { siteUrl } from "../site";

export const metadata: Metadata = {
  title: "Docker Compose Env Interpolation Checker | Vercel Env Checker",
  description:
    "Check Docker Compose ${VAR} interpolation, defaults, required markers, env_file boundaries, and missing .env names without pasting secret values.",
  alternates: {
    canonical: `${siteUrl}/docker-compose-env-interpolation`
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function Page() {
  return <DockerComposeEnvInterpolationApp />;
}
