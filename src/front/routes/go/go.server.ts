// Loader da tela "Go".
import type { LoaderFunctionArgs } from "react-router";
import { requireUser } from "../../auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	await requireUser(request, context);
	return Response.json({ ok: true });
}
