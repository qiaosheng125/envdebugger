export const metadata = {
  title: "Privacy Policy",
  alternates: {
    canonical: "/privacy"
  }
};

export default function PrivacyPage() {
  return (
    <main className="simplePage">
      <a href="/" className="backLink">Back to checker</a>
      <h1>Privacy Policy</h1>
      <p>
        This MVP runs the checklist in your browser. Do not paste real API keys,
        tokens, passwords, database URLs, or other secrets into the tool.
      </p>
      <p>
        The diagnostic form is designed to ask about variable patterns and
        symptoms, not secret values.
      </p>
    </main>
  );
}
