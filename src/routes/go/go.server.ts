// Loader da tela "Começar".
import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "../../lib/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	await requireUser(request, context);
	return Response.json({ ok: true });
}
