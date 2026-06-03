export const metadata = {
  title: "About"
};

export default function AboutPage() {
  return (
    <main className="simplePage">
      <a href="/" className="backLink">Back to checker</a>
      <h1>About Vercel Env Checker</h1>
      <p>
        Vercel Env Checker is a guided troubleshooting tool for common Next.js
        and Vercel environment variable issues.
      </p>
      <p>
        It does not ask for secrets, connect to your Vercel account, or store
        values. It turns your symptom into a safe checklist and copyable
        commands.
      </p>
    </main>
  );
}
