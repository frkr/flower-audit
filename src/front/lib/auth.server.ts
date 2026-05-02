// Autenticação: JWT (HS256 via Web Crypto) + cookies httpOnly + Google OAuth.
// Settings (client_id, client_secret, jwt_secret) ficam na tabela `settings`.
import type { AppLoadContext } from "react-router";
import { redirect } from "react-router";
import { db } from "./db.server";

export type SessionUser = {
	sub: string;
	email: string;
	name: string;
	picture?: string;
};

type JwtPayload = SessionUser & {
	iat: number;
	exp: number;
};

const COOKIE_NAME = "flower_session";
const STATE_COOKIE = "flower_oauth_state";
const DEFAULT_SESSION_TTL_HOURS = 6;

const PUBLIC_PATHS = new Set(["/landing", "/login", "/login/callback", "/logout"]);

function parseTtlSeconds(raw: string | undefined): number {
	const hours = Number(raw);
	if (!Number.isFinite(hours) || hours <= 0) return DEFAULT_SESSION_TTL_HOURS * 3600;
	return Math.floor(hours * 3600);
}

// ---------------- settings ----------------

export async function getSettings(
	context: AppLoadContext,
	names: string[]
): Promise<Record<string, string>> {
	const conn = db(context);
	const placeholders = names.map((_, i) => `?${i + 1}`).join(",");
	const stmt = `SELECT name, value FROM settings WHERE name IN (${placeholders})`;
	const { results } = await conn
		.prepare(stmt)
		.bind(...names)
		.all<{ name: string; value: string }>();
	const out: Record<string, string> = {};
	for (const r of results ?? []) out[r.name] = r.value;
	return out;
}

export async function getAuthConfig(context: AppLoadContext) {
	const s = await getSettings(context, [
		"google_client_id",
		"google_client_secret",
		"jwt_secret",
		"jwt_ttl_hours",
	]);
	return {
		clientId: s.google_client_id ?? "",
		clientSecret: s.google_client_secret ?? "",
		jwtSecret: s.jwt_secret ?? "",
		sessionTtlSeconds: parseTtlSeconds(s.jwt_ttl_hours),
	};
}

// ---------------- base64url ----------------

function b64urlEncode(input: string | Uint8Array): string {
	const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
	let str = "";
	for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
	return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecodeBytes(input: string): Uint8Array {
	const pad = "=".repeat((4 - (input.length % 4)) % 4);
	const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
	const bin = atob(b64);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

function b64urlDecodeString(input: string): string {
	return new TextDecoder().decode(b64urlDecodeBytes(input));
}

// ---------------- JWT ----------------

async function importHmacKey(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		usage
	);
}

export async function signJWT(
	user: SessionUser,
	secret: string,
	ttlSeconds: number = DEFAULT_SESSION_TTL_HOURS * 3600
): Promise<string> {
	const now = Math.floor(Date.now() / 1000);
	const payload: JwtPayload = { ...user, iat: now, exp: now + ttlSeconds };
	const header = { alg: "HS256", typ: "JWT" };
	const headerB64 = b64urlEncode(JSON.stringify(header));
	const payloadB64 = b64urlEncode(JSON.stringify(payload));
	const data = `${headerB64}.${payloadB64}`;
	const key = await importHmacKey(secret, ["sign"]);
	const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
	return `${data}.${b64urlEncode(new Uint8Array(sig))}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JwtPayload | null> {
	if (!token) return null;
	const parts = token.split(".");
	if (parts.length !== 3) return null;
	const [headerB64, payloadB64, sigB64] = parts;
	const data = `${headerB64}.${payloadB64}`;
	const key = await importHmacKey(secret, ["verify"]);
	const sig = b64urlDecodeBytes(sigB64);
	const ok = await crypto.subtle.verify(
		"HMAC",
		key,
		sig.buffer.slice(sig.byteOffset, sig.byteOffset + sig.byteLength) as ArrayBuffer,
		new TextEncoder().encode(data)
	);
	if (!ok) return null;
	try {
		const payload = JSON.parse(b64urlDecodeString(payloadB64)) as JwtPayload;
		if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
		return payload;
	} catch {
		return null;
	}
}

// ---------------- cookies ----------------

function parseCookies(request: Request): Record<string, string> {
	const header = request.headers.get("Cookie") ?? request.headers.get("cookie") ?? "";
	const out: Record<string, string> = {};
	for (const part of header.split(/;\s*/)) {
		if (!part) continue;
		const eq = part.indexOf("=");
		if (eq < 0) continue;
		const k = part.slice(0, eq).trim();
		const v = decodeURIComponent(part.slice(eq + 1).trim());
		if (k) out[k] = v;
	}
	return out;
}

export function readCookie(request: Request, name: string): string | undefined {
	return parseCookies(request)[name];
}

export function buildSessionCookie(
	token: string,
	secure: boolean,
	ttlSeconds: number = DEFAULT_SESSION_TTL_HOURS * 3600
): string {
	const flags = [
		`${COOKIE_NAME}=${encodeURIComponent(token)}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		`Max-Age=${ttlSeconds}`,
	];
	if (secure) flags.push("Secure");
	return flags.join("; ");
}

export function buildClearSessionCookie(secure: boolean): string {
	const flags = [
		`${COOKIE_NAME}=`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		"Max-Age=0",
	];
	if (secure) flags.push("Secure");
	return flags.join("; ");
}

export function buildStateCookie(state: string, redirectTo: string, secure: boolean): string {
	const value = `${state}:${encodeURIComponent(redirectTo)}`;
	const flags = [
		`${STATE_COOKIE}=${encodeURIComponent(value)}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		"Max-Age=600",
	];
	if (secure) flags.push("Secure");
	return flags.join("; ");
}

export function buildClearStateCookie(secure: boolean): string {
	const flags = [`${STATE_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
	if (secure) flags.push("Secure");
	return flags.join("; ");
}

export function readStateCookie(request: Request): { state: string; redirectTo: string } | null {
	const raw = readCookie(request, STATE_COOKIE);
	if (!raw) return null;
	const colon = raw.indexOf(":");
	if (colon < 0) return { state: raw, redirectTo: "/" };
	return { state: raw.slice(0, colon), redirectTo: decodeURIComponent(raw.slice(colon + 1)) };
}

// ---------------- helpers ----------------

export function isPublicPath(pathname: string): boolean {
	return PUBLIC_PATHS.has(pathname);
}

export function isSecureRequest(request: Request): boolean {
	const url = new URL(request.url);
	if (url.protocol === "https:") return true;
	const xfp = request.headers.get("x-forwarded-proto");
	return xfp === "https";
}

export async function getOptionalUser(
	request: Request,
	context: AppLoadContext
): Promise<SessionUser | null> {
	const token = readCookie(request, COOKIE_NAME);
	if (!token) return null;
	const { jwtSecret } = await getAuthConfig(context);
	if (!jwtSecret) return null;
	const payload = await verifyJWT(token, jwtSecret);
	if (!payload) return null;
	return { sub: payload.sub, email: payload.email, name: payload.name, picture: payload.picture };
}

export async function requireUser(
	request: Request,
	context: AppLoadContext
): Promise<SessionUser> {
	const user = await getOptionalUser(request, context);
	if (user) return user;
	const url = new URL(request.url);
	const back = url.pathname + url.search;
	throw redirect(`/landing?redirect=${encodeURIComponent(back)}`);
}
