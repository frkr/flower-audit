// CRUD de Processos — listagem paginada, criação, exclusão, "iniciar a partir de fluxo".
// SQL em ./database.json (regra do AGENTS.md).
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { db } from "../db";
import { requireUser } from "../auth";
import randomHEX from "../../lib/randomHEX";
import queries from "./database.json";

const PAGE_SIZE = 10;

export type ProcessRow = {
	id: string;
	id_fluxo: string | null;
	name: string;
	description: string;
	created_at: string;
	updated_at: string;
};

export async function loader({ request, context }: LoaderFunctionArgs) {
	await requireUser(request, context);
	const url = new URL(request.url);
	const q = (url.searchParams.get("q") ?? "").trim();
	const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
	const offset = (page - 1) * PAGE_SIZE;
	const conn = db(context);

	const list = q
		? await conn.prepare(queries.listSearch).bind(`%${q}%`, PAGE_SIZE, offset).all<ProcessRow>()
		: await conn.prepare(queries.listAll).bind(PAGE_SIZE, offset).all<ProcessRow>();

	const total = q
		? await conn.prepare(queries.countSearch).bind(`%${q}%`).first<{ c: number }>()
		: await conn.prepare(queries.countAll).first<{ c: number }>();

	const fluxList = await conn.prepare(queries.listFluxes).all<{ id: string; name: string }>();

	return Response.json({
		q,
		page,
		pageSize: PAGE_SIZE,
		total: total?.c ?? 0,
		items: list.results ?? [],
		fluxes: fluxList.results ?? [],
	});
}

export async function action({ request, context }: ActionFunctionArgs) {
	await requireUser(request, context);
	const conn = db(context);
	const form = await request.formData();
	const intent = String(form.get("intent") ?? "");

	if (intent === "create") {
		const id = await randomHEX(16);
		const name = String(form.get("name") ?? "").trim();
		const description = String(form.get("description") ?? "").trim();
		const idFluxo = String(form.get("id_fluxo") ?? "").trim() || null;
		if (!name) return Response.json({ ok: false, error: "name required" }, { status: 422 });
		await conn.prepare(queries.insert).bind(id, idFluxo, name, description).run();
		return Response.json({ ok: true, id });
	}

	if (intent === "startFromFlow") {
		const idFluxo = String(form.get("id_fluxo") ?? "").trim();
		if (!idFluxo) return Response.json({ ok: false, error: "id_fluxo required" }, { status: 422 });

		const flux = await conn
			.prepare(queries.getFluxForStart)
			.bind(idFluxo)
			.first<{ id: string; name: string; description: string }>();
		if (!flux) return Response.json({ ok: false, error: "flux not found" }, { status: 404 });

		const { results: fluxSteps } = await conn
			.prepare(queries.listFluxStepsForStart)
			.bind(idFluxo)
			.all<{ id_order: number; name: string }>();

		const newId = await randomHEX(16);
		const stamp = new Date().toISOString().replace("T", " ").slice(0, 19);
		const procName = `${flux.name} — ${stamp}`;
		await conn.prepare(queries.insert).bind(newId, idFluxo, procName, flux.description).run();

		for (const s of fluxSteps ?? []) {
			await conn
				.prepare(queries.insertStepFromFlux)
				.bind(await randomHEX(16), s.id_order, newId, idFluxo, s.name)
				.run();
		}

		return redirect(`/process/${newId}`);
	}

	if (intent === "delete") {
		const id = String(form.get("id") ?? "");
		if (!id) return Response.json({ ok: false }, { status: 422 });
		await conn.prepare(queries.deactivate).bind(id).run();
		return Response.json({ ok: true });
	}

	return Response.json({ ok: false, error: "unknown intent" }, { status: 400 });
}
