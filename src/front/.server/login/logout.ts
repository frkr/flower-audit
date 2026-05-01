// /logout: limpa o cookie de sessão e volta para a hero page pública.
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { buildClearSessionCookie, isSecureRequest } from "../auth";

function clearAndRedirect(request: Request) {
	return new Response(null, {
		status: 302,
		headers: {
			Location: "/landing",
			"Set-Cookie": buildClearSessionCookie(isSecureRequest(request)),
		},
	});
}

export async function loader({ request }: LoaderFunctionArgs) {
	return clearAndRedirect(request);
}

export async function action({ request }: ActionFunctionArgs) {
	return clearAndRedirect(request);
}
