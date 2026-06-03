const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const paths = ["/", "/about", "/contact", "/privacy", "/terms", "/robots.txt", "/sitemap.xml"];

for (const path of paths) {
  const response = await fetch(`${baseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  console.log(`${path} ${response.status}`);
}
