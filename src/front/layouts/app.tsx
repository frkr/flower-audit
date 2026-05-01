import { NavLink, Outlet, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useState } from "react";
import { SearchProvider } from "../components/SearchContext";
import { CalendarPanel } from "../components/CalendarPanel";
import { ChatPanel } from "../components/ChatPanel";
import { ProfileButton } from "../components/ProfileButton";
import { getSettings, requireUser, type SessionUser } from "../.server/auth";

export async function loader({ request, context }: LoaderFunctionArgs) {
	const user = await requireUser(request, context);
	const s = await getSettings(context, ["system_name"]);
	const systemName = s.system_name?.trim() || "Flower";
	return Response.json({ user, systemName });
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
	"px-3 py-1 rounded text-sm " +
	(isActive
		? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-50"
		: "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800");

export default function AppLayout() {
	const { user, systemName } = useLoaderData() as { user: SessionUser; systemName: string };
	const [sidebarHidden, setSidebarHidden] = useState(false);
	return (
		<SearchProvider>
			<div className={"h-screen flex flex-col " + (sidebarHidden ? "" : "md:pr-64")}>
				<header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800">
					<nav className="flex items-center gap-2">
						<NavLink to="/" end className="font-semibold text-blue-600 mr-3">
							{systemName}
						</NavLink>
						<NavLink to="/start" className={navLinkClass}>
							Começar
						</NavLink>
						<NavLink to="/flow" className={navLinkClass}>
							Fluxos
						</NavLink>
						<NavLink to="/setup" className={navLinkClass}>
							Configuração
						</NavLink>
					</nav>
				</header>

				<main className="flex-1 min-w-0 p-4 overflow-auto">
					<Outlet />
				</main>
			</div>

			{sidebarHidden ? (
				<button
					type="button"
					onClick={() => setSidebarHidden(false)}
					className="hidden md:flex fixed top-2 right-2 z-30 p-1 rounded border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900"
					aria-label="Mostrar painel"
					title="Mostrar painel"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<polyline points="15 18 9 12 15 6" />
					</svg>
				</button>
			) : (
				<aside className="hidden md:flex fixed top-0 right-0 bottom-0 w-64 border-l border-gray-200 dark:border-gray-800 flex-col bg-white dark:bg-gray-950 z-20">
					<div className="p-2 flex items-center justify-between gap-2">
						<button
							type="button"
							onClick={() => setSidebarHidden(true)}
							className="p-1 rounded border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900"
							aria-label="Esconder painel"
							title="Esconder painel"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</button>
						<CalendarPanel />
					</div>
					<ChatPanel />
					<div className="p-2 border-t border-gray-200 dark:border-gray-800 flex justify-end">
						<ProfileButton user={user} />
					</div>
				</aside>
			)}
		</SearchProvider>
	);
}
