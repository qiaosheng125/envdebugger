import type { MetadataRoute } from "next";
import { siteUrl } from "./site";

const routes = [
  "",
  "/docker-compose-env-interpolation",
  "/github-actions-reusable-workflow-env",
  "/terraform-tfvars-variable-preflight",
  "/about",
  "/contact",
  "/privacy",
  "/terms"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.includes("env") ? 0.75 : 0.5
  }));
}
