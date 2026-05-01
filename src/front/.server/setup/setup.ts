// CRUD simples de configurações chave/valor. SQL em ./database.json.
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { db } from "../db";
import randomHEX from "../../lib/randomHEX";
import queries from "./database.json";

export type Setting = { id: string; name: string; value: string; description: string; updated_at: string };

export async function loader({ context }: LoaderFunctionArgs) {
	const { results } = await db(context).prepare(queries.list).all<Setting>();
	return Response.json({ items: results ?? [] });
}

export async function action({ request, context }: ActionFunctionArgs) {
	const conn = db(context);
	const form = await request.formData();
	const intent = String(form.get("intent") ?? "upsert");

	if (intent === "delete") {
		const id = String(form.get("id") ?? "");
		if (!id) return Response.json({ ok: false }, { status: 422 });
		await conn.prepare(queries.deleteById).bind(id).run();
		return Response.json({ ok: true });
	}

	const id = String(form.get("id") ?? "").trim();
	const name = String(form.get("name") ?? "").trim();
	const value = String(form.get("value") ?? "");
	const description = String(form.get("description") ?? "");
	if (!name) return Response.json({ ok: false, error: "name required" }, { status: 422 });

	if (id) {
		await conn.prepare(queries.updateById).bind(name, value, description, id).run();
	} else {
		await conn.prepare(queries.upsertByName).bind(await randomHEX(16), name, value, description).run();
	}
	return Response.json({ ok: true });
}
