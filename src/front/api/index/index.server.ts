// Backend do entrypoint principal de API.
// Roteia chamadas internas e devolve metadata simples.
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { requireUser } from "../../auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	await requireUser(request, context);
	const cf = context.cloudflare;
	const version = cf?.env?.CF_VERSION_METADATA?.id ?? "dev";
	return Response.json({
		ok: true,
		service: "flower-audit",
		version,
	});
}

export async function action({ request, context }: ActionFunctionArgs) {
	await requireUser(request, context);
	return Response.json(
		{ ok: false, error: "method not allowed" },
		{ status: 405, headers: { "Content-Type": "application/json" } }
	);
}
