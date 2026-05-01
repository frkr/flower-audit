// Backend do entrypoint principal de API.
// Roteia chamadas internas e devolve metadata simples.
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

export async function loader({ context }: LoaderFunctionArgs) {
	const cf = context.cloudflare;
	const version = cf?.env?.CF_VERSION_METADATA?.id ?? "dev";
	return Response.json({
		ok: true,
		service: "flower-audit",
		version,
	});
}

export async function action({ request }: ActionFunctionArgs) {
	return Response.json(
		{ ok: false, error: "method not allowed" },
		{ status: 405, headers: { "Content-Type": "application/json" } }
	);
}
