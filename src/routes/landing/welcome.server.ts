// Loader da tela de boas-vindas (index "/").
// Lista os 10 fluxos e 10 processos mais recentes.
import type { LoaderFunctionArgs } from "react-router";
import { db } from "../../lib/db.server";
import { requireUser } from "../../lib/auth.server";
import queries from "./database.json";

export type RecentRow = {
	id: string;
	name: string;
	description: string;
	updated_at: string;
};

export async function loader({ request, context }: LoaderFunctionArgs) {
	await requireUser(request, context);
	const conn = db(context);
	const [fluxes, processes] = await Promise.all([
		conn.prepare(queries.listRecentFluxes).all<RecentRow>(),
		conn.prepare(queries.listRecentProcesses).all<RecentRow>(),
	]);
	return Response.json({
		fluxes: fluxes.results ?? [],
		processes: processes.results ?? [],
	});
}
