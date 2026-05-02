// /login/callback: troca code por token, busca userinfo, emite JWT no cookie.
import type { LoaderFunctionArgs } from "react-router";
import {
	buildClearStateCookie,
	buildSessionCookie,
	getAuthConfig,
	isLocalRedirect,
	isSecureRequest,
	readStateCookie,
	signJWT,
	type SessionUser,
} from "../../lib/auth.server";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

type GoogleTokenResponse = {
	access_token?: string;
	id_token?: string;
	error?: string;
	error_description?: string;
};

type GoogleUserInfo = {
	sub: string;
	email: string;
	email_verified?: boolean;
	name?: string;
	picture?: string;
};

export async function loader({ request, context }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const errorParam = url.searchParams.get("error");
	const secure = isSecureRequest(request);

	if (errorParam) {
		return new Response(`OAuth error: ${errorParam}`, {
			status: 400,
			headers: { "Set-Cookie": buildClearStateCookie(secure) },
		});
	}
	if (!code || !state) {
		return new Response("Missing code/state", {
			status: 400,
			headers: { "Set-Cookie": buildClearStateCookie(secure) },
		});
	}

	const stored = readStateCookie(request);
	if (!stored || stored.state !== state) {
		return new Response("State mismatch", {
			status: 400,
			headers: { "Set-Cookie": buildClearStateCookie(secure) },
		});
	}

	const { clientId, clientSecret, jwtSecret, sessionTtlSeconds } = await getAuthConfig(context);
	if (!clientId || !clientSecret || !jwtSecret) {
		return new Response("Auth não configurado: defina google_client_id, google_client_secret e jwt_secret em /setup", {
			status: 500,
		});
	}

	const callback = `${url.origin}/login/callback`;
	const tokenRes = await fetch(TOKEN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			code,
			client_id: clientId,
			client_secret: clientSecret,
			redirect_uri: callback,
			grant_type: "authorization_code",
		}),
	});

	const tokenJson = (await tokenRes.json()) as GoogleTokenResponse;
	if (!tokenRes.ok || !tokenJson.access_token) {
		return new Response(
			`Falha ao trocar code: ${tokenJson.error_description || tokenJson.error || "desconhecido"}`,
			{ status: 400, headers: { "Set-Cookie": buildClearStateCookie(secure) } }
		);
	}

	const infoRes = await fetch(USERINFO_URL, {
		headers: { Authorization: `Bearer ${tokenJson.access_token}` },
	});
	if (!infoRes.ok) {
		return new Response("Falha ao obter perfil do Google", {
			status: 400,
			headers: { "Set-Cookie": buildClearStateCookie(secure) },
		});
	}
	const info = (await infoRes.json()) as GoogleUserInfo;
	if (!info.email || (info.email_verified !== undefined && !info.email_verified)) {
		return new Response("Email não verificado", { status: 403 });
	}

	const user: SessionUser = {
		sub: info.sub,
		email: info.email,
		name: info.name ?? info.email,
		picture: info.picture,
	};
	const jwt = await signJWT(user, jwtSecret, sessionTtlSeconds);

	const headers = new Headers();
	headers.append("Set-Cookie", buildSessionCookie(jwt, secure, sessionTtlSeconds));
	headers.append("Set-Cookie", buildClearStateCookie(secure));

	let finalRedirect = stored.redirectTo || "/";
	if (!isLocalRedirect(finalRedirect)) finalRedirect = "/";

	headers.set("Location", finalRedirect);
	return new Response(null, { status: 302, headers });
}
