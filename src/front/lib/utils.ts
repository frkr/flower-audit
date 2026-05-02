export function cn(...classes: (string | undefined | null | false | 0)[]): string {
	return classes.filter(Boolean).join(" ");
}

/**
 * Basic HTML sanitization to prevent XSS.
 * Removes <script> tags, on* attributes, and dangerous URI schemes.
 */
export function sanitizeHtml(html: string): string {
	if (!html) return "";
	return html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, "")
		.replace(/(href|src|action|data|formaction)\s*=\s*("[^"]*(javascript|data|vbscript):[^"]*"|'[^']*(javascript|data|vbscript):[^']*'|[^\s>]* (javascript|data|vbscript):[^\s>]*)/gi, "$1=\"#\"");
}
