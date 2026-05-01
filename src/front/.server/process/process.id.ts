// Detalhe de processo + wizard. SQL em ./database.json.
// Cada passo é editável apenas enquanto completed_at IS NULL.
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { db } from "../db";
import { requireUser } from "../auth";
import randomHEX from "../../lib/randomHEX";
import queries from "./database.json";

export type StepRow = {
	id: string;
	id_order: number;
	name: string;
	content: string;
	completed_at: string | null;
};

export type FileRow = {
	id: string;
	id_step: string;
	name: string;
	description: string;
	finder: string;
	mime_type: string;
	size_bytes: number;
	is_image: number;
	uploaded_at: string;
};

type ProcessRow = { id: string; id_fluxo: string | null };

async function recordProcessAuthor(
	conn: D1Database,
	processId: string,
	idFluxo: string | null,
	email: string
) {
	await conn
		.prepare(queries.insertProcessAuthor)
		.bind(await randomHEX(16), processId, idFluxo, email)
		.run();
}

async function recordStepAuthor(
	conn: D1Database,
	stepId: string,
	idFluxo: string | null,
	email: string
) {
	await conn
		.prepare(queries.insertStepAuthor)
		.bind(await randomHEX(16), stepId, idFluxo, email)
		.run();
}

export async function loader({ request, params, context }: LoaderFunctionArgs) {
	await requireUser(request, context);
	const id = String(params.id);
	const conn = db(context);
	const row = await conn.prepare(queries.getById).bind(id).first();
	if (!row) throw new Response("Não encontrado", { status: 404 });
	const { results: steps } = await conn.prepare(queries.listSteps).bind(id).all<StepRow>();
	const { results: fluxes } = await conn
		.prepare(queries.listFluxes)
		.all<{ id: string; name: string }>();
	const { results: files } = await conn
		.prepare(queries.listFilesByProcess)
		.bind(id)
		.all<FileRow>();
	return Response.json({
		process: row,
		steps: steps ?? [],
		fluxes: fluxes ?? [],
		files: files ?? [],
	});
}

export async function action({ request, params, context }: ActionFunctionArgs) {
	const user = await requireUser(request, context);
	const id = String(params.id);
	const conn = db(context);
	const form = await request.formData();
	const intent = String(form.get("intent") ?? "");

	const proc = await conn
		.prepare(queries.getById)
		.bind(id)
		.first<ProcessRow>();
	const idFluxo = proc?.id_fluxo ?? null;

	if (intent === "delete") {
		await conn.prepare(queries.deactivate).bind(id).run();
		await recordProcessAuthor(conn, id, idFluxo, user.email);
		return redirect("/process");
	}

	if (intent === "updateMeta") {
		const name = String(form.get("name") ?? "").trim();
		const description = String(form.get("description") ?? "").trim();
		if (!name) return Response.json({ ok: false, error: "name required" }, { status: 422 });
		await conn.prepare(queries.updateMeta).bind(name, description, id).run();
		await recordProcessAuthor(conn, id, idFluxo, user.email);
		return Response.json({ ok: true });
	}

	if (intent === "saveDraft" || intent === "completeStep") {
		const stepId = String(form.get("step_id") ?? "");
		const content = String(form.get("content") ?? "");
		if (!stepId) return Response.json({ ok: false, error: "step_id required" }, { status: 422 });
		const sql = intent === "completeStep" ? queries.completeStep : queries.saveStepDraft;
		const res = await conn.prepare(sql).bind(content, stepId, id).run();
		if (!res.meta || (res.meta as { changes?: number }).changes === 0) {
			return Response.json(
				{ ok: false, error: "step is already completed or not found" },
				{ status: 409 }
			);
		}
		await conn.prepare(queries.touchProcess).bind(id).run();
		await recordStepAuthor(conn, stepId, idFluxo, user.email);
		return redirect(`/process/${id}`);
	}

	if (intent === "reopenStep") {
		const stepId = String(form.get("step_id") ?? "");
		if (!stepId) return Response.json({ ok: false, error: "step_id required" }, { status: 422 });
		await conn.prepare(queries.reopenStep).bind(stepId, id).run();
		await conn.prepare(queries.touchProcess).bind(id).run();
		await recordStepAuthor(conn, stepId, idFluxo, user.email);
		return redirect(`/process/${id}`);
	}

	return Response.json({ ok: false, error: "unknown intent" }, { status: 400 });
}
