## 2025-06-09 - Add Missing Default Security Headers for SSR
**Vulnerability:** Missing security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`) in SSR HTML responses.
**Learning:** In a React Router v7 application using Cloudflare Workers, the default `entry.server.tsx` doesn't include common security headers by default. These headers must be manually added to the `responseHeaders` object before constructing the final `Response`.
**Prevention:** Always verify that fundamental security headers like `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY` are applied at the global entry point (`entry.server.tsx`) to protect all HTML responses across the application.

## 2026-07-21 - Add Missing HTTP Strict Transport Security (HSTS) Header for SSR
**Vulnerability:** Missing `Strict-Transport-Security` header in SSR HTML responses.
**Learning:** In a React Router v7 application, while some security headers might be present, HSTS might be missed. This exposes users to man-in-the-middle attacks if they initially request over HTTP or if TLS is somehow bypassed.
**Prevention:** Always include `Strict-Transport-Security` (`max-age=31536000; includeSubDomains`) along with other fundamental security headers in the global entry point (`entry.server.tsx`) to enforce HTTPS connections.
