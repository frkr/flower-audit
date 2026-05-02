// Resource route /api/files: upload (POST), download (GET), delete (DELETE).
// Os bytes vão para o R2 (binding FLOWER) e o metadata para D1 (tabela process_step_files).
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { db, r2 } from "../../lib/db.server";
import { requireUser } from "../../lib/auth.server";
import randomHEX from "../../lib/randomHEX";
import queries from "./database.json";

const MAX_BYTES = 25 * 1024 * 1024;
const HEX_RE = /^[0-9a-f]+$/i;

function isValidHex(id: string): boolean {
	return id.length > 0 && HEX_RE.test(id);
}

type FileRow = {
	id: string;
	id_step: string;
	id_process: string;
	name: string;
	finder: string;
	mime_type: string;
	size_bytes: number;
	is_image: number;
};

function isImageMime(mime: string) {
	return /^image\//i.test(mime);
}

export async function loader({ request, context }: LoaderFunctionArgs) {
	await requireUser(request, context);
	const url = new URL(request.url);
	const id = url.searchParams.get("id");
	const stepId = url.searchParams.get("step_id");
	const conn = db(context);

	if (id) {
		const row = await conn.prepare(queries.getById).bind(id).first<FileRow>();
		if (!row) return new Response("Not found", { status: 404 });
		const obj = await r2(context).get(row.finder);
		if (!obj) return new Response("Not found in storage", { status: 404 });
		const headers = new Headers();
		headers.set("Content-Type", row.mime_type || "application/octet-stream");
		headers.set("Content-Length", String(row.size_bytes || 0));
		const dispo = url.searchParams.get("download") === "1" ? "attachment" : "inline";
		headers.set("Content-Disposition", `${dispo}; filename="${encodeURIComponent(row.name)}"`);
		headers.set("Cache-Control", "private, max-age=3600");
		return new Response(obj.body, { headers });
	}

	if (stepId) {
		const { results } = await conn.prepare(queries.listByStep).bind(stepId).all<FileRow & { uploaded_at: string; description: string }>();
		return Response.json({ files: results ?? [] });
	}

	return Response.json({ ok: false, error: "id or step_id required" }, { status: 400 });
}

export async function action({ request, context }: ActionFunctionArgs) {
	await requireUser(request, context);
	const conn = db(context);
	const bucket = r2(context);

	if (request.method === "DELETE") {
		const url = new URL(request.url);
		const id = url.searchParams.get("id");
		if (!id) return Response.json({ ok: false, error: "id required" }, { status: 400 });
		const row = await conn.prepare(queries.getById).bind(id).first<FileRow>();
		if (!row) return Response.json({ ok: false, error: "not found" }, { status: 404 });
		await bucket.delete(row.finder);
		await conn.prepare(queries.deactivateById).bind(id).run();
		return Response.json({ ok: true });
	}

	if (request.method === "POST") {
		const form = await request.formData();
		const intent = String(form.get("intent") ?? "upload");

		if (intent === "delete") {
			const id = String(form.get("id") ?? "");
			if (!id) return Response.json({ ok: false, error: "id required" }, { status: 400 });
			const row = await conn.prepare(queries.getById).bind(id).first<FileRow>();
			if (!row) return Response.json({ ok: false, error: "not found" }, { status: 404 });
			await bucket.delete(row.finder);
			await conn.prepare(queries.deactivateById).bind(id).run();
			return Response.json({ ok: true });
		}

		const stepId = String(form.get("step_id") ?? "");
		const processId = String(form.get("process_id") ?? "");
		const description = String(form.get("description") ?? "");
		const file = form.get("file");
		if (!stepId || !processId) {
			return Response.json({ ok: false, error: "step_id and process_id required" }, { status: 400 });
		}
		if (!isValidHex(stepId) || !isValidHex(processId)) {
			return Response.json({ ok: false, error: "invalid step_id or process_id" }, { status: 400 });
		}
		if (!(file instanceof File)) {
			return Response.json({ ok: false, error: "file required" }, { status: 400 });
		}
		if (file.size === 0) {
			return Response.json({ ok: false, error: "empty file" }, { status: 400 });
		}
		if (file.size > MAX_BYTES) {
			return Response.json({ ok: false, error: "file too large" }, { status: 413 });
		}

		const id = await randomHEX(16);
		const mime = file.type || "application/octet-stream";
		const isImg = isImageMime(mime) ? 1 : 0;
		const safeName = file.name || "file";
		const key = `process/${processId}/${stepId}/${id}-${safeName.replace(/[^\w.\-]+/g, "_")}`;

		await bucket.put(key, file.stream(), {
			httpMetadata: { contentType: mime },
		});
		await conn
			.prepare(queries.insert)
			.bind(id, processId, stepId, safeName, description, key, mime, file.size, isImg)
			.run();

		return Response.json({
			ok: true,
			file: {
				id,
				name: safeName,
				mime_type: mime,
				size_bytes: file.size,
				is_image: isImg,
				url: `/api/files?id=${id}`,
			},
		});
	}

	return Response.json({ ok: false, error: "method not allowed" }, { status: 405 });
}
