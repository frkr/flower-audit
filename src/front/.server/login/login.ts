// /login: gera state + cookie e redireciona para o consent screen do Google.
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import {
	buildStateCookie,
	getAuthConfig,
	getOptionalUser,
	isSecureRequest,
} from "../auth";
import randomHEX from "../../lib/randomHEX";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const SCOPES = "openid email profile";

export async function loader({ request, context }: LoaderFunctionArgs) {
	const existing = await getOptionalUser(request, context);
	const url = new URL(request.url);
	const redirectTo = url.searchParams.get("redirect") || "/";
	if (existing) throw redirect(redirectTo);

	const { clientId } = await getAuthConfig(context);
	if (!clientId) {
		return new Response("Auth não configurado: defina google_client_id em /setup", {
			status: 500,
		});
	}

	const state = await randomHEX(16);
	const callback = `${url.origin}/login/callback`;

	const auth = new URL(GOOGLE_AUTH);
	auth.searchParams.set("client_id", clientId);
	auth.searchParams.set("redirect_uri", callback);
	auth.searchParams.set("response_type", "code");
	auth.searchParams.set("scope", SCOPES);
	auth.searchParams.set("access_type", "online");
	auth.searchParams.set("prompt", "select_account");
	auth.searchParams.set("state", state);

	return new Response(null, {
		status: 302,
		headers: {
			Location: auth.toString(),
			"Set-Cookie": buildStateCookie(state, redirectTo, isSecureRequest(request)),
		},
	});
}
