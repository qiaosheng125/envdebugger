import type { Metadata } from "next";
import EnvCheckerApp from "./EnvCheckerApp";

export const metadata: Metadata = {
  alternates: {
    canonical: "/"
  }
};

export default function HomePage() {
  return <EnvCheckerApp />;
}
