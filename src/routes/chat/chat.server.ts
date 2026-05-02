// Chat IA — placeholder. Integração futura com assistant-ui.
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { requireUser } from "../../lib/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	await requireUser(request, context);
	return Response.json({ ok: true, messages: [] });
}

export async function action({ request, context }: ActionFunctionArgs) {
	await requireUser(request, context);
	const body = (await request.json().catch(() => ({}))) as { message?: string };
	const message = (body?.message ?? "").trim();
	const reply = message
		? `Recebi: "${message}". A integração com IA será adicionada em breve.`
		: "Olá! Em que posso ajudar?";
	return Response.json({ ok: true, reply });
}
