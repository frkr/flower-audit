import { NavLink, Outlet } from "react-router";
import { SearchProvider } from "../components/SearchContext";
import { CalendarPanel } from "../components/CalendarPanel";
import { ChatPanel } from "../components/ChatPanel";
import { ProfileButton } from "../components/ProfileButton";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
	"px-3 py-1 rounded text-sm " +
	(isActive
		? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-50"
		: "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800");

export default function AppLayout() {
	return (
		<SearchProvider>
			<div className="min-h-screen flex flex-col">
				<header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800">
					<nav className="flex items-center gap-2">
						<div className="font-semibold text-blue-600 mr-3">Flower</div>
						<NavLink to="/" end className={navLinkClass}>
							Começar
						</NavLink>
						<NavLink to="/flow" className={navLinkClass}>
							Fluxos
						</NavLink>
						<NavLink to="/setup" className={navLinkClass}>
							Configuração
						</NavLink>
					</nav>
					<div className="flex items-center gap-2">
						<CalendarPanel />
					</div>
				</header>

				<div className="flex flex-1 min-h-0">
					<main className="flex-1 min-w-0 p-4 overflow-auto">
						<Outlet />
					</main>

					<aside className="hidden md:flex w-64 border-l border-gray-200 dark:border-gray-800 flex-col">
						<ChatPanel />
						<div className="p-2 border-t border-gray-200 dark:border-gray-800 flex justify-end">
							<ProfileButton />
						</div>
					</aside>
				</div>
			</div>
		</SearchProvider>
	);
}
