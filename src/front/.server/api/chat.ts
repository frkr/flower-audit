// Chat IA — placeholder. Integração futura com assistant-ui.
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

export async function loader({}: LoaderFunctionArgs) {
	return Response.json({ ok: true, messages: [] });
}

export async function action({ request }: ActionFunctionArgs) {
	const body = (await request.json().catch(() => ({}))) as { message?: string };
	const message = (body?.message ?? "").trim();
	const reply = message
		? `Recebi: "${message}". A integração com IA será adicionada em breve.`
		: "Olá! Em que posso ajudar?";
	return Response.json({ ok: true, reply });
}
