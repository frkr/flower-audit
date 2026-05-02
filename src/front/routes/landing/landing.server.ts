// Loader público da tela de boas-vindas (/landing).
// Não exige autenticação — esta é a página que recebe o usuário deslogado
// e também o visitante que ainda não fez login pela primeira vez.
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getOptionalUser, getSettings } from "../../auth.server";

function sanitizeRedirect(raw: string | null): string {
	if (!raw) return "/";
	if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
	if (raw === "/landing" || raw.startsWith("/landing?")) return "/";
	return raw;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const redirectTo = sanitizeRedirect(url.searchParams.get("redirect"));
	const user = await getOptionalUser(request, context);
	if (user) throw redirect(redirectTo);
	const s = await getSettings(context, ["system_name"]);
	const systemName = s.system_name?.trim() || "Flower";
	return Response.json({ systemName, redirectTo });
}
