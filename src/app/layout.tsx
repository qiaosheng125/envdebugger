import type { Metadata } from "next";
import { AnalyticsScripts } from "./analytics";
import { siteName, siteUrl } from "./site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vercel Env Checker - Next.js Environment Variable Debugger",
    template: `%s | ${siteName}`
  },
  description:
    "Find why your Next.js or Vercel environment variable is undefined, stale, missing, or only works locally. Get a safe checklist and copyable commands.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Vercel Env Checker",
    description:
      "A guided debug checklist for Next.js and Vercel environment variables.",
    url: siteUrl,
    siteName,
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Vercel Env Checker",
    description:
      "Debug undefined, stale, or missing Next.js and Vercel environment variables."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <AnalyticsScripts />
      </body>
    </html>
  );
}
