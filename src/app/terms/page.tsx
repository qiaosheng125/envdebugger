export const metadata = {
  title: "Terms"
};

export default function TermsPage() {
  return (
    <main className="simplePage">
      <a href="/" className="backLink">Back to checker</a>
      <h1>Terms</h1>
      <p>
        Vercel Env Checker provides troubleshooting guidance only. Verify
        changes against the official Next.js and Vercel documentation before
        deploying production systems.
      </p>
      <p>
        The tool does not guarantee that a deployment is secure, correct, or
        production-ready.
      </p>
    </main>
  );
}
