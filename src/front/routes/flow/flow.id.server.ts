// Detalhe / atualização / exclusão de um fluxo.
// Cada operação é uma intent independente — passos são manipulados um a um
// (addStep / renameStep / removeStep) para evitar a duplicação de registros
// que o padrão "desativar todos e reinserir" causava. SQL em ./database.json.
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { db } from "../../lib/db.server";
import { requireUser } from "../../lib/auth.server";
import randomHEX from "../../lib/randomHEX";
import queries from "./database.json";

export async function loader({ request, params, context }: LoaderFunctionArgs) {
	await requireUser(request, context);
	const id = String(params.id);
	const conn = db(context);
	const row = await conn.prepare(queries.getById).bind(id).first();
	if (!row) throw new Response("Não encontrado", { status: 404 });
	const { results: steps } = await conn.prepare(queries.listSteps).bind(id).all();
	return Response.json({ flux: row, steps });
}

export async function action({ request, params, context }: ActionFunctionArgs) {
	const user = await requireUser(request, context);
	const id = String(params.id);
	const conn = db(context);
	const form = await request.formData();
	const intent = String(form.get("intent") ?? "updateFlux");

	if (intent === "delete") {
		await conn.prepare(queries.deactivate).bind(id).run();
		await conn.prepare(queries.insertAuthor).bind(await randomHEX(16), id, user.email).run();
		return redirect("/flow");
	}

	if (intent === "updateFlux") {
		const name = String(form.get("name") ?? "").trim();
		const description = String(form.get("description") ?? "").trim();
		if (!name) return Response.json({ ok: false, error: "name required" }, { status: 422 });
		await conn.prepare(queries.update).bind(name, description, id).run();
		await conn.prepare(queries.insertAuthor).bind(await randomHEX(16), id, user.email).run();
		return Response.json({ ok: true });
	}

	if (intent === "addStep") {
		const name = String(form.get("name") ?? "").trim();
		if (!name) return Response.json({ ok: false, error: "name required" }, { status: 422 });
		const max = await conn.prepare(queries.maxStepOrder).bind(id).first<{ m: number }>();
		const nextOrder = (max?.m ?? -1) + 1;
		await conn.prepare(queries.insertStep).bind(await randomHEX(16), id, nextOrder, name).run();
		await conn.prepare(queries.touchFlux).bind(id).run();
		await conn.prepare(queries.insertAuthor).bind(await randomHEX(16), id, user.email).run();
		return Response.json({ ok: true });
	}

	if (intent === "renameStep") {
		const stepId = String(form.get("stepId") ?? "");
		const name = String(form.get("name") ?? "").trim();
		if (!stepId || !name) return Response.json({ ok: false, error: "stepId/name required" }, { status: 422 });
		await conn.prepare(queries.updateStep).bind(name, stepId, id).run();
		await conn.prepare(queries.touchFlux).bind(id).run();
		await conn.prepare(queries.insertAuthor).bind(await randomHEX(16), id, user.email).run();
		return Response.json({ ok: true });
	}

	if (intent === "removeStep") {
		const stepId = String(form.get("stepId") ?? "");
		if (!stepId) return Response.json({ ok: false, error: "stepId required" }, { status: 422 });
		await conn.prepare(queries.deactivateStep).bind(stepId, id).run();
		await conn.prepare(queries.touchFlux).bind(id).run();
		await conn.prepare(queries.insertAuthor).bind(await randomHEX(16), id, user.email).run();
		return Response.json({ ok: true });
	}

	return Response.json({ ok: false, error: "unknown intent" }, { status: 400 });
}
