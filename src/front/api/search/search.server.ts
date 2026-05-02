// Busca: primeiro 10 em flux, depois 10 em process. SQL em ./database.json (regra do AGENTS.md).
import type { LoaderFunctionArgs } from "react-router";
import { db } from "../../db.server";
import { requireUser } from "../../auth.server";
import queries from "./database.json";

type Hit = { id: string; name: string; description: string; kind: "flux" | "process" };

export async function loader({ context, request }: LoaderFunctionArgs) {
	await requireUser(request, context);
	const url = new URL(request.url);
	const q = (url.searchParams.get("q") ?? "").trim();
	const phase = url.searchParams.get("phase") === "process" ? "process" : "flux";

	if (!q) {
		return Response.json({ q, phase, hits: [] as Hit[] });
	}

	const like = `%${q}%`;
	const conn = db(context);
	let hits: Hit[] = [];

	if (phase === "flux") {
		const { results } = await conn
			.prepare(queries.searchFlux)
			.bind(like)
			.all<{ id: string; name: string; description: string }>();
		hits = (results ?? []).map((r) => ({ ...r, kind: "flux" as const }));
	} else {
		const { results } = await conn
			.prepare(queries.searchProcess)
			.bind(like)
			.all<{ id: string; name: string; description: string }>();
		hits = (results ?? []).map((r) => ({ ...r, kind: "process" as const }));
	}

	return Response.json({ q, phase, hits });
}
