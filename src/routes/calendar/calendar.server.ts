// Calendário: agrupa contagem de fluxos iniciados (=process criado) por data.
// SQL em ./database.json (regra do AGENTS.md).
import type { LoaderFunctionArgs } from "react-router";
import { db } from "../../lib/db.server";
import { requireUser } from "../../lib/auth.server";
import queries from "./database.json";

export async function loader({ context, request }: LoaderFunctionArgs) {
	await requireUser(request, context);
	const url = new URL(request.url);
	const year = Number(url.searchParams.get("year")) || new Date().getUTCFullYear();
	const month = Number(url.searchParams.get("month")) || new Date().getUTCMonth() + 1;

	const start = `${year}-${String(month).padStart(2, "0")}-01`;
	const next = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;

	const { results } = await db(context)
		.prepare(queries.countByDay)
		.bind(start, next)
		.all<{ day: string; total: number }>();

	return Response.json({ year, month, days: results ?? [] });
}
