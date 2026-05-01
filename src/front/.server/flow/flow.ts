// CRUD de Fluxos — listagem com paginação 10/pesquisa.png, criação, atualização, exclusão.
// SQL em ./database.json (regra do AGENTS.md).
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { db } from "../db";
import randomHEX from "../../lib/randomHEX";
import queries from "./database.json";

const PAGE_SIZE = 10;

export type FluxRow = {
	id: string;
	name: string;
	description: string;
	created_at: string;
	updated_at: string;
};

export async function loader({ request, context }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const q = (url.searchParams.get("q") ?? "").trim();
	const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
	const offset = (page - 1) * PAGE_SIZE;
	const conn = db(context);

	const list = q
		? await conn.prepare(queries.listSearch).bind(`%${q}%`, PAGE_SIZE, offset).all<FluxRow>()
		: await conn.prepare(queries.listAll).bind(PAGE_SIZE, offset).all<FluxRow>();

	const total = q
		? await conn.prepare(queries.countSearch).bind(`%${q}%`).first<{ c: number }>()
		: await conn.prepare(queries.countAll).first<{ c: number }>();

	return Response.json({
		q,
		page,
		pageSize: PAGE_SIZE,
		total: total?.c ?? 0,
		items: list.results ?? [],
	});
}

export async function action({ request, context }: ActionFunctionArgs) {
	const conn = db(context);
	const form = await request.formData();
	const intent = String(form.get("intent") ?? "");

	if (intent === "create") {
		const id = await randomHEX(16);
		const name = String(form.get("name") ?? "").trim();
		const description = String(form.get("description") ?? "").trim();
		if (!name) return Response.json({ ok: false, error: "name required" }, { status: 422 });
		await conn.prepare(queries.insert).bind(id, name, description).run();
		const steps = form.getAll("step").map(String).filter((s) => s.trim());
		for (let i = 0; i < steps.length; i++) {
			await conn.prepare(queries.insertStep).bind(await randomHEX(16), id, i, steps[i]).run();
		}
		return Response.json({ ok: true, id });
	}

	if (intent === "delete") {
		const id = String(form.get("id") ?? "");
		if (!id) return Response.json({ ok: false }, { status: 422 });
		await conn.prepare(queries.deactivate).bind(id).run();
		return Response.json({ ok: true });
	}

	return Response.json({ ok: false, error: "unknown intent" }, { status: 400 });
}
