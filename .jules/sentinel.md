## 2025-06-02 - Added global security headers for SSR responses
**Vulnerability:** The application was missing basic global security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`).
**Learning:** React Router v7 SSR applications allow configuring global response headers in `src/entry.server.tsx` inside `handleRequest`.
**Prevention:** Always ensure standard security headers are added to the headers object in the main SSR entry point before creating the HTML `Response`.
