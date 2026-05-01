// Loader da tela "Começar".
import type { LoaderFunctionArgs } from "react-router";

export async function loader({}: LoaderFunctionArgs) {
	return Response.json({ ok: true });
}
