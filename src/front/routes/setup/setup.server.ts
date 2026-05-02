// CRUD simples de configurações chave/valor. SQL em ./database.json.
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { db } from "../../lib/db.server";
import { requireUser } from "../../lib/auth.server";
import randomHEX from "../../lib/randomHEX";
import queries from "./database.json";

export type Setting = { id: string; name: string; value: string; description: string; updated_at: string };

export type VersionInfo = {
	id?: string;
	tag?: string;
	timestamp?: string;
};

export async function loader({ request, context }: LoaderFunctionArgs) {
	await requireUser(request, context);
	const { results } = await db(context).prepare(queries.list).all<Setting>();

	const items = (results ?? []).map((item) => ({
		...item,
		value:
			/secret/i.test(item.name) && item.value
				? "*".repeat(Math.max(item.value.length, 8))
				: item.value,
	}));

	const v = context?.cloudflare?.env?.CF_VERSION_METADATA;
	const version: VersionInfo = {
		id: v?.id,
		tag: v?.tag,
		timestamp: v?.timestamp,
	};
	return Response.json({ items, version });
}

export async function action({ request, context }: ActionFunctionArgs) {
	const user = await requireUser(request, context);
	const conn = db(context);
	const form = await request.formData();
	const intent = String(form.get("intent") ?? "upsert");

	if (intent === "delete") {
		const id = String(form.get("id") ?? "");
		if (!id) return Response.json({ ok: false }, { status: 422 });
		await conn.prepare(queries.insertAuthor).bind(await randomHEX(16), id, user.email).run();
		await conn.prepare(queries.deleteById).bind(id).run();
		return Response.json({ ok: true });
	}

	const id = String(form.get("id") ?? "").trim();
	const name = String(form.get("name") ?? "").trim();
	const value = String(form.get("value") ?? "");
	const description = String(form.get("description") ?? "");
	if (!name) return Response.json({ ok: false, error: "name required" }, { status: 422 });

	if (id) {
		if (!value && /secret/i.test(name)) {
			await conn.prepare(queries.updateByIdKeepValue).bind(name, description, id).run();
		} else {
			await conn.prepare(queries.updateById).bind(name, value, description, id).run();
		}
		await conn.prepare(queries.insertAuthor).bind(await randomHEX(16), id, user.email).run();
	} else {
		const newId = await randomHEX(16);
		await conn.prepare(queries.upsertByName).bind(newId, name, value, description).run();
		await conn.prepare(queries.insertAuthor).bind(await randomHEX(16), newId, user.email).run();
	}
	return Response.json({ ok: true });
}
