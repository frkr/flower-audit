// Acesso ao D1 via context Cloudflare.
import type { AppLoadContext } from "react-router";

export function db(context: AppLoadContext) {
	const env = context?.cloudflare?.env;
	if (!env || !env.DB) {
		throw new Error("D1 binding 'DB' not available");
	}
	return env.DB;
}

export function r2(context: AppLoadContext) {
	const env = context?.cloudflare?.env;
	if (!env || !env.FLOWER) {
		throw new Error("R2 binding 'FLOWER' not available");
	}
	return env.FLOWER;
}
