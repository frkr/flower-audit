// Loader público da tela de boas-vindas (/landing).
// Não exige autenticação — esta é a página que recebe o usuário deslogado
// e também o visitante que ainda não fez login pela primeira vez.
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getOptionalUser, getSettings, sanitizeRedirect } from "../../lib/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const redirectTo = sanitizeRedirect(url.searchParams.get("redirect"));
	const user = await getOptionalUser(request, context);
	if (user) throw redirect(redirectTo);
	const s = await getSettings(context, ["system_name"]);
	const systemName = s.system_name?.trim() || "Flower";
	return Response.json({ systemName, redirectTo });
}
