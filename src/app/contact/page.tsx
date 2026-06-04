import { supportEmail } from "../site";

export const metadata = {
  title: "Contact",
  alternates: {
    canonical: "/contact"
  }
};

export default function ContactPage() {
  return (
    <main className="simplePage">
      <a href="/" className="backLink">Back to checker</a>
      <h1>Contact</h1>
      {supportEmail ? (
        <p>
          Send bug reports, incorrect checklist results, and missing environment
          variable cases to <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
        </p>
      ) : (
        <p>
          This local MVP does not have a public support mailbox yet. A real
          support address will be configured after a domain is approved.
        </p>
      )}
    </main>
  );
}
