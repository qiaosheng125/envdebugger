import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const apexHost = "envdebugger.com";
const canonicalHost = "www.envdebugger.com";

export function proxy(request: NextRequest) {
  if (request.headers.get("host") !== apexHost) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.hostname = canonicalHost;

  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: "/:path*",
};
