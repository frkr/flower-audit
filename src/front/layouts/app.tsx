import { NavLink, Outlet, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchProvider } from "@/SearchContext";
import { CalendarPanel } from "@/CalendarPanel";
import { ChatPanel } from "@/ChatPanel";
import { ProfileButton } from "@/ProfileButton";
import { getSettings, requireUser, type SessionUser } from "../lib/auth.server";
import { cn } from "../lib/utils";

export async function loader({ request, context }: LoaderFunctionArgs) {
	const user = await requireUser(request, context);
	const s = await getSettings(context, ["system_name"]);
	const systemName = s.system_name?.trim() || "Flower";
	return Response.json({ user, systemName });
}

export default function AppLayout() {
	const { user, systemName } = useLoaderData() as { user: SessionUser; systemName: string };
	const [sidebarHidden, setSidebarHidden] = useState(false);
	const { t } = useTranslation();

	return (
		<SearchProvider>
			<div className={cn("h-screen flex flex-col", !sidebarHidden && "md:pr-64")}>
				<header className="flex items-center justify-between px-4 h-14 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/60 sticky top-0 z-10">
					<nav className="flex items-center gap-1">
						<NavLink
							to="/"
							end
							className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-50 mr-4 px-2 py-1"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="w-5 h-5 text-blue-600"
							>
								<path d="M12 2a10 10 0 1 0 10 10" />
								<path d="M12 8a4 4 0 0 1 4 4" />
								<circle cx="12" cy="12" r="2" />
							</svg>
							<span>{systemName}</span>
						</NavLink>

						<NavLink
							to="/go"
							className={({ isActive }) =>
								cn(
									"px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
									isActive
										? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
										: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800"
								)
							}
						>
							{t("nav.go")}
						</NavLink>
						<NavLink
							to="/flow"
							className={({ isActive }) =>
								cn(
									"px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
									isActive
										? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
										: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800"
								)
							}
						>
							{t("nav.flows")}
						</NavLink>
						<NavLink
							to="/setup"
							className={({ isActive }) =>
								cn(
									"px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
									isActive
										? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
										: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800"
								)
							}
						>
							{t("nav.setup")}
						</NavLink>
					</nav>
				</header>

				<main className="flex-1 min-w-0 p-6 overflow-auto bg-slate-50 dark:bg-slate-950">
					<Outlet />
				</main>
			</div>

			{sidebarHidden ? (
				<button
					type="button"
					onClick={() => setSidebarHidden(false)}
					className="hidden md:flex fixed top-3 right-3 z-30 p-1.5 rounded-md border border-slate-200 shadow-sm bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
					aria-label={t("nav.showPanel")}
					title={t("nav.showPanel")}
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="text-slate-600 dark:text-slate-400"
					>
						<polyline points="15 18 9 12 15 6" />
					</svg>
				</button>
			) : (
				<aside className="hidden md:flex fixed top-0 right-0 bottom-0 w-64 border-l border-slate-200 dark:border-slate-800 flex-col bg-white dark:bg-slate-950 z-20 shadow-sm">
					<div className="h-14 px-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
						<span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
							{t("nav.panel")}
						</span>
						<div className="flex items-center gap-1">
							<CalendarPanel />
							<button
								type="button"
								onClick={() => setSidebarHidden(true)}
								className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
								aria-label={t("nav.hidePanel")}
								title={t("nav.hidePanel")}
							>
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-slate-500"
								>
									<polyline points="9 18 15 12 9 6" />
								</svg>
							</button>
						</div>
					</div>
					<ChatPanel />
					<div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-white dark:bg-slate-950">
						<ProfileButton user={user} />
					</div>
				</aside>
			)}
		</SearchProvider>
	);
}
