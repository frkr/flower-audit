// Detalhe/atualização/exclusão de um fluxo. SQL em ./database.json.
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { db } from "../db";
import { requireUser } from "../auth";
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
	await requireUser(request, context);
	const id = String(params.id);
	const conn = db(context);
	const form = await request.formData();
	const intent = String(form.get("intent") ?? "update");

	if (intent === "delete") {
		await conn.prepare(queries.deactivate).bind(id).run();
		return redirect("/flow");
	}

	const name = String(form.get("name") ?? "").trim();
	const description = String(form.get("description") ?? "").trim();
	if (!name) return Response.json({ ok: false, error: "name required" }, { status: 422 });

	await conn.prepare(queries.update).bind(name, description, id).run();
	await conn.prepare(queries.deleteSteps).bind(id).run();

	const steps = form.getAll("step").map(String).filter((s) => s.trim());
	for (let i = 0; i < steps.length; i++) {
		await conn.prepare(queries.insertStep).bind(await randomHEX(16), id, i, steps[i]).run();
	}
	return Response.json({ ok: true });
}
