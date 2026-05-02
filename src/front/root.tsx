import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import type { Route } from "./+types/root";
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nextProvider } from "react-i18next";
import { useEffect, useMemo } from "react";
import { i18nServer } from "./i18n/i18next.server";
import { allResources } from "./i18n/resources";
import { fallbackLng } from "./i18n/i18n";
import "./app.css";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export async function loader({ request }: LoaderFunctionArgs) {
	const locale = await i18nServer.getLocale(request);
	return Response.json({ locale });
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
		<head>
			<meta charSet="utf-8"/>
			<meta name="viewport" content="width=device-width, initial-scale=1"/>
			<link rel="icon" type="image/x-icon" href="/favicon.ico"/>
			<Meta/>
			<Links/>
		</head>
		<body>
		{children}
		<ScrollRestoration />
		<Scripts />
		</body>
		</html>
	);
}

export default function App() {
	const { locale } = useLoaderData<typeof loader>();

	const i18n = useMemo(() => {
		const instance = createInstance();
		instance.use(initReactI18next).init({
			lng: locale,
			fallbackLng,
			resources: allResources,
			interpolation: { escapeValue: false },
			react: { useSuspense: false },
		});
		return instance;
	}, [locale]);

	useEffect(() => {
		document.documentElement.lang = locale;
	}, [locale]);

	return (
		<I18nextProvider i18n={i18n}>
			<Outlet />
		</I18nextProvider>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
			)}
		</main>
	);
}
